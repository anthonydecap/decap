import { formatMoney } from "../../format";

/** Display helpers shared by the orders, customers and royalties admin pages. */

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "FULFILLED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "CANCELED",
  "FAILED",
] as const;

export function humanize(value: string): string {
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

const SOURCE_LABELS: Record<string, string> = {
  PURCHASE: "Purchase",
  BUNDLE: "Collection purchase",
  ADMIN_GRANT: "Admin grant",
  PROMOTION: "Promotion",
  LEGACY_IMPORT: "Legacy import",
};

export function sourceTypeLabel(type: string): string {
  return SOURCE_LABELS[type] ?? humanize(type);
}

export function royaltyTermsLabel(basis: string, rateBps: number, fixedCents: number | null | undefined, currency: string): string {
  if (basis === "PERCENT_OF_NET") return `${(rateBps / 100).toLocaleString("en-GB", { maximumFractionDigits: 2 })}% of net`;
  if (basis === "FIXED_PER_UNIT") return fixedCents != null ? `${formatMoney(fixedCents, currency)} per unit` : "Fixed per unit";
  return "No royalty";
}

export function customerName(c: { firstName: string | null; lastName: string | null }): string | null {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return name || null;
}

/** Builds a query string, dropping empty values. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function pageParam(v: string | string[] | undefined): number {
  const n = Number(firstParam(v));
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}
