import { ApiError, errorMessage } from "../../api";

/** Client-safe helpers shared by the catalog admin forms. */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

/** "12,50" / "12.5" → 1250. Returns null for empty, NaN for garbage. */
export function eurosToCents(v: string): number | null {
  const t = v.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return Number.NaN;
  return Math.round(n * 100);
}

export function centsToEuros(c: number | null | undefined): string {
  if (c == null) return "";
  return (c / 100).toFixed(2);
}

/** "25" / "12.5" percent → basis points. */
export function percentToBps(v: string): number | null {
  const t = v.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return Number.NaN;
  return Math.round(n * 100);
}

export function bpsToPercent(b: number | null | undefined): string {
  if (b == null) return "";
  return String(b / 100);
}

/** "3:45" → 225, "225" → 225. */
export function parseDuration(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const m = /^(\d+):([0-5]?\d)$/.exec(t);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  if (/^\d+$/.test(t)) return Number(t);
  return Number.NaN;
}

export function intOrNull(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isInteger(n) ? n : Number.NaN;
}

export function dateInputValue(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export type FieldErrors = Record<string, string>;

/** Splits an API error into a top-level message and per-field messages (Zod issue paths). */
export function apiErrorParts(e: unknown): { message: string; fields: FieldErrors; issues: { code: string; message: string }[] } {
  const fields: FieldErrors = {};
  let issues: { code: string; message: string }[] = [];
  if (e instanceof ApiError) {
    if (e.code === "VALIDATION_FAILED" && Array.isArray(e.details)) {
      for (const d of e.details as { path?: string; message?: string }[]) {
        if (d?.path && d.message && !fields[d.path]) fields[d.path] = d.message;
      }
    }
    if (e.code === "PUBLISH_BLOCKED") {
      const det = e.details as { issues?: { code: string; message: string }[] } | undefined;
      issues = det?.issues ?? [];
    }
  }
  const message =
    e instanceof ApiError && e.code === "VALIDATION_FAILED" && Object.keys(fields).length
      ? "Some fields need attention. Check the highlighted fields below."
      : errorMessage(e);
  return { message, fields, issues };
}

export const RIGHTS_STATUSES = ["NOT_REVIEWED", "PENDING_REVIEW", "CLEARED", "PUBLIC_DOMAIN", "RESTRICTED", "REJECTED"] as const;
export const ROYALTY_BASES = ["PERCENT_OF_NET", "FIXED_PER_UNIT", "NONE"] as const;

export const ROYALTY_BASIS_LABEL: Record<string, string> = {
  PERCENT_OF_NET: "Percent of net",
  FIXED_PER_UNIT: "Fixed per unit",
  NONE: "No royalty",
};

export function humanize(code: string): string {
  return code.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
