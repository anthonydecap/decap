/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { reverseLocaleLookup } from "@/i18n";
import { createClient } from "@/prismicio";
import { Container } from "@/components/Container";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { getRelatedPosts, getBlogPosts } from "@/lib/blog-utils";

type Params = { lang: string; uid: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, uid } = await params;
  const client = createClient();
  try {
    const post = await client.getByUID("blog" as any, uid, {
      lang: reverseLocaleLookup(lang),
    });
    const postData = post.data as any;
    return {
      title: postData.meta_title || (typeof postData.title === "string" ? postData.title : "Blog Post"),
      description: postData.meta_description || (typeof postData.excerpt === "string" ? postData.excerpt : "Read our latest blog post"),
      openGraph: {
        title: postData.meta_title || "Blog Post",
        description: postData.meta_description || "Read our latest blog post",
        images: postData.meta_image?.url ? [postData.meta_image.url] : [],
      },
    };
  } catch {
    return { title: "Blog Post", description: "Read our latest blog post" };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { lang, uid } = await params;
  const client = createClient();
  let post: any = null;
  let allPosts: any[] = [];

  try {
    post = await client.getByUID("blog" as any, uid, {
      lang: reverseLocaleLookup(lang),
    });
    allPosts = await getBlogPosts(reverseLocaleLookup(lang) || "en-us");
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
            context={{ lang, relatedPosts }}
          />
        ) : null}
      </Container>
    </div>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const LOCALES: Record<string, string> = { "en-us": "en", "fr-fr": "fr" };
  try {
    const posts = await client.getAllByType("blog" as any, { lang: "*" });
    return posts.map((post: any) => ({
      lang: LOCALES[post.lang] || post.lang,
      uid: post.uid,
    }));
  } catch {
    return [];
  }
}
