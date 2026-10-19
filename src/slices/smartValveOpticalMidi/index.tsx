"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import clsx from "clsx";

/** SmartValve gradient — stretched across all stat rules so together they read as one line */
const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];
const FULL_GRADIENT = `linear-gradient(to right, ${SMARTVALVE_GRADIENT.join(", ")})`;

function getGradientSegment(index: number, total: number) {
  if (total <= 1) return { background: FULL_GRADIENT };
  return {
    background: FULL_GRADIENT,
    backgroundSize: `${total * 100}% 100%`,
    backgroundPosition: `${(index / (total - 1)) * 100}% 0`,
  };
}


/** Static class map so Tailwind can see every column count */
const statColumns: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

function isDarkBackground(color?: string | null): boolean {
  if (!color) return true;
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}

function getComponents(isDark: boolean): JSXMapSerializer {
  return {
    hyperlink: ({ node, children }) => (
      <PrismicNextLink
        field={node.data}
        className={clsx(
          "underline underline-offset-4 transition-colors",
          isDark
            ? "decoration-neutral-600 hover:decoration-white"
            : "decoration-neutral-300 hover:decoration-neutral-900"
        )}
      >
        {children}
      </PrismicNextLink>
    ),
    label: ({ node, children }) => {
      if (node.data.label === "codespan") {
        return (
          <code
            className={clsx(
              "rounded px-1 py-0.5 text-sm font-mono",
              isDark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-700"
            )}
          >
            {children}
          </code>
        );
      }
    },
  };
}

type SmartValveOpticalMidiProps = SliceComponentProps<any>;

const SmartValveOpticalMidi: FC<SmartValveOpticalMidiProps> = ({ slice }) => {
  const { headline, description, product_image, footnote, background_color } = slice.primary;
  const stats = (slice.items || []).filter((stat: any) => stat.stat_value);

  const bgColor = background_color || "#0a0a0a";
  const isDark = isDarkBackground(background_color);
  const components = getComponents(isDark);
  const hasImage = Boolean(product_image?.url);

  return (
    <div className="py-16 sm:py-24 lg:py-32" style={{ backgroundColor: bgColor }}>
      <Container>
        {/* Product image | headline + description; stacks image-first below lg */}
        <div
          className={clsx(
            "grid grid-cols-1 items-center gap-12 lg:gap-20",
            hasImage && "lg:grid-cols-12"
          )}
        >
          {hasImage && (
            <FadeIn className="lg:col-span-6">
              <div className="relative flex items-center justify-center">
                <PrismicNextImage
                  field={product_image}
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="relative mx-auto h-auto w-full max-w-lg"
                />
              </div>
            </FadeIn>
          )}

          <FadeIn className={clsx(hasImage ? "lg:col-span-6" : "max-w-3xl")}>
            {headline && (
              <h2
                className={clsx(
                  "font-display text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl",
                  isDark ? "text-white" : "text-neutral-900"
                )}
              >
                {headline}
              </h2>
            )}

            {description && (
              <div
                className={clsx(
                  "mt-6 max-w-[60ch] space-y-4 text-lg leading-relaxed sm:text-xl",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                <PrismicRichText field={description} components={components} />
              </div>
            )}
          </FadeIn>
        </div>

        {/* Stats — open row; each top rule shows its slice of one continuous SmartValve gradient */}
        {stats.length > 0 && (
          <FadeInStagger
            faster
            className={clsx(
              "mt-20 grid grid-cols-1 gap-x-10 gap-y-12 sm:mt-24 lg:mt-28",
              statColumns[stats.length] ?? "sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {stats.map((stat: any, index: number) => (
              <FadeIn key={index} className="relative pt-8">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px"
                  style={getGradientSegment(index, stats.length)}
                />
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-2 leading-none">
                  <span
                    className={clsx(
                      "font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl",
                      isDark ? "text-white" : "text-neutral-900"
                    )}
                  >
                    {stat.stat_value}
                  </span>
                  {stat.stat_unit && (
                    <span
                      className={clsx(
                        "whitespace-nowrap text-base",
                        isDark ? "text-neutral-400" : "text-neutral-600"
                      )}
                    >
                      {stat.stat_unit}
                    </span>
                  )}
                </p>
                {stat.stat_kicker && (
                  <p
                    className={clsx(
                      "mt-4 text-sm",
                      "text-neutral-500"
                    )}
                  >
                    {stat.stat_kicker}
                  </p>
                )}
              </FadeIn>
            ))}
          </FadeInStagger>
        )}

        {footnote && (
          <div className="mt-8 max-w-[75ch] text-sm leading-relaxed text-neutral-500">
            <PrismicRichText field={footnote} components={components} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default SmartValveOpticalMidi;
