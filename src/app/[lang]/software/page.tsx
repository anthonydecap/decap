import { Metadata } from "next";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { DEFAULT_PRISMIC_LANG, LOCALE_OG, resolveUrlLang, urlLangToPrismic } from "@/i18n";
import { PageThemeScope } from "@/components/PageThemeScope";
import { resolvePageTheme } from "@/lib/brand";
import { buildLocaleMetadataAlternates } from "@/lib/locale-alternates";
import { fallbackToDefaultLocale } from "@/lib/locale-fallback";
import { existingLocalePathsFromDocument } from "@/lib/locale-path";
import { prismicGetByUID } from "@/lib/prismic-get-by-uid";
import { createSliceContext } from "@/lib/slice-context";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * /software: the Prismic page "software" (overview of Virtual Orchestrion and MIDIMapper).
 * This static route takes precedence over [uid], so it renders that page itself. The shop's
 * catalog is at /shop/software; product pages stay at /software/<slug> (route group "catalog").
 */
export const revalidate = 3600;

async function getPage(lang: string) {
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;
  const page = await prismicGetByUID(createClient(), "page", "software", { lang: prismicLang }).catch(() => null);
  return { urlLang, page };
}

export default async function SoftwarePage({ params }: { params: Promise<{ lang: string }> }) {
  const { urlLang, page } = await getPage((await params).lang);
  const doc = page ?? (await fallbackToDefaultLocale("page", "software", urlLang));
  const theme = resolvePageTheme(doc.data.theme);
  return (
    <PageThemeScope theme={theme}>
      <SliceZone slices={doc.data.slices} components={components} context={createSliceContext(urlLang, { theme })} />
    </PageThemeScope>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { urlLang, page } = await getPage((await params).lang);
  if (!page) return {};
  return {
    title: page.data.meta_title || asText(page.data.title),
    description: page.data.meta_description,
    alternates: buildLocaleMetadataAlternates(existingLocalePathsFromDocument(page), urlLang),
    openGraph: { title: page.data.meta_title ?? undefined, images: [{ url: page.data.meta_image?.url ?? "" }], locale: LOCALE_OG[urlLang] },
  };
}
