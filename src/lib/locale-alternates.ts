import { cache } from "react";
import type { Metadata } from "next";
import {
  DEFAULT_PRISMIC_LANG,
  DEFAULT_URL_LANG,
  PRISMIC_TO_URL_LOCALE,
  urlLangToPrismic,
  type PrismicLocale,
  type UrlLocale,
} from "@/i18n";
import { prismicGetByUID } from "@/lib/prismic-get-by-uid";
import { absoluteUrl } from "@/lib/site-url";
import {
  defaultPathsForPathname,
  parseLocalizedPath,
  pathForHome,
  pathsFromPrismicDocument,
  type ParsedLocalizedPath,
} from "@/lib/locale-path";
import { createClient } from "@/prismicio";

/** BCP 47 tags for hreflang (Google recommends language-region). */
export const PRISMIC_TO_HREFLANG: Record<PrismicLocale, string> = {
  "en-us": "en-US",
  "fr-fr": "fr-FR",
};

export type LocaleAlternatePaths = Record<UrlLocale, string>;

/**
 * Resolves alternate locale URLs for the current request path.
 * Uses Prismic `alternate_languages` when a document backs the page.
 */
export const getLocaleAlternatePaths = cache(
  async (pathname: string): Promise<LocaleAlternatePaths> => {
    const parsed = parseLocalizedPath(pathname);
    if (!parsed) {
      return defaultPathsForPathname(pathname);
    }

    try {
      const doc = await fetchDocumentForRoute(parsed);
      if (doc) {
        return pathsFromPrismicDocument(doc, pathname);
      }
    } catch {
      // Fall back to path-prefix swap when no Prismic document backs the route.
    }

    return defaultPathsForPathname(pathname);
  },
);

async function fetchDocumentForRoute(parsed: ParsedLocalizedPath) {
  const client = createClient();
  const prismicLang = urlLangToPrismic(parsed.urlLang) ?? DEFAULT_PRISMIC_LANG;

  switch (parsed.kind) {
    case "home":
      return prismicGetByUID(client, "page", "home", { lang: prismicLang });
    case "page":
      if (!parsed.uid || parsed.uid === "home") return null;
      return prismicGetByUID(client, "page", parsed.uid, { lang: prismicLang });
    case "blog_post":
      if (!parsed.uid) return null;
      return prismicGetByUID(client, "blog", parsed.uid, { lang: prismicLang });
    case "blog_overview":
      return client.getSingle("blog_overview", { lang: prismicLang });
    default:
      return null;
  }
}

/** Next.js metadata `alternates` for hreflang + canonical (SEO). */
export function buildLocaleMetadataAlternates(
  paths: Partial<Record<UrlLocale, string>>,
  currentUrlLang: UrlLocale,
  options?: { includeCanonical?: boolean },
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};

  for (const [prismicLang, urlSegment] of Object.entries(PRISMIC_TO_URL_LOCALE)) {
    const path = paths[urlSegment as UrlLocale];
    if (!path) continue;
    const hreflang = PRISMIC_TO_HREFLANG[prismicLang as PrismicLocale];
    languages[hreflang] = absoluteUrl(path);
  }

  const defaultPath =
    paths[DEFAULT_URL_LANG] ??
    paths[currentUrlLang] ??
    pathForHome(DEFAULT_URL_LANG);
  languages["x-default"] = absoluteUrl(defaultPath);

  const alternates: NonNullable<Metadata["alternates"]> = { languages };

  if (options?.includeCanonical !== false) {
    alternates.canonical = absoluteUrl(
      paths[currentUrlLang] ?? pathForHome(currentUrlLang),
    );
  }

  return alternates;
}
