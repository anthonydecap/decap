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
  const page = await prismicGetByUID(client, "page", uid, {
    lang: prismicLang,
  }).catch(() => notFound());

  return (
    <SliceZone
      slices={page.data.slices}
      components={components}
      context={createSliceContext(urlLang)}
    />
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
  const page = await prismicGetByUID(client, "page", uid, {
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
  const pages = await client.getAllByType("page", { lang: "*" });

  return pages
    .filter((page) => page.uid !== "home")
    .map((page) => ({
      lang: prismicLangToUrl(page.lang),
      uid: page.uid,
    }));
}
