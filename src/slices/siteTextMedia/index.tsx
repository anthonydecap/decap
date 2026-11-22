"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { MuxVideoLayer, resolveMuxHlsUrl } from "@/lib/mux-video";
import {
  Eyebrow,
  Section,
  SiteButton,
  SiteRichText,
  toneFromSelect,
} from "@/lib/site-ui";
import {
  ShowcaseBlock,
  ShowcaseHeader,
  isShowcase,
} from "@/components/Showcase";

const ASPECTS: Record<string, string> = {
  "Landscape 4:3": "aspect-[4/3]",
  Square: "aspect-square",
  "Portrait 4:5": "aspect-[4/5]",
  "Wide 16:9": "aspect-[16/9]",
};

/**
 * Text next to an image or a short muted looping clip (the easiest DIY footage to shoot).
 * A Mux stream wins over an uploaded mp4; the image stays underneath as the poster.
 */
const SiteTextMedia: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const points: string[] = (slice.items || [])
    .map((i: any) => i?.point)
    .filter(Boolean);
  const imageLeft = p.media_side === "Image left";
  const aspect = ASPECTS[p.aspect] ?? ASPECTS["Landscape 4:3"];
  // "Same as section": no card behind the media, images are shown whole on the section color
  const bare = p.media_background === "Same as section";
  const frame = clsx(
    "relative overflow-hidden rounded-2xl lg:rounded-3xl",
    !bare && "bg-surface",
    aspect,
  );
  const muxUrl = resolveMuxHlsUrl(p.mux_video);
  const videoUrl = isFilled.link(p.video) ? (p.video as any).url : null;
  const brief = p.image_brief || `Image for “${p.title || "this section"}”`;

  // The image, a Mux stream or an mp4: shared by both styles.
  const media = (
    <>
      {muxUrl ? (
        <div className={frame}>
          {isFilled.image(p.image) && (
            <MediaSlot
              field={p.image}
              brief={brief}
              aspect=""
              rounded=""
              fit={bare ? "contain" : "cover"}
              backdrop={!bare}
              className="absolute inset-0 h-full w-full"
            />
          )}
          <MuxVideoLayer
            src={muxUrl}
            className="absolute inset-0 h-full w-full motion-reduce:hidden"
          />
        </div>
      ) : videoUrl ? (
        <div className={frame}>
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
        <MediaSlot
          field={p.image}
          brief={brief}
          aspect={aspect}
          fit={bare ? "contain" : "auto"}
          backdrop={!bare}
        />
      )}
    </>
  );

  if (isShowcase(p)) {
    // Showcase (home page): a light rounded block, everything centered, the media big below.
    return (
      <ShowcaseBlock tone="light">
        <ShowcaseHeader eyebrow={p.eyebrow} title={p.title} />
        <SiteRichText
          field={p.body}
          className="mx-auto mt-6 max-w-2xl space-y-4 text-center text-lg leading-relaxed text-ink-muted sm:text-xl"
        />
        {points.length > 0 && (
          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-3 text-ink">
            {points.map((point, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span
                  className="h-1.5 w-1.5 flex-none rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8 flex justify-center">
          <SiteButton field={p.cta_link} label={p.cta_label} variant="text" />
        </div>
        <div className="mx-auto mt-14 max-w-4xl">{media}</div>
      </ShowcaseBlock>
    );
  }

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <FadeInStagger
        faster
        className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
      >
        <FadeIn className={clsx(imageLeft ? "lg:order-1" : "lg:order-2")}>
          {media}
        </FadeIn>

        <FadeIn className={clsx(imageLeft ? "lg:order-2" : "lg:order-1")}>
          {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
          {p.title && (
            <h2
              className={clsx(
                "site-heading text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl",
                p.eyebrow && "mt-4",
              )}
            >
              {p.title}
            </h2>
          )}
          <SiteRichText
            field={p.body}
            className="mt-6 text-lg leading-relaxed text-ink-muted"
          />
          {points.length > 0 && (
            <ul className="mt-8 space-y-3 border-t border-line pt-8">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-ink">
                  <span
                    className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
          <SiteButton
            field={p.cta_link}
            label={p.cta_label}
            variant="text"
            className="mt-8"
          />
        </FadeIn>
      </FadeInStagger>
    </Section>
  );
};

export default SiteTextMedia;
