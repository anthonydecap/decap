"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { isFilled } from "@prismicio/client";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { HomeButton, homeRichText, homeTheme, illustrationClass, TwoToneHeading } from "@/lib/home-ui";

/**
 * Home hero: two-tone headline ("Heritage of / Innovation"), short intro, up to two CTAs and
 * a large illustration. Fits the first viewport; theme follows `background_color`.
 */
const HomeHero: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const theme = homeTheme(p.background_color);
  const hasImage = isFilled.image(p.illustration);

  return (
    <section className="relative overflow-hidden pb-16 pt-6 sm:pb-24 sm:pt-10 lg:pb-28" style={{ backgroundColor: theme.bg }}>
      <Container>
        <div className={clsx("grid items-center gap-12 lg:gap-16", hasImage && "lg:grid-cols-12")}>
          <FadeIn className={clsx(hasImage ? "lg:col-span-6" : "max-w-3xl")}>
            <TwoToneHeading as="h1" size="hero" title={p.title} accent={p.title_accent} theme={theme} />
            {isFilled.richText(p.body) && (
              <div className={clsx("mt-6 max-w-xl text-lg leading-relaxed", theme.body)}>
                <PrismicRichText field={p.body} components={homeRichText(theme)} />
              </div>
            )}
            {(p.primary_cta_label || p.secondary_cta_label) && (
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <HomeButton field={p.primary_cta_link} label={p.primary_cta_label} theme={theme} />
                <HomeButton field={p.secondary_cta_link} label={p.secondary_cta_label} theme={theme} variant="secondary" />
              </div>
            )}
          </FadeIn>

          {hasImage && (
            <FadeIn className="lg:col-span-6">
              <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
                <PrismicNextImage
                  field={p.illustration}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={clsx("h-auto w-full object-contain", illustrationClass(theme, p.illustration_style))}
                  alt=""
                />
              </div>
            </FadeIn>
          )}
        </div>
      </Container>
    </section>
  );
};

export default HomeHero;
