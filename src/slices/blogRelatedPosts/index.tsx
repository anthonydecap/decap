"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { FadeIn } from "@/components/FadeIn";
import { getBlogPostDate } from "@/lib/blog-utils";
import type { BlogPost } from "@/lib/blog-utils";

type BlogRelatedPostsProps = {
  slice: any;
  context?: { lang?: string; relatedPosts?: BlogPost[] };
};

const BlogRelatedPosts: FC<BlogRelatedPostsProps> = ({ slice, context }) => {
  const relatedPosts = context?.relatedPosts ?? [];
  const lang = context?.lang ?? "en";
  const sectionTitle = slice?.primary?.section_title || "Related Posts";

  if (relatedPosts.length === 0) return null;

  return (
    <FadeIn>
      <div className="mt-24 sm:mt-32 pt-16 border-t border-neutral-800">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8">
          {sectionTitle}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.map((relatedPost: BlogPost) => {
            const cardImg = relatedPost.data.card_image || relatedPost.data.featured_image;
            return (
              <Link
                key={relatedPost.uid}
                href={`/${lang}/blog/${relatedPost.uid}`}
                className="group block rounded-2xl bg-neutral-900 overflow-hidden transition-colors"
              >
                {cardImg?.url && (
                  <div className="aspect-video overflow-hidden">
                    <PrismicNextImage
                      field={cardImg}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      alt=""
                    />
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  <time className="text-xs text-neutral-500 block">
                    {getBlogPostDate(relatedPost)}
                  </time>
                  <h3 className="font-display text-lg font-bold text-white mt-2 line-clamp-2 group-hover:text-neutral-300">
                    <PrismicRichText field={relatedPost.data.title} />
                  </h3>
                  {relatedPost.data.type && (
                    <span className="text-xs text-neutral-500 uppercase tracking-wider mt-2 block">
                      {relatedPost.data.type}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
};

export default BlogRelatedPosts;
