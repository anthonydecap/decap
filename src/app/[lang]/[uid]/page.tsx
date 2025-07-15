import { Metadata } from "next";
import { notFound } from "next/navigation";
import { reverseLocaleLookup } from "@/i18n";

import { asText, filter } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

type Params = { lang: string; uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { lang, uid } = await params;

  const client = createClient();
  const page = await client
    .getByUID("page", uid, {
      lang: reverseLocaleLookup(lang),
    })
    .catch(() => notFound());

  // <SliceZone> renders the page's slices.
  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, uid } = await params;
  
  const client = createClient();
  const page = await client
    .getByUID("page", uid, {
      lang: reverseLocaleLookup(lang),
    })
    .catch(() => notFound());

  return {
    title: asText(page.data.title),
    description: page.data.meta_description,
    openGraph: {
      title: page.data.meta_title ?? undefined,
      images: [{ url: page.data.meta_image.url ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();

  // Get all pages from Prismic, except the homepage.
  const pages = await client.getAllByType("page", {
    filters: [filter.not("my.page.uid", "home")],
    lang: "*",
  });

  return pages.map((page) => ({ lang: page.lang, uid: page.uid }));
}
