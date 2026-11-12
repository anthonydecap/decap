"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFilled } from "@prismicio/client";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/Container";
import { MediaSlot } from "@/components/MediaSlot";
import { Eyebrow, SiteButton, SiteRichText } from "@/lib/site-ui";

/*
 * "Photo collage" hero: a moving wall of photos. The whole window is filled with columns of
 * photos that drift endlessly, up and down at different speeds, tilted a little in perspective.
 * The heading and buttons sit large in the middle, over a dark veil. It moves from the first
 * moment, without scrolling. Reduced motion: the same wall, standing still.
 */

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

function Column({ photos, c }: { photos: any[]; c: number }) {
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
  const photos = items
    .filter((it) => isFilled.image(it.photo) || it.photo_brief)
    .slice(0, MAX);
  while (photos.length < 3) photos.push({ photo_brief: "" });

  return (
    <section
      data-tone="inverse"
      className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-neutral-950 text-ink h-svh"
    >
      {/* The wall: tilted and enlarged so its edges never show. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-20 [perspective:1600px]"
        // Same starting point on server and client (no hydration mismatch); reduced motion: no transition.
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduce ? { duration: 0 } : { duration: 1.6, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div className="absolute left-1/2 top-1/2 grid w-[150%] grid-cols-2 gap-3 [transform:translate(-50%,-50%)_rotateX(18deg)_rotateZ(-8deg)] sm:w-[130%] sm:grid-cols-3 sm:gap-4 lg:w-[118%] lg:grid-cols-5 lg:gap-5">
          {[0, 1, 2, 3, 4].map((c) => (
            <Column key={c} photos={photos} c={c} />
          ))}
        </div>
      </motion.div>

      {/* Veil: dark in the middle where the text is, and at the edges; the photos glow in between. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_50%_at_50%_52%,rgba(0,0,0,0.86),rgba(0,0,0,0.5)_70%,rgba(0,0,0,0.72))]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-neutral-950 to-transparent"
      />

      <Container className="w-full">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
          {p.title && (
            <h1 className="site-heading mt-5 text-[2.75rem] leading-[1.02] text-ink [text-wrap:balance] sm:text-7xl lg:text-8xl">
              {p.title}
            </h1>
          )}
          <SiteRichText
            field={p.intro}
            className="mx-auto mt-7 hidden max-w-2xl text-lg leading-relaxed text-ink-muted sm:block sm:text-xl"
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
          {p.note && <p className="mt-6 text-sm text-ink-muted">{p.note}</p>}
        </motion.div>
      </Container>
    </section>
  );
}
