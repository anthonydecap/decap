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

const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];
const GRADIENT_BAR = `linear-gradient(to right, ${SMARTVALVE_GRADIENT.join(", ")})`;

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>
    ) : null,
};

type SmartValveQuoteProps = SliceComponentProps<any>;

const SmartValveQuote: FC<SmartValveQuoteProps> = ({ slice }) => {
  const { section_title, quote, attribution, background_color } = slice.primary;
  const bgColor = background_color || "#0a0a0a";

  if (!quote?.length) return null;

  return (
    <div className="py-16 sm:py-24 lg:py-32 text-white" style={{ backgroundColor: bgColor }}>
      <Container>
        <FadeIn>
          <div className="max-w-4xl mx-auto">
            {section_title && section_title.length > 0 && (
              <div className="text-center mb-10">
                <div className="text-2xl sm:text-3xl font-display font-bold text-neutral-300">
                  <PrismicRichText field={section_title} components={components} />
                </div>
              </div>
            )}
            <div className="rounded-2xl lg:rounded-3xl bg-neutral-900 overflow-hidden">
              <div className="h-1 w-full" style={{ background: GRADIENT_BAR }} />
              <blockquote className="p-8 sm:p-10 lg:p-12 text-left">
                <div className="text-xl sm:text-2xl lg:text-3xl text-white/95 font-serif italic leading-relaxed">
                  <PrismicRichText field={quote} components={components} />
                </div>
                {attribution && (
                  <cite className="mt-6 block text-base sm:text-lg text-neutral-400 not-italic font-display font-medium">
                    {attribution}
                  </cite>
                )}
              </blockquote>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
};

export default SmartValveQuote;
