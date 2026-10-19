"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { isFilled } from "@prismicio/client";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { HOME_SECTION_PY, HomeButton, homeRichText, homeTheme, illustrationClass, TwoToneHeading } from "@/lib/home-ui";

/**
 * Feature: illustration and copy side by side (side switchable), with optional key points
 * and a text link. For "Instruments"-style sections. Use at most two of these in a row.
 */
const HomeFeature: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const theme = homeTheme(p.background_color);
  const imageRight = p.image_side === "Image right";
  const hasImage = isFilled.image(p.illustration);
  const points = (slice.items ?? []).filter((i: any) => i.point_title || i.point_text);

  return (
    <section className={HOME_SECTION_PY} style={{ backgroundColor: theme.bg }}>
      <Container>
        <div className={clsx("grid items-center gap-12 lg:gap-20", hasImage && "lg:grid-cols-12")}>
          {hasImage && (
            <FadeIn className={clsx("lg:col-span-5", imageRight ? "lg:order-2 lg:col-start-8" : "lg:order-1")}>
              <div className="mx-auto w-full max-w-md lg:max-w-none">
                <PrismicNextImage
                  field={p.illustration}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className={clsx("h-auto w-full object-contain", illustrationClass(theme, p.illustration_style))}
                  alt=""
                />
              </div>
            </FadeIn>
          )}

          <FadeIn className={clsx(hasImage ? "lg:col-span-6" : "max-w-3xl", hasImage && (imageRight ? "lg:order-1" : "lg:order-2 lg:col-start-7"))}>
            <TwoToneHeading title={p.title} accent={p.title_accent} theme={theme} />
            {isFilled.richText(p.body) && (
              <div className={clsx("mt-6 max-w-[65ch] text-lg leading-relaxed", theme.body)}>
                <PrismicRichText field={p.body} components={homeRichText(theme)} />
              </div>
            )}
            {points.length > 0 && (
              <dl className={clsx("mt-10 divide-y border-y", theme.rule, theme.dark ? "divide-neutral-800" : "divide-neutral-200")}>
                {points.map((pt: any, i: number) => (
                  <div key={i} className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-6">
                    <dt className={clsx("font-semibold", theme.heading)}>{pt.point_title}</dt>
                    <dd className={clsx("sm:col-span-2", theme.body)}>{pt.point_text}</dd>
                  </div>
                ))}
              </dl>
            )}
            <HomeButton field={p.link} label={p.link_label} theme={theme} variant="text" className="mt-8" />
          </FadeIn>
        </div>
      </Container>
    </section>
  );
};

export default HomeFeature;
