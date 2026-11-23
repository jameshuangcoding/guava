import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { EMAIL_MAX } from "@/lib/auth-validation";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Reset your password · guava" };

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  if (await getCurrentUser()) redirect("/");

  // ?email= comes from login's "Forgot password?".
  const { email } = await searchParams;
  return (
    <ForgotPasswordForm
      defaultEmail={typeof email === "string" ? email.slice(0, EMAIL_MAX) : ""}
    />
  );
}
