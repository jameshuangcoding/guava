import { randomUUID } from "node:crypto";

import { neonConfig, Pool } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";
import ws from "ws";

// Without RESEND_API_KEY (tests/env.ts) no email goes out, so the test takes
// the reset token from the app database instead of an inbox. Better Auth
// stores it in Verification as "reset-password:<token>", with the user's id
// as the value.

// Same setup as lib/neon-config.ts, which is server-only.
neonConfig.webSocketConstructor = ws;
const localProxy = process.env.NEON_LOCAL_PROXY;
if (localProxy) {
  neonConfig.fetchEndpoint = `http://${localProxy}/sql`;
  neonConfig.wsProxy = `${localProxy}/v2`;
  neonConfig.useSecureWebSocket = false;
}

// The test user's logins before and after the reset, made up per run.
const FIRST_LOGIN = `e2e-${randomUUID()}`;
const SECOND_LOGIN = `e2e-${randomUUID()}`;

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function resetToken(email: string): Promise<string> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { rows } = await pool.query<{ identifier: string }>(
      `SELECT v.identifier FROM "Verification" v
       JOIN "User" u ON u.id = v.value
       WHERE u.email = $1 AND v.identifier LIKE 'reset-password:%'
       ORDER BY v."createdAt" DESC LIMIT 1`,
      [email],
    );
    if (!rows[0]) throw new Error(`No reset token for ${email}`);
    return rows[0].identifier.slice("reset-password:".length);
  } finally {
    await pool.end();
  }
}

/** The link from the email: Better Auth checks it, then opens /reset-password. */
function resetLink(token: string) {
  return `/api/auth/reset-password/${token}?callbackURL=${encodeURIComponent("/reset-password")}`;
}

test("reset a forgotten password by email", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Buzz Peterson");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(FIRST_LOGIN);
  await page.getByLabel("Confirm password", { exact: true }).fill(FIRST_LOGIN);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/connect$/);
  await page.context().clearCookies();

  // "Forgot password?" carries the typed email over.
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password\?email=/);
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your email" }),
  ).toBeVisible();

  const token = await resetToken(email);
  await page.goto(resetLink(token));
  await expect(page).toHaveURL(/\/reset-password\?token=/);
  await page.getByLabel("New password").fill(SECOND_LOGIN);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(
    page.getByRole("heading", { name: "Password updated" }),
  ).toBeVisible();

  // The link works once.
  await page.goto(resetLink(token));
  await expect(
    page.getByRole("heading", { name: "This link has expired" }),
  ).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(SECOND_LOGIN);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
});

test("forgot password doesn't reveal unknown emails", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(uniqueEmail());
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByRole("heading", { name: "Check your email" }),
  ).toBeVisible();
});
