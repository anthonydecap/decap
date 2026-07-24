"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentConnectivity: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, intro, background_color } = slice.primary;
  const bg = background_color || "#0a0a0a";
  const items = slice.items || [];

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            {section_title && (
              <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                {section_title}
              </h2>
            )}
            {intro && (
              <div className="mt-4 text-lg text-neutral-400">
                <PrismicRichText field={intro} components={instrumentRichText} />
              </div>
            )}
          </div>
        </FadeIn>
        <FadeInStagger faster>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-6">
            {items.map((item: any, index: number) => (
              <FadeIn key={index}>
                <div className="h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-all duration-300 hover:border-neutral-700 lg:rounded-3xl">
                  {item.title && (
                    <h3 className="font-display text-lg font-bold text-white">{item.title}</h3>
                  )}
                  {item.description && (
                    <div className="mt-2 text-sm leading-relaxed text-neutral-300">
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

export default InstrumentConnectivity;
