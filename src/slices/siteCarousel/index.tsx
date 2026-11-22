"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { type SliceComponentProps } from "@prismicio/react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { MediaPlaceholder } from "@/components/MediaSlot";
import { Eyebrow, SiteLink, SiteRichText, toneFromSelect } from "@/lib/site-ui";

/*
 * "Where they play": a list of places next to one big photo, in the same text-left / image-right
 * build as the text-and-media sections around it.
 *
 * Desktop: the split is pinned while you scroll through the places. The active place lights up
 * with its line and a thin progress bar; the photo on the right changes with it in a soft
 * crossfade. Clicking a place scrolls to it. Phones and reduced motion: no pin, the places one
 * under the other, each with its photo. A place with a link opens it (desktop: its photo,
 * phones: the whole card).
 */

const POSITION: Record<string, string> = {
  Center: "object-center",
  Top: "object-top",
  Bottom: "object-bottom",
  Left: "object-left",
  Right: "object-right",
};

/** Scroll per place while pinned, in svh. */
const PER_PLACE = 55;

function Photo({ item, sizes }: { item: any; sizes: string }) {
  return isFilled.image(item.image) ? (
    <PrismicNextImage
      field={item.image}
      fill
      sizes={sizes}
      className={clsx(
        "object-cover",
        POSITION[item.image_position] ?? "object-center",
      )}
      fallbackAlt=""
    />
  ) : (
    <MediaPlaceholder
      tone="dark"
      brief={item.image_brief || item.title || item.eyebrow || "Photo"}
    />
  );
}

function Header({ p }: { p: any }) {
  return (
    <>
      {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
      {p.title && (
        <h2
          className={clsx(
            "site-heading text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl",
            p.eyebrow && "mt-4",
          )}
        >
          {p.title}
        </h2>
      )}
      <SiteRichText
        field={p.intro}
        className="mt-6 text-lg leading-relaxed text-ink-muted"
      />
    </>
  );
}

/** One place in the pinned list: its label always, its line and progress bar only while active. */
function Place({
  item,
  active,
  bar,
  onSelect,
}: {
  item: any;
  active: boolean;
  bar: MotionValue<number>;
  onSelect: () => void;
}) {
  return (
    <li className="border-t border-line">
      <button
        type="button"
        onClick={onSelect}
        aria-current={active || undefined}
        className={clsx(
          "w-full py-5 text-left transition-colors duration-300",
          active ? "text-ink" : "text-ink-muted hover:text-ink",
        )}
      >
        <span className="text-lg font-semibold">
          {item.eyebrow || item.title}
        </span>
        {/* The line opens smoothly under the active place. */}
        <span
          className={clsx(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
            active
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <span className="overflow-hidden">
            {item.eyebrow && item.title && (
              <span className="block pt-2 text-lg leading-relaxed text-ink-muted">
                {item.title}
              </span>
            )}
          </span>
        </span>
      </button>
      {/* How far the scroll is through this place. */}
      <span className="relative block h-px">
        {active && (
          <motion.span
            style={{ scaleX: bar }}
            className="absolute inset-0 origin-left bg-ink"
          />
        )}
      </span>
    </li>
  );
}

const SiteCarousel: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const items: any[] = (slice.items || []).filter(
    (i: any) => i?.title || i?.eyebrow || isFilled.image(i?.image),
  );
  const n = Math.max(1, items.length);
  const pin = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: pin,
    offset: ["start start", "end end"],
  });
  const indexAt = (v: number) => Math.min(n - 1, Math.floor(v * n));
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(indexAt(v)));
  // Progress within the active place, for its bar.
  const bar = useTransform(scrollYProgress, (v) =>
    Math.min(1, v * n - indexAt(v)),
  );

  /** Scroll so that place i becomes the active one. */
  const select = (i: number) => {
    const el = pin.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + range * ((i + 0.05) / n),
      behavior: "smooth",
    });
  };

  if (!items.length) return null;
  const tone = toneFromSelect(p.tone);

  return (
    <section
      data-tone={tone === "page" ? undefined : tone}
      className="bg-page text-ink"
    >
      {/* Desktop with motion: the pinned split. */}
      <div
        ref={pin}
        className="relative hidden lg:block motion-reduce:lg:hidden"
        style={{ height: `calc(100svh + ${(n - 1) * PER_PLACE}svh)` }}
      >
        <div className="sticky top-0 flex h-svh items-center">
          <Container className="w-full">
            <div className="grid items-center gap-20 lg:grid-cols-2">
              <div>
                <Header p={p} />
                <ul className="mt-10">
                  {items.map((item, i) => (
                    <Place
                      key={i}
                      item={item}
                      active={i === active}
                      bar={bar}
                      onSelect={() => select(i)}
                    />
                  ))}
                </ul>
              </div>
              {/* All photos stacked; the active one fades in over the others. */}
              <div className="group relative mx-auto aspect-[4/5] max-h-[78svh] w-full overflow-hidden rounded-2xl bg-surface lg:rounded-3xl">
                {items.map((item, i) => (
                  <div
                    key={i}
                    aria-hidden={i !== active}
                    className={clsx(
                      "absolute inset-0 transition-[opacity,transform] duration-700 ease-out",
                      i === active
                        ? "scale-100 opacity-100 group-hover:scale-[1.03]"
                        : "pointer-events-none scale-[1.04] opacity-0",
                    )}
                  >
                    <Photo
                      item={item}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                    {/* The active photo opens the place's page (as the tiles: hover zoom, hand cursor). */}
                    {isFilled.link(item.link) && (
                      <SiteLink
                        field={item.link}
                        tabIndex={i === active ? undefined : -1}
                        aria-label={item.eyebrow || item.title}
                        className={clsx(
                          "absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white",
                          i !== active && "pointer-events-none",
                        )}
                      >
                        <span className="sr-only">
                          {item.eyebrow || item.title}
                        </span>
                      </SiteLink>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Phones, tablets and reduced motion: the places one under the other. */}
      <Container className="py-16 sm:py-24 lg:hidden lg:py-32 motion-reduce:lg:block">
        <div className="max-w-3xl">
          <Header p={p} />
        </div>
        <ul className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {items.map((item, i) => {
            const body = (
              <>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                  <Photo item={item} sizes="(min-width: 640px) 50vw, 100vw" />
                </div>
                {item.eyebrow && (
                  <p className="mt-5 text-lg font-semibold text-ink">
                    {item.eyebrow}
                  </p>
                )}
                {item.title && (
                  <p className="mt-1 text-lg leading-relaxed text-ink-muted">
                    {item.title}
                  </p>
                )}
              </>
            );
            return (
              <li key={i}>
                {isFilled.link(item.link) ? (
                  <SiteLink
                    field={item.link}
                    className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {body}
                  </SiteLink>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
};

export default SiteCarousel;
