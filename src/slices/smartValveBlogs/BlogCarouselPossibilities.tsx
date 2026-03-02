"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { FadeIn } from "@/components/FadeIn";
import { getBlogPostDate, extractTagsFromPost } from "@/lib/blog-utils";
import type { BlogPost } from "@/lib/blog-utils";
import clsx from "clsx";

function BlogCard({ post, lang }: { post: BlogPost; index: number; lang: string }) {
  const image = post.data.card_image || post.data.featured_image;
  const tags = extractTagsFromPost(post);
  return (
    <Link href={`/${lang}/blog/${post.uid}`} className="group block w-full h-full">
      <article className="h-full flex flex-col rounded-2xl bg-neutral-900/95 overflow-hidden shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300">
        {image?.url ? (
          <div className="relative aspect-[16/10] flex-shrink-0 overflow-hidden bg-neutral-800">
            <PrismicNextImage
              field={image}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="aspect-[16/10] flex-shrink-0 bg-neutral-800" aria-hidden />
        )}
        <div className="p-5 sm:p-6 flex flex-col h-[172px] flex-shrink-0">
          <time className="text-xs font-medium text-neutral-400 mb-2 block tracking-wide">
            {getBlogPostDate(post)}
          </time>
          <div className="font-display text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-neutral-200 transition-colors leading-snug">
            <PrismicRichText
              field={post.data.title}
              components={{
                heading1: ({ children }) => <span className="font-display text-lg font-semibold">{children}</span>,
                heading2: ({ children }) => <span className="font-display text-lg font-semibold">{children}</span>,
                heading3: ({ children }) => <span className="font-display text-lg font-semibold">{children}</span>,
              }}
            />
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            {post.data.type && (
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                {post.data.type}
              </span>
            )}
            {tags.length > 0 && (
              <>
                {post.data.type && <span className="text-neutral-600">·</span>}
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function getItemsPerView(): number {
  if (typeof window === "undefined") return 1;
  const width = window.innerWidth;
  if (width < 768) return 1;
  if (width < 1024) return 2;
  return 3;
}

type BlogCarouselPossibilitiesProps = {
  posts: BlogPost[];
  lang: string;
};

export const BlogCarouselPossibilities: FC<BlogCarouselPossibilitiesProps> = ({ posts, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const handleTouchStart = useRef({ x: 0, y: 0 });

  const maxIndex = Math.max(0, posts.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const updateItemsPerView = () => setItemsPerView(getItemsPerView());
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaX !== 0) {
        if (e.deltaX > 0) nextSlide();
        else prevSlide();
      }
    };

    const handleTouchMove = (e: TouchEvent) => e.preventDefault();

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - handleTouchStart.current.x;
      const deltaY = touch.clientY - handleTouchStart.current.y;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) prevSlide();
        else nextSlide();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      handleTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    carousel.addEventListener("wheel", handleWheel, { passive: false });
    carousel.addEventListener("touchstart", onTouchStart);
    carousel.addEventListener("touchmove", handleTouchMove, { passive: false });
    carousel.addEventListener("touchend", handleTouchEnd);

    return () => {
      carousel.removeEventListener("wheel", handleWheel);
      carousel.removeEventListener("touchstart", onTouchStart);
      carousel.removeEventListener("touchmove", handleTouchMove);
      carousel.removeEventListener("touchend", handleTouchEnd);
    };
  }, [maxIndex, nextSlide, prevSlide]);

  const showNavigation = posts.length > itemsPerView;

  return (
    <div className="relative overflow-visible">
      <div ref={carouselRef} className="overflow-visible px-8 -mx-8">
        <div
          className="flex gap-8 transition-transform duration-500 ease-in-out items-stretch"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(posts.length * 100) / itemsPerView}%`,
          }}
        >
          {posts.map((post, index) => (
            <div
              key={post.uid}
              className="flex-shrink-0 flex"
              style={{ width: `${100 / posts.length}%`, padding: "0 0.5rem" }}
            >
              <FadeIn className="w-full h-full flex">
                <BlogCard post={post} index={index} lang={lang} />
              </FadeIn>
            </div>
          ))}
        </div>
      </div>

      {showNavigation && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={clsx(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  index === currentIndex ? "bg-white scale-125" : "bg-neutral-600 hover:bg-neutral-500"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={clsx(
                "w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700",
                "flex items-center justify-center text-white",
                "hover:bg-neutral-700 hover:border-neutral-600 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-800",
                "shadow-lg hover:shadow-xl"
              )}
              aria-label="Previous items"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={clsx(
                "w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700",
                "flex items-center justify-center text-white",
                "hover:bg-neutral-700 hover:border-neutral-600 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-800",
                "shadow-lg hover:shadow-xl"
              )}
              aria-label="Next items"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
