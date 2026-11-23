import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

import { RESET_LINK_TTL_SECONDS, resetPasswordEmail } from "@/lib/auth-emails";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth-validation";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

// Reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from the environment.
function createAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    // Better Auth's "account" model is AuthAccount in prisma/schema.prisma,
    // so it doesn't collide with the Plaid bank Account model.
    account: { modelName: "authAccount" },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN,
      maxPasswordLength: PASSWORD_MAX,
      // `url` is Better Auth's /api/auth/reset-password/:token, which checks
      // the token and redirects to the redirectTo page (/reset-password).
      sendResetPassword: async ({ user, url }) => {
        // Sent after the response, not awaited: Better Auth waits for this
        // callback, so a slow send would reveal that the email has an
        // account (unknown emails return right away).
        after(() =>
          sendEmail(
            resetPasswordEmail({ name: user.name, email: user.email, url }),
          ).catch((error) => console.error("sendResetPassword failed", error)),
        );
      },
      resetPasswordTokenExpiresIn: RESET_LINK_TTL_SECONDS,
      // A reset signs out every device, in case someone else was signed in.
      revokeSessionsOnPasswordReset: true,
    },
    // Lets auth.api calls in Server Actions set cookies. Must stay last.
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/**
 * The Better Auth instance. Created on first use rather than at import (the
 * Prisma adapter touches the client right away), so `next build` works
 * without DATABASE_URL, like lib/prisma.ts.
 */
export function getAuth() {
  return (instance ??= createAuth());
}
