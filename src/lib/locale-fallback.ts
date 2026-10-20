import "server-only";
import { notFound, redirect } from "next/navigation";
import { asLink, type PrismicDocument } from "@prismicio/client";
import { DEFAULT_PRISMIC_LANG, DEFAULT_URL_LANG, type UrlLocale } from "@/i18n";
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
