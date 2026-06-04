import { asLink, type LinkField } from "@prismicio/client";
import {
  DEFAULT_URL_LANG,
  LOCALE_PATH_PREFIXES,
  resolveUrlLang,
  type UrlLocale,
} from "@/i18n";

/** Prismic link field or minimal `{ url }` shape used in fallbacks. */
export type LinkLike = LinkField | { url?: string | null } | null | undefined;

function pathHasLocalePrefix(path: string): boolean {
  const first = path.replace(/\/$/, "").split("/").filter(Boolean)[0];
  return (LOCALE_PATH_PREFIXES as readonly string[]).includes(first ?? "");
}

/**
 * Prefixes internal paths with the active URL locale (`/contact` → `/en/contact`).
 * Leaves absolute URLs, hash links, and already-localized paths unchanged.
 */
export function localizeAppPath(
  path: string,
  urlLang: UrlLocale = DEFAULT_URL_LANG,
): string {
  if (!path || path === "#") return path;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  if (pathHasLocalePrefix(path)) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${urlLang}`;
  return `/${urlLang}${normalized}`;
}

/**
 * URL for Next.js `<Link href={…}>` — never undefined.
 * Document links use Prismic `routes` (per-locale paths); web links get a locale prefix.
 */
export function prismicLinkHref(
  field: LinkLike,
  fallback = "#",
  urlLang: UrlLocale = DEFAULT_URL_LANG,
): string {
  if (field == null) return fallback;

  const resolved = asLink(field as LinkField);
  if (typeof resolved === "string" && resolved.length > 0) {
    return localizeAppPath(resolved, urlLang);
  }

  if (
    typeof field === "object" &&
    "url" in field &&
    typeof field.url === "string" &&
    field.url.length > 0
  ) {
    return localizeAppPath(field.url, urlLang);
  }

  return fallback === "#" ? fallback : localizeAppPath(fallback, urlLang);
}

/** Resolve locale from a pathname (`/fr/blog` → `fr`). */
export function urlLangFromPathname(pathname: string): UrlLocale {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  return resolveUrlLang(first);
}
