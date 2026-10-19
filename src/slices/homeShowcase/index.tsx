"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { isFilled } from "@prismicio/client";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { HOME_SECTION_PY, HomeButton, homeRichText, homeTheme, TwoToneHeading } from "@/lib/home-ui";
import { MuxVideoLayer, resolveMuxHlsUrl } from "@/lib/mux-video";

/**
 * Showcase: a product told through a real screenshot or video (e.g. the Virtual
 * Orchestrion). Copy and CTAs on top, a wide media stage, then up to four highlights.
 * The media stage is a dark surface in both themes so screenshots and video read well.
 */
const HomeShowcase: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const theme = homeTheme(p.background_color);
  const highlights = (slice.items ?? []).filter((i: any) => i.highlight_title || i.highlight_text);
  const mux = resolveMuxHlsUrl(p.mux_playback_id);
  const hasMedia = Boolean(mux) || isFilled.image(p.media_image);

  return (
    <section className={HOME_SECTION_PY} style={{ backgroundColor: theme.bg }}>
      <Container>
        <FadeIn className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <TwoToneHeading title={p.title} accent={p.title_accent} theme={theme} />
            {isFilled.richText(p.body) && (
              <div className={clsx("mt-6 max-w-[65ch] text-lg leading-relaxed", theme.body)}>
                <PrismicRichText field={p.body} components={homeRichText(theme)} />
              </div>
            )}
          </div>
          {(p.primary_cta_label || p.secondary_cta_label) && (
            <div className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
              <HomeButton field={p.primary_cta_link} label={p.primary_cta_label} theme={theme} />
              <HomeButton field={p.secondary_cta_link} label={p.secondary_cta_label} theme={theme} variant="secondary" />
            </div>
          )}
        </FadeIn>

        {hasMedia && (
          <FadeIn className="mt-12 lg:mt-16">
            <figure>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 lg:rounded-4xl">
                {mux ? (
                  <MuxVideoLayer src={mux} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <PrismicNextImage
                    field={p.media_image}
                    sizes="(min-width: 1280px) 1200px, 100vw"
                    className={clsx("absolute inset-0 h-full w-full", p.media_fit === "Contain" ? "object-contain p-4 sm:p-8" : "object-cover")}
                    alt={p.media_image?.alt || ""}
                  />
                )}
              </div>
              {p.media_caption && <figcaption className={clsx("mt-4 text-sm", theme.muted)}>{p.media_caption}</figcaption>}
            </figure>
          </FadeIn>
        )}

        {highlights.length > 0 && (
          <FadeInStagger
            faster
            className={clsx(
              "mt-12 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:mt-16",
              highlights.length >= 4 ? "lg:grid-cols-4" : highlights.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
            )}
          >
            {highlights.map((h: any, i: number) => (
              <FadeIn key={i} className={clsx("border-t pt-6", theme.rule)}>
                <h3 className={clsx("font-display text-lg font-bold", theme.heading)}>{h.highlight_title}</h3>
                {h.highlight_text && <p className={clsx("mt-2 leading-relaxed", theme.body)}>{h.highlight_text}</p>}
              </FadeIn>
            ))}
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
};

export default HomeShowcase;
