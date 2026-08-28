/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm font-mono text-neutral-700">{children}</code>;
    }
  },
};

/**
 * Component for "CoreTestimonial" Slices.
 *
 * Smart Valve "quote card" look, standard (light) theme, no gradient:
 * a centered white card with a solid neutral top accent bar and the quote
 * set in a large serif italic, with an optional client logo + name attribution.
 */
const CoreTestimonial: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { quote, client_name, client_logo, background_color } = slice.primary;
  const bgColor = background_color || "#fafafa";

  if (!quote?.length) return null;

  return (
    <div className="py-16 sm:py-24 lg:py-32" style={{ backgroundColor: bgColor }}>
      <Container>
        <FadeIn>
          <figure className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:rounded-3xl">
            <div className="h-1 w-full bg-neutral-200" />
            <blockquote className="p-8 text-left sm:p-10 lg:p-12">
              <div className="font-serif text-2xl font-bold italic leading-relaxed text-neutral-950 sm:text-3xl lg:text-4xl">
                <PrismicRichText field={quote} components={components} />
              </div>
              {(client_logo || client_name) && (
                <figcaption className="mt-8 flex items-center gap-4">
                  {client_logo && (
                    <PrismicNextImage
                      field={client_logo}
                      className="h-8 w-auto"
                      alt=""
                    />
                  )}
                  {client_name && (
                    <cite className="font-display text-base font-medium not-italic text-neutral-600 sm:text-lg">
                      {client_name}
                    </cite>
                  )}
                </figcaption>
              )}
            </blockquote>
          </figure>
        </FadeIn>
      </Container>
    </div>
  );
};

export default CoreTestimonial;
