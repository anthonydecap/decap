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
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="font-display text-3xl font-bold leading-tight text-neutral-950 sm:text-4xl lg:text-5xl">
                {section_title}
              </h2>
            </div>
          </FadeIn>
        )}
        <FadeInStagger faster>
          <FadeIn>
            {/* Category-card look (light): solid neutral top accent bar */}
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:rounded-3xl">
              <div className="absolute left-0 right-0 top-0 h-1 bg-neutral-200" />
              <div className="p-6 pt-8 sm:p-8 sm:pt-10">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {items.map((row: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4"
                    >
                      {row.label && (
                        <dt className="flex-shrink-0 font-display text-sm font-semibold text-neutral-900">
                          {row.label}
                        </dt>
                      )}
                      {row.value && (
                        <dd className="min-w-0 text-right text-sm leading-relaxed text-neutral-700">
                          <PrismicRichText field={row.value} components={instrumentRichText} />
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </FadeIn>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentSpecs;
