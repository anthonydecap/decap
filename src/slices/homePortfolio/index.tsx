"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { isFilled } from "@prismicio/client";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { HOME_SECTION_PY, HomeButton, homeRichText, homeTheme, TwoToneHeading } from "@/lib/home-ui";

/**
 * Portfolio: heading + intro, then an asymmetric gallery of instruments (alternating wide and
 * narrow tiles, so it never reads as a row of identical cards). Captions sit below the
 * images, never on top of them. Renders work best as "Contain" on a quiet surface.
 */
const SPANS = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];

const HomePortfolio: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const theme = homeTheme(p.background_color);
  const items = (slice.items ?? []).filter((i: any) => isFilled.image(i.image));
  const contain = p.image_fit !== "Cover";

  return (
    <section className={HOME_SECTION_PY} style={{ backgroundColor: theme.bg }}>
      <Container>
        <FadeIn className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-6">
            <TwoToneHeading title={p.title} accent={p.title_accent} theme={theme} />
          </div>
          {(isFilled.richText(p.body) || p.link_label) && (
            <div className="lg:col-span-6">
              {isFilled.richText(p.body) && (
                <div className={clsx("max-w-2xl text-lg leading-relaxed", theme.body)}>
                  <PrismicRichText field={p.body} components={homeRichText(theme)} />
                </div>
              )}
              <HomeButton field={p.link} label={p.link_label} theme={theme} variant="text" className="mt-6" />
            </div>
          )}
        </FadeIn>

        {items.length > 0 && (
          <FadeInStagger faster className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12 lg:gap-8">
            {items.map((item: any, i: number) => {
              const tile = (
                <>
                  <div
                    className={clsx(
                      "relative overflow-hidden rounded-2xl border transition-all duration-300 lg:rounded-3xl",
                      theme.card,
                      theme.cardHover,
                      i % 4 === 0 || i % 4 === 3 ? "aspect-[4/3]" : "aspect-[4/3] lg:aspect-[5/4]",
                    )}
                  >
                    <PrismicNextImage
                      field={item.image}
                      sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw"
                      className={clsx(
                        "absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.03]",
                        contain ? "object-contain p-6 sm:p-8" : "object-cover",
                      )}
                      alt={item.name || ""}
                    />
                  </div>
                  {(item.name || item.caption) && (
                    <div className="mt-4 flex items-baseline justify-between gap-4">
                      {item.name && <h3 className={clsx("font-display text-lg font-bold", theme.heading)}>{item.name}</h3>}
                      {item.caption && <p className={clsx("text-sm", theme.muted)}>{item.caption}</p>}
                    </div>
                  )}
                </>
              );
              return (
                <FadeIn key={i} className={clsx(SPANS[i % 4], items.length === 1 && "lg:col-span-12")}>
                  {isFilled.link(item.link) ? (
                    <PrismicNextLink field={item.link} className="group block">{tile}</PrismicNextLink>
                  ) : (
                    <div className="group">{tile}</div>
                  )}
                </FadeIn>
              );
            })}
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
};

export default HomePortfolio;
