"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY } from "@/lib/instrument-ui";

const InstrumentHighlights: FC<SliceComponentProps<any>> = ({ slice }) => {
  const bg = slice.primary.background_color || "#0a0a0a";
  const items = slice.items || [];

  return (
    <section className={`${INSTRUMENT_SECTION_PY} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        <FadeIn>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:gap-4 [scrollbar-width:thin]">
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className="min-w-[200px] shrink-0 snap-start rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 sm:min-w-[220px] lg:rounded-3xl lg:px-6 lg:py-5"
              >
                {item.label && (
                  <p className="font-display text-sm font-semibold text-white sm:text-base">
                    {item.label}
                  </p>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
};

export default InstrumentHighlights;
