"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

function BentoCell({ item }: { item: any }) {
  if (!item) return null;

  const hasImage = item.image?.url;

  return (
    <div className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:border-neutral-700 lg:rounded-3xl">
      {hasImage && (
        <div className="absolute inset-0">
          <PrismicNextImage
            field={item.image}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt=""
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </div>
      )}
      <div className="relative mt-auto p-5 sm:p-6 lg:p-8">
        {item.item_title && (
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-2xl lg:text-3xl">
            {item.item_title}
          </h3>
        )}
        {item.item_description && (
          <div className="mt-2 text-sm leading-relaxed text-neutral-300 drop-shadow-sm sm:text-base">
            <PrismicRichText field={item.item_description} components={instrumentRichText} />
          </div>
        )}
      </div>
    </div>
  );
}

const InstrumentBento: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, background_color } = slice.primary;
  const bg = background_color || "#0a0a0a";
  const items = (slice.items ?? []).slice(0, 4);
  const hasGrid = items.some(
    (item: any) => item?.item_title || item?.item_description?.length || item?.image?.url,
  );

  const cellSlot = (item: (typeof items)[number], flexClass: string) =>
    item ? (
      <div className={`h-full min-h-0 ${flexClass}`}>
        <FadeIn className="h-full">
          <BentoCell item={item} />
        </FadeIn>
      </div>
    ) : null;

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        {section_title?.length > 0 && (
          <FadeIn>
            <div className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl lg:mb-16 lg:text-5xl">
              <PrismicRichText field={section_title} components={instrumentRichText} />
            </div>
          </FadeIn>
        )}
        {hasGrid && (
          <FadeInStagger faster>
            <div
              className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:gap-5"
              style={{ aspectRatio: "3/2" }}
            >
              <div className="flex min-h-0 flex-col gap-3 sm:gap-4 lg:gap-5">
                {cellSlot(items[0], "flex-[1.5]")}
                {cellSlot(items[2], "flex-1")}
              </div>
              <div className="flex min-h-0 flex-col gap-3 sm:gap-4 lg:gap-5">
                {cellSlot(items[1], "flex-1")}
                {cellSlot(items[3], "flex-[1.5]")}
              </div>
            </div>
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
};

export default InstrumentBento;
