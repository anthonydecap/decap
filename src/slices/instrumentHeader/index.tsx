"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { MuxVideoLayer, overlayClass, resolveMuxHlsUrl } from "@/lib/mux-video";
import { instrumentRichText } from "@/lib/instrument-ui";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

const InstrumentHeader: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const bgColor = p.background_color || "#0a0a0a";
  const muxUrl = resolveMuxHlsUrl(p.mux_hls_url);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden text-white"
      style={{ backgroundColor: muxUrl ? undefined : bgColor }}
    >
      {muxUrl && (
        <div className="absolute inset-0">
          <MuxVideoLayer src={muxUrl} className="absolute inset-0 h-full w-full" />
        </div>
      )}
      <div className={clsx("absolute inset-0", overlayClass(p.overlay_opacity))} />

      <Container className="relative z-10 py-24 text-center sm:py-32 lg:py-40">
        <FadeInStagger>
          {p.title && (
            <FadeIn>
              <h1 className="mx-auto max-w-5xl font-display text-5xl font-bold leading-[1.05] tracking-tight drop-shadow-sm sm:text-6xl lg:text-7xl">
                {p.title}
              </h1>
            </FadeIn>
          )}
          {p.subtitle && (
            <FadeIn>
              <p className="mx-auto mt-6 max-w-3xl text-xl font-medium leading-relaxed text-neutral-200 sm:text-2xl">
                {p.subtitle}
              </p>
            </FadeIn>
          )}
          {p.body && (
            <FadeIn>
              <div className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300">
                <PrismicRichText field={p.body} components={instrumentRichText} />
              </div>
            </FadeIn>
          )}
          <FadeIn>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {p.primary_button_text && (
                <Button
                  invert
                  href={p.primary_button_link}
                  className="px-8 py-3.5 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  {p.primary_button_text}
                </Button>
              )}
              {p.secondary_button_text && (
                <PrismicNextLink
                  field={p.secondary_button_link}
                  className="inline-flex rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
                >
                  <span className="relative top-px">{p.secondary_button_text}</span>
                </PrismicNextLink>
              )}
            </div>
          </FadeIn>
          {p.footnote && (
            <FadeIn>
              <p className="mt-8 text-sm text-neutral-400">{p.footnote}</p>
            </FadeIn>
          )}
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default InstrumentHeader;
