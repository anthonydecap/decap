"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { MediaPlaceholder } from "@/components/MediaSlot";
import { SectionHeader, SiteLink, toneFromSelect } from "@/lib/site-ui";
import { useUiCopy } from "@/lib/ui-copy";

/*
 * Apple-style photo cards with a label and one line over the photo. Up to four cards form one row
 * inside the site container on desktop (same gaps and corners as the homepage tiles); below
 * desktop, or with more cards, they swipe in a snapping row with arrow buttons.
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
            sizes="(min-width: 1024px) 25vw, 80vw"
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
        {item.title && <p className="site-heading mt-1.5 text-xl leading-snug text-white sm:text-2xl lg:text-xl xl:text-2xl">{item.title}</p>}
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
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16), behavior: "smooth" });
  };

  if (!items.length) return null;
  const tone = toneFromSelect(p.tone);

  // Up to four cards: one neat row inside the container on desktop. More: a scrolling row.
  const fits = items.length <= 4;
  const cols = ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"][Math.min(items.length, 4)];

  return (
    <section data-tone={tone === "page" ? undefined : tone} className="bg-page py-16 text-ink sm:py-24 lg:py-28">
      <Container>
        <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

        <div className={clsx("mt-12 flex justify-end gap-3 lg:mt-16", fits ? "lg:hidden" : "hidden sm:flex")}>
          <Arrow dir="prev" disabled={edge.start} onClick={() => scroll(-1)} />
          <Arrow dir="next" disabled={edge.end} onClick={() => scroll(1)} />
        </div>

        {/* Same container, gaps and corners as the homepage tiles; swipes below desktop. */}
        <ul
          ref={track}
          onScroll={update}
          className={clsx(
            "mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden",
            fits && clsx("lg:mt-16 lg:grid lg:overflow-visible", cols),
          )}
        >
          {items.map((item, i) => (
            <li key={i} className={clsx("w-[78%] flex-none snap-start sm:w-[44%]", fits ? "lg:w-auto" : "lg:w-[31%]")}>
              <Card item={item} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};

export default SiteCarousel;
