"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentSplit: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { footnote, background_color } = slice.primary;
  const bg = background_color || "#ffffff";
  const columns = (slice.items || []).slice(0, 2);

  return (
    <section className={INSTRUMENT_SECTION_PY_LG} style={{ backgroundColor: bg }}>
      <Container>
        <FadeInStagger faster>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {columns.map((col: any, index: number) => (
              <FadeIn key={index}>
                <div className="flex flex-col">
                  {col.image?.url && (
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 lg:rounded-3xl">
                      <PrismicNextImage
                        field={col.image}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    </div>
                  )}
                  {col.title && (
                    <h3 className="mt-6 font-display text-3xl font-bold text-neutral-950 sm:text-4xl">
                      {col.title}
                    </h3>
                  )}
                  {col.description && (
                    <div className="mt-4 text-lg leading-relaxed text-neutral-600">
                      <PrismicRichText field={col.description} components={instrumentRichText} />
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeInStagger>
        {footnote && (
          <FadeIn>
            <p className="mt-10 text-center text-sm text-neutral-500 lg:mt-12">{footnote}</p>
          </FadeIn>
        )}
      </Container>
    </section>
  );
};

export default InstrumentSplit;
