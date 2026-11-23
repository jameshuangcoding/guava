import "server-only";

// Transactional email (password reset, and later verification and reminders)
// through Resend's HTTP API: https://resend.com/docs/api-reference/emails/send-email
//
// Without RESEND_API_KEY (local dev, tests, CI) nothing is sent: the email is
// printed to the server console instead, so the flows still work end to end.

const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;

export type Email = {
  to: string;
  subject: string;
  /** Plain-text body. Always sent, for clients that don't render HTML. */
  text: string;
  html?: string;
};

export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // A production deploy without a key would otherwise write reset links
    // into the platform's logs.
    if (process.env.VERCEL_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set. See .env.example.");
    }
    console.info(
      [
        "[email] RESEND_API_KEY is not set, so this email was not sent:",
        `To: ${email.to}`,
        `Subject: ${email.subject}`,
        "",
        email.text,
      ].join("\n"),
    );
    return;
  }

  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set. See .env.example.");

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email.to],
      subject: email.subject,
      text: email.text,
      ...(email.html && { html: email.html }),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    // Resend answers errors as { name, message, statusCode }.
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend answered ${res.status}: ${detail.slice(0, 500)}`);
  }
}
