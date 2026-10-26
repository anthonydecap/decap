"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/Container";
import { MediaSlot } from "@/components/MediaSlot";
import { MuxVideoLayer } from "@/lib/mux-video";
import { Eyebrow, SiteButton, SiteRichText } from "@/lib/site-ui";
import { useUiCopy } from "@/lib/ui-copy";

/*
 * "Video showcase" hero: the copy on the left, the film on the right in a curved cinema screen.
 * While the visitor scrolls, the section pins, the screen flattens and opens to the full window,
 * holds for a moment, then goes back into its screen and the copy returns. Reduced motion: the
 * same layout without the scroll animation.
 */

type Box = { x0: number; y0: number; x1: number; y1: number; W: number; H: number };

/** Screen shape: top and bottom edges bow inwards, like a wide cinema screen seen from the seats. */
function screenPath(x0: number, y0: number, x1: number, y1: number, sag: number, r: number) {
  const cx = (x0 + x1) / 2;
  const c = sag * 2; // a quadratic curve reaches half its control point's offset
  return `path("M ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Q ${cx} ${y0 + c} ${x1 - r} ${y0} Q ${x1} ${y0} ${x1} ${y0 + r} L ${x1} ${y1 - r} Q ${x1} ${y1} ${x1 - r} ${y1} Q ${cx} ${y1 - c} ${x0 + r} ${y1} Q ${x0} ${y1} ${x0} ${y1 - r} Z")`;
}

/**
 * Cinema glow: the film's own colours spill onto the page around the screen. A tiny canvas copies
 * the playing video (or the image) a few times a second; CSS blurs and enlarges it.
 */
function ScreenGlow({ scope, style }: { scope: React.RefObject<HTMLElement | null>; style?: any }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 120) return;
      last = t;
      const src = scope.current?.querySelector<HTMLVideoElement | HTMLImageElement>("video, img");
      if (!src || (src instanceof HTMLVideoElement ? src.readyState < 2 : !src.complete)) return;
      try {
        ctx.drawImage(src, 0, 0, 32, 18);
      } catch {
        /* source not ready */
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scope]);
  return (
    <motion.canvas
      ref={canvas}
      width={32}
      height={18}
      aria-hidden="true"
      style={style}
      className="pointer-events-none absolute -inset-x-[8%] -inset-y-[8%] h-[116%] w-[116%] blur-[56px] brightness-125 saturate-[1.8]"
    />
  );
}

/** Pause / play for the film (autoplaying video needs a way to stop it). */
function PauseButton({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const t = useUiCopy();
  const [paused, setPaused] = useState(false);
  const toggle = () => {
    const v = scope.current?.querySelector("video");
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    setPaused(!v.paused);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={paused ? t.filmPlay : t.filmPause}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        {paused ? <path d="M8 5.5v13l11-6.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
      </svg>
    </button>
  );
}

function Copy({ p }: { p: any }) {
  return (
    <>
      {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
      <h1 className="site-heading mt-5 text-[2.5rem] leading-[1.03] text-ink sm:text-6xl lg:text-[4.25rem] xl:text-7xl">{p.title}</h1>
      <SiteRichText field={p.intro} className="mt-6 hidden text-lg leading-relaxed text-ink-muted sm:block sm:text-xl" />
      <div className="mt-8 flex flex-wrap items-center gap-4 lg:mt-10">
        <SiteButton field={p.primary_cta_link} label={p.primary_cta_label} />
        <SiteButton field={p.secondary_cta_link} label={p.secondary_cta_label} variant="secondary" />
      </div>
      {p.note && <p className="mt-6 text-sm text-ink-muted">{p.note}</p>}
    </>
  );
}

export function VideoShowcase({ p, video, brief }: { p: any; video: string | null; brief: string }) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  // Where the screen rests: an empty box in the layout, measured relative to the pinned stage.
  useLayoutEffect(() => {
    if (reduce) return;
    const measure = () => {
      const s = stage.current?.getBoundingClientRect();
      const b = slot.current?.getBoundingClientRect();
      if (!s || !b) return;
      setBox({ x0: b.left - s.left, y0: b.top - s.top, x1: b.right - s.left, y1: b.bottom - s.top, W: s.width, H: s.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    if (slot.current) ro.observe(slot.current);
    return () => ro.disconnect();
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  // 0 = in the cinema screen, 1 = the full window: out, hold, and back in.
  const open = useTransform(scrollYProgress, [0.06, 0.36, 0.6, 0.9], [0, 1, 1, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0.06, 0.2, 0.76, 0.9], [1, 0, 0, 1]);
  const copyX = useTransform(scrollYProgress, [0.06, 0.24, 0.72, 0.9], [0, -40, -40, 0]);
  const copyEvents = useTransform(copyOpacity, (o) => (o > 0.5 ? "auto" : "none"));
  const pauseOpacity = useTransform(open, [0.8, 1], [0, 1]);
  const pauseEvents = useTransform(pauseOpacity, (o) => (o > 0.5 ? "auto" : "none"));
  const glowOpacity = useTransform(open, [0, 0.4], [0.65, 0]);

  const clip = useTransform(open, (k) => {
    if (!box) return "none";
    const lerp = (a: number, b: number) => a + (b - a) * k;
    const sag = (1 - k) * (box.y1 - box.y0) * 0.022; // a gentle bow: reads as a cinema screen, not a wave
    return screenPath(lerp(box.x0, 0), lerp(box.y0, 0), lerp(box.x1, box.W), lerp(box.y1, box.H), sag, 0); // square corners, like a real screen
  });
  // In the screen the film is scaled down to cover it, so the whole shot shows; it grows with it.
  const filmScale = useTransform(open, (k) => {
    if (!box) return 1;
    const s0 = Math.max((box.x1 - box.x0) / box.W, (box.y1 - box.y0) / box.H) * 1.04;
    return s0 + (1 - s0) * k;
  });
  const filmX = useTransform(open, (k) => (box ? ((box.x0 + box.x1) / 2 - box.W / 2) * (1 - k) : 0));
  const filmY = useTransform(open, (k) => (box ? ((box.y0 + box.y1) / 2 - box.H / 2) * (1 - k) : 0));

  const film = video ? (
    <MuxVideoLayer src={video} className="absolute inset-0 h-full w-full" />
  ) : (
    <MediaSlot field={p.image} brief={brief} aspect="" rounded="" className="absolute inset-0 h-full w-full" sizes="100vw" priority tone="dark" />
  );

  if (reduce) {
    return (
      <section className="bg-page pt-12 pb-16 text-ink sm:pt-16 sm:pb-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Copy p={p} />
            </div>
            <MediaSlot field={p.image} brief={brief} aspect="aspect-[16/11]" priority />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section ref={section} className="relative h-[320vh] bg-page text-ink">
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden">
        {/* Copy and the screen's resting place, centred a little high so the screen is fully
            visible under the header before the section pins. */}
        <div className="absolute inset-x-0 top-0 flex h-full items-start pt-8 lg:h-[84%] lg:items-center lg:pt-0">
          <Container className="w-full">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div style={{ opacity: copyOpacity, x: copyX, pointerEvents: copyEvents }} className="relative z-10">
                <Copy p={p} />
              </motion.div>
              <div className="relative">
                <ScreenGlow scope={filmRef} style={{ opacity: glowOpacity }} />
                <div ref={slot} className="aspect-[16/11] w-full" />
              </div>
            </div>
          </Container>
        </div>

        {/* The film, seen through the cinema screen that opens to the full window. */}
        <motion.div style={{ clipPath: clip, visibility: box ? "visible" : "hidden" }} className="pointer-events-none absolute inset-0">
          <motion.div ref={filmRef} style={{ scale: filmScale, x: filmX, y: filmY }} className="absolute inset-0 bg-neutral-950">
            {film}
          </motion.div>
        </motion.div>

        {video && (
          <motion.div style={{ opacity: pauseOpacity, pointerEvents: pauseEvents }} className="absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
            <Container>
              <div className="flex justify-end">
                <PauseButton scope={stage} />
              </div>
            </Container>
          </motion.div>
        )}
      </div>
    </section>
  );
}
