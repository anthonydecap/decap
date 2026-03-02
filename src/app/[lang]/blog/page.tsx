import { type Metadata } from "next";
import { reverseLocaleLookup } from "@/i18n";
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { components } from "@/slices";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

type Params = { lang: string };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog",
    description: "The latest articles and news",
  };
}

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  const client = createClient();

  let overviewDoc = null;
  try {
    overviewDoc = await client.getSingle("blog_overview", {
      lang: reverseLocaleLookup(lang),
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
        context={{ lang }}
      />
    </div>
  );
} 