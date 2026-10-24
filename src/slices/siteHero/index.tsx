"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { MuxVideoLayer, resolveMuxHlsUrl } from "@/lib/mux-video";
import { VideoShowcase } from "./VideoShowcase";
import { Eyebrow, SiteButton, SiteRichText, toneFromSelect } from "@/lib/site-ui";

/** The hero image, with an optional Mux video playing over it (the image stays as poster and fallback). */
function HeroMedia({ video, className, rounded = "rounded-2xl lg:rounded-3xl", ...slot }: Parameters<typeof MediaSlot>[0] & { video: string | null }) {
  return (
    <div className={clsx("relative", className)}>
      <MediaSlot {...slot} rounded={rounded} className={className && "h-full w-full"} />
      {video && (
        <div className={clsx("absolute inset-0 overflow-hidden motion-reduce:hidden", rounded)}>
          <MuxVideoLayer src={video} className="absolute inset-0 h-full w-full" />
        </div>
      )}
    </div>
  );
}

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
          <HeroMedia video={video} field={p.image} brief={brief} aspect="" rounded="" className="h-full w-full" sizes="100vw" priority tone="dark" />
          {(p.image?.url || video) && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />}
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
                <HeroMedia video={video} field={p.image} brief={brief} aspect="aspect-[16/9]" sizes="(min-width: 1280px) 1216px, 100vw" priority />
              </FadeIn>
            )}
          </FadeInStagger>
        ) : (
          <FadeInStagger faster className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn>{copy}</FadeIn>
            <FadeIn>
              <HeroMedia video={video} field={p.image} brief={brief} aspect="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]" priority />
            </FadeIn>
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
};

export default SiteHero;
