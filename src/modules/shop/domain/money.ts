/** Money is always integer cents + ISO currency. Never floats. */

export const DEFAULT_CURRENCY = "EUR";

export function assertCents(value: number, label = "amount"): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer number of cents`);
  }
  return value;
}

export function formatMoney(cents: number, currency: string, locale = "en"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-BE" : "en-IE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Parses "12.50", "12,50", "12" → 1250. Returns null for anything ambiguous or negative. */
export function parseDecimalToCents(input: string): number | null {
  const trimmed = input.trim().replace(/\s/g, "").replace(/[€$£]/g, "");
  if (!/^\d+([.,]\d{1,2})?$/.test(trimmed)) return null;
  const [whole, frac = ""] = trimmed.replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}
