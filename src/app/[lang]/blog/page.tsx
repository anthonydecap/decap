import { type Metadata } from "next";
import { reverseLocaleLookup } from "@/i18n";
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";

type Params = { lang: string };
type SearchParams = { tag?: string };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog",
    description: "The latest articles and news from our team",
  };
}

export default async function BlogPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  const { tag } = await searchParams;
  const client = createClient();

  // Fetch the blog_overview singleton for the current language
  let overviewDoc = null;
  try {
    const prismicLang = reverseLocaleLookup(lang) || "en-us";
    overviewDoc = await client.getSingle("blog_overview", {
      lang: prismicLang,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    // fallback: show nothing or error message
    return <div className="container mx-auto py-24 text-center text-xl">Blog overview not found in Prismic.</div>;
  }

  // Pass tag as context to BlogListing slice if needed
  // (You may need to update BlogListing to accept context)
  return (
    <SliceZone
      slices={overviewDoc.data.slices}
      components={components}
      context={{ lang, tag }}
    />
  );
} 