"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  PrismicImage,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import clsx from "clsx";

/** SmartValve gradient — one color per KPI for value text */
const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];

function getAccentColor(index: number): string {
  return SMARTVALVE_GRADIENT[Math.min(index % 6, 5)];
}

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>;
    }
  },
};

type SmartValveOpticalMidiProps = SliceComponentProps<any>;

const SmartValveOpticalMidi: FC<SmartValveOpticalMidiProps> = ({ slice }) => {
  const {
    headline,
    description,
    product_image,
    footnote,
    background_color,
  } = slice.primary;

  const stats = slice.items || [];

  const bgColor = background_color || "#0a0a0a";
  const effectiveIsDark = background_color
    ? (() => {
        const hex = (background_color as string).replace("#", "");
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        return lum < 0.5;
      })()
    : true;

  return (
    <div className="py-16 sm:py-24 lg:py-32" style={{ backgroundColor: bgColor }}>
      <Container>
        {/* Two-column: image (left) | title + description (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column: PNG image (no background container) */}
          {product_image?.url && (
            <FadeIn>
              <div className="relative flex items-center justify-center">
                <PrismicImage field={product_image} className="w-full h-auto max-w-lg mx-auto" alt="" />
              </div>
            </FadeIn>
          )}

          {/* Right column: title + description */}
          <FadeIn>
            <div
              className={clsx(
                "prose prose-lg max-w-none",
                effectiveIsDark
                  ? "prose-invert prose-neutral"
                  : "prose-neutral"
              )}
            >
              {headline && (
                <h2
                  className={clsx(
                    "text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6",
                    effectiveIsDark ? "text-white" : "text-neutral-900"
                  )}
                >
                  {headline}
                </h2>
              )}
              {description && (
                <div className={clsx("text-xl leading-relaxed", effectiveIsDark ? "text-neutral-300" : "text-neutral-600")}>
                  <PrismicRichText field={description} components={components} />
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* KPIs — metrics only, no cards */}
        {stats.length > 0 && (
          <div className="mt-24 sm:mt-28 lg:mt-32 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">
            {stats.map((stat: any, index: number) => {
              const accent = getAccentColor(index);
              return (
                <FadeIn key={index}>
                  <div className="text-left">
                    {stat.stat_kicker && (
                      <div className={clsx("text-xs font-medium uppercase tracking-wider mb-1.5", effectiveIsDark ? "text-neutral-500" : "text-neutral-500")}>
                        {stat.stat_kicker}
                      </div>
                    )}
                    <div
                      className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums"
                      style={{ color: accent }}
                    >
                      {stat.stat_value}
                    </div>
                    {stat.stat_unit && (
                      <div className={clsx("text-sm mt-0.5", effectiveIsDark ? "text-neutral-400" : "text-neutral-600")}>
                        {stat.stat_unit}
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {footnote && (
          <div
            className={clsx(
              "text-sm leading-relaxed mt-12 max-w-4xl mx-auto text-center",
              effectiveIsDark ? "text-neutral-500" : "text-neutral-500"
            )}
          >
            <PrismicRichText field={footnote} components={components} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default SmartValveOpticalMidi;
