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

/** SmartValve gradient — distributed across cards like possibilities slice */
const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];

function getGradientForCard(index: number, total: number): string {
  if (total <= 0) return `linear-gradient(to right, ${SMARTVALVE_GRADIENT[0]}, ${SMARTVALVE_GRADIENT[1]})`;
  const start = index / total;
  const end = (index + 1) / total;
  const fromIdx = Math.min(4, Math.floor(start * 6));
  let toIdx = Math.min(5, Math.floor(end * 6));
  if (toIdx <= fromIdx) toIdx = Math.min(5, fromIdx + 1);
  const from = SMARTVALVE_GRADIENT[fromIdx];
  const to = SMARTVALVE_GRADIENT[toIdx];
  return `linear-gradient(to right, ${from}, ${to})`;
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
    <div className="py-8 sm:py-12 lg:py-24" style={{ backgroundColor: bgColor }}>
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

        {/* Stats cards — SmartValve gradient style like possibilities slice */}
        {stats.length > 0 && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat: any, index: number) => {
              const accentGradient = getGradientForCard(index, stats.length);
              return (
                <FadeIn key={index}>
                  <div
                    className={clsx(
                      "group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] h-full flex flex-col",
                      effectiveIsDark
                        ? "bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-xl hover:shadow-2xl"
                        : "bg-white border border-neutral-200 shadow-sm hover:shadow-xl"
                    )}
                  >
                    {/* SmartValve gradient accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 shadow-lg"
                      style={{ background: accentGradient }}
                    />
                    <div
                      className="absolute top-0 left-0 right-0 h-1 opacity-50 blur-sm pointer-events-none"
                      style={{ background: accentGradient }}
                    />

                    <div className="text-center pt-2">
                      {stat.stat_kicker && (
                        <div className={clsx("text-xs font-medium mb-2", effectiveIsDark ? "text-neutral-500" : "text-neutral-500")}>
                          {stat.stat_kicker}
                        </div>
                      )}
                      <div
                        className="font-display text-3xl sm:text-4xl font-bold text-transparent bg-clip-text"
                        style={{ backgroundImage: accentGradient }}
                      >
                        {stat.stat_value}
                      </div>
                      {stat.stat_unit && (
                        <div className={clsx("text-sm mt-1", effectiveIsDark ? "text-neutral-400" : "text-neutral-600")}>
                          {stat.stat_unit}
                        </div>
                      )}
                    </div>

                    {/* Hover effect overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-sm pointer-events-none"
                      style={{ background: accentGradient }}
                    />
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
