/** Work case study (Prismic "project"), e.g. /en/work/pat-metheny. Same page builder as Page. */
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import {
  DEFAULT_PRISMIC_LANG,
  prismicLangToUrl,
  resolveUrlLang,
  urlLangToPrismic,
} from "@/i18n";
import { prismicGetByUID } from "@/lib/prismic-get-by-uid";
import { createSliceContext } from "@/lib/slice-context";
import { resolvePageTheme } from "@/lib/brand";
import { PageThemeScope } from "@/components/PageThemeScope";
import { buildLocaleMetadataAlternates } from "@/lib/locale-alternates";
import { existingLocalePathsFromDocument } from "@/lib/locale-path";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
export const revalidate = 3600;

type Params = { lang: string; uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { lang, uid } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;

  const client = createClient();
  const page = await prismicGetByUID(client, "project", uid, {
    lang: prismicLang,
  }).catch(() => notFound());

  const theme = resolvePageTheme(page.data.theme);

  return (
    <PageThemeScope theme={theme}>
      <SliceZone
        slices={page.data.slices}
        components={components}
        context={createSliceContext(urlLang, { theme })}
      />
    </PageThemeScope>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, uid } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;

  const client = createClient();
  const page = await prismicGetByUID(client, "project", uid, {
    lang: prismicLang,
  }).catch(() => notFound());

  const localePaths = existingLocalePathsFromDocument(page);

  return {
    title: asText(page.data.title),
    description: page.data.meta_description,
    alternates: buildLocaleMetadataAlternates(localePaths, urlLang),
    openGraph: {
      title: page.data.meta_title ?? undefined,
      images: [{ url: page.data.meta_image.url ?? "" }],
      locale: urlLang === "fr" ? "fr_FR" : "en_US",
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("project", { lang: "*" });

  return pages
    .map((page) => ({
      lang: prismicLangToUrl(page.lang),
      uid: page.uid,
    }));
}
