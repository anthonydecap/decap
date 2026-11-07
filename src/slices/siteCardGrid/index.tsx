"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicRichText, type JSXMapSerializer, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { BrandText } from "@/components/BrandText";
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

  if (p.card_style === "Case cards") {
    return (
      <Section tone={toneFromSelect(p.tone)}>
        <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        <CaseGrid items={items} columns={columns} className={hasHeader ? "mt-16 lg:mt-20" : undefined} />
        {p.cta_label && isFilled.link(p.cta_link) && (
          <FadeIn className="mt-12 text-center lg:mt-16">
            <SiteButton field={p.cta_link} label={p.cta_label} variant="text" />
          </FadeIn>
        )}
      </Section>
    );
  }

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
                      <BrandText>{item.tag}</BrandText>
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

/**
 * "Case cards": editorial tiles for case studies, in the language of the Work page's portfolio and
 * artist rows. No card frame: the photo itself is the tile, with the text loose underneath. When the
 * count would leave one card alone on the last row, the first case becomes a wide feature instead.
 */
function CaseGrid({ items, columns, className }: { items: any[]; columns: string; className?: string }) {
  const cols = Number(columns);
  const feature = items.length > 1 && items.length % cols === 1;
  return (
    <FadeInStagger faster className={className}>
      <ul role="list" className={clsx("grid grid-cols-1 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16", COLUMNS[columns])}>
        {items.map((item, i) => (
          <li key={i} className={clsx("flex", feature && i === 0 && "sm:col-span-full")}>
            <FadeIn className="flex w-full">
              <CaseCard item={item} feature={feature && i === 0} sizes={SIZES[columns]} />
            </FadeIn>
          </li>
        ))}
      </ul>
    </FadeInStagger>
  );
}

function CaseCard({ item, feature, sizes }: { item: any; feature: boolean; sizes: string }) {
  const linked = isFilled.link(item.link);
  const inner = (
    <>
      <div className={clsx(feature && "lg:col-span-7")}>
        <MediaSlot
          field={item.image}
          brief={item.image_brief || `Photo for “${item.title || "this case"}”`}
          aspect={feature ? "aspect-[4/3] lg:aspect-[3/2]" : "aspect-[4/3]"}
          rounded="rounded-2xl lg:rounded-3xl"
          sizes={feature ? "(min-width: 1024px) 58vw, 100vw" : sizes}
          className={clsx(
            linked && "[&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out group-hover:[&_img]:scale-[1.03]",
          )}
        />
      </div>
      <div className={clsx("flex flex-1 flex-col pt-6", feature && "lg:col-span-5 lg:pt-0")}>
        {item.tag && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
            <BrandText>{item.tag}</BrandText>
          </p>
        )}
        {item.title && (
          <h3
            className={clsx(
              "site-heading leading-snug text-ink",
              feature ? "text-2xl sm:text-3xl lg:text-4xl lg:leading-tight" : "text-xl sm:text-2xl",
            )}
          >
            {item.title}
          </h3>
        )}
        {isFilled.richText(item.body) && (
          <div className={clsx("mt-3 leading-relaxed text-ink-muted", feature ? "text-base lg:text-lg" : "text-base")}>
            <PrismicRichText field={item.body} components={linked ? cardRichText : siteRichText} />
          </div>
        )}
        {linked && item.link_label && (
          <span className={clsx("inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink", !feature && "mt-auto")}>
            {item.link_label}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        )}
      </div>
    </>
  );
  const layout = clsx("flex w-full flex-col", feature && "lg:grid lg:grid-cols-12 lg:items-center lg:gap-12");
  return linked ? (
    <SiteLink
      field={item.link}
      className={clsx(
        layout,
        "group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:rounded-3xl",
      )}
    >
      {inner}
    </SiteLink>
  ) : (
    <div className={layout}>{inner}</div>
  );
}

export default SiteCardGrid;
