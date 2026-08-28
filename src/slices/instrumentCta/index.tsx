"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { MuxVideoLayer, overlayClass, resolveMuxHlsUrl } from "@/lib/mux-video";
import { instrumentRichText } from "@/lib/instrument-ui";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

const InstrumentCta: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const bg = p.background_color || "#0a0a0a";
  const muxUrl = resolveMuxHlsUrl(p.mux_hls_url);

  return (
    <div
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden text-white sm:min-h-screen"
      style={{ backgroundColor: muxUrl ? undefined : bg }}
    >
      {muxUrl && (
        <div className="absolute inset-0">
          <MuxVideoLayer src={muxUrl} className="absolute inset-0 h-full w-full" />
        </div>
      )}
      <div className={clsx("absolute inset-0", overlayClass(p.overlay_opacity))} />

      <Container className="relative z-10 py-24 text-center sm:py-32">
        <FadeInStagger>
          {p.title && (
            <FadeIn>
              <h2 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
                {p.title}
              </h2>
            </FadeIn>
          )}
          {p.body && (
            <FadeIn>
              <div className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300 sm:text-xl">
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
                  className="px-8 py-3.5 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  {p.button_text}
                </Button>
              </div>
            </FadeIn>
          )}
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

export default InstrumentCta;
