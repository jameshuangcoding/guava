import { addDays, fromKey } from "@/lib/guava/dates";
import type { DateKey } from "@/lib/guava/types";

// "Auto-review recurring bills" (Settings): a new bank charge that repeats
// one the user already reviewed about a month earlier takes that expense's
// category and skips the review queue. Pure, so it's tested without a
// database; lib/plaid-sync.ts applies it to newly imported transactions.

/** How many days before a new charge last month's copy may fall. */
export const BILL_GAP_DAYS = { min: 25, max: 35 };

/** A newly imported bank transaction. */
export type NewCharge = {
  date: DateKey;
  name: string;
  amountCents: number;
  bankAccountId: string | null;
  spending: boolean;
};

/** An expense the user already categorized and reviewed. */
export type ReviewedExpense = {
  date: DateKey;
  name: string;
  amountCents: number;
  bankAccountId: string | null;
  categoryId: string;
  subcategoryId: string | null;
};

/** The date range to search for last month's copies of `charges`. */
export function billSearchRange(
  charges: Pick<NewCharge, "date">[],
): { from: DateKey; to: DateKey } | null {
  if (!charges.length) return null;
  const dates = charges.map((c) => c.date).sort();
  return {
    from: addDays(dates[0], -BILL_GAP_DAYS.max),
    to: addDays(dates[dates.length - 1], -BILL_GAP_DAYS.min),
  };
}

const DAY_MS = 86_400_000;

function daysBetween(earlier: DateKey, later: DateKey): number {
  return Math.round(
    (fromKey(later).getTime() - fromKey(earlier).getTime()) / DAY_MS,
  );
}

function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Last month's copy of `charge`: a reviewed expense from the same account
 * with the same name (ignoring case) and exact amount, 25 to 35 days earlier.
 * The latest one wins. Only spending charges count: refunds, transfers and
 * card payments aren't bills.
 */
export function findRecurringBill(
  charge: NewCharge,
  reviewed: ReviewedExpense[],
): ReviewedExpense | undefined {
  if (!charge.spending || charge.amountCents <= 0) return undefined;
  let match: ReviewedExpense | undefined;
  for (const e of reviewed) {
    if (
      e.amountCents !== charge.amountCents ||
      e.bankAccountId !== charge.bankAccountId ||
      !sameName(e.name, charge.name)
    )
      continue;
    const gap = daysBetween(e.date, charge.date);
    if (gap < BILL_GAP_DAYS.min || gap > BILL_GAP_DAYS.max) continue;
    if (!match || e.date > match.date) match = e;
  }
  return match;
}
