"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useRef } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import {
  Section,
  SectionHeader,
  SiteRichText,
  toneFromSelect,
} from "@/lib/site-ui";
import {
  ShowcaseBlock,
  ShowcaseHeader,
  isShowcase,
} from "@/components/Showcase";
import { useUiCopy } from "@/lib/ui-copy";

/**
 * Showcase (home page): a light rounded block with the milestones as a row of cards you scroll
 * sideways (arrows on wider screens): a big year, the photo, the title and the text.
 * Highlighted milestones are dark cards.
 */
function ShowcaseTimeline({ p, entries }: { p: any; entries: any[] }) {
  const row = useRef<HTMLOListElement>(null);
  const t = useUiCopy();
  const step = (dir: 1 | -1) => {
    const el = row.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({
      left: dir * (card.getBoundingClientRect().width + 16),
      behavior: "smooth",
    });
  };
  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      onClick={() => step(dir)}
      aria-label={dir < 0 ? t.previous : t.next}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 shadow-sm transition hover:bg-neutral-200"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={clsx("h-5 w-5", dir < 0 && "rotate-180")}
      >
        <path
          d="m9 6 6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  return (
    <ShowcaseBlock tone="light">
      <ShowcaseHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      {/* The row runs to the block's edges; snap per card. */}
      <ol
        ref={row}
        role="list"
        className="-mx-6 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] sm:-mx-12 sm:scroll-px-12 sm:px-12 [&::-webkit-scrollbar]:hidden"
      >
        {entries.map((entry, i) => {
          const dark = !!entry.highlight;
          const showMedia = isFilled.image(entry.image) || !!entry.image_brief;
          return (
            <li
              key={i}
              className={clsx(
                "flex w-[82%] flex-none snap-start flex-col rounded-2xl p-6 text-left sm:w-[22rem] sm:p-7",
                dark ? "bg-black text-white" : "bg-white text-neutral-950",
              )}
            >
              {entry.year && (
                <p className="site-heading text-5xl leading-none tabular-nums sm:text-6xl">
                  {entry.year}
                </p>
              )}
              {showMedia && (
                <MediaSlot
                  field={entry.image}
                  brief={
                    entry.image_brief ||
                    `Photo for ${entry.year ? `${entry.year}: ` : ""}“${entry.title || "this milestone"}”`
                  }
                  aspect="aspect-[4/3]"
                  rounded="rounded-xl"
                  sizes="352px"
                  tone={dark ? "dark" : "light"}
                  className="mt-6 w-full"
                />
              )}
              {entry.title && (
                <h3 className="site-heading mt-6 text-xl leading-snug sm:text-2xl">
                  {entry.title}
                </h3>
              )}
              <SiteRichText
                field={entry.body}
                className={clsx(
                  "mt-3 text-base leading-relaxed",
                  dark ? "text-neutral-400" : "text-neutral-600",
                )}
              />
            </li>
          );
        })}
      </ol>
      <div className="mt-8 hidden justify-center gap-3 sm:flex">
        {arrow(-1)}
        {arrow(1)}
      </div>
    </ShowcaseBlock>
  );
}

/**
 * History timeline on a thin vertical line. Mobile: one column with the line on the left.
 * Desktop: entries alternate left and right of a centered line. Highlighted milestones get a
 * larger year, a filled marker and a card.
 */
const SiteTimeline: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const entries: any[] = (slice.items || []).filter(
    (i: any) => i?.year || i?.title || isFilled.richText(i?.body),
  );
  if (entries.length === 0) return null;
  if (isShowcase(p)) return <ShowcaseTimeline p={p} entries={entries} />;

  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      <FadeInStagger
        faster
        className={clsx("relative", hasHeader && "mt-16 lg:mt-20")}
      >
        {/* The line: left on mobile, centered on desktop. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-2 left-[7px] border-l border-line lg:left-1/2"
        />

        <ol role="list" className="space-y-12 lg:space-y-16">
          {entries.map((entry, i) => {
            const left = i % 2 === 0;
            const highlight = !!entry.highlight;
            const showMedia =
              isFilled.image(entry.image) || !!entry.image_brief;

            return (
              <li
                key={i}
                className="relative pl-10 lg:grid lg:grid-cols-2 lg:gap-x-20 lg:pl-0"
              >
                {/* Marker on the line. */}
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-accent lg:left-1/2 lg:-translate-x-[7px]",
                    highlight
                      ? "bg-accent ring-4 ring-accent-soft/40"
                      : "bg-page",
                  )}
                />

                <FadeIn
                  className={clsx(
                    left ? "lg:col-start-1 lg:text-right" : "lg:col-start-2",
                    highlight &&
                      "rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:rounded-3xl",
                  )}
                >
                  {entry.year && (
                    <p
                      className={clsx(
                        "site-heading leading-none tabular-nums text-accent",
                        highlight
                          ? "text-5xl sm:text-6xl"
                          : "text-3xl sm:text-4xl",
                      )}
                    >
                      {entry.year}
                    </p>
                  )}
                  {entry.title && (
                    <h3
                      className={clsx(
                        "site-heading text-xl leading-snug text-ink sm:text-2xl",
                        entry.year && "mt-4",
                      )}
                    >
                      {entry.title}
                    </h3>
                  )}
                  <SiteRichText
                    field={entry.body}
                    className="mt-3 text-base leading-relaxed text-ink-muted"
                  />
                  {showMedia && (
                    <MediaSlot
                      field={entry.image}
                      brief={
                        entry.image_brief ||
                        `Photo for ${entry.year ? `${entry.year}: ` : ""}“${entry.title || "this milestone"}”`
                      }
                      aspect="aspect-[4/3]"
                      rounded="rounded-xl lg:rounded-2xl"
                      sizes="(min-width: 640px) 384px, 100vw"
                      className={clsx(
                        "mt-6 w-full max-w-sm",
                        left && "lg:ml-auto",
                      )}
                    />
                  )}
                </FadeIn>
              </li>
            );
          })}
        </ol>
      </FadeInStagger>
    </Section>
  );
};

export default SiteTimeline;
