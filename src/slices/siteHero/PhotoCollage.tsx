"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/Container";
import { MediaSlot } from "@/components/MediaSlot";
import { MuxVideoLayer, resolveMuxHlsUrl } from "@/lib/mux-video";
import { Eyebrow, SiteButton, SiteRichText } from "@/lib/site-ui";
import { LogoDock } from "./LogoDock";

/*
 * "Photo collage" hero: a moving wall of photos. The whole window is filled with columns of
 * photos that drift endlessly, up and down at different speeds, tilted a little in perspective.
 * The heading and buttons sit large in the middle, over a dark veil. It moves from the first
 * moment, without scrolling. Reduced motion: the same wall, standing still.
 *
 * A photo can carry a Mux video: on desktop (and without reduced motion) that tile plays a short
 * silent loop, the photo staying as poster. Phones and reduced motion only get the photo.
 */

/** Mux's still of a video (its playback ID from a stream URL or the bare ID), or null. */
function muxPoster(raw: string | null | undefined) {
  const id = resolveMuxHlsUrl(raw)?.match(/stream\.mux\.com\/([^/.?]+)/)?.[1];
  return id
    ? `https://image.mux.com/${id}/thumbnail.webp?width=800&fit_mode=smartcrop`
    : null;
}

/** Videos only where they help and don't cost too much: wide screens, motion allowed. */
const VIDEO_QUERY =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/** False on the server and the first render (same HTML everywhere), then follows the media query. */
function useWallVideos() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(VIDEO_QUERY);
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return on;
}

/**
 * A video tile: loads the stream the first time it comes near the window, then plays only while
 * it is on screen (the wall keeps every tile twice, and most of them are off screen at any time).
 */
function WallVideo({ src }: { src: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        const v = el.querySelector("video");
        if (!v) return;
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="absolute inset-0">
      {near && (
        <MuxVideoLayer src={src} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

const MAX = 12;
/** Seconds per loop, per column: neighbours move at different speeds and in opposite directions. */
const SPEED = [70, 55, 80, 60, 75];
/** Photo shapes along a column, so the wall has rhythm instead of a grid. */
const SHAPES = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[4/3]",
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[3/4]",
];

/** Each column starts at a different photo, so no row repeats across the wall. */
function column(photos: any[], c: number) {
  const start = (c * 3) % photos.length;
  const order = [...photos.slice(start), ...photos.slice(0, start)];
  // Long enough to cover the tilted, enlarged window several times over.
  const run = order.length < 6 ? [...order, ...order] : order;
  return run;
}

function Column({
  photos,
  c,
  videos,
}: {
  photos: any[];
  c: number;
  videos: boolean;
}) {
  const run = column(photos, c);
  const up = c % 2 === 0;
  return (
    <div
      className={
        c >= 3 ? "hidden lg:block" : c === 2 ? "hidden sm:block" : undefined
      }
    >
      <div
        // No gap: the space sits under each photo, so both copies are exactly the same height and the loop is seamless.
        // Reduced motion is handled in CSS (same HTML on server and client): the wall stands still.
        className="flex flex-col motion-reduce:[animation:none!important]"
        style={{
          animation: `${up ? "wall-up" : "wall-down"} ${SPEED[c % SPEED.length]}s linear infinite`,
        }}
      >
        {/* Twice the same run: when the first has scrolled out, the second is exactly in its place. */}
        {[0, 1].map((copy) =>
          run.map((item, i) => (
            <div
              key={`${copy}-${i}`}
              aria-hidden={copy === 1 || undefined}
              className="pb-3 sm:pb-4 lg:pb-5"
            >
              <div
                className={`relative w-full overflow-hidden rounded-xl lg:rounded-2xl ${SHAPES[(i + c) % SHAPES.length]}`}
              >
                {!isFilled.image(item.photo) && muxPoster(item.mux_video) ? (
                  // A video without a photo: Mux's own still of the video as poster (phones,
                  // reduced motion and while the stream loads).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={muxPoster(item.mux_video)!}
                    alt=""
                    loading={copy === 0 && i < 3 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <MediaSlot
                    field={item.photo}
                    brief={item.photo_brief || "Photo for the wall"}
                    aspect=""
                    rounded=""
                    className="absolute inset-0 h-full w-full"
                    fit="cover"
                    tone="dark"
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 36vw, 55vw"
                    priority={copy === 0 && i < 3}
                  />
                )}
                {videos && resolveMuxHlsUrl(item.mux_video) && (
                  <WallVideo src={resolveMuxHlsUrl(item.mux_video)!} />
                )}
              </div>
            </div>
          )),
        )}
      </div>
    </div>
  );
}

export function PhotoCollage({ p, items }: { p: any; items: any[] }) {
  const reduce = !!useReducedMotion();
  const section = useRef<HTMLElement>(null);
  // Over the pin: the big logo docks into the header (LogoDock), the copy comes in after it.
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  // Smoothed like the logo, so text and logo glide together instead of stepping with the wheel.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    mass: 0.7,
  });
  const copyOpacity = useTransform(smooth, [0.38, 0.8], [0, 1]);
  const copyY = useTransform(smooth, [0.38, 0.8], [36, 0]);
  const copyEvents = useTransform(copyOpacity, (o) =>
    o > 0.5 ? "auto" : "none",
  );
  const cueOpacity = useTransform(smooth, [0, 0.12], [1, 0]);
  const videos = useWallVideos();
  const photos = items
    .filter((it) => isFilled.image(it.photo) || it.photo_brief || it.mux_video)
    .slice(0, MAX);
  while (photos.length < 3) photos.push({ photo_brief: "" });

  return (
    <section
      ref={section}
      data-tone="inverse"
      // Pulled up under the header (the page sheet's pt-14 + pt-9), so the wall fills the rounded
      // sheet to the top and the navigation floats over the photos. Taller than the window: the
      // stage is pinned while the logo docks. Reduced motion: no pin, one window high.
      className="relative -mt-[5.75rem] h-[175svh] bg-neutral-950 text-ink motion-reduce:h-svh"
    >
      <div className="sticky top-0 isolate flex h-svh min-h-[680px] items-center overflow-hidden pt-24">
        {/* The wall: tilted and enlarged so its edges never show. */}
        <motion.div
          aria-hidden="true"
          // Dimmed as a whole, so the photos read as a backdrop and the text stays in front.
          className="absolute inset-0 -z-20 [filter:brightness(0.62)_saturate(0.9)] [perspective:1600px]"
          // Same starting point on server and client (no hydration mismatch); reduced motion: no transition.
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1.6, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <div className="absolute left-1/2 top-1/2 grid w-[150%] grid-cols-2 gap-3 [transform:translate(-50%,-50%)_rotateX(18deg)_rotateZ(-8deg)] sm:w-[130%] sm:grid-cols-3 sm:gap-4 lg:w-[118%] lg:grid-cols-5 lg:gap-5">
            {[0, 1, 2, 3, 4].map((c) => (
              <Column key={c} photos={photos} c={c} videos={videos} />
            ))}
          </div>
        </motion.div>

        {/* Veil: darkest behind the text, lighter towards the edges where the photos glow; dark at the
          top under the navigation and at the bottom into the next section. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_48%_42%_at_50%_56%,rgba(0,0,0,0.88),rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.25))]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-neutral-950/80 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-neutral-950 to-transparent"
        />

        <LogoDock section={section} />

        {/* Scroll hint on arrival, gone as soon as the logo starts to move. */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: cueOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center motion-reduce:hidden"
        >
          <span className="relative h-10 w-px overflow-hidden bg-white/20">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_1.8s_ease-in-out_infinite] bg-white" />
          </span>
        </motion.div>

        <Container className="w-full">
          <div className="mx-auto max-w-4xl text-center">
            {/* The eyebrow stays the whole time: above the big logo on arrival, above the heading after. */}
            {p.eyebrow && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <Eyebrow>{p.eyebrow}</Eyebrow>
              </motion.div>
            )}
            <motion.div
              className="motion-reduce:!transform-none motion-reduce:!opacity-100"
              style={{
                opacity: copyOpacity,
                y: copyY,
                pointerEvents: copyEvents,
              }}
            >
              {p.title && (
                <h1 className="site-heading mt-5 text-[2.75rem] leading-[1.02] text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.6)] [text-wrap:balance] sm:text-7xl lg:text-8xl">
                  {p.title}
                </h1>
              )}
              <SiteRichText
                field={p.intro}
                className="mx-auto mt-7 hidden max-w-2xl text-lg leading-relaxed text-white/85 [text-shadow:0_1px_20px_rgba(0,0,0,0.8)] sm:block sm:text-xl"
              />
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:mt-11">
                <SiteButton
                  field={p.primary_cta_link}
                  label={p.primary_cta_label}
                />
                <SiteButton
                  field={p.secondary_cta_link}
                  label={p.secondary_cta_label}
                  variant="secondary"
                />
              </div>
              {p.note && (
                <p className="mt-6 text-sm text-ink-muted">{p.note}</p>
              )}
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
