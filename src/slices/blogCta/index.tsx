"use client";

import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/Button";

/* eslint-disable @typescript-eslint/no-explicit-any */
type BlogCtaProps = SliceComponentProps<any>;

const BlogCta: FC<BlogCtaProps> = ({ slice }) => {
  const { heading, text, button_text, button_link } = slice.primary;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <FadeIn>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 sm:p-10 text-center max-w-2xl mx-auto">
            {heading && (
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                {heading}
              </h3>
            )}
            {text && (
              <div className="text-neutral-300 text-lg mb-6">
                <PrismicRichText field={text} />
              </div>
            )}
            {button_text && button_link?.url && (
              <PrismicNextLink field={button_link}>
                <Button className="bg-white text-neutral-900 hover:bg-neutral-100">
                  {button_text}
                </Button>
              </PrismicNextLink>
            )}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
};

export default BlogCta;
