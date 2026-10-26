import "server-only";
import { notFound, redirect } from "next/navigation";
import { asLink, type PrismicDocument } from "@prismicio/client";
import { DEFAULT_PRISMIC_LANG, DEFAULT_URL_LANG, LOCALE_PATH_PREFIXES, type UrlLocale } from "@/i18n";
import { prismicGetByUID } from "@/lib/prismic-get-by-uid";
import { createClient } from "@/prismicio";

/**
 * A page that is not translated yet: send the visitor to the English version instead of a 404
 * (temporary redirect, so it switches over as soon as the translation is published).
 */
export async function fallbackToDefaultLocale(type: string, uid: string, urlLang: UrlLocale): Promise<never> {
  if (urlLang !== DEFAULT_URL_LANG) {
    const original = await prismicGetByUID<PrismicDocument>(createClient(), type, uid, { lang: DEFAULT_PRISMIC_LANG }).catch(() => null);
    const path = original ? asLink(original) : null;
    if (path) redirect(path);
  }
  notFound();
}

/**
 * Static params plus every untranslated page, so its redirect to English is built ahead. Rendered
 * on demand, the first response carried its Location header twice, which browsers can reject.
 */
export function withFallbackParams(published: { lang: string; uid: string }[]) {
  const have = new Set(published.map((p) => `${p.lang}/${p.uid}`));
  const fallbacks = published
    .filter((p) => p.lang === DEFAULT_URL_LANG)
    .flatMap((p) =>
      LOCALE_PATH_PREFIXES.filter((lang) => lang !== DEFAULT_URL_LANG && !have.has(`${lang}/${p.uid}`)).map((lang) => ({ lang, uid: p.uid })),
    );
  return [...published, ...fallbacks];
}
