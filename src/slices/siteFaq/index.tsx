"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { asText, isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { Section, SectionHeader, SiteRichText, toneFromSelect } from "@/lib/site-ui";

/** Questions and answers as a native <details> accordion, plus FAQPage structured data. */
const SiteFaq: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const items: any[] = (slice.items || []).filter((i: any) => i?.question && isFilled.richText(i.answer));
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: asText(i.answer) },
    })),
  };

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <FadeInStagger faster className="mx-auto mt-12 max-w-3xl border-t border-line sm:mt-16">
        {items.map((item, i) => (
          <FadeIn key={i}>
            <details className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-semibold text-ink transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-xl [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-line text-ink-muted transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.75} strokeLinecap="round">
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </span>
              </summary>
              <SiteRichText field={item.answer} className="pb-6 pr-14 text-base leading-relaxed text-ink-muted sm:text-lg" />
            </details>
          </FadeIn>
        ))}
      </FadeInStagger>
    </Section>
  );
};

export default SiteFaq;
