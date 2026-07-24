"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MuxVideoLayer, resolveMuxHlsUrl } from "@/lib/mux-video";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentFeature: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const bg = p.background_color || "#0a0a0a";
  const useMux = p.media_type === "mux_video";
  const muxUrl = resolveMuxHlsUrl(p.mux_hls_url);

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        <FadeInStagger
          faster
          className="grid min-h-[420px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <FadeIn>
            {p.title && (
              <h2 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {p.title}
              </h2>
            )}
            {p.body && (
              <div className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
                <PrismicRichText field={p.body} components={instrumentRichText} />
              </div>
            )}
          </FadeIn>
          <FadeIn>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-all duration-300 hover:border-neutral-700 lg:rounded-3xl">
              {useMux && muxUrl ? (
                <MuxVideoLayer src={muxUrl} className="absolute inset-0 h-full w-full" />
              ) : p.image?.url ? (
                <PrismicNextImage
                  field={p.image}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt=""
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-800" />
              )}
            </div>
          </FadeIn>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentFeature;
