"use client";

import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

/* eslint-disable @typescript-eslint/no-explicit-any */
type BlogImageProps = SliceComponentProps<any>;

const BlogImage: FC<BlogImageProps> = ({ slice }) => {
  const { image, caption, full_width } = slice.primary;
  if (!image?.url) return null;
  const content = (
    <FadeIn>
      <figure>
        <PrismicNextImage
          field={image}
          className="w-full h-auto rounded-2xl border border-neutral-800"
          alt={caption || ""}
        />
        {caption && (
          <figcaption className="mt-3 text-sm text-neutral-500 text-center">
            {caption}
          </figcaption>
        )}
      </figure>
    </FadeIn>
  );
  if (full_width) {
    return (
      <section className="py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 max-w-5xl mx-auto">{content}</div>
      </section>
    );
  }
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="max-w-3xl mx-auto">{content}</div>
      </Container>
    </section>
  );
};

export default BlogImage;
