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

      <Container className="relative z-10 py-24 text-center">
        {p.title && (
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {p.title}
          </h1>
        )}
        {p.subtitle && (
          <p className="mt-4 text-xl text-neutral-200 sm:text-2xl">{p.subtitle}</p>
        )}
        {p.body && (
          <div className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300">
            <PrismicRichText field={p.body} components={instrumentRichText} />
          </div>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {p.primary_button_text && (
            <Button invert href={p.primary_button_link}>
              {p.primary_button_text}
            </Button>
          )}
          {p.secondary_button_text && (
            <PrismicNextLink
              field={p.secondary_button_link}
              className="inline-flex rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <span className="relative top-px">{p.secondary_button_text}</span>
            </PrismicNextLink>
          )}
        </div>
        {p.footnote && (
          <p className="mt-8 text-sm text-neutral-400">{p.footnote}</p>
        )}
      </Container>
    </div>
  );
};

export default InstrumentHeader;
