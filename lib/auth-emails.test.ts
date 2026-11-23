import { describe, expect, it } from "vitest";

import { resetPasswordEmail } from "./auth-emails";

describe("resetPasswordEmail", () => {
  const url = "https://guava.example/api/auth/reset-password/abc?x=1&y=2";

  it("addresses the user and includes the link", () => {
    const email = resetPasswordEmail({
      name: "Buzz",
      email: "buzz@example.com",
      url,
    });
    expect(email.to).toBe("buzz@example.com");
    expect(email.subject).toBe("Reset your guava password");
    expect(email.text).toContain("Hi Buzz,");
    expect(email.text).toContain(url);
    expect(email.html).toContain(
      'href="https://guava.example/api/auth/reset-password/abc?x=1&amp;y=2"',
    );
  });

  it("escapes the name in the HTML", () => {
    const email = resetPasswordEmail({
      name: "<b>Buzz</b>",
      email: "buzz@example.com",
      url,
    });
    expect(email.html).toContain("Hi &lt;b&gt;Buzz&lt;/b&gt;,");
    expect(email.html).not.toContain("<b>");
  });
});
