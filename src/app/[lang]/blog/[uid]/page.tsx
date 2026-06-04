/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Metadata } from "next";
import { notFound } from "next/navigation";
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
import { Container } from "@/components/Container";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { getRelatedPosts, getBlogPosts } from "@/lib/blog-utils";
export const revalidate = 3600;

type Params = { lang: string; uid: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, uid } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;
  const client = createClient();
  try {
    const post = await prismicGetByUID(client, "blog" as any, uid, {
      lang: prismicLang,
    });
    const postData = post.data as any;
    const localePaths = existingLocalePathsFromDocument(post);

    return {
      title: postData.meta_title || (typeof postData.title === "string" ? postData.title : "Blog Post"),
      description: postData.meta_description || (typeof postData.excerpt === "string" ? postData.excerpt : "Read our latest blog post"),
      alternates: buildLocaleMetadataAlternates(localePaths, urlLang),
      openGraph: {
        title: postData.meta_title || "Blog Post",
        description: postData.meta_description || "Read our latest blog post",
        images: postData.meta_image?.url ? [postData.meta_image.url] : [],
        locale: urlLang === "fr" ? "fr_FR" : "en_US",
      },
    };
  } catch {
    return { title: "Blog Post", description: "Read our latest blog post" };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { lang, uid } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;
  const client = createClient();
  let post: any = null;
  let allPosts: any[] = [];

  try {
    post = await prismicGetByUID(client, "blog" as any, uid, {
      lang: prismicLang,
    });
    allPosts = await getBlogPosts(prismicLang);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post, allPosts, 3);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Container className="pt-24 sm:pt-32 lg:pt-40 pb-24">
        {post.data.slices && post.data.slices.length > 0 ? (
          <SliceZone
            slices={post.data.slices}
            components={components}
            context={createSliceContext(urlLang, { relatedPosts })}
          />
        ) : null}
      </Container>
    </div>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  try {
    const posts = await client.getAllByType("blog" as any, { lang: "*" });
    return posts.map((post: any) => ({
      lang: prismicLangToUrl(post.lang),
      uid: post.uid,
    }));
  } catch {
    return [];
  }
}
