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
 * Props for `SectionIntro`.
 */
type SectionIntroProps = SliceComponentProps<Content.SectionIntroSlice>;

/**
 * Component for "SectionIntro" Slices.
 */
const SectionIntro: FC<SectionIntroProps> = ({ slice }) => {
  const { eyebrow, title, description, smaller, invert } = slice.primary;

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn className="max-w-2xl">
        <h2>
          {eyebrow && (
            <>
              <span
                className={clsx(
                  'mb-6 block font-display text-base font-semibold',
                  invert ? 'text-white' : 'text-neutral-950',
                )}
              >
                {eyebrow}
              </span>
              <span className="sr-only"> - </span>
            </>
          )}
          {title && (
            <span
              className={clsx(
                'block font-display tracking-tight text-balance',
                smaller
                  ? 'text-2xl font-semibold'
                  : 'text-4xl font-medium sm:text-5xl',
                invert ? 'text-white' : 'text-neutral-950',
              )}
            >
              {title}
            </span>
          )}
        </h2>
        {description && (
          <div
            className={clsx(
              'mt-6 text-xl',
              invert ? 'text-neutral-300' : 'text-neutral-600',
            )}
          >
            <PrismicRichText field={description} components={components} />
          </div>
        )}
      </FadeIn>
    </Container>
  );
};

export default SectionIntro; 