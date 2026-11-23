import { describe, expect, it } from "vitest";

import {
  confirmPasswordError,
  emailError,
  normalizeEmail,
  PASSWORD_MAX,
  passwordOk,
} from "./auth-validation";

describe("emailError", () => {
  it("accepts a normal address", () => {
    expect(emailError(" buzz@example.com ")).toBe("");
  });

  it("rejects empty and malformed addresses", () => {
    expect(emailError("  ")).toBe("Enter your email.");
    expect(emailError("buzz@example")).toMatch(/valid email/);
    expect(emailError("buzz example@x.com")).toMatch(/valid email/);
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Buzz@Example.COM ")).toBe("buzz@example.com");
  });
});

describe("passwordOk", () => {
  it("needs 8+ characters with a letter and a number", () => {
    expect(passwordOk("guava123")).toBe(true);
    expect(passwordOk("guava12")).toBe(false);
    expect(passwordOk("guavaguava")).toBe(false);
    expect(passwordOk("12345678")).toBe(false);
  });

  it("caps the length", () => {
    expect(passwordOk("a1".repeat(PASSWORD_MAX))).toBe(false);
  });
});

describe("confirmPasswordError", () => {
  it("accepts a matching password", () => {
    expect(confirmPasswordError("guava123", "guava123")).toBe("");
  });

  it("asks for the confirmation when it's empty", () => {
    expect(confirmPasswordError("guava123", "")).toBe("Confirm your password.");
  });

  it("rejects any difference, including case and spaces", () => {
    expect(confirmPasswordError("guava123", "guava124")).toMatch(/match/);
    expect(confirmPasswordError("guava123", "Guava123")).toMatch(/match/);
    expect(confirmPasswordError("guava123", "guava123 ")).toMatch(/match/);
  });
});
