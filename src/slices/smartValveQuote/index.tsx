"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import clsx from "clsx";

function isDarkBackground(color?: string | null): boolean {
  if (!color) return true;
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}

/** Editors sometimes type a leading dash before the name; the rule replaces it */
const cleanAttribution = (value?: string | null) => (value || "").replace(/^[\s—–-]+/, "").trim();

function getComponents(isDark: boolean): JSXMapSerializer {
  return {
    paragraph: ({ children }) => <p className="[&+p]:mt-6">{children}</p>,
    // Bold inside the quote = the line to remember; same family, brighter and heavier
    strong: ({ children }) => (
      <strong className={clsx("font-semibold", isDark ? "text-white" : "text-neutral-950")}>{children}</strong>
    ),
    hyperlink: ({ node, children }) => (
      <PrismicNextLink field={node.data} className="underline underline-offset-4">
        {children}
      </PrismicNextLink>
    ),
    label: ({ node, children }) =>
      node.data.label === "codespan" ? (
        <code
          className={clsx(
            "rounded px-1 py-0.5 text-sm font-mono",
            isDark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-700"
          )}
        >
          {children}
        </code>
      ) : null,
  };
}

type SmartValveQuoteProps = SliceComponentProps<any>;

/**
 * SmartValveQuote — type-only pull quote. Small label left, large sans quote right with a
 * hanging opening mark; no card, no gradient. Collapses to a single column below lg.
 */
const SmartValveQuote: FC<SmartValveQuoteProps> = ({ slice }) => {
  const { section_title, quote, attribution, background_color } = slice.primary;
  if (!quote?.length) return null;

  const bgColor = background_color || "#0a0a0a";
  const isDark = isDarkBackground(background_color);
  const components = getComponents(isDark);
  const name = cleanAttribution(attribution);
  const hasTitle = section_title && section_title.length > 0;

  return (
    <section className="py-16 sm:py-24 lg:py-32" style={{ backgroundColor: bgColor }}>
      <Container>
        <FadeIn className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {hasTitle && (
            <div
              className="text-base font-medium text-neutral-500 lg:col-span-3 lg:pt-3 [&_*]:text-base [&_*]:font-medium"
            >
              <PrismicRichText field={section_title} components={components} />
            </div>
          )}

          <figure className={clsx("lg:col-span-8", hasTitle ? "lg:col-start-5" : "lg:col-start-4")}>
            <blockquote className="relative">
              <span
                aria-hidden="true"
                className={clsx(
                  "block font-display text-6xl font-bold leading-none lg:absolute lg:-left-[0.6em] lg:top-0 lg:text-5xl",
                  isDark ? "text-neutral-700" : "text-neutral-300"
                )}
              >
                &ldquo;
              </span>
              <div
                className={clsx(
                  "font-display text-2xl font-medium leading-snug tracking-tight text-pretty sm:text-3xl lg:text-4xl lg:leading-[1.2]",
                  isDark ? "text-neutral-300" : "text-neutral-600"
                )}
              >
                <PrismicRichText field={quote} components={components} />
              </div>
            </blockquote>

            {name && (
              <figcaption className="mt-10 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className={clsx("h-px w-10 shrink-0", isDark ? "bg-neutral-700" : "bg-neutral-300")}
                />
                <span className={clsx("text-base", isDark ? "text-neutral-400" : "text-neutral-600")}>
                  {name}
                </span>
              </figcaption>
            )}
          </figure>
        </FadeIn>
      </Container>
    </section>
  );
};

export default SmartValveQuote;
