"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { MuxVideoLayer, overlayClass, resolveMuxHlsUrl } from "@/lib/mux-video";
import { instrumentRichText } from "@/lib/instrument-ui";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

const InstrumentBanner: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const bg = p.background_color || "#0a0a0a";
  const muxUrl = resolveMuxHlsUrl(p.mux_hls_url);

  const hasContent =
    p.eyebrow || p.title || p.body || p.button_text || p.image?.url || muxUrl;

  if (!hasContent) return null;

  return (
    <div
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden text-white lg:min-h-[70vh]"
      style={{ backgroundColor: muxUrl ? undefined : bg }}
    >
      {muxUrl ? (
        <MuxVideoLayer src={muxUrl} className="absolute inset-0 h-full w-full" />
      ) : p.image?.url ? (
        <PrismicNextImage
          field={p.image}
          className="absolute inset-0 h-full w-full object-cover"
          alt=""
        />
      ) : null}

      <div className={clsx("absolute inset-0", overlayClass(p.overlay_opacity))} />

      <Container className="relative z-10 py-24 text-center">
        <FadeInStagger>
          {p.eyebrow && (
            <FadeIn>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-300">
                {p.eyebrow}
              </p>
            </FadeIn>
          )}
          {p.title && (
            <FadeIn>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {p.title}
              </h2>
            </FadeIn>
          )}
          {p.body && (
            <FadeIn>
              <div className="mx-auto mt-6 max-w-2xl text-lg text-neutral-200">
                <PrismicRichText field={p.body} components={instrumentRichText} />
              </div>
            </FadeIn>
          )}
          {p.button_text && (
            <FadeIn>
              <div className="mt-10">
                <Button
                  invert
                  href={p.button_link}
                  className="px-8 py-3.5 text-base"
                >
                  {p.button_text}
                </Button>
              </div>
            </FadeIn>
          )}
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default InstrumentBanner;
