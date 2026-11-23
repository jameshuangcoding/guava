"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Field } from "@/components/guava/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMAIL_MAX, emailError } from "@/lib/auth-validation";
import { requestPasswordReset } from "@/lib/password-reset-actions";

import { AuthHeader, authLinkClass, FormError } from "./auth-layout";

export function ForgotPasswordForm({ defaultEmail }: { defaultEmail: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [tried, setTried] = useState(false);
  const [formError, setFormError] = useState("");
  // The email the link was requested for, once the request went through.
  const [sentTo, setSentTo] = useState("");
  const [isPending, startTransition] = useTransition();

  const emailErr = emailError(email);
  const showEmailErr = tried && !!emailErr;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    setFormError("");
    if (emailErr) return;
    startTransition(async () => {
      const result = await requestPasswordReset(email);
      if (result.formError) setFormError(result.formError);
      else setSentTo(email.trim());
    });
  }

  if (sentTo) {
    return (
      <div className="flex w-full max-w-[380px] flex-col gap-[18px]">
        {/* Same message whether or not the email has an account. */}
        <AuthHeader
          title="Check your email"
          subtitle={
            <>
              If an account exists for{" "}
              <span className="font-medium text-foreground">{sentTo}</span>, a
              link to reset your password is on its way. It works for an hour.
            </>
          }
        />
        <p className="text-[13px] text-ink-3">
          No email? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setSentTo("")}
            className={authLinkClass}
          >
            try a different email
          </button>
          .
        </p>
        <p className="text-center text-[13px] text-ink-3">
          <Link href="/login" className={authLinkClass}>
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex w-full max-w-[380px] flex-col gap-[18px]"
    >
      <AuthHeader
        title="Reset your password"
        subtitle="Enter the email you signed up with and we’ll send you a link to choose a new password."
      />

      <Field
        label="Email"
        htmlFor="forgot-email"
        error={showEmailErr ? emailErr : undefined}
      >
        <Input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFormError("");
          }}
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={EMAIL_MAX}
          aria-invalid={showEmailErr || undefined}
          className="h-10 px-3 shadow-card"
        />
      </Field>

      {formError && <FormError>{formError}</FormError>}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Send reset link
      </Button>

      <p className="text-center text-[13px] text-ink-3">
        Remembered it?{" "}
        <Link href="/login" className={authLinkClass}>
          Log in
        </Link>
      </p>
    </form>
  );
}
