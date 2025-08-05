import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { GridPattern } from "@/components/GridPattern";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

/**
 * Props for `Testimonial`.
 */
type TestimonialProps = SliceComponentProps<Content.TestimonialSlice>;

/**
 * Component for "Testimonial" Slices.
 */
const Testimonial: FC<TestimonialProps> = ({ slice }) => {
  const { quote, client_name, client_logo } = slice.primary;

  return (
    <div className="relative isolate bg-neutral-50 py-16 sm:py-28 md:py-32">
      <GridPattern
        className="absolute inset-0 -z-10 h-full w-full mask-[linear-gradient(to_bottom_left,white_50%,transparent_60%)] fill-neutral-100 stroke-neutral-950/5"
        yOffset={-256}
      />
      <Container>
        <FadeIn>
          <figure className="mx-auto max-w-4xl">
            {quote && (
              <blockquote className="relative font-display text-3xl font-medium text-neutral-950 sm:text-4xl">
                <PrismicRichText field={quote} components={components} />
              </blockquote>
            )}
            {(client_logo || client_name) && (
              <figcaption className="mt-10">
                {client_logo && (
                  <PrismicNextImage
                    field={client_logo}
                    className="h-8 w-auto"
                    alt=""
                  />
                )}
                {client_name && (
                  <div className="text-lg font-semibold text-neutral-950">
                   - {client_name}
                  </div>
                )}
              </figcaption>
            )}
          </figure>
        </FadeIn>
      </Container>
    </div>
  );
};

export default Testimonial;
