"use server";

import { isAPIError } from "better-auth/api";
import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  deleteConfirmationMatches,
  nameError,
  newPasswordError,
} from "@/lib/account-validation";
import { getAuth } from "@/lib/auth";
import { PASSWORD_MAX } from "@/lib/auth-validation";
import { decrypt } from "@/lib/crypto";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { forgetUserDbClient } from "@/lib/user-db/client";

export type AccountFormResult =
  | { ok: true }
  | {
      ok: false;
      /** Shown under the current-password field. */
      passwordError?: string;
      /** Shown above the submit button. */
      formError?: string;
    };

const GENERIC_ERROR = "Something went wrong. Try again in a moment.";
const SIGNED_OUT = "Your session ended. Log in again.";
const WRONG_PASSWORD = "That password is incorrect.";

/** Better Auth's error code, e.g. "INVALID_PASSWORD". */
function errorCode(error: unknown): string | undefined {
  return isAPIError(error) ? error.body?.code : undefined;
}

function str(input: unknown): string {
  return typeof input === "string" ? input : "";
}

export async function updateName(input: {
  name: string;
}): Promise<AccountFormResult> {
  const name = str(input?.name);
  if (nameError(name)) return { ok: false, formError: GENERIC_ERROR };
  if (!(await getCurrentUser())) return { ok: false, formError: SIGNED_OUT };

  try {
    await getAuth().api.updateUser({
      body: { name: name.trim() },
      headers: await headers(),
    });
  } catch (error) {
    console.error("updateName failed", errorCode(error) ?? error);
    return { ok: false, formError: GENERIC_ERROR };
  }
  // The sidebar shows the name; re-render it.
  refresh();
  return { ok: true };
}

/** Changes the password and signs out every other session. */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AccountFormResult> {
  const currentPassword = str(input?.currentPassword);
  const newPassword = str(input?.newPassword);
  if (!currentPassword || currentPassword.length > PASSWORD_MAX) {
    return { ok: false, passwordError: WRONG_PASSWORD };
  }
  if (newPasswordError(currentPassword, newPassword)) {
    return { ok: false, formError: GENERIC_ERROR };
  }
  if (!(await getCurrentUser())) return { ok: false, formError: SIGNED_OUT };

  try {
    await getAuth().api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (error) {
    const code = errorCode(error);
    if (code === "INVALID_PASSWORD") {
      return { ok: false, passwordError: WRONG_PASSWORD };
    }
    console.error("changePassword failed", code ?? error);
    return { ok: false, formError: GENERIC_ERROR };
  }
  return { ok: true };
}

/**
 * Deletes the signed-in user from the app database: the user row, and through
 * its foreign keys (ON DELETE CASCADE) their sessions, login methods and
 * workspace row, which holds the encrypted connection string to their Neon
 * database. Nothing in that Neon database is touched: it belongs to the user.
 */
export async function deleteAccount(input: {
  confirmEmail: string;
  password: string;
}): Promise<AccountFormResult> {
  const confirmEmail = str(input?.confirmEmail);
  const password = str(input?.password);
  const user = await getCurrentUser();
  if (!user) return { ok: false, formError: SIGNED_OUT };
  if (!deleteConfirmationMatches(confirmEmail, user.email)) {
    return { ok: false, formError: "Type your account’s email to confirm." };
  }
  if (!password || password.length > PASSWORD_MAX) {
    return { ok: false, passwordError: WRONG_PASSWORD };
  }

  const workspace = await prisma.workspace.findUnique({
    where: { userId: user.id },
    select: { neonUrl: true },
  });

  try {
    // Checks the password, deletes the user, and clears the session cookie.
    await getAuth().api.deleteUser({
      body: { password },
      headers: await headers(),
    });
  } catch (error) {
    const code = errorCode(error);
    if (code === "INVALID_PASSWORD") {
      return { ok: false, passwordError: WRONG_PASSWORD };
    }
    console.error("deleteAccount failed", code ?? error);
    return { ok: false, formError: GENERIC_ERROR };
  }

  // Close this server's connection pool to their database, if it has one.
  if (workspace) forgetUserDbClient(decrypt(workspace.neonUrl));
  redirect("/login");
}
