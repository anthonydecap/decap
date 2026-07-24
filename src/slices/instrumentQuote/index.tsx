/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentQuote: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { quote, author_name, author_role, author_image, background_color } = slice.primary;
  const bg = background_color || "#0a0a0a";

  if (!quote?.length) return null;

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-4xl text-center">
            <blockquote className="font-display text-3xl font-medium leading-tight text-white sm:text-4xl lg:text-5xl">
              <PrismicRichText field={quote} components={instrumentRichText} />
            </blockquote>
            {(author_image?.url || author_name || author_role) && (
              <div className="mt-10 flex items-center justify-center gap-4">
                {author_image?.url && (
                  <PrismicNextImage
                    field={author_image}
                    className="h-12 w-12 rounded-full object-cover"
                    alt=""
                  />
                )}
                <div className="text-left">
                  {author_name && (
                    <div className="font-display font-semibold text-white">{author_name}</div>
                  )}
                  {author_role && <div className="text-sm text-neutral-400">{author_role}</div>}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
};

export default InstrumentQuote;
