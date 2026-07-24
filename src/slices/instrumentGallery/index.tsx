"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useRef } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentGallery: FC<SliceComponentProps<any>> = ({ slice }) => {
  const bg = slice.primary.background_color || "#0a0a0a";
  const items = (slice.items || []).filter(
    (item: any) => item.image?.url || item.title || item.description,
  );
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollBy = (direction: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section
      className={`${INSTRUMENT_SECTION_PY_LG} text-white`}
      style={{ backgroundColor: bg }}
    >
      <Container>
        {(slice.primary.section_title ||
          slice.primary.section_subtitle?.length > 0) && (
          <FadeIn className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
            {slice.primary.section_title && (
              <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                {slice.primary.section_title}
              </h2>
            )}
            {slice.primary.section_subtitle?.length > 0 && (
              <div className="mt-6 text-lg leading-relaxed text-neutral-300">
                <PrismicRichText
                  field={slice.primary.section_subtitle}
                  components={instrumentRichText}
                />
              </div>
            )}
          </FadeIn>
        )}

        <FadeIn>
          <div className="relative">
            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:gap-5 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {items.map((item: any, index: number) => {
                const hasImage = Boolean(item.image?.url);

                if (!hasImage) {
                  return (
                    <div
                      key={index}
                      className="flex snap-start shrink-0 flex-col justify-end rounded-2xl border border-neutral-800 bg-neutral-900 p-6 lg:rounded-3xl lg:p-8 w-[80%] aspect-[3/4] sm:w-[380px] lg:w-[440px]"
                    >
                      {item.title && (
                        <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                          {item.title}
                        </h3>
                      )}
                      {item.description?.length > 0 && (
                        <div className="mt-2 text-sm leading-relaxed text-neutral-300">
                          <PrismicRichText
                            field={item.description}
                            components={instrumentRichText}
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="group relative snap-start shrink-0 aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-900 lg:rounded-3xl w-[80%] sm:w-[380px] lg:w-[440px]"
                  >
                    <PrismicNextImage
                      field={item.image}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="relative z-10 mt-auto flex h-full flex-col justify-end p-6 lg:p-8">
                      {item.title && (
                        <h3 className="font-display text-xl font-bold text-white drop-shadow-sm sm:text-2xl">
                          {item.title}
                        </h3>
                      )}
                      {item.description?.length > 0 && (
                        <div className="mt-2 text-sm leading-relaxed text-white/85 drop-shadow-sm">
                          <PrismicRichText
                            field={item.description}
                            components={instrumentRichText}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollBy(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollBy(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
};

export default InstrumentGallery;
