"use client";

import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps, type JSXMapSerializer } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>
    ) : null,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type BlogRichTextProps = SliceComponentProps<any>;

const BlogRichText: FC<BlogRichTextProps> = ({ slice }) => {
  const { content } = slice.primary;
  if (!content) return null;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <FadeIn>
          <div className="max-w-3xl mx-auto prose prose-lg prose-invert prose-neutral">
            <PrismicRichText field={content} components={components} />
          </div>
        </FadeIn>
      </Container>
    </section>
  );
};

export default BlogRichText;
