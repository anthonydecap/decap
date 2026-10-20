"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { Section, SectionHeader, toneFromSelect } from "@/lib/site-ui";

const STAT_COLUMNS: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Key figures as big numbers ("Stats"), or a label/value spec table ("Spec list"). */
const SiteFacts: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const facts: any[] = (slice.items || []).filter((i: any) => i?.value || i?.label);
  if (facts.length === 0) return null;

  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));
  const specList = p.layout === "Spec list";

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      <FadeInStagger faster className={hasHeader ? "mt-16 lg:mt-20" : undefined}>
        {specList ? (
          <dl
            className={clsx(
              "mx-auto grid gap-x-16",
              facts.length > 4 ? "max-w-5xl lg:grid-cols-2" : "max-w-3xl",
            )}
          >
            {facts.map((fact, i) => (
              <FadeIn key={i} className="grid grid-cols-2 gap-6 border-t border-line py-5">
                <dt className="text-ink-muted">{fact.label}</dt>
                <dd className="text-right">
                  <span className="font-medium text-ink">{fact.value}</span>
                  {fact.note && <span className="mt-1 block text-sm text-ink-muted">{fact.note}</span>}
                </dd>
              </FadeIn>
            ))}
          </dl>
        ) : (
          <dl
            className={clsx(
              "grid gap-x-8 gap-y-12 text-center",
              STAT_COLUMNS[Math.min(facts.length, 4)],
              facts.length > 4 && "lg:grid-cols-3",
            )}
          >
            {facts.map((fact, i) => (
              // DOM order dt → dd for valid markup; flex-col-reverse puts the value on top.
              <FadeIn key={i} className="flex flex-col-reverse">
                <dt className="mt-3 text-base text-ink-muted sm:text-lg">
                  {fact.label}
                  {fact.note && <span className="mt-1 block text-sm opacity-80">{fact.note}</span>}
                </dt>
                <dd className="site-heading text-5xl leading-none tabular-nums text-ink sm:text-6xl">{fact.value}</dd>
              </FadeIn>
            ))}
          </dl>
        )}
      </FadeInStagger>
    </Section>
  );
};

export default SiteFacts;
