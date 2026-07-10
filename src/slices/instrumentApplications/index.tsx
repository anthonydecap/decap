"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentApplications: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, background_color } = slice.primary;
  const bg = background_color || "#0a0a0a";
  const items = slice.items || [];

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        {section_title && (
          <FadeIn>
            <h2 className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl lg:mb-16 lg:text-5xl">
              {section_title}
            </h2>
          </FadeIn>
        )}
        <FadeInStagger faster>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {items.map((item: any, index: number) => (
              <FadeIn key={index}>
                <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 lg:rounded-3xl lg:p-8">
                  {item.title && (
                    <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <div className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
                      <PrismicRichText field={item.description} components={instrumentRichText} />
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentApplications;
