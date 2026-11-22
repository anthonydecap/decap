"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useRef } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { type SliceComponentProps } from "@prismicio/react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { MediaPlaceholder } from "@/components/MediaSlot";
import { SectionHeader, SiteLink, toneFromSelect } from "@/lib/site-ui";

/*
 * Photo cards that stack while you scroll ("Where they play"). Each card is as wide as the home
 * page tiles and nearly a window tall, the photo full-bleed with the label and a big line over
 * it. Each card sticks near the top; the next one slides over it, and the cards underneath
 * shrink a little and darken, like leafing through a pile of photos. The photo in a card eases
 * from a slight zoom to rest as it comes in. A card with a link is clickable as a whole (as the
 * tiles). Reduced motion: the same stack, no scaling, dimming or zoom.
 */

const POSITION: Record<string, string> = {
  Center: "object-center",
  Top: "object-top",
  Bottom: "object-bottom",
  Left: "object-left",
  Right: "object-right",
};

/** How far each card sits below the one before it once stacked, so the pile's edges show. */
const STEP = 22;

function Card({
  item,
  i,
  n,
  progress,
}: {
  item: any;
  i: number;
  n: number;
  progress: MotionValue<number>;
}) {
  // The stack scrolls n-1 windows: card i is in place at progress i/(n-1), sliding in over the
  // window before that. Its photo eases from a slight zoom to rest as it slides in.
  const m = Math.max(1, n - 1);
  const photoScale = useTransform(
    progress,
    [Math.max(0, (i - 1) / m), i / m],
    [i === 0 ? 1 : 1.18, 1],
  );
  // Once later cards slide over it: shrink towards the back of the pile and darken.
  const covered = [Math.min(i / m, 0.999), 1];
  const scale = useTransform(progress, covered, [1, 1 - (n - 1 - i) * 0.045]);
  const dim = useTransform(progress, covered, [0, i === n - 1 ? 0 : 0.55]);

  const linked = isFilled.link(item.link);
  const card = (
    <>
      {isFilled.image(item.image) ? (
        <motion.div
          style={{ scale: photoScale }}
          className="absolute inset-0 motion-reduce:!transform-none"
        >
          <PrismicNextImage
            field={item.image}
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            className={clsx(
              "object-cover",
              POSITION[item.image_position] ?? "object-center",
            )}
            fallbackAlt=""
          />
        </motion.div>
      ) : (
        <MediaPlaceholder
          tone="dark"
          brief={item.image_brief || item.title || item.eyebrow || "Photo"}
        />
      )}
      {/* Legibility: dark at the bottom where the text sits, a touch at the top for the counter. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />
      <div className="absolute inset-x-0 top-0 flex justify-between p-6 text-sm font-semibold tracking-[0.2em] text-white/80 sm:p-10">
        <span>{String(i + 1).padStart(2, "0")}</span>
        <span className="text-white/45">{String(n).padStart(2, "0")}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-left sm:p-10 lg:p-14">
        {item.eyebrow && (
          <p className="text-base font-semibold text-white/85 sm:text-lg">
            {item.eyebrow}
          </p>
        )}
        {item.title && (
          <p className="site-heading mt-2 max-w-4xl text-4xl leading-[1.05] text-white [text-wrap:balance] sm:text-6xl lg:text-7xl">
            {item.title}
          </p>
        )}
      </div>
      {/* Darkens as the next cards cover it. */}
      <motion.div
        style={{ opacity: dim }}
        className="pointer-events-none absolute inset-0 bg-black motion-reduce:hidden"
      />
    </>
  );

  const shell =
    "group relative block h-full w-full overflow-hidden rounded-3xl bg-neutral-900 text-white";
  return (
    // Each card is one window of scroll and sticks inside the stack, a little lower than the one
    // before it, so the next card slides over it and the pile's edges show.
    <div
      className="sticky top-0 flex h-svh items-start"
      style={{ paddingTop: `calc(6svh + ${i * STEP}px)` }}
    >
      <div className="h-[78svh] w-full sm:h-[84svh]">
        <motion.div
          style={{ scale }}
          className="h-full w-full origin-top motion-reduce:!transform-none"
        >
          {linked ? (
            <SiteLink
              field={item.link}
              className={clsx(
                shell,
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
              )}
            >
              {card}
            </SiteLink>
          ) : (
            <div className={shell}>{card}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const SiteCarousel: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const items: any[] = (slice.items || []).filter(
    (i: any) => i?.title || i?.eyebrow || isFilled.image(i?.image),
  );
  const stack = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stack,
    offset: ["start start", "end end"],
  });

  if (!items.length) return null;
  const tone = toneFromSelect(p.tone);

  return (
    <section
      data-tone={tone === "page" ? undefined : tone}
      className="bg-page pt-16 text-ink sm:pt-24 lg:pt-28"
    >
      <Container>
        <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        <div ref={stack} className="relative mt-10 lg:mt-14">
          {items.map((item, i) => (
            <Card
              key={i}
              item={item}
              i={i}
              n={items.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default SiteCarousel;
