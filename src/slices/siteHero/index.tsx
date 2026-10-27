"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveMuxHlsUrl } from "@/lib/mux-video";
import { HeroMedia } from "./HeroMedia";
import { VideoShowcase } from "./VideoShowcase";
import { Eyebrow, SiteButton, SiteRichText, toneFromSelect } from "@/lib/site-ui";

const SHAPE: Record<string, string> = {
  "Portrait 4:5": "aspect-[4/5]",
  "Landscape 4:3": "aspect-[4/3]",
  Square: "aspect-square",
  "Wide 16:9": "aspect-[16/9]",
};
/** How much the full-bleed image is darkened behind the text. */
const OVERLAY: Record<string, string> = {
  Light: "from-black/60 via-black/20 to-transparent",
  Medium: "from-black/80 via-black/40 to-black/20",
  Strong: "from-black/90 via-black/65 to-black/45",
};

/** Page hero with the page's H1. Layouts: Split (text + image), Centered, Full-bleed image, Video showcase. */
const SiteHero: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const layout = p.layout || "Split";
  const brief = p.image_brief || `Hero image for “${p.title || "this page"}”`;
  const video = resolveMuxHlsUrl(p.mux_video);

  if (layout === "Video showcase") return <VideoShowcase p={p} video={video} brief={brief} />;

  const buttons = (
    <div className={clsx("mt-10 flex flex-wrap items-center gap-4", layout !== "Split" && "justify-center")}>
      <SiteButton field={p.primary_cta_link} label={p.primary_cta_label} />
      <SiteButton field={p.secondary_cta_link} label={p.secondary_cta_label} variant="secondary" />
    </div>
  );

  const copy = (
    <>
      {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
      {p.title && (
        <h1 className={clsx("site-heading text-5xl leading-[1.05] text-ink sm:text-6xl lg:text-7xl", p.eyebrow && "mt-5")}>
          {p.title}
        </h1>
      )}
      <SiteRichText field={p.intro} className="mt-6 text-lg leading-relaxed text-ink-muted sm:text-xl" />
      {buttons}
      {p.note && <p className="mt-6 text-sm text-ink-muted">{p.note}</p>}
    </>
  );

  if (layout === "Full-bleed image") {
    return (
      <section data-tone="inverse" className="relative isolate overflow-hidden bg-page text-ink">
        <div className="absolute inset-0 -z-10">
          <HeroMedia p={p} video={video} brief={brief} rounded="" className="h-full w-full" sizes="100vw" priority tone="dark" />
          {(p.image?.url || video) && p.overlay !== "None" && (
            <div className={clsx("absolute inset-0 bg-gradient-to-t", OVERLAY[p.overlay] ?? OVERLAY.Medium)} />
          )}
        </div>
        <Container className="flex min-h-[80vh] items-end py-24 sm:py-32">
          <FadeIn className="mx-auto max-w-3xl text-center">{copy}</FadeIn>
        </Container>
      </section>
    );
  }

  return (
    <section
      data-tone={toneFromSelect(p.tone) === "page" ? undefined : toneFromSelect(p.tone)}
      className="bg-page pt-12 pb-16 text-ink sm:pt-16 sm:pb-24 lg:pb-32"
    >
      <Container>
        {layout === "Centered" ? (
          <FadeInStagger faster>
            <FadeIn className="mx-auto max-w-3xl text-center">{copy}</FadeIn>
            {(p.image?.url || p.image_brief || video) && (
              <FadeIn className="mt-16 lg:mt-20">
                <HeroMedia p={p} video={video} brief={brief} aspect={SHAPE[p.image_shape] ?? "aspect-[16/9]"} sizes="(min-width: 1280px) 1216px, 100vw" priority />
              </FadeIn>
            )}
          </FadeInStagger>
        ) : (
          <FadeInStagger faster className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn>{copy}</FadeIn>
            <FadeIn>
              <HeroMedia
                p={p}
                video={video}
                brief={brief}
                aspect={SHAPE[p.image_shape] ?? "aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]"}
                priority
              />
            </FadeIn>
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
};

export default SiteHero;
