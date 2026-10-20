"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { Section, SectionHeader, SiteRichText, toneFromSelect } from "@/lib/site-ui";

const hasMedia = (item: any) => isFilled.image(item?.image) || !!item?.image_brief;
const stepNumber = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Numbered process steps. When any step has a photo (or a photo brief) they render as
 * alternating text/image rows; otherwise as a calm grid of numbered columns.
 */
const SiteSteps: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const steps: any[] = (slice.items || []).filter((i: any) => i?.title || isFilled.richText(i?.body));
  if (steps.length === 0) return null;

  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));
  const withMedia = steps.some(hasMedia);

  const number = (i: number, className?: string) => (
    <span aria-hidden="true" className={clsx("site-heading block tabular-nums text-accent", className)}>
      {stepNumber(i)}
    </span>
  );

  const copy = (step: any) => (
    <>
      {step.title && <h3 className="site-heading text-xl leading-snug text-ink sm:text-2xl">{step.title}</h3>}
      <SiteRichText field={step.body} className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg" />
    </>
  );

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      <FadeInStagger faster className={hasHeader ? "mt-16 lg:mt-20" : undefined}>
        {withMedia ? (
          <ol role="list" className="space-y-16 sm:space-y-20 lg:space-y-28">
            {steps.map((step, i) => (
              <li key={i}>
                <FadeIn className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
                  {hasMedia(step) && (
                    <MediaSlot
                      field={step.image}
                      brief={step.image_brief || `Photo for step ${i + 1}: “${step.title || "this step"}”`}
                      aspect="aspect-[4/3]"
                      className={i % 2 === 1 ? "lg:order-2" : undefined}
                    />
                  )}
                  <div className={clsx(i % 2 === 1 && "lg:order-1", !hasMedia(step) && "lg:col-span-2 lg:max-w-2xl")}>
                    {number(i, "mb-5 text-5xl leading-none sm:text-6xl")}
                    {copy(step)}
                  </div>
                </FadeIn>
              </li>
            ))}
          </ol>
        ) : (
          <ol
            role="list"
            className={clsx(
              "grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:gap-x-12",
              steps.length % 3 === 0 || steps.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-2",
            )}
          >
            {steps.map((step, i) => (
              <li key={i}>
                <FadeIn className="h-full border-t border-line pt-8">
                  {number(i, "mb-6 text-4xl leading-none sm:text-5xl")}
                  {copy(step)}
                </FadeIn>
              </li>
            ))}
          </ol>
        )}
      </FadeInStagger>
    </Section>
  );
};

export default SiteSteps;
