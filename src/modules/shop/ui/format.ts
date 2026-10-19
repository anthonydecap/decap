export function formatMoney(cents: number, currency = "EUR", lang = "en"): string {
  return new Intl.NumberFormat(lang === "fr" ? "fr-BE" : "en-IE", { style: "currency", currency }).format(cents / 100);
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const v = bytes / 1024 ** i;
  return `${v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

export function formatDate(d: string | Date, lang = "en"): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-BE" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    typeof d === "string" ? new Date(d) : d,
  );
}

export function formatDateTime(d: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(typeof d === "string" ? new Date(d) : d);
}
