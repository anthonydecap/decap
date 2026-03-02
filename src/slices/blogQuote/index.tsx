"use client";

import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

/* eslint-disable @typescript-eslint/no-explicit-any */
type BlogQuoteProps = SliceComponentProps<any>;

const BlogQuote: FC<BlogQuoteProps> = ({ slice }) => {
  const { quote, attribution } = slice.primary;
  if (!quote) return null;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <FadeIn>
          <blockquote className="max-w-3xl mx-auto border-l-4 border-neutral-600 pl-6 sm:pl-8 py-4">
            <div className="text-xl sm:text-2xl text-neutral-200 italic font-serif leading-relaxed">
              <PrismicRichText field={quote} />
            </div>
            {attribution && (
              <cite className="mt-4 block text-sm text-neutral-500 not-italic">
                — {attribution}
              </cite>
            )}
          </blockquote>
        </FadeIn>
      </Container>
    </section>
  );
};

export default BlogQuote;
