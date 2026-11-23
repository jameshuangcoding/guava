import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

// Made up per run. "e2e" / "new" cover the letter and number rules.
const LOGIN = `e2e-${randomUUID()}`;
const NEW_LOGIN = `new-${randomUUID()}`;

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function signUpAndConnect(page: Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Buzz Peterson");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(LOGIN);
  await page.getByLabel("Confirm password", { exact: true }).fill(LOGIN);
  await page.getByLabel(/I agree to the Terms/).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/connect$/);
  await page
    .getByRole("textbox", { name: "Connection string" })
    .fill(process.env.WORKSPACE_URL_E2E!);
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
}

async function logIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
}

test("change the display name", async ({ page }) => {
  await signUpAndConnect(page, uniqueEmail());
  await page.goto("/settings");
  await page
    .getByRole("navigation", { name: "Settings" })
    .getByRole("link", { name: "Account" })
    .click();
  await expect(page).toHaveURL(/\/settings\/account$/);

  await page.getByLabel("Display name").fill("Mango Peterson");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Name saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Display name")).toHaveValue("Mango Peterson");
});

test("change the password", async ({ page }) => {
  const email = uniqueEmail();
  await signUpAndConnect(page, email);
  await page.goto("/settings/account");

  await page.getByLabel("Current password").fill("wrong-123");
  await page.getByLabel("New password", { exact: true }).fill(NEW_LOGIN);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("That password is incorrect.")).toBeVisible();

  await page.getByLabel("Current password").fill(LOGIN);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText(/Password changed/)).toBeVisible();

  await page.context().clearCookies();
  await logIn(page, email, LOGIN);
  await expect(page.getByText(/Incorrect password/)).toBeVisible();
  await logIn(page, email, NEW_LOGIN);
  await expect(page).toHaveURL(/\/$/);
});

test("delete the account", async ({ page }) => {
  const email = uniqueEmail();
  await signUpAndConnect(page, email);
  await page.goto("/settings/account");

  await page.getByRole("button", { name: "Delete account" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/won’t delete anything/)).toBeVisible();
  const confirm = dialog.getByRole("button", { name: "Delete account" });

  await dialog.getByLabel(/to confirm/).fill("someone@example.com");
  await dialog.getByLabel("Password", { exact: true }).fill(LOGIN);
  await expect(confirm).toBeDisabled();

  await dialog.getByLabel(/to confirm/).fill(email);
  await confirm.click();
  await expect(page).toHaveURL(/\/login$/);

  await logIn(page, email, LOGIN);
  await expect(page.getByText(/No account found/)).toBeVisible();
});
