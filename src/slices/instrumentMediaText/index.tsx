"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentMediaText: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const bg = p.background_color || "#0a0a0a";
  const points = (slice.items || []).filter((item: any) => item?.point);
  const imageLeft = p.media_side === "image_left";

  const hasContent =
    p.eyebrow ||
    p.title ||
    p.body ||
    p.image?.url ||
    points.length > 0 ||
    p.cta_text;

  if (!hasContent) return null;

  return (
    <section
      className={`${INSTRUMENT_SECTION_PY_LG} text-white`}
      style={{ backgroundColor: bg }}
    >
      <Container>
        <FadeInStagger
          faster
          className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <FadeIn className={clsx(imageLeft ? "lg:order-1" : "lg:order-2")}>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 lg:rounded-3xl">
              {p.image?.url ? (
                <PrismicNextImage
                  field={p.image}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt=""
                />
              ) : (
                <div className="absolute inset-0 border border-neutral-800 bg-neutral-900" />
              )}
            </div>
          </FadeIn>

          <FadeIn className={clsx(imageLeft ? "lg:order-2" : "lg:order-1")}>
            {p.eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {p.eyebrow}
              </p>
            )}
            {p.title && (
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
                {p.title}
              </h2>
            )}
            {p.body && (
              <div className="mt-6 text-lg leading-relaxed text-neutral-300">
                <PrismicRichText field={p.body} components={instrumentRichText} />
              </div>
            )}
            {points.length > 0 && (
              <ul className="mt-8 space-y-3">
                {points.map((item: any, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-neutral-500" />
                    <span className="text-neutral-300">{item.point}</span>
                  </li>
                ))}
              </ul>
            )}
            {p.cta_text && (
              <div className="mt-10">
                <PrismicNextLink
                  field={p.cta_link}
                  className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
                >
                  {p.cta_text}
                </PrismicNextLink>
              </div>
            )}
          </FadeIn>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentMediaText;
