"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicRichText, type JSXMapSerializer, type SliceComponentProps } from "@prismicio/react";
import { FadeIn } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { Section, toneFromSelect } from "@/lib/site-ui";

const quoteText: JSXMapSerializer = {
  paragraph: ({ children }) => <p className="[&+p]:mt-6">{children}</p>,
  em: ({ children }) => <em className="italic">{children}</em>,
};

/** A single large quote or testimonial, with name, role and an optional round portrait. */
const SiteQuote: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  if (!isFilled.richText(p.quote)) return null;

  const hasPortrait = isFilled.image(p.image);

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <FadeIn>
        <figure className="mx-auto max-w-4xl text-center">
          <span aria-hidden="true" className="site-heading block text-6xl leading-none text-accent sm:text-7xl">
            “
          </span>
          <blockquote className="site-heading mt-4 text-2xl leading-snug text-ink sm:text-3xl lg:text-4xl lg:leading-tight">
            <PrismicRichText field={p.quote} components={quoteText} />
          </blockquote>
          {(p.name || p.role || hasPortrait) && (
            <figcaption className="mt-10 flex items-center justify-center gap-4">
              {hasPortrait && (
                <MediaSlot
                  field={p.image}
                  brief={`Portrait of ${p.name || "the person quoted"}`}
                  aspect="aspect-square"
                  rounded="rounded-full"
                  sizes="56px"
                  className="size-14 flex-none"
                />
              )}
              <div className={hasPortrait ? "text-left" : undefined}>
                {p.name && <div className="font-semibold text-ink">{p.name}</div>}
                {p.role && <div className="text-ink-muted">{p.role}</div>}
              </div>
            </figcaption>
          )}
        </figure>
      </FadeIn>
    </Section>
  );
};

export default SiteQuote;
