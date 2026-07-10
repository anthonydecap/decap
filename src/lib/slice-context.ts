import type { BlogPost } from "@/lib/blog-utils";
import {
  DEFAULT_PRISMIC_LANG,
  DEFAULT_URL_LANG,
  urlLangToPrismic,
  type PrismicLocale,
  type UrlLocale,
} from "@/i18n";

export type SliceZoneContext = {
  /** URL path segment for links (`/en/blog/...`). */
  urlLang: UrlLocale;
  /** Prismic API locale (`en-us`). */
  prismicLang: PrismicLocale;
  /** @deprecated Use `urlLang`. Kept so older context shapes still work. */
  lang?: UrlLocale;
  relatedPosts?: BlogPost[];
};

export function createSliceContext(
  urlLang: string,
  extra?: Omit<SliceZoneContext, "urlLang" | "prismicLang" | "lang">,
): SliceZoneContext {
  const resolvedUrlLang = (
    urlLang === "en" || urlLang === "fr" ? urlLang : DEFAULT_URL_LANG
  ) as UrlLocale;
  const prismicLang =
    urlLangToPrismic(resolvedUrlLang) ?? DEFAULT_PRISMIC_LANG;

  return {
    urlLang: resolvedUrlLang,
    prismicLang,
    lang: resolvedUrlLang,
    ...extra,
  };
}

/** Locale fields from SliceZone context (supports legacy `lang` only). */
export function getSliceLocale(context?: Partial<SliceZoneContext>): {
  urlLang: UrlLocale;
  prismicLang: PrismicLocale;
} {
  const urlLang = (context?.urlLang ??
    context?.lang ??
    DEFAULT_URL_LANG) as UrlLocale;
  const prismicLang =
    context?.prismicLang ??
    urlLangToPrismic(urlLang) ??
    DEFAULT_PRISMIC_LANG;
  return { urlLang, prismicLang };
}
