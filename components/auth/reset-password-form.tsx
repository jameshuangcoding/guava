"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { passwordOk } from "@/lib/auth-validation";
import { resetPassword } from "@/lib/password-reset-actions";

import { AuthHeader, authLinkClass, FormError } from "./auth-layout";
import { PasswordInput } from "./password-input";
import { PasswordRules } from "./password-rules";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [formError, setFormError] = useState("");
  const [state, setState] = useState<"form" | "done" | "invalid">("form");
  const [isPending, startTransition] = useTransition();

  const pwOk = passwordOk(password);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    setFormError("");
    if (!pwOk) return;
    startTransition(async () => {
      const result = await resetPassword({ token, newPassword: password });
      if (result.done) setState("done");
      else if (result.invalidLink) setState("invalid");
      else if (result.formError) setFormError(result.formError);
    });
  }

  if (state === "invalid") return <InvalidResetLink />;

  if (state === "done") {
    return (
      <div className="flex w-full max-w-[380px] flex-col gap-[18px]">
        <AuthHeader
          title="Password updated"
          subtitle="Log in with your new password. Any other devices were signed out."
        />
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex w-full max-w-[380px] flex-col gap-[18px]"
    >
      <AuthHeader title="Choose a new password" />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password" className="text-[13px]">
          New password
        </Label>
        <PasswordInput
          id="reset-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFormError("");
          }}
          placeholder="Create a password"
          autoComplete="new-password"
          aria-invalid={(tried && !pwOk) || undefined}
          aria-describedby="reset-password-rules"
        />
        <PasswordRules
          id="reset-password-rules"
          password={password}
          tried={tried}
        />
      </div>

      {formError && <FormError>{formError}</FormError>}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Update password
      </Button>
    </form>
  );
}

/** For a used, expired or malformed link. */
export function InvalidResetLink() {
  return (
    <div className="flex w-full max-w-[380px] flex-col gap-[18px]">
      <AuthHeader
        title="This link has expired"
        subtitle="Reset links work once, for an hour. Ask for a new one and use the latest email."
      />
      <Button asChild size="lg" className="w-full">
        <Link href="/forgot-password">Send a new link</Link>
      </Button>
      <p className="text-center text-[13px] text-ink-3">
        <Link href="/login" className={authLinkClass}>
          Back to log in
        </Link>
      </p>
    </div>
  );
}
