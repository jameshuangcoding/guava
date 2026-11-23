"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";

import { getAuth } from "@/lib/auth";
import {
  EMAIL_MAX,
  emailError,
  normalizeEmail,
  passwordOk,
} from "@/lib/auth-validation";

const GENERIC_ERROR = "Something went wrong. Try again in a moment.";

/**
 * Emails a reset link if `email` has an account. Answers the same either way,
 * so the forgot-password page can't be used to find out who has an account.
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ formError?: string }> {
  if (
    typeof email !== "string" ||
    email.trim().length > EMAIL_MAX ||
    emailError(email)
  ) {
    return { formError: GENERIC_ERROR };
  }
  try {
    await getAuth().api.requestPasswordReset({
      body: { email: normalizeEmail(email), redirectTo: "/reset-password" },
      headers: await headers(),
    });
  } catch (error) {
    // Logged, not shown: an error here can depend on whether the account
    // exists, and the page must look the same for every email.
    console.error("requestPasswordReset failed", error);
  }
  return {};
}

export type ResetPasswordResult = {
  /** The password was changed. Every session was signed out. */
  done?: boolean;
  /** The link was already used, expired or never existed. */
  invalidLink?: boolean;
  formError?: string;
};

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<ResetPasswordResult> {
  const { token, newPassword } = input;
  if (typeof token !== "string" || !token) return { invalidLink: true };
  if (typeof newPassword !== "string" || !passwordOk(newPassword)) {
    return { formError: GENERIC_ERROR };
  }
  try {
    await getAuth().api.resetPassword({
      body: { token, newPassword },
      headers: await headers(),
    });
  } catch (error) {
    if (isAPIError(error) && error.body?.code === "INVALID_TOKEN") {
      return { invalidLink: true };
    }
    console.error("resetPassword failed", error);
    return { formError: GENERIC_ERROR };
  }
  return { done: true };
}
