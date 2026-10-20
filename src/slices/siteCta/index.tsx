"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { Eyebrow, Section, SiteButton, SiteRichText, toneFromSelect } from "@/lib/site-ui";

/** Closing call to action: copy, optional price and buttons, centered or next to an image. */
const SiteCta: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const hasImage = isFilled.image(p.image) || !!p.image_brief;
  const hasButtons = (p.primary_cta_label && isFilled.link(p.primary_cta_link)) || (p.secondary_cta_label && isFilled.link(p.secondary_cta_link));
  if (!p.title && !isFilled.richText(p.body) && !p.price && !hasButtons) return null;

  const centered = !hasImage;
  const brief = p.image_brief || `Image for “${p.title || "this call to action"}”`;

  const copy = (
    <>
      {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
      {p.title && (
        <h2 className={clsx("site-heading text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl", p.eyebrow && "mt-4")}>
          {p.title}
        </h2>
      )}
      <SiteRichText field={p.body} className="mt-6 text-lg leading-relaxed text-ink-muted sm:text-xl" />
      {p.price && (
        <div className="mt-8">
          <p className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{p.price}</p>
          {p.price_note && <p className="mt-2 text-sm text-ink-muted">{p.price_note}</p>}
        </div>
      )}
      {hasButtons && (
        <div className={clsx("mt-10 flex flex-wrap items-center gap-4", centered && "justify-center")}>
          <SiteButton field={p.primary_cta_link} label={p.primary_cta_label} />
          <SiteButton field={p.secondary_cta_link} label={p.secondary_cta_label} variant="secondary" />
        </div>
      )}
    </>
  );

  return (
    <Section tone={toneFromSelect(p.tone)}>
      {centered ? (
        <FadeIn className="mx-auto max-w-3xl text-center">{copy}</FadeIn>
      ) : (
        <FadeInStagger faster className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn>{copy}</FadeIn>
          <FadeIn>
            <MediaSlot field={p.image} brief={brief} aspect="aspect-[4/3]" />
          </FadeIn>
        </FadeInStagger>
      )}
    </Section>
  );
};

export default SiteCta;
