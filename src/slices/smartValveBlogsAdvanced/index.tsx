import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { BlogCarousel } from "./BlogCarousel";
import { getBlogPostsByType } from "@/lib/blog-utils";
import { getBlogPostDate } from "@/lib/blog-utils";
import { extractTagsFromPost } from "@/lib/blog-utils";
import type { BlogPost } from "@/lib/blog-utils";

const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];

function getGradient(index: number): string {
  const i = index % 6;
  const j = (index + 1) % 6;
  return `linear-gradient(135deg, ${SMARTVALVE_GRADIENT[i]}, ${SMARTVALVE_GRADIENT[j]})`;
}

/** Single blog card for carousel */
function BlogCard({
  post,
  index,
  lang,
}: {
  post: BlogPost;
  index: number;
  lang: string;
}) {
  const image = post.data.card_image || post.data.featured_image;
  const tags = extractTagsFromPost(post);
  return (
    <Link
      href={`/${lang}/blog/${post.uid}`}
      className="group block w-full min-w-0"
    >
      <article className="relative h-full rounded-2xl bg-neutral-900 overflow-hidden transition-colors flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10 rounded-t-2xl" style={{ background: getGradient(index) }} />
        {image?.url && (
          <div className="relative aspect-video overflow-hidden">
            <PrismicNextImage
              field={image}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        )}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <time className="text-xs text-neutral-500 mb-2 block">
            {getBlogPostDate(post)}
          </time>
          <h3 className="font-display text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-neutral-300 transition-colors">
            <PrismicRichText field={post.data.title} />
          </h3>
          {post.data.type && (
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500 mt-auto">
              {post.data.type}
            </span>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SmartValveBlogsAdvancedProps = {
  slice: any;
  context?: { lang?: string };
};

export default async function SmartValveBlogsAdvanced({ slice, context }: SmartValveBlogsAdvancedProps) {
  const { section_title, background_color } = slice.primary;
  const lang = context?.lang || "en";
  const langCode = lang === "fr" ? "fr-fr" : "en-us";
  const posts = await getBlogPostsByType("smartvalve", langCode);
  const bgColor = background_color || "#0a0a0a";

  if (posts.length === 0) return null;

  return (
    <div className="py-16 sm:py-24 lg:py-32 text-white" style={{ backgroundColor: bgColor }}>
      <Container>
        {section_title && (
          <FadeIn>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-10">
              {section_title}
            </h2>
          </FadeIn>
        )}
        <BlogCarousel>
          {posts.map((post, index) => (
            <BlogCard key={post.uid} post={post} index={index} lang={lang} />
          ))}
        </BlogCarousel>
      </Container>
    </div>
  );
}
