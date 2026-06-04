import { type Metadata } from "next";
import {
  DEFAULT_PRISMIC_LANG,
  resolveUrlLang,
  urlLangToPrismic,
} from "@/i18n";
import { createSliceContext } from "@/lib/slice-context";
import { buildLocaleMetadataAlternates } from "@/lib/locale-alternates";
import { existingLocalePathsFromDocument } from "@/lib/locale-path";
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { components } from "@/slices";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
export const revalidate = 3600;

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }];
}

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;

  try {
    const client = createClient();
    const overview = await client.getSingle("blog_overview", { lang: prismicLang });
    const localePaths = existingLocalePathsFromDocument(overview);

    return {
      title: "Blog",
      description: "The latest articles and news",
      alternates: buildLocaleMetadataAlternates(localePaths, urlLang),
    };
  } catch {
    return {
      title: "Blog",
      description: "The latest articles and news",
    };
  }
}

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;
  const client = createClient();

  let overviewDoc = null;
  try {
    overviewDoc = await client.getSingle("blog_overview", {
      lang: prismicLang,
    });
  } catch {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Blog overview not found in Prismic.</p>
      </div>
    );
  }

  const data = overviewDoc.data as {
    title?: Parameters<typeof PrismicRichText>[0]["field"];
    description?: Parameters<typeof PrismicRichText>[0]["field"];
  };
  const hasHeader = Boolean(data?.title ?? data?.description);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {hasHeader ? (
        <div className="py-16 sm:py-24 border-b border-neutral-800">
          <Container>
            <FadeIn className="max-w-3xl mx-auto text-center">
              {data.title != null ? (
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
                  <PrismicRichText field={data.title} />
                </h1>
              ) : null}
              {data.description != null ? (
                <div className="mt-6 text-lg text-neutral-400">
                  <PrismicRichText field={data.description} />
                </div>
              ) : null}
            </FadeIn>
          </Container>
        </div>
      ) : null}
      <SliceZone
        slices={overviewDoc.data.slices}
        components={components}
        context={createSliceContext(urlLang)}
      />
    </div>
  );
}
