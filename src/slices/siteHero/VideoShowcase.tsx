"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { MediaSlot } from "@/components/MediaSlot";
import { MuxVideoLayer } from "@/lib/mux-video";
import { Eyebrow, SiteButton, SiteRichText } from "@/lib/site-ui";
import { useUiCopy } from "@/lib/ui-copy";

/*
 * "Video showcase" hero: a big headline with the film peeking up from below in a rounded frame.
 * While the visitor scrolls, the section pins and the frame opens up to the full screen; the
 * headline lifts away and the intro and buttons appear over the film. Reduced motion: a static
 * headline above a framed image.
 */

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

export function VideoShowcase({ p, video, brief }: { p: any; video: string | null; brief: string }) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setNarrow(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  // The frame: starts inset under the headline, opens to the full screen.
  const open = useTransform(scrollYProgress, [0, 0.55], [0, 1], { clamp: true });
  const top = useTransform(open, (k) => (narrow ? 50 : 46) * (1 - k));
  const side = useTransform(open, (k) => (narrow ? 5 : 18) * (1 - k));
  const bottom = useTransform(open, (k) => 5 * (1 - k));
  const radius = useTransform(open, (k) => 28 * (1 - k));
  const clip = useMotionTemplate`inset(${top}% ${side}% ${bottom}% round ${radius}px)`;
  const filmScale = useTransform(open, [0, 1], [1.12, 1]);

  // The headline lifts away; the intro, buttons and darkening come in once the film is open.
  const headY = useTransform(scrollYProgress, [0, 0.25], ["0%", "-25%"]);
  const headOpacity = useTransform(scrollYProgress, [0.02, 0.2], [1, 0]);
  const shade = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const copyOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const copyY = useTransform(scrollYProgress, [0.55, 0.75], [32, 0]);
  const copyEvents = useTransform(copyOpacity, (o) => (o > 0.5 ? "auto" : "none"));

  const film = video ? (
    <MuxVideoLayer src={video} className="absolute inset-0 h-full w-full" />
  ) : (
    <MediaSlot field={p.image} brief={brief} aspect="" rounded="" className="absolute inset-0 h-full w-full" sizes="100vw" priority tone="dark" />
  );

  const buttons = (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <SiteButton field={p.primary_cta_link} label={p.primary_cta_label} />
      <SiteButton field={p.secondary_cta_link} label={p.secondary_cta_label} variant="secondary" />
    </div>
  );

  if (reduce) {
    return (
      <section className="bg-page pt-12 pb-16 text-ink sm:pt-16 sm:pb-24">
        <Container className="text-center">
          {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
          <h1 className="site-heading mx-auto mt-5 max-w-5xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{p.title}</h1>
          <SiteRichText field={p.intro} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl" />
          <div className="flex justify-center [&>div]:justify-center">{buttons}</div>
          <MediaSlot field={p.image} brief={brief} aspect="aspect-[16/9]" className="mt-14" sizes="(min-width: 1280px) 1216px, 100vw" priority />
        </Container>
      </section>
    );
  }

  return (
    <section ref={section} className="relative h-[260vh] bg-page text-ink">
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden">
        {/* The film, revealed through an opening frame. */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 bg-neutral-950">
          <motion.div style={{ scale: filmScale }} className="absolute inset-0">
            {film}
          </motion.div>
          <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        </motion.div>

        {/* Headline above the frame. */}
        <motion.div style={{ y: headY, opacity: headOpacity }} className="relative">
          <Container className={clsx("text-center", narrow ? "pt-10" : "pt-14 lg:pt-16")}>
            {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
            <h1 className="site-heading mx-auto mt-5 max-w-5xl text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              {p.title}
            </h1>
          </Container>
        </motion.div>

        {/* Intro and buttons over the open film. */}
        <motion.div data-tone="inverse" style={{ opacity: copyOpacity, y: copyY, pointerEvents: copyEvents }} className="absolute inset-x-0 bottom-0 pb-14 text-ink sm:pb-20">
          <Container>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <SiteRichText field={p.intro} className="text-lg leading-relaxed text-white/85 sm:text-xl" />
                {buttons}
                {p.note && <p className="mt-6 text-sm text-white/70">{p.note}</p>}
              </div>
              {video && <PauseButton scope={stage} />}
            </div>
          </Container>
        </motion.div>
      </div>
    </section>
  );
}
