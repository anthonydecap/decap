"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentShowcase: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { title, body, image, background_color } = slice.primary;
  const bg = background_color || "#ffffff";

  return (
    <section className={INSTRUMENT_SECTION_PY_LG} style={{ backgroundColor: bg }}>
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            {title && (
              <h2 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
                {title}
              </h2>
            )}
            {body && (
              <div className="mt-6 text-lg leading-relaxed text-neutral-600 sm:text-xl">
                <PrismicRichText field={body} components={instrumentRichText} />
              </div>
            )}
          </div>
          {image?.url && (
            <div className="mt-12 lg:mt-16 overflow-hidden rounded-2xl lg:rounded-3xl bg-neutral-100">
              <PrismicNextImage field={image} className="h-auto w-full object-cover" alt="" />
            </div>
          )}
        </FadeIn>
      </Container>
    </section>
  );
};

export default InstrumentShowcase;
