"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { FormError } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { ConfirmDeleteDialog } from "@/components/guava/confirm-delete-dialog";
import { Field } from "@/components/guava/field";
import { Card } from "@/components/shell/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changePassword,
  deleteAccount,
  updateName,
} from "@/lib/account-actions";
import {
  deleteConfirmationMatches,
  nameError,
  newPasswordError,
} from "@/lib/account-validation";
import { NAME_MAX } from "@/lib/auth-validation";

const ROW = "flex flex-col gap-4 px-5 py-4";
const GENERIC_ERROR = "Something went wrong. Try again in a moment.";

function RowHeading({
  title,
  description,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-medium">{title}</div>
      {description && (
        <div className="mt-0.5 text-[13px] text-ink-3">{description}</div>
      )}
    </div>
  );
}

function Success({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="text-[13px] text-primary-text">
      {children}
    </p>
  );
}

function NameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(initialName);
  const [tried, setTried] = useState(false);
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const err = nameError(name);
  const unchanged = name.trim() === saved.trim();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    setFormError("");
    setDone(false);
    if (err || unchanged) return;
    startTransition(async () => {
      try {
        const result = await updateName({ name });
        if (result.ok) {
          setSaved(name.trim());
          setName(name.trim());
          setTried(false);
          setDone(true);
        } else {
          setFormError(result.formError ?? GENERIC_ERROR);
        }
      } catch {
        setFormError(GENERIC_ERROR);
      }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className={ROW}>
      <Field
        label="Display name"
        htmlFor="account-name"
        error={tried && err ? err : undefined}
      >
        <div className="flex flex-wrap gap-2">
          <Input
            id="account-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDone(false);
            }}
            autoComplete="name"
            maxLength={NAME_MAX}
            aria-invalid={(tried && !!err) || undefined}
            className="h-10 min-w-0 flex-1 px-3 shadow-card"
          />
          <Button type="submit" size="lg" disabled={isPending || unchanged}>
            {isPending && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </div>
      </Field>
      {formError && <FormError>{formError}</FormError>}
      {done && <Success>Name saved.</Success>}
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [currentError, setCurrentError] = useState("");
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentEmpty = !currentPassword;
  const newErr = newPasswordError(currentPassword, newPassword);
  const showCurrentErr =
    currentError ||
    (tried && currentEmpty ? "Enter your current password." : "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    setCurrentError("");
    setFormError("");
    setDone(false);
    if (currentEmpty || newErr) return;
    startTransition(async () => {
      try {
        const result = await changePassword({ currentPassword, newPassword });
        if (result.ok) {
          setCurrentPassword("");
          setNewPassword("");
          setTried(false);
          setDone(true);
        } else if (result.passwordError) {
          setCurrentError(result.passwordError);
        } else {
          setFormError(result.formError ?? GENERIC_ERROR);
        }
      } catch {
        setFormError(GENERIC_ERROR);
      }
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className={ROW}>
      <RowHeading
        title="Password"
        description="Changing it signs you out everywhere else."
      />
      <Field
        label="Current password"
        htmlFor="account-current-password"
        error={showCurrentErr || undefined}
      >
        <PasswordInput
          id="account-current-password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            setCurrentError("");
          }}
          autoComplete="current-password"
          aria-invalid={!!showCurrentErr || undefined}
        />
      </Field>
      <Field
        label="New password"
        htmlFor="account-new-password"
        hint="8+ characters with a letter and a number."
        error={tried && newErr ? newErr : undefined}
      >
        <PasswordInput
          id="account-new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          revealLabel="new password"
          aria-invalid={(tried && !!newErr) || undefined}
        />
      </Field>
      {formError && <FormError>{formError}</FormError>}
      {done && (
        <Success>Password changed. Other devices were signed out.</Success>
      )}
      <div>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Change password
        </Button>
      </div>
    </form>
  );
}

function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const matches = deleteConfirmationMatches(confirmEmail, email);

  function onOpenChange(next: boolean) {
    if (isPending) return;
    setOpen(next);
    if (!next) {
      setConfirmEmail("");
      setPassword("");
      setPasswordError("");
      setFormError("");
    }
  }

  function onConfirm() {
    if (!matches || !password) return;
    setPasswordError("");
    setFormError("");
    startTransition(async () => {
      try {
        // Redirects to /login on success.
        const result = await deleteAccount({ confirmEmail, password });
        if (result.ok) return;
        if (result.passwordError) setPasswordError(result.passwordError);
        else setFormError(result.formError ?? GENERIC_ERROR);
      } catch {
        setFormError(GENERIC_ERROR);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <RowHeading
          title="Delete account"
          description="Removes your guava login. Your Neon database and its data stay yours."
        />
      </div>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete account
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Delete your account?"
        description={
          <>
            This deletes your guava login and the saved connection to your Neon
            database, and signs you out everywhere. It can’t be undone.
            <br />
            <br />
            guava won’t delete anything in your Neon database. Your expenses,
            categories and bank connections stay there, and you can delete that
            database yourself in Neon.
          </>
        }
        confirmLabel={
          <>
            {isPending && <Loader2 className="animate-spin" />}
            Delete account
          </>
        }
        confirmDisabled={!matches || !password || isPending}
        onConfirm={onConfirm}
      >
        <div className="flex flex-col gap-3">
          <Field
            label={
              <>
                Type <span className="font-semibold">{email}</span> to confirm
              </>
            }
            htmlFor="delete-confirm-email"
          >
            <Input
              id="delete-confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="h-10 px-3 shadow-card"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="delete-password"
            error={passwordError || undefined}
          >
            <PasswordInput
              id="delete-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              autoComplete="current-password"
              aria-invalid={!!passwordError || undefined}
            />
          </Field>
          {formError && <FormError>{formError}</FormError>}
        </div>
      </ConfirmDeleteDialog>
    </div>
  );
}

/** Display name, email, password and deleting the account. */
export function AccountCard({ name, email }: { name: string; email: string }) {
  return (
    <Card className="divide-y divide-muted">
      <NameForm initialName={name} />
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <RowHeading title="Email" />
        </div>
        <span className="truncate text-[13px] text-ink-2">{email}</span>
      </div>
      <PasswordForm />
      <DeleteAccount email={email} />
    </Card>
  );
}
