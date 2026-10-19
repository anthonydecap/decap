/** Display helpers for the software admin pages (pure, server and client safe). */

export const PLATFORMS = ["WINDOWS", "MACOS", "LINUX"] as const;
export const ARCHITECTURES = ["X64", "X86", "ARM64", "UNIVERSAL"] as const;
export const CHANNELS = ["STABLE", "BETA", "LEGACY"] as const;
export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "DISCONTINUED", "ARCHIVED"] as const;
export const LICENSE_STATUSES = ["PENDING_ACTIVATION", "ACTIVE", "SUSPENDED", "REVOKED"] as const;

const PLATFORM_LABELS: Record<string, string> = { WINDOWS: "Windows", MACOS: "macOS", LINUX: "Linux" };
const ARCH_LABELS: Record<string, string> = { X64: "x64", X86: "x86", ARM64: "ARM64", UNIVERSAL: "Universal" };
const CHANNEL_LABELS: Record<string, string> = { STABLE: "Stable", BETA: "Beta", LEGACY: "Legacy" };
const DOWNLOAD_SOURCE_LABELS: Record<string, string> = {
  SOFTWARE_PAGE: "Software page",
  ACCOUNT: "Customer account",
  ADMIN: "Admin",
  OTHER: "Other",
};
const LICENSE_SOURCE_LABELS: Record<string, string> = {
  PURCHASE: "Purchase",
  ADMIN: "Manual grant",
  PROMOTION: "Promotion",
  LEGACY_IMPORT: "Legacy customer",
};

export const platformLabel = (v: string) => PLATFORM_LABELS[v] ?? v;
export const archLabel = (v: string) => ARCH_LABELS[v] ?? v;
export const channelLabel = (v: string) => CHANNEL_LABELS[v] ?? v;
export const downloadSourceLabel = (v: string) => DOWNLOAD_SOURCE_LABELS[v] ?? v;
export const licenseSourceLabel = (v: string) => LICENSE_SOURCE_LABELS[v] ?? v;

export function customerLabel(c: { firstName: string | null; lastName: string | null; companyName?: string | null; email: string }): string {
  return [c.firstName, c.lastName].filter(Boolean).join(" ") || c.companyName || c.email;
}

/** "12.50" or "12,50" in euros to integer cents. Empty means not for sale (null). NaN on bad input. */
export function eurosToCents(value: string): number | null {
  const v = value.trim().replace(",", ".");
  if (!v) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return Number.NaN;
  return Math.round(Number(v) * 100);
}

export function centsToEuros(cents: number | null | undefined): string {
  return cents == null ? "" : (cents / 100).toFixed(2);
}
