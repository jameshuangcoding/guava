import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

// The test user's login, made up per run. "e2e" covers the letter and
// number rules.
const LOGIN = `e2e-${randomUUID()}`;

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function signUp(page: Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Buzz Peterson");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(LOGIN);
  await page.getByLabel("Confirm password", { exact: true }).fill(LOGIN);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/connect$/);
}

async function connectDatabase(page: Page) {
  await page
    .getByRole("textbox", { name: "Connection string" })
    .fill(process.env.WORKSPACE_URL_E2E!);
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
}

test("signed-out visitors are sent to log in", async ({ page }) => {
  await page.goto("/expenses");
  await expect(page).toHaveURL(/\/login$/);
});

test("signup blocks mismatched passwords", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Buzz Peterson");
  await page.getByLabel("Email").fill(uniqueEmail());
  await page.getByLabel("Password", { exact: true }).fill(LOGIN);
  await page.getByLabel("Confirm password", { exact: true }).fill(`${LOGIN}x`);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Passwords don’t match.")).toBeVisible();
  await expect(page).toHaveURL(/\/signup$/);
});

test("sign up, connect a database, and open expenses", async ({ page }) => {
  await signUp(page, uniqueEmail());
  await expect(
    page.getByRole("heading", { name: "Connect your database, Buzz" }),
  ).toBeVisible();
  await connectDatabase(page);

  await page.goto("/expenses");
  await expect(
    page.getByRole("heading", { level: 1, name: "Expenses" }),
  ).toBeVisible();
  // A brand-new workspace has no transactions yet.
  await expect(page.getByText("0 total transactions")).toBeVisible();

  // The sidebar's community links open the Discord invite in a new tab.
  for (const name of ["Join our Discord", "Request a feature"]) {
    const link = page.getByRole("link", { name });
    await expect(link).toHaveAttribute("href", "https://discord.gg/XeB4FurTAy");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

async function logIn(page: Page, email: string, rememberMe: boolean) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(LOGIN);
  // Checked by default.
  await expect(page.getByLabel("Remember me")).toBeChecked();
  await page.getByLabel("Remember me").setChecked(rememberMe);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

/** The session cookie's expiry in seconds, or -1 for a browser-session cookie. */
async function sessionCookieExpiry(page: Page) {
  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name.endsWith("session_token"));
  expect(session).toBeDefined();
  return session!.expires;
}

test("log out and back in", async ({ page }) => {
  const email = uniqueEmail();
  await signUp(page, email);
  await connectDatabase(page);

  // Remembered: the cookie outlives the browser.
  await logIn(page, email, true);
  expect(await sessionCookieExpiry(page)).toBeGreaterThan(0);

  // Not remembered: the cookie ends when the browser closes.
  await logIn(page, email, false);
  expect(await sessionCookieExpiry(page)).toBe(-1);
});
