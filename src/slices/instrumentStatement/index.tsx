/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps, type JSXMapSerializer } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG } from "@/lib/instrument-ui";

const statementComponents: JSXMapSerializer = {
  paragraph: ({ children }) => (
    <p className="font-display text-4xl font-bold leading-tight tracking-tight text-neutral-500 sm:text-5xl lg:text-6xl xl:text-7xl">
      {children}
    </p>
  ),
  strong: ({ children }) => <strong className="text-white">{children}</strong>,
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
  ),
};

const InstrumentStatement: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { eyebrow, statement, cta_text, cta_link, background_color } = slice.primary;
  const bg = background_color || "#0a0a0a";

  const hasStatement = statement && statement.length > 0;
  if (!eyebrow && !hasStatement && !cta_text) return null;

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        <FadeInStagger>
          <div className="mx-auto max-w-4xl text-center">
            {eyebrow && (
              <FadeIn>
                <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {eyebrow}
                </p>
              </FadeIn>
            )}
            {hasStatement && (
              <FadeIn>
                <PrismicRichText field={statement} components={statementComponents} />
              </FadeIn>
            )}
            {cta_text && (
              <FadeIn>
                <div className="mt-10">
                  <PrismicNextLink
                    field={cta_link}
                    className="inline-block rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {cta_text}
                  </PrismicNextLink>
                </div>
              </FadeIn>
            )}
          </div>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentStatement;
