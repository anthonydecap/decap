import type { NextRequest } from "next/server";

/**
 * Prismic locale IDs (keys) mapped to URL path segments (values).
 * Keys must match locales in your Prismic repository.
 * First key is the default Prismic locale.
 */
export const PRISMIC_TO_URL_LOCALE = {
  "en-us": "en",
  "fr-fr": "fr",
} as const;

export type PrismicLocale = keyof typeof PRISMIC_TO_URL_LOCALE;
export type UrlLocale = (typeof PRISMIC_TO_URL_LOCALE)[PrismicLocale];

/** Default URL segment when no locale is in the path (e.g. redirect from `/`). */
export const DEFAULT_URL_LANG: UrlLocale = "en";

/** Default Prismic locale for API queries. */
export const DEFAULT_PRISMIC_LANG: PrismicLocale = "en-us";

/** URL segments used as first path segment (e.g. `/en`, `/fr`). */
export const LOCALE_PATH_PREFIXES = Object.values(PRISMIC_TO_URL_LOCALE);

/** True when pathname is exactly `/en`, `/fr`, etc. (localized home). */
export function isLocaleHomePathname(pathname: string): boolean {
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  return (
    segments.length === 1 &&
    (LOCALE_PATH_PREFIXES as readonly string[]).includes(segments[0]!)
  );
}

/** Redirects paths without a locale prefix to the default locale (`/en/...`). */
export function createLocaleRedirect(request: NextRequest): Response {
  const pathname = request.nextUrl.pathname;
  const prefix =
    pathname === "/" ? `/${DEFAULT_URL_LANG}` : `/${DEFAULT_URL_LANG}${pathname}`;
  request.nextUrl.pathname = prefix;
  return Response.redirect(request.nextUrl);
}

/** Determines if a pathname has a supported locale as its first segment. */
export function pathnameHasLocale(request: NextRequest): boolean {
  const regexp = new RegExp(
    `^/(${LOCALE_PATH_PREFIXES.join("|")})(/|$)`,
  );
  return regexp.test(request.nextUrl.pathname);
}

export function isValidUrlLang(lang: string): lang is UrlLocale {
  return (LOCALE_PATH_PREFIXES as readonly string[]).includes(lang);
}

/** URL segment (`en`) → Prismic locale (`en-us`). */
export function urlLangToPrismic(urlLang: string): PrismicLocale | undefined {
  for (const prismicLang of Object.keys(PRISMIC_TO_URL_LOCALE) as PrismicLocale[]) {
    if (PRISMIC_TO_URL_LOCALE[prismicLang] === urlLang) {
      return prismicLang;
    }
  }
  return undefined;
}

/** Prismic locale (`en-us`) → URL segment (`en`). Falls back to the Prismic id if unknown. */
export function prismicLangToUrl(prismicLang: string): string {
  const mapped =
    PRISMIC_TO_URL_LOCALE[prismicLang as PrismicLocale];
  return mapped ?? prismicLang;
}

/** Resolves URL lang for routes; invalid segments fall back to default. */
export function resolveUrlLang(urlLang: string): UrlLocale {
  return isValidUrlLang(urlLang) ? urlLang : DEFAULT_URL_LANG;
}
