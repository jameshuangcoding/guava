import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "./email";

const EMAIL = {
  to: "buzz@example.com",
  subject: "Reset your password",
  text: "Open https://example.com/reset",
  html: "<p>Open the link</p>",
};

describe("sendEmail", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "guava <hello@example.com>");
    vi.stubEnv("VERCEL_ENV", "");
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("posts the email to Resend", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "email_1" }));

    await sendEmail(EMAIL);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer re_test_key",
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      from: "guava <hello@example.com>",
      to: ["buzz@example.com"],
      subject: "Reset your password",
      text: "Open https://example.com/reset",
      html: "<p>Open the link</p>",
    });
  });

  it("leaves html out when there is none", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "email_1" }));

    await sendEmail({ ...EMAIL, html: undefined });

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(body).not.toHaveProperty("html");
  });

  it("throws when Resend rejects the email", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { name: "validation_error", message: "Invalid `from` field." },
        { status: 422 },
      ),
    );

    await expect(sendEmail(EMAIL)).rejects.toThrow(
      /Resend answered 422.*Invalid `from` field/,
    );
  });

  it("throws without EMAIL_FROM", async () => {
    vi.stubEnv("EMAIL_FROM", "");

    await expect(sendEmail(EMAIL)).rejects.toThrow(/EMAIL_FROM/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs instead of sending without RESEND_API_KEY", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await sendEmail(EMAIL);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledOnce();
    const logged = info.mock.calls[0][0] as string;
    expect(logged).toContain("To: buzz@example.com");
    expect(logged).toContain("Subject: Reset your password");
    expect(logged).toContain("Open https://example.com/reset");
  });

  it("refuses to log emails in Vercel production without a key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("VERCEL_ENV", "production");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await expect(sendEmail(EMAIL)).rejects.toThrow(/RESEND_API_KEY/);
    expect(info).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
