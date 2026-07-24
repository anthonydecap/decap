"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";
import clsx from "clsx";

const InstrumentSplit: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { footnote, background_color } = slice.primary;
  const bg = background_color || "#ffffff";
  const columns = (slice.items || []).slice(0, 2);

  return (
    <section className={INSTRUMENT_SECTION_PY_LG} style={{ backgroundColor: bg }}>
      <Container>
        <FadeInStagger faster>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {columns.map((col: any, index: number) => {
              const hasImage = Boolean(col.image?.url);

              return (
                <FadeIn key={index}>
                  <div
                    className={clsx(
                      "group relative flex flex-col overflow-hidden rounded-2xl lg:rounded-3xl",
                      hasImage
                        ? "aspect-[4/5] bg-neutral-900"
                        : "border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md",
                    )}
                  >
                    {hasImage ? (
                      <>
                        {/* Full-bleed portrait image */}
                        <PrismicNextImage
                          field={col.image}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          alt=""
                        />
                        {/* Scrim for legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                        {/* Overlaid content */}
                        <div className="relative z-10 mt-auto p-6 lg:p-8">
                          {col.title && (
                            <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-2xl lg:text-3xl">
                              {col.title}
                            </h3>
                          )}
                          {col.description && (
                            <div className="mt-3 max-w-md text-sm leading-relaxed text-white/85 drop-shadow-sm sm:text-base">
                              <PrismicRichText
                                field={col.description}
                                components={instrumentRichText}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-1 flex-col p-6 sm:p-8">
                        {col.title && (
                          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-neutral-950 sm:text-2xl lg:text-3xl">
                            {col.title}
                          </h3>
                        )}
                        {col.description && (
                          <div className="mt-3 text-base leading-relaxed text-neutral-600">
                            <PrismicRichText
                              field={col.description}
                              components={instrumentRichText}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
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
