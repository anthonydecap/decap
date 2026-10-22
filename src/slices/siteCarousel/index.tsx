"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { MediaPlaceholder } from "@/components/MediaSlot";
import { SiteLink, SiteRichText, toneFromSelect } from "@/lib/site-ui";
import { useUiCopy } from "@/lib/ui-copy";

/*
 * Apple-style gallery ("Get to know …"): tall photo cards in a horizontal, snapping scroll row.
 * The first card lines up with the page content; the row bleeds off the right edge. A label and
 * one line sit over the top of each photo; arrow buttons scroll one card at a time.
 */

const POSITION: Record<string, string> = {
  Center: "object-center",
  Top: "object-top",
  Bottom: "object-bottom",
  Left: "object-left",
  Right: "object-right",
};

function Arrow({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const t = useUiCopy();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? t.previous : t.next}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink transition hover:bg-line disabled:opacity-35"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={clsx("h-5 w-5", dir === "prev" && "rotate-180")}>
        <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Card({ item }: { item: any }) {
  const inner = (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-neutral-900">
      {isFilled.image(item.image) ? (
        <>
          <PrismicNextImage
            field={item.image}
            fill
            sizes="(min-width: 1024px) 400px, 80vw"
            className={clsx("object-cover transition-transform duration-700 ease-out group-hover:scale-105", POSITION[item.image_position] ?? "object-center")}
            fallbackAlt=""
          />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/65 via-black/25 to-transparent" />
        </>
      ) : (
        <MediaPlaceholder tone="dark" brief={item.image_brief || item.title || item.eyebrow || "Photo"} />
      )}
      <div className="absolute inset-x-0 top-0 p-6 text-left sm:p-7">
        {item.eyebrow && <p className="text-sm font-semibold text-white/85">{item.eyebrow}</p>}
        {item.title && <p className="site-heading mt-1.5 text-2xl leading-snug text-white sm:text-[1.65rem]">{item.title}</p>}
      </div>
    </div>
  );
  return isFilled.link(item.link) ? (
    <SiteLink field={item.link} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
      {inner}
    </SiteLink>
  ) : (
    <div className="group">{inner}</div>
  );
}

const SiteCarousel: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const items: any[] = (slice.items || []).filter((i: any) => i?.title || i?.eyebrow || isFilled.image(i?.image));
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20), behavior: "smooth" });
  };

  if (!items.length) return null;
  const tone = toneFromSelect(p.tone);

  return (
    <section data-tone={tone === "page" ? undefined : tone} className="overflow-hidden bg-page py-16 text-ink sm:py-24 lg:py-28">
      <Container>
        <FadeIn className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {p.eyebrow && <p className="text-sm font-semibold text-ink-muted">{p.eyebrow}</p>}
            {p.title && <h2 className="site-heading mt-2 text-4xl leading-tight text-ink sm:text-5xl">{p.title}</h2>}
            <SiteRichText field={p.intro} className="mt-4 text-lg leading-relaxed text-ink-muted" />
          </div>
          <div className="hidden gap-3 sm:flex">
            <Arrow dir="prev" disabled={edge.start} onClick={() => scroll(-1)} />
            <Arrow dir="next" disabled={edge.end} onClick={() => scroll(1)} />
          </div>
        </FadeIn>
      </Container>

      {/* The row starts at the content edge and runs off the right side of the screen. */}
      <ul
        ref={track}
        onScroll={update}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 2rem))", paddingRight: "1.5rem", scrollPaddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 2rem))" }}
      >
        {items.map((item, i) => (
          <li key={i} className="w-[78vw] max-w-[400px] flex-none snap-start sm:w-[340px] lg:w-[400px]">
            <Card item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SiteCarousel;
