import type { Metadata } from "next";

import {
  InvalidResetLink,
  ResetPasswordForm,
} from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password · guava" };

/**
 * Where the emailed link lands. Better Auth's /api/auth/reset-password/:token
 * checks the token first, then redirects here with ?token= or, for a used or
 * expired one, ?error=INVALID_TOKEN. Open to signed-in visitors too: the
 * link works whoever is signed in on this browser.
 */
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;
  if (error || typeof token !== "string" || !token) {
    return <InvalidResetLink />;
  }
  return <ResetPasswordForm token={token} />;
}
