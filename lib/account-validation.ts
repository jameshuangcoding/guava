// Shared by the Account settings forms (live validation) and
// lib/account-actions.ts.

import { NAME_MAX, normalizeEmail, passwordOk } from "@/lib/auth-validation";

/** The field error for a display name, or "" when it's fine. */
export function nameError(name: string): string {
  const v = name.trim();
  if (!v) return "Enter your name.";
  if (v.length > NAME_MAX) return `Keep it to ${NAME_MAX} characters.`;
  return "";
}

/** The field error for a new password, or "" when it's fine. */
export function newPasswordError(
  currentPassword: string,
  newPassword: string,
): string {
  if (!passwordOk(newPassword)) {
    return "Use 8+ characters with a letter and a number.";
  }
  if (newPassword === currentPassword) {
    return "Pick a password different from your current one.";
  }
  return "";
}

/**
 * Whether the email typed into the delete-account dialog matches the
 * account's. Case and surrounding spaces don't matter.
 */
export function deleteConfirmationMatches(
  typed: string,
  accountEmail: string,
): boolean {
  return (
    !!typed.trim() && normalizeEmail(typed) === normalizeEmail(accountEmail)
  );
}
