import type { Email } from "@/lib/email";

// The emails Better Auth sends (see lib/auth.ts).

/** How long a reset link works, in seconds. Better Auth's default. */
export const RESET_LINK_TTL_SECONDS = 60 * 60;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function resetPasswordEmail(user: {
  name: string;
  email: string;
  url: string;
}): Email {
  const hello = user.name.trim() ? `Hi ${user.name.trim()},` : "Hi,";
  const intro =
    "Someone asked to reset the password for your guava account. Open this link to choose a new one. It works once, for the next hour.";
  const outro =
    "If you didn't ask for this, ignore this email. Your password won't change.";
  return {
    to: user.email,
    subject: "Reset your guava password",
    text: [hello, "", intro, "", user.url, "", outro].join("\n"),
    html: [
      `<p>${escapeHtml(hello)}</p>`,
      `<p>${escapeHtml(intro)}</p>`,
      `<p><a href="${escapeHtml(user.url)}">Reset your password</a></p>`,
      `<p>${escapeHtml(outro)}</p>`,
    ].join("\n"),
  };
}
