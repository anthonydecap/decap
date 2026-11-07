"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowsOut, X } from "@phosphor-icons/react";
import clsx from "clsx";
import { FadeIn } from "@/components/FadeIn";
import { Section, SectionHeader, SiteLink, toneFromSelect } from "@/lib/site-ui";
import { useUiCopy } from "@/lib/ui-copy";

/*
 * The work, shown like a showroom: one instrument at a time on a large stage, with the whole
 * collection as an index beside it (desktop) or a strip of thumbnails under it (mobile).
 * Cut-outs stand on a floor with a soft shadow; real photos fill the stage. Filters come from the
 * labels; the stage opens full screen.
 */

/** "Whole, …" fits from Prismic: always a cut-out on a stage; the dark one on a dark stage. */
const DARK_FIT = "Whole, dark backdrop";
const isWholeFit = (fit?: string) => typeof fit === "string" && fit.startsWith("Whole");

/**
 * Which images are cut-outs (transparent edges), checked on a 24 px copy of each image, so a
 * transparent PNG is never cropped, whatever its Fit says. Unknown until checked: shown whole.
 */
function useCutouts(items: any[]) {
  const [cutouts, setCutouts] = useState<Record<string, boolean>>({});
  useEffect(() => {
    let cancelled = false;
    for (const item of items) {
      const url: string = item.image.url;
      if (url in cutouts) continue;
      const probe = new Image();
      probe.crossOrigin = "anonymous";
      probe.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = c.height = 24;
          const ctx = c.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(probe, 0, 0, 24, 24);
          // A cut-out is transparent along most of its border; a photo with rounded corners is not
          const { data } = ctx.getImageData(0, 0, 24, 24);
          let edge = 0;
          let clear = 0;
          for (let y = 0; y < 24; y++)
            for (let x = 0; x < 24; x++)
              if (x === 0 || y === 0 || x === 23 || y === 23) {
                edge++;
                if (data[(y * 24 + x) * 4 + 3] < 200) clear++;
              }
          if (!cancelled) setCutouts((m) => ({ ...m, [url]: clear / edge > 0.4 }));
        } catch {
          if (!cancelled) setCutouts((m) => ({ ...m, [url]: false }));
        }
      };
      probe.src = `${url}${url.includes("?") ? "&" : "?"}w=24&h=24&fit=fill&fm=png`;
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  return cutouts;
}

const ratio = (item: any) => {
  const d = item.image?.dimensions;
  return d?.width && d?.height ? d.width / d.height : 4 / 3;
};

const SiteGallery: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const t = useUiCopy();
  const items: any[] = useMemo(() => (slice.items || []).filter((i: any) => isFilled.image(i?.image)), [slice.items]);
  const labels = useMemo(() => [...new Set(items.map((i) => i.label).filter(Boolean))] as string[], [items]);
  const cutouts = useCutouts(items);
  const [filter, setFilter] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const strip = useRef<HTMLDivElement>(null);

  const shown = filter ? items.filter((i) => i.label === filter) : items;
  if (!items.length) return null;
  const current = shown.includes(items[active]) ? active : items.indexOf(shown[0]);
  const position = shown.indexOf(items[current]);
  const item = items[current];
  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));
  const many = shown.length > 1;

  const select = (index: number) => {
    setActive(index);
    // Keep the chosen thumbnail in view on mobile
    strip.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };
  const step = (dir: number) => select(items.indexOf(shown[(position + dir + shown.length) % shown.length]));
  const choose = (next: string | null) => {
    setFilter(next);
    const list = next ? items.filter((i) => i.label === next) : items;
    if (!list.includes(items[active])) setActive(items.indexOf(list[0]));
  };

  /** How an item sits on the stage */
  const look = (it: any) => {
    const cutout = isWholeFit(it.fit) || cutouts[it.image.url] !== false;
    return {
      cutout,
      dark: it.fit === DARK_FIT,
      // A photo fills the stage when its shape is close; otherwise it is shown whole
      cover: !cutout && Math.abs(ratio(it) - 1.25) < 0.35,
    };
  };

  const filters = p.show_filters !== false && labels.length > 1 && (
    <div className="flex flex-wrap gap-2" role="group">
      {[null, ...labels].map((l) => (
        <button
          key={l ?? "all"}
          type="button"
          aria-pressed={filter === l}
          onClick={() => choose(l)}
          className={clsx(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]",
            filter === l ? "bg-ink text-page" : "bg-ink/[0.06] text-ink-muted hover:text-ink",
          )}
        >
          {l ?? t.galleryAll}
          <span className={clsx("ml-1.5 tabular-nums", filter === l ? "opacity-60" : "opacity-50")}>
            {l ? items.filter((i) => i.label === l).length : items.length}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      <FadeIn className={clsx("grid gap-x-12 gap-y-6 lg:grid-cols-12", hasHeader && "mt-12 lg:mt-16")}>
        {filters && <div className="lg:hidden">{filters}</div>}

        {/* Stage */}
        <div className="lg:col-span-8">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface sm:aspect-[4/3] lg:aspect-[5/4]">
            {shown.map((it) => {
              const index = items.indexOf(it);
              const { cutout, dark, cover } = look(it);
              const isActive = index === current;
              return (
                <div
                  key={index}
                  aria-hidden={!isActive}
                  className={clsx(
                    "absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    dark ? "bg-neutral-950" : "bg-surface",
                    isActive ? "z-10 translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
                  )}
                >
                  {cutout && (
                    // The floor: a soft contact shadow the instrument stands on
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "absolute bottom-[6%] left-1/2 h-[5%] w-[55%] -translate-x-1/2 rounded-[100%] blur-2xl",
                        dark ? "bg-white/10" : "bg-ink/20",
                      )}
                    />
                  )}
                  <PrismicNextImage
                    field={it.image}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    fallbackAlt=""
                    className={clsx(
                      cover ? "object-cover" : cutout ? "object-contain object-bottom px-[10%] pt-[7%] pb-[8%]" : "object-contain p-[6%]",
                    )}
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.galleryOpen(item.title || item.image.alt || item.label || "")}
              className="group absolute inset-0 z-20 cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink"
            >
              <span className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-page/80 text-ink opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:top-5 sm:right-5">
                <ArrowsOut className="h-4 w-4" weight="bold" />
              </span>
            </button>
          </div>

          {/* Caption under the stage */}
          <div className="mt-5 flex items-start justify-between gap-6">
            <div className="min-w-0" aria-live="polite">
              <p className="site-heading text-2xl leading-tight text-ink sm:text-3xl">{item.title || item.image.alt}</p>
              <p className="mt-1.5 text-sm text-ink-muted">
                {item.label}
                {item.link_label && isFilled.link(item.link) && (
                  <SiteLink field={item.link} className="ml-3 font-semibold text-ink underline-offset-4 hover:underline">
                    {item.link_label}
                  </SiteLink>
                )}
              </p>
            </div>
            {many && (
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => step(-1)} aria-label={t.previous} className={arrowClass}>
                  <ArrowLeft className="h-4 w-4" weight="bold" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label={t.next} className={arrowClass}>
                  <ArrowRight className="h-4 w-4" weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: thumbnail strip */}
        {many && (
          <div
            ref={strip}
            className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 py-1 [scrollbar-width:none] lg:hidden"
            role="list"
          >
            {shown.map((it) => {
              const index = items.indexOf(it);
              return (
                <button
                  key={index}
                  type="button"
                  role="listitem"
                  data-index={index}
                  onClick={() => select(index)}
                  aria-label={it.title || it.label || undefined}
                  aria-current={index === current}
                  className={clsx(
                    "relative aspect-square w-20 shrink-0 snap-start overflow-hidden rounded-2xl transition",
                    it.fit === DARK_FIT ? "bg-neutral-950" : "bg-surface",
                    index === current ? "ring-2 ring-ink ring-offset-2 ring-offset-page" : "opacity-70",
                  )}
                >
                  <PrismicNextImage field={it.image} fill sizes="80px" fallbackAlt="" className="object-contain p-2" />
                </button>
              );
            })}
          </div>
        )}

        {/* Desktop: the index */}
        <div className="relative hidden lg:col-span-4 lg:block">
          <div className="flex h-full flex-col lg:absolute lg:inset-0">
            {filters && <div className="mb-6">{filters}</div>}
            <ol className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
              {shown.map((it) => {
                const index = items.indexOf(it);
                const isActive = index === current;
                return (
                  <li key={index} className="border-t border-line first:border-t-0">
                    <button
                      type="button"
                      onClick={() => select(index)}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      aria-current={isActive}
                      className="group flex w-full items-center gap-4 py-3 text-left"
                    >
                      <span
                        className={clsx(
                          "relative h-12 w-12 shrink-0 overflow-hidden rounded-xl transition-opacity duration-300",
                          it.fit === DARK_FIT ? "bg-neutral-950" : "bg-surface",
                          isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100",
                        )}
                      >
                        <PrismicNextImage field={it.image} fill sizes="48px" fallbackAlt="" className="object-contain p-1" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={clsx(
                            "block truncate text-base font-semibold transition-colors duration-300",
                            isActive ? "text-ink" : "text-ink-muted group-hover:text-ink",
                          )}
                        >
                          {it.title || it.image.alt || it.label}
                        </span>
                        {it.label && <span className="block text-sm text-ink-muted">{it.label}</span>}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        weight="bold"
                        className={clsx(
                          "h-4 w-4 shrink-0 text-ink transition-[opacity,transform] duration-300",
                          isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </FadeIn>

      <Lightbox
        items={shown}
        index={open ? position : null}
        onIndex={(i) => {
          if (i === null) setOpen(false);
          else select(items.indexOf(shown[i]));
        }}
      />
    </Section>
  );
};

const arrowClass =
  "flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition hover:bg-ink hover:text-page active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

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
  const button = "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20";

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
          <div className="flex items-center justify-end px-4 py-4 sm:px-6">
            <button ref={close} type="button" onClick={() => onIndex(null)} aria-label={t.galleryClose} className={button}>
              <X className="h-5 w-5" weight="bold" />
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
                <button type="button" onClick={() => go(-1)} aria-label={t.previous} className={clsx(button, "absolute top-1/2 left-4 hidden -translate-y-1/2 sm:flex")}>
                  <ArrowLeft className="h-5 w-5" weight="bold" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label={t.next} className={clsx(button, "absolute top-1/2 right-4 hidden -translate-y-1/2 sm:flex")}>
                  <ArrowRight className="h-5 w-5" weight="bold" />
                </button>
              </>
            )}
          </div>

          <div className="flex min-h-20 flex-col items-center justify-center gap-1 px-6 py-5 text-center">
            {item.title && <p className="site-heading text-xl">{item.title}</p>}
            <p className="text-sm text-white/60">
              {item.label}
              {item.link_label && isFilled.link(item.link) && (
                <SiteLink field={item.link} className="ml-3 font-semibold text-white underline-offset-4 hover:underline">
                  {item.link_label}
                </SiteLink>
              )}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SiteGallery;
