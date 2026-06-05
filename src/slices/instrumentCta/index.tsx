"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { MuxVideoLayer, overlayClass, resolveMuxHlsUrl } from "@/lib/mux-video";
import { instrumentRichText } from "@/lib/instrument-ui";

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

      <Container className="relative z-10 py-20 text-center">
        {p.title && (
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {p.title}
          </h2>
        )}
        {p.body && (
          <div className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300">
            <PrismicRichText field={p.body} components={instrumentRichText} />
          </div>
        )}
        {p.button_text && (
          <div className="mt-10">
            <Button invert href={p.button_link}>
              {p.button_text}
            </Button>
          </div>
        )}
        {p.footnote && (
          <p className="mt-8 text-sm text-neutral-500">{p.footnote}</p>
        )}
      </Container>
    </div>
  );
};

export default InstrumentCta;
