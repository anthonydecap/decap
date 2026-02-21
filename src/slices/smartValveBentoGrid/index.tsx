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

/** Single cell: image, gradient bar, title, description. */
function BentoCell({
  item,
  index,
  gradient,
}: {
  item: any;
  index: number;
  gradient: string;
}) {
  const hasImage = item.background_image?.url;
  return (
    <div className="group relative overflow-hidden rounded-2xl lg:rounded-3xl flex flex-col min-h-0 h-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300">
      {hasImage && (
        <div className="absolute inset-0">
          <PrismicNextImage
            field={item.background_image}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 2}
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      )}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ background: gradient }} />
      <div className="relative z-10 mt-auto p-5 sm:p-6">
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
