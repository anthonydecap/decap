"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { Eyebrow, Section, SiteButton, SiteRichText, toneFromSelect } from "@/lib/site-ui";

const ASPECTS: Record<string, string> = {
  "Landscape 4:3": "aspect-[4/3]",
  Square: "aspect-square",
  "Portrait 4:5": "aspect-[4/5]",
  "Wide 16:9": "aspect-[16/9]",
};

/** Text next to an image or a short muted looping clip (the easiest DIY footage to shoot). */
const SiteTextMedia: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const points: string[] = (slice.items || []).map((i: any) => i?.point).filter(Boolean);
  const imageLeft = p.media_side === "Image left";
  const aspect = ASPECTS[p.aspect] ?? ASPECTS["Landscape 4:3"];
  const videoUrl = isFilled.link(p.video) ? (p.video as any).url : null;
  const brief = p.image_brief || `Image for “${p.title || "this section"}”`;

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <FadeInStagger faster className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <FadeIn className={clsx(imageLeft ? "lg:order-1" : "lg:order-2")}>
          {videoUrl ? (
            <div className={clsx("relative overflow-hidden rounded-2xl bg-surface lg:rounded-3xl", aspect)}>
              <video
                src={videoUrl}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={p.image?.alt || p.title || undefined}
              />
            </div>
          ) : (
            <MediaSlot field={p.image} brief={brief} aspect={aspect} />
          )}
        </FadeIn>

        <FadeIn className={clsx(imageLeft ? "lg:order-2" : "lg:order-1")}>
          {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
          {p.title && (
            <h2 className={clsx("site-heading text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl", p.eyebrow && "mt-4")}>
              {p.title}
            </h2>
          )}
          <SiteRichText field={p.body} className="mt-6 text-lg leading-relaxed text-ink-muted" />
          {points.length > 0 && (
            <ul className="mt-8 space-y-3 border-t border-line pt-8">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-ink">
                  <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
          <SiteButton field={p.cta_link} label={p.cta_label} variant="text" className="mt-8" />
        </FadeIn>
      </FadeInStagger>
    </Section>
  );
};

export default SiteTextMedia;
