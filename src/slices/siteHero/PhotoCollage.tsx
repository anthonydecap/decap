"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import clsx from "clsx";
import { isFilled } from "@prismicio/client";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Container } from "@/components/Container";
import { MediaSlot } from "@/components/MediaSlot";
import { Eyebrow, SiteButton, SiteRichText } from "@/lib/site-ui";

/*
 * "Photo collage" hero: the copy, then 3 to 7 photos in one mosaic that is seen all at once
 * (no slideshow). The first photo is the biggest. The photos come in together with a short
 * stagger, and drift at slightly different speeds while the visitor scrolls away.
 * Reduced motion: the same mosaic, still.
 */

const MAX = 7;

/** Desktop mosaics on a 12-column grid, one per number of photos. Letters = photo order. */
const AREAS: Record<number, string[]> = {
  3: ["a a a a a a a b b b b b", "a a a a a a a c c c c c"],
  4: ["a a a a a a b b b c c c", "a a a a a a d d d d d d"],
  5: ["a a a a a b b b b c c c", "a a a a a d d d d c c c", "a a a a a e e e e e e e"],
  6: ["a a a a a b b b b c c c", "a a a a a d d d d c c c", "e e e e e e f f f f f f"],
  7: ["a a a a a b b b b c c c", "a a a a a d d d d c c c", "e e e f f f f f f g g g"],
};
const LETTERS = "abcdefg";

/** How far each photo drifts (px) once the mosaic scrolls up: neighbours move differently, so the mosaic feels deep. At rest (page top) everything lines up. */
const DRIFT = [-40, 30, -70, 50, -20, 60, -50];

/** Desktop: the heading on the left, intro and buttons on the right, so the mosaic fits on the first screen. */
function Copy({ p }: { p: any }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
      <div className="lg:col-span-7">
        {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
        {p.title && (
          <h1 className={clsx("site-heading text-[2.5rem] leading-[1.03] text-ink sm:text-6xl xl:text-7xl", p.eyebrow && "mt-5")}>
            {p.title}
          </h1>
        )}
      </div>
      <div className="lg:col-span-5">
        <SiteRichText field={p.intro} className="hidden text-lg leading-relaxed text-ink-muted sm:block lg:text-base xl:text-lg" />
        <div className="flex flex-wrap items-center gap-4 sm:mt-8">
          <SiteButton field={p.primary_cta_link} label={p.primary_cta_label} />
          <SiteButton field={p.secondary_cta_link} label={p.secondary_cta_label} variant="secondary" />
        </div>
        {p.note && <p className="mt-6 text-sm text-ink-muted">{p.note}</p>}
      </div>
    </div>
  );
}

function Photo({
  item,
  index,
  area,
  progress,
  reduce,
}: {
  item: any;
  index: number;
  area: string;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const y = useTransform(progress, [0, 1], [0, reduce ? 0 : DRIFT[index % DRIFT.length]]);
  return (
    <motion.div
      style={{ "--area": area, y } as any}
      // Mobile: the first photo spans both columns, the rest sit two by two.
      className={clsx("relative min-h-0 lg:[grid-area:var(--area)]", index === 0 ? "col-span-2 aspect-[4/3] lg:aspect-auto" : "aspect-square lg:aspect-auto")}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: reduce ? 0 : 0.15 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group h-full w-full overflow-hidden rounded-2xl lg:rounded-3xl">
        <MediaSlot
          field={item.photo}
          brief={item.photo_brief || `Collage photo ${index + 1}`}
          aspect=""
          rounded=""
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          fit="cover"
          sizes={index === 0 ? "(min-width: 1024px) 42vw, 100vw" : "(min-width: 1024px) 34vw, 50vw"}
          priority={index < 3}
        />
      </div>
    </motion.div>
  );
}

export function PhotoCollage({ p, items }: { p: any; items: any[] }) {
  const reduce = !!useReducedMotion();
  const mosaic = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mosaic, offset: ["start start", "end start"] });

  // Filled photos first; empty slots with a brief still show as placeholders (the shot list).
  const photos = items.filter((it) => isFilled.image(it.photo) || it.photo_brief).slice(0, MAX);
  const n = Math.max(3, photos.length);
  const areas = AREAS[Math.min(n, MAX)];
  while (photos.length < 3) photos.push({ photo_brief: "" });

  return (
    <section className="overflow-hidden bg-page pt-12 pb-16 text-ink sm:pt-16 sm:pb-24 lg:pb-32">
      <Container>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Copy p={p} />
        </motion.div>

        <div
          ref={mosaic}
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-12 lg:grid-cols-12 lg:gap-4 lg:[grid-template-areas:var(--collage-areas)] lg:[grid-template-rows:var(--collage-rows)]"
          style={
            {
              "--collage-areas": areas.map((r) => `"${r}"`).join(" "),
              // Sized to the window, so the whole mosaic shows on the first screen of a laptop.
              "--collage-rows": `repeat(${areas.length}, clamp(8.5rem, calc((100svh - 26rem) / ${areas.length}), 17rem))`,
            } as React.CSSProperties
          }
        >
          {photos.map((item, i) => (
            <Photo key={i} item={item} index={i} area={LETTERS[i]} progress={scrollYProgress} reduce={reduce} />
          ))}
        </div>
      </Container>
    </section>
  );
}
