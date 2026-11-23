import { describe, expect, it } from "vitest";

import {
  billSearchRange,
  findRecurringBill,
  type NewCharge,
  type ReviewedExpense,
} from "./recurring-bills";

function charge(overrides: Partial<NewCharge> = {}): NewCharge {
  return {
    date: "2026-11-15",
    name: "Netflix",
    amountCents: 1549,
    bankAccountId: "acc_1",
    spending: true,
    ...overrides,
  };
}

function reviewed(overrides: Partial<ReviewedExpense> = {}): ReviewedExpense {
  return {
    date: "2026-10-15",
    name: "Netflix",
    amountCents: 1549,
    bankAccountId: "acc_1",
    categoryId: "cat_subs",
    subcategoryId: "sub_streaming",
    ...overrides,
  };
}

describe("findRecurringBill", () => {
  it("matches last month's charge with the same name, amount and account", () => {
    const last = reviewed();
    expect(findRecurringBill(charge(), [last])).toBe(last);
  });

  it("ignores case and surrounding spaces in the name", () => {
    const last = reviewed({ name: " NETFLIX " });
    expect(findRecurringBill(charge(), [last])).toBe(last);
  });

  it("needs the exact amount", () => {
    expect(
      findRecurringBill(charge(), [reviewed({ amountCents: 1599 })]),
    ).toBeUndefined();
  });

  it("needs the same account", () => {
    expect(
      findRecurringBill(charge(), [reviewed({ bankAccountId: "acc_2" })]),
    ).toBeUndefined();
  });

  it("needs the same name", () => {
    expect(
      findRecurringBill(charge(), [reviewed({ name: "Hulu" })]),
    ).toBeUndefined();
  });

  it("only looks 25 to 35 days back", () => {
    for (const [date, matches] of [
      ["2026-10-21", true], // 25 days
      ["2026-10-11", true], // 35 days
      ["2026-10-22", false], // 24 days
      ["2026-10-10", false], // 36 days
      ["2026-11-14", false], // yesterday
      ["2026-12-15", false], // later
    ] as const) {
      expect(findRecurringBill(charge(), [reviewed({ date })]) != null).toBe(
        matches,
      );
    }
  });

  it("picks the latest match", () => {
    const older = reviewed({ date: "2026-10-12", categoryId: "old" });
    const newer = reviewed({ date: "2026-10-18", categoryId: "new" });
    expect(findRecurringBill(charge(), [older, newer])).toBe(newer);
    expect(findRecurringBill(charge(), [newer, older])).toBe(newer);
  });

  it("skips refunds and charges that aren't spending", () => {
    expect(
      findRecurringBill(charge({ spending: false }), [reviewed()]),
    ).toBeUndefined();
    expect(
      findRecurringBill(charge({ amountCents: -1549 }), [
        reviewed({ amountCents: -1549 }),
      ]),
    ).toBeUndefined();
  });

  it("finds nothing without reviewed expenses", () => {
    expect(findRecurringBill(charge(), [])).toBeUndefined();
  });
});

describe("billSearchRange", () => {
  it("covers 25 to 35 days before every charge", () => {
    expect(
      billSearchRange([
        { date: "2026-11-15" },
        { date: "2026-11-01" },
        { date: "2026-11-20" },
      ]),
    ).toEqual({ from: "2026-09-27", to: "2026-10-26" });
  });

  it("is empty without charges", () => {
    expect(billSearchRange([])).toBeNull();
  });
});
