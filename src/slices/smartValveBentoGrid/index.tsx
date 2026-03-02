"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];

function getGradient(index: number): string {
  const i = index % 6;
  const j = (index + 1) % 6;
  return `linear-gradient(135deg, ${SMARTVALVE_GRADIENT[i]}, ${SMARTVALVE_GRADIENT[j]})`;
}

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>
    ) : null,
};

/** Image layer + gradient bar; shared by all styles that use an image. */
function BentoImageLayer({
  item,
  index,
  gradient,
}: {
  item: any;
  index: number;
  gradient: string;
}) {
  const hasImage = item.background_image?.url;
  const isContain = item.background_image_mode === "contain";
  const filterKey = (item.background_image_filter as string) || "none";
  const imageFilter =
    filterKey === "grayscale" ? "grayscale(100%)" : filterKey === "sepia" ? "sepia(100%)" : "none";
  const filterStyle = imageFilter !== "none" ? { filter: imageFilter } : undefined;

  return (
    <>
      {hasImage && (
        <div className="absolute inset-0">
          {isContain ? (
            <div
              className="h-full w-full bg-neutral-800 bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${item.background_image.url})`,
                backgroundSize: "55%",
                ...filterStyle,
              }}
            />
          ) : (
            <PrismicNextImage
              field={item.background_image}
              className="h-full w-full object-cover"
              style={filterStyle}
              priority={index < 2}
              alt=""
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        </div>
      )}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: gradient }} />
    </>
  );
}

/** Single cell: layout varies by cell_style. */
function BentoCell({
  item,
  index,
  gradient,
}: {
  item: any;
  index: number;
  gradient: string;
}) {
  const style = (item.cell_style as string) || "default";
  const hasImage = item.background_image?.url;

  const baseClasses =
    "group relative overflow-hidden rounded-2xl lg:rounded-3xl flex flex-col min-h-0 h-full bg-neutral-900 transition-all duration-300";

  // text_only: no image, gradient tint + large text
  if (style === "text_only") {
    return (
      <div className={baseClasses}>
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: gradient }}
        />
        <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: gradient }} />
        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 flex-1 transition-opacity duration-300 group-hover:opacity-0">
          {item.item_title && (
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
              {item.item_title}
            </h3>
          )}
          {item.item_description && (
            <div className="text-sm sm:text-base text-white/90 leading-relaxed">
              <PrismicRichText field={item.item_description} components={components} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // stat: big number + label (original)
  if (style === "stat") {
    return (
      <div className={baseClasses}>
        {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
        <div className="relative z-10 flex flex-col justify-center items-center p-6 sm:p-8 flex-1 text-center transition-opacity duration-300 group-hover:opacity-0">
          {item.item_title && (
            <span
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tabular-nums block mb-2"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
            >
              {item.item_title}
            </span>
          )}
          {item.item_description && (
            <div className="text-sm sm:text-base text-white/80 max-w-[12rem]">
              <PrismicRichText field={item.item_description} components={components} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // stat_compact: smaller number, same layout
  if (style === "stat_compact") {
    return (
      <div className={baseClasses}>
        {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
        <div className="relative z-10 flex flex-col justify-center items-center p-5 sm:p-6 flex-1 text-center transition-opacity duration-300 group-hover:opacity-0">
          {item.item_title && (
            <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums block mb-1.5 drop-shadow-md">
              {item.item_title}
            </span>
          )}
          {item.item_description && (
            <div className="text-xs sm:text-sm text-white/75 max-w-[10rem]">
              <PrismicRichText field={item.item_description} components={components} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // stat_minimal: number + label one line, bottom of cell
  if (style === "stat_minimal") {
    return (
      <div className={baseClasses}>
        {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
        <div className="relative z-10 mt-auto p-5 sm:p-6 transition-opacity duration-300 group-hover:opacity-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            {item.item_title && (
              <span className="font-display text-2xl sm:text-3xl font-semibold text-white tabular-nums drop-shadow-md">
                {item.item_title}
              </span>
            )}
            {item.item_description && (
              <span className="text-sm text-white/80">
                <PrismicRichText field={item.item_description} components={components} />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // stat_soft: medium number, more emphasis on label, softer weight
  if (style === "stat_soft") {
    return (
      <div className={baseClasses}>
        {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
        <div className="relative z-10 flex flex-col justify-center items-center p-6 sm:p-7 flex-1 text-center transition-opacity duration-300 group-hover:opacity-0">
          {item.item_description && (
            <div className="text-xs uppercase tracking-wider text-white/70 mb-2">
              <PrismicRichText field={item.item_description} components={components} />
            </div>
          )}
          {item.item_title && (
            <span className="font-display text-3xl sm:text-4xl font-semibold text-white tabular-nums drop-shadow-md">
              {item.item_title}
            </span>
          )}
        </div>
      </div>
    );
  }

  // quote: description = quote, title = attribution
  if (style === "quote") {
    return (
      <div className={baseClasses}>
        {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 flex-1 transition-opacity duration-300 group-hover:opacity-0">
          {item.item_description && (
            <blockquote className="text-lg sm:text-xl lg:text-2xl text-white/95 leading-snug italic font-serif mb-4 drop-shadow-md">
              <PrismicRichText field={item.item_description} components={components} />
            </blockquote>
          )}
          {item.item_title && (
            <cite className="text-sm text-white/70 not-italic">
              — {item.item_title}
            </cite>
          )}
        </div>
      </div>
    );
  }

  // large_headline: big title, small description
  if (style === "large_headline") {
    return (
      <div className={baseClasses}>
        {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
        <div className="relative z-10 mt-auto p-5 sm:p-6 lg:p-8 transition-opacity duration-300 group-hover:opacity-0">
          {item.item_title && (
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 drop-shadow-sm">
              {item.item_title}
            </h3>
          )}
          {item.item_description && (
            <div className="text-sm text-neutral-200/90 leading-relaxed drop-shadow-sm max-w-md">
              <PrismicRichText field={item.item_description} components={components} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // minimal: image + large title only (centered or bottom)
  if (style === "minimal") {
    return (
      <div className={baseClasses}>
        {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
        <div className="relative z-10 flex flex-col justify-end flex-1 p-5 sm:p-6 transition-opacity duration-300 group-hover:opacity-0">
          {item.item_title && (
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              {item.item_title}
            </h3>
          )}
        </div>
      </div>
    );
  }

  // default: classic image + title + description at bottom
  return (
    <div className={baseClasses}>
      {hasImage && <BentoImageLayer item={item} index={index} gradient={gradient} />}
      <div className="relative z-10 mt-auto p-5 sm:p-6 transition-opacity duration-300 group-hover:opacity-0">
        {item.item_title && (
          <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-2 drop-shadow-sm">
            {item.item_title}
          </h3>
        )}
        {item.item_description && (
          <div className="text-sm text-neutral-200/90 leading-relaxed drop-shadow-sm">
            <PrismicRichText field={item.item_description} components={components} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Exactly 4 items. Layout like reference: left col = tall top + short bottom; right col = two equal cells. */
const SmartValveBentoGrid: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const bgColor = background_color || "#0a0a0a";
  const items = (slice.items || []).slice(0, 4);

  return (
    <div className="py-16 sm:py-24 lg:py-32 text-white" style={{ backgroundColor: bgColor }}>
      <Container>
        {(section_title || section_subtitle) && (
          <div className="text-center mb-12 lg:mb-16">
            <FadeIn>
              {section_title && (
                <div className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
                  <PrismicRichText field={section_title} components={components} />
                </div>
              )}
              {section_subtitle && (
                <div className="max-w-2xl mx-auto text-lg text-neutral-400">
                  <PrismicRichText field={section_subtitle} components={components} />
                </div>
              )}
            </FadeIn>
          </div>
        )}

        <FadeInStagger faster>
          {/* Picture-style bento. Aspect 3/2 for a shorter section. */}
          <div
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full"
            style={{ aspectRatio: "3/2" }}
          >
            {/* Left column: item 0 (tall), item 2 (short) */}
            <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 min-h-0">
              <div className="flex-[1.5] min-h-0 h-full">
                <FadeIn className="h-full">
                  <BentoCell item={items[0]} index={0} gradient={getGradient(0)} />
                </FadeIn>
              </div>
              <div className="flex-1 min-h-0 h-full">
                <FadeIn className="h-full">
                  <BentoCell item={items[2]} index={2} gradient={getGradient(2)} />
                </FadeIn>
              </div>
            </div>
            {/* Right column: same as left but reversed — short top, tall (square) bottom */}
            <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 min-h-0">
              <div className="flex-1 min-h-0 h-full">
                <FadeIn className="h-full">
                  <BentoCell item={items[1]} index={1} gradient={getGradient(1)} />
                </FadeIn>
              </div>
              <div className="flex-[1.5] min-h-0 h-full">
                <FadeIn className="h-full">
                  <BentoCell item={items[3]} index={3} gradient={getGradient(3)} />
                </FadeIn>
              </div>
            </div>
          </div>
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default SmartValveBentoGrid;
