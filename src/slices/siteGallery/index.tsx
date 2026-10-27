"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { FadeIn } from "@/components/FadeIn";
import { Section, SectionHeader, SiteLink, toneFromSelect } from "@/lib/site-ui";
import { useUiCopy } from "@/lib/ui-copy";

/*
 * Photo portfolio: the photos do the talking. Justified rows, as in a photo library: every row
 * fills the width, every photo keeps its own shape, so nothing is cropped and there are no holes,
 * whatever the number of photos. One small pill per photo (e.g. Realisation or Design) and the
 * name only on hover. Filter pills above, built from the labels; a click opens the photo full screen.
 */

/** The photo's width / height, within limits so very tall or wide photos don't break a row. */
function ratioOf(item: any): number {
  const d = item.image?.dimensions;
  return d ? Math.min(2, Math.max(0.6, d.width / d.height)) : 4 / 3;
}

/**
 * Row breaks for the measured width: the split whose rows come closest to the target row height
 * (so no photo is left alone on a last row). Returns each photo's share of its row's width and
 * the number of photos in that row; null until the list has been measured.
 */
function useRows(list: React.RefObject<HTMLElement | null>, ratios: number[]) {
  const [rows, setRows] = useState<{ share: number; count: number }[] | null>(null);
  const key = ratios.join(",");
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const layout = () => {
      const style = getComputedStyle(el);
      const W = el.clientWidth;
      const H = parseFloat(style.getPropertyValue("--row")) * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const g = parseFloat(style.columnGap) || 0;
      const n = ratios.length;
      if (!W || !H || !n) return;
      const cost = [0];
      const from = [0];
      for (let j = 1; j <= n; j++) {
        cost[j] = Infinity;
        let sum = 0;
        for (let i = j - 1; i >= 0; i--) {
          sum += ratios[i];
          const h = (W - g * (j - i - 1)) / sum;
          const c = cost[i] + (h - H) ** 2;
          if (c < cost[j]) [cost[j], from[j]] = [c, i];
          if (h < H / 3) break;
        }
      }
      const out: { share: number; count: number }[] = [];
      for (let j = n; j > 0; j = from[j]) {
        const i = from[j];
        const sum = ratios.slice(i, j).reduce((a, b) => a + b, 0);
        for (let k = i; k < j; k++) out[k] = { share: ratios[k] / sum, count: j - i };
      }
      setRows(out);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, key]);
  return rows;
}

/** Cut-outs and renders are shown whole on a plain backdrop instead of cropped. */
const BACKDROP: Record<string, string> = { "Whole, light backdrop": "bg-ink/[0.05]", "Whole, dark backdrop": "bg-neutral-950" };

const SiteGallery: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const t = useUiCopy();
  const reduce = useReducedMotion();
  const items: any[] = useMemo(() => (slice.items || []).filter((i: any) => isFilled.image(i?.image)), [slice.items]);
  const labels = useMemo(() => [...new Set(items.map((i) => i.label).filter(Boolean))] as string[], [items]);
  const [filter, setFilter] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const shown = filter ? items.filter((i) => i.label === filter) : items;
  const list = useRef<HTMLUListElement>(null);
  const rows = useRows(list, shown.map(ratioOf));
  if (!items.length) return null;
  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      {p.show_filters !== false && labels.length > 1 && (
        <FadeIn className={clsx("flex flex-wrap gap-2", hasHeader && "mt-10 lg:mt-12")}>
          {[null, ...labels].map((l) => (
            <button
              key={l ?? "all"}
              type="button"
              aria-pressed={filter === l}
              onClick={() => setFilter(l)}
              className={clsx(
                "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                filter === l ? "text-page" : "bg-ink/[0.06] text-ink-muted hover:text-ink",
              )}
            >
              {filter === l && (
                <motion.span layoutId={`gallery-pill-${slice.id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative">{l ?? t.galleryAll}</span>
            </button>
          ))}
        </FadeIn>
      )}

      <LayoutGroup>
        <motion.ul
          ref={list}
          role="list"
          className={clsx(
            // Each photo grows in proportion to its shape, so a row's photos end up the same height.
            "flex flex-wrap gap-[var(--gap)] [--gap:0.5rem] [--row:11rem] sm:[--gap:0.75rem] sm:[--row:13rem] lg:[--row:17rem]",
            hasHeader || labels.length > 1 ? "mt-8 lg:mt-10" : undefined,
          )}
        >
          <AnimatePresence initial={false}>
            {shown.map((item) => {
              const index = items.indexOf(item);
              const backdrop = BACKDROP[item.fit];
              const r = ratioOf(item);
              const row = rows?.[shown.indexOf(item)];
              return (
                <motion.li
                  key={index}
                  layout={!reduce}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={
                    row
                      ? { flex: `0 1 calc((100% - ${row.count - 1} * var(--gap)) * ${row.share * 0.9999})`, aspectRatio: r }
                      : { flexGrow: r, flexBasis: `calc(var(--row) * ${r})`, aspectRatio: r }
                  }
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(index)}
                    aria-label={t.galleryOpen(item.title || item.image.alt || item.label || "")}
                    className={clsx("group absolute inset-0 overflow-hidden rounded-2xl lg:rounded-3xl", backdrop ?? "bg-ink/[0.06]")}
                  >
                    <PrismicNextImage
                      field={item.image}
                      fill
                      sizes="(min-width: 1024px) 40vw, 70vw"
                      className={clsx(
                        "transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                        backdrop ? "object-contain p-[8%]" : "object-cover",
                      )}
                      fallbackAlt=""
                    />
                    {item.label && (
                      <span className="absolute top-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-md sm:top-4 sm:left-4 sm:max-w-[calc(100%-2rem)] sm:px-2.5 sm:py-1 sm:text-xs">
                        {item.label}
                      </span>
                    )}
                    {item.title && (
                      <span
                        className={clsx(
                          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-10 pb-3 text-left text-sm font-semibold text-white transition-opacity duration-300 sm:px-4 sm:pb-4",
                          "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100",
                        )}
                      >
                        {item.title}
                      </span>
                    )}
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {/* Before measuring: keeps the last row at its natural height instead of stretching it. */}
          {!rows && <li aria-hidden="true" className="grow-[100]" />}
        </motion.ul>
      </LayoutGroup>

      <Lightbox items={shown} index={open === null ? null : shown.indexOf(items[open])} onIndex={(i) => setOpen(i === null ? null : items.indexOf(shown[i]))} />
    </Section>
  );
};

/** Full-screen view: arrows, swipe and Escape; the page behind doesn't scroll. */
function Lightbox({ items, index, onIndex }: { items: any[]; index: number | null; onIndex: (i: number | null) => void }) {
  const t = useUiCopy();
  const close = useRef<HTMLButtonElement>(null);
  const [dir, setDir] = useState(0);
  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      setDir(step);
      onIndex((index + step + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  // On open: focus the close button and lock the page; on close, give focus back.
  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
      opener?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, go, onIndex]);

  const item = index === null ? null : items[index];
  const many = items.length > 1;
  const arrow = "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20";

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title || item.label || undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col bg-neutral-950/95 text-white backdrop-blur-xl"
          onClick={(e) => e.target === e.currentTarget && onIndex(null)}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <p className="text-sm tabular-nums text-white/60">{many && `${index! + 1} / ${items.length}`}</p>
            <button ref={close} type="button" onClick={() => onIndex(null)} aria-label={t.galleryClose} className={arrow}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && onIndex(null)}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                drag={many ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className="absolute inset-x-4 inset-y-0 sm:inset-x-20"
              >
                <PrismicNextImage field={item.image} fill sizes="100vw" className="pointer-events-none object-contain" fallbackAlt="" />
              </motion.div>
            </AnimatePresence>
            {many && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label={t.previous} className={clsx(arrow, "absolute top-1/2 left-4 hidden -translate-y-1/2 sm:flex")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button type="button" onClick={() => go(1)} aria-label={t.next} className={clsx(arrow, "absolute top-1/2 right-4 hidden -translate-y-1/2 sm:flex")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="flex min-h-20 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-5 text-center">
            {item.label && <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">{item.label}</span>}
            {item.title && <p className="text-base font-semibold">{item.title}</p>}
            {item.link_label && isFilled.link(item.link) && (
              <SiteLink field={item.link} className="text-sm font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline">
                {item.link_label} <span aria-hidden="true">›</span>
              </SiteLink>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SiteGallery;
