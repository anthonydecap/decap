"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicRichText, type JSXMapSerializer, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { Section, SectionHeader, SiteButton, SiteLink, cardClass, siteRichText, toneFromSelect } from "@/lib/site-ui";

const COLUMNS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

const SIZES: Record<string, string> = {
  "2": "(min-width: 640px) 50vw, 100vw",
  "3": "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  "4": "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
};

/** Inside a clickable card, links in the text would nest <a> tags: render them as plain text. */
const cardRichText: JSXMapSerializer = { ...siteRichText, hyperlink: ({ children }) => <>{children}</> };

/** Grid of product or page cards, with an optional brand tag (e.g. Orchestrionix) and price. */
const SiteCardGrid: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const items: any[] = (slice.items || []).filter(
    (i: any) => i?.title || isFilled.richText(i?.body) || isFilled.image(i?.image) || i?.image_brief,
  );
  if (items.length === 0) return null;

  const columns = COLUMNS[p.columns] ? p.columns : "3";
  const withImages = p.card_style !== "Text cards";
  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      <FadeInStagger faster className={hasHeader ? "mt-16 lg:mt-20" : undefined}>
        <ul role="list" className={clsx("grid grid-cols-1 gap-6 lg:gap-8", COLUMNS[columns])}>
          {items.map((item, i) => {
            const linked = isFilled.link(item.link);
            const body = (
              <>
                {withImages && (
                  <MediaSlot
                    field={item.image}
                    brief={item.image_brief || `Photo for “${item.title || "this card"}”`}
                    aspect="aspect-[4/3]"
                    rounded="rounded-xl lg:rounded-2xl"
                    sizes={SIZES[columns]}
                  />
                )}
                <div className={clsx("flex flex-1 flex-col", withImages ? "px-2 pt-6 pb-2" : undefined)}>
                  {item.tag && (
                    <span className="mb-4 inline-flex self-start rounded-full border border-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      {item.tag}
                    </span>
                  )}
                  {item.title && (
                    <h3 className="site-heading text-xl leading-snug text-ink sm:text-2xl">{item.title}</h3>
                  )}
                  {isFilled.richText(item.body) && (
                    <div className="mt-3 text-base leading-relaxed text-ink-muted">
                      <PrismicRichText field={item.body} components={linked ? cardRichText : siteRichText} />
                    </div>
                  )}
                  {(item.price || (linked && item.link_label)) && (
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-6 text-sm">
                      {item.price && <p className="font-semibold text-ink">{item.price}</p>}
                      {linked && item.link_label && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                          {item.link_label}
                          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            );

            const cardClassName = clsx(
              cardClass,
              "flex h-full flex-col",
              withImages ? "p-3 sm:p-4" : "p-6 sm:p-8",
            );

            return (
              <li key={i} className="flex">
                <FadeIn className="flex w-full">
                  {linked ? (
                    <SiteLink
                      field={item.link}
                      className={clsx(
                        cardClassName,
                        "group w-full hover:-translate-y-1 hover:border-accent-soft hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                      )}
                    >
                      {body}
                    </SiteLink>
                  ) : (
                    <div className={clsx(cardClassName, "w-full")}>{body}</div>
                  )}
                </FadeIn>
              </li>
            );
          })}
        </ul>
      </FadeInStagger>

      {p.cta_label && isFilled.link(p.cta_link) && (
        <FadeIn className="mt-12 text-center lg:mt-16">
          <SiteButton field={p.cta_link} label={p.cta_label} variant="text" />
        </FadeIn>
      )}
    </Section>
  );
};

export default SiteCardGrid;
