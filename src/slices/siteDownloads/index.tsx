"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { Section, SectionHeader, cardClass, toneFromSelect } from "@/lib/site-ui";

/** Manuals, spec sheets and other files. Rows without a file stay visible as "Coming soon". */
const SiteDownloads: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const items: any[] = (slice.items || []).filter((i: any) => i?.label);
  if (items.length === 0) return null;

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <FadeInStagger faster className="mx-auto mt-12 max-w-3xl space-y-3 sm:mt-16">
        {items.map((item, i) => {
          const url = isFilled.link(item.file) ? (item.file as any).url : null;
          return (
            <FadeIn key={i}>
              <div className={clsx(cardClass, "flex items-center gap-4 p-5 sm:gap-6 sm:p-6", !url && "opacity-70")}>
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-page text-accent" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.5} strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{item.label}</h3>
                    {item.file_type && (
                      <span className="rounded-full border border-line px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                        {item.file_type}
                      </span>
                    )}
                  </div>
                  {item.description && <p className="mt-1 text-sm text-ink-muted">{item.description}</p>}
                </div>
                {url ? (
                  <a
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${item.label}`}
                    className="inline-flex flex-none items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8 2v8m0 0 3-3m-3 3L5 7M3 13h10" />
                    </svg>
                    <span className="hidden sm:inline">Download</span>
                  </a>
                ) : (
                  <span aria-disabled="true" className="flex-none rounded-full border border-dashed border-line px-4 py-2 text-sm font-medium text-ink-muted">
                    Coming soon
                  </span>
                )}
              </div>
            </FadeIn>
          );
        })}
      </FadeInStagger>
    </Section>
  );
};

export default SiteDownloads;
