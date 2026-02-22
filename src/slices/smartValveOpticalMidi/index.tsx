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

const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];
const GRADIENT_TEXT = `linear-gradient(to right, ${SMARTVALVE_GRADIENT.join(", ")})`;

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

        {/* KPIs — soft card-like blocks (contained but not boxy) */}
        {stats.length > 0 && (
          <div className="mt-24 sm:mt-28 lg:mt-32 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat: any, index: number) => (
              <FadeIn key={index}>
                <div
                  className={clsx(
                    "rounded-2xl px-5 py-4 sm:px-6 sm:py-5 text-left",
                    effectiveIsDark
                      ? "bg-white/[0.04] ring-1 ring-white/[0.06]"
                      : "bg-neutral-100/70 ring-1 ring-neutral-200/80"
                  )}
                >
                  <div className="font-display text-3xl sm:text-4xl font-bold tabular-nums leading-tight">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: GRADIENT_TEXT,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {stat.stat_value}
                    </span>
                    {stat.stat_unit && (
                      <span
                        className={clsx(
                          "font-normal ml-1.5 text-xl sm:text-2xl",
                          effectiveIsDark ? "text-neutral-400" : "text-neutral-600"
                        )}
                      >
                        {stat.stat_unit}
                      </span>
                    )}
                  </div>
                  {stat.stat_kicker && (
                    <div
                      className={clsx(
                        "mt-1 text-sm",
                        effectiveIsDark ? "text-neutral-500" : "text-neutral-500"
                      )}
                    >
                      {stat.stat_kicker}
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
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
