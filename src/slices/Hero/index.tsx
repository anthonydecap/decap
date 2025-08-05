import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import clsx from "clsx";

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
 * Props for `Hero`.
 */
type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  const { eyebrow, title, description, centered } = slice.primary;

  return (
    <Container
      className={clsx('mt-8 sm:mt-12 lg:mt-16', centered && 'text-center')}
    >
      <FadeIn>
        <h1>
          {eyebrow && (
            <span className="block font-display text-base font-semibold text-neutral-950">
              {eyebrow}
            </span>
          )}
          <span className="sr-only"> - </span>
          {title && (
            <span
              className={clsx(
                'mt-6 block max-w-5xl font-display text-5xl font-medium tracking-tight text-balance text-neutral-950 sm:text-6xl',
                centered && 'mx-auto',
              )}
            >
              {title}
            </span>
          )}
        </h1>
        {description && (
          <div
            className={clsx(
              'mt-6 max-w-3xl text-xl text-neutral-600',
              centered && 'mx-auto',
            )}
          >
            <PrismicRichText field={description} components={components} />
          </div>
        )}
      </FadeIn>
    </Container>
  );
};

export default Hero; 