"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentSpecs: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, background_color } = slice.primary;
  const bg = background_color || "#ffffff";
  const items = slice.items || [];

  return (
    <section className={INSTRUMENT_SECTION_PY_LG} style={{ backgroundColor: bg }}>
      <Container>
        {section_title && (
          <FadeIn>
            <h2 className="mb-10 font-display text-3xl font-bold text-neutral-950 sm:text-4xl lg:mb-12">
              {section_title}
            </h2>
          </FadeIn>
        )}
        <FadeInStagger faster>
          <dl className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
            {items.map((row: any, index: number) => (
              <FadeIn key={index}>
                <div className="border-b border-neutral-200 pb-6">
                  {row.label && (
                    <dt className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                      {row.label}
                    </dt>
                  )}
                  {row.value && (
                    <dd className="mt-2 text-base leading-relaxed text-neutral-800">
                      <PrismicRichText field={row.value} components={instrumentRichText} />
                    </dd>
                  )}
                </div>
              </FadeIn>
            ))}
          </dl>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentSpecs;
