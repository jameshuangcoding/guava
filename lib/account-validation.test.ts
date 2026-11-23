import { describe, expect, it } from "vitest";

import {
  deleteConfirmationMatches,
  nameError,
  newPasswordError,
} from "./account-validation";
import { NAME_MAX, PASSWORD_MAX } from "./auth-validation";

describe("nameError", () => {
  it("accepts a normal name", () => {
    expect(nameError(" Buzz Peterson ")).toBe("");
  });

  it("rejects an empty name", () => {
    expect(nameError("   ")).toBe("Enter your name.");
  });

  it("caps the length after trimming", () => {
    expect(nameError(` ${"a".repeat(NAME_MAX)} `)).toBe("");
    expect(nameError("a".repeat(NAME_MAX + 1))).toMatch(/characters/);
  });
});

describe("newPasswordError", () => {
  it("accepts a valid, different password", () => {
    expect(newPasswordError("guava123", "mango456")).toBe("");
  });

  it("applies the signup password rules", () => {
    expect(newPasswordError("guava123", "short1")).toMatch(/8\+ characters/);
    expect(newPasswordError("guava123", "nonumbers")).toMatch(/a number/);
    expect(newPasswordError("guava123", "a1".repeat(PASSWORD_MAX))).not.toBe(
      "",
    );
  });

  it("rejects reusing the current password", () => {
    expect(newPasswordError("guava123", "guava123")).toMatch(/different/);
  });
});

describe("deleteConfirmationMatches", () => {
  it("matches the account email, ignoring case and spaces", () => {
    expect(
      deleteConfirmationMatches(" Buzz@Example.com ", "buzz@example.com"),
    ).toBe(true);
  });

  it("rejects a different or empty email", () => {
    expect(
      deleteConfirmationMatches("buzz@example.org", "buzz@example.com"),
    ).toBe(false);
    expect(deleteConfirmationMatches("", "")).toBe(false);
    expect(deleteConfirmationMatches("  ", "buzz@example.com")).toBe(false);
  });
});
