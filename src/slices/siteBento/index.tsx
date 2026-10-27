"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { Section, SectionHeader, SiteLink, toneFromSelect } from "@/lib/site-ui";

/*
 * Apple-style bento grid of key facts. Each card has a size, a style, an optional big number and a
 * small built-in visual (drawn in code, so no images are needed).
 */

const SIZE: Record<string, string> = {
  Small: "",
  Wide: "sm:col-span-2",
  Tall: "lg:row-span-2",
  Large: "sm:col-span-2 lg:row-span-2",
};

const STYLE: Record<string, { card: string; muted: string }> = {
  Light: { card: "bg-ink/[0.045] text-ink", muted: "text-ink-muted" },
  Dark: { card: "bg-neutral-950 text-white ring-1 ring-white/10", muted: "text-white/60" },
  Accent: { card: "bg-accent text-accent-contrast", muted: "opacity-80" },
};

/** 16 ports, lighting up one after the other. */
function Ports({ animate, large }: { animate: boolean; large: boolean }) {
  return (
    <div className={clsx("grid w-full", large ? "max-w-[15rem] grid-cols-4 gap-2.5" : "max-w-[16rem] grid-cols-8 gap-1.5")} aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <motion.span
          key={i}
          className={clsx("aspect-square bg-current", large ? "rounded-xl" : "rounded-[5px]")}
          initial={{ opacity: 0.25 }}
          animate={animate ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.85 }}
          transition={animate ? { duration: 2.4, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" } : undefined}
        />
      ))}
    </div>
  );
}

/** Note strengths: bars of different heights, softly moving. */
function Velocity({ animate }: { animate: boolean }) {
  const bars = [0.35, 0.8, 0.5, 1, 0.25, 0.65, 0.9, 0.4, 0.7, 0.3, 0.95, 0.55];
  return (
    <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="w-2 rounded-full bg-current"
          style={{ opacity: 0.35 + h * 0.65 }}
          initial={{ height: `${h * 100}%` }}
          animate={animate ? { height: [`${h * 100}%`, `${(1.15 - h) * 100}%`, `${h * 100}%`] } : undefined}
          transition={animate ? { duration: 3, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" } : undefined}
        />
      ))}
    </div>
  );
}

/** Three wind chests, each at its own pressure. */
function Wind() {
  const needles = [-50, 10, 55];
  return (
    <svg viewBox="0 0 180 56" className="h-14 w-auto" fill="none" stroke="currentColor" aria-hidden="true">
      {needles.map((deg, i) => (
        <g key={i} transform={`translate(${30 + i * 60} 48)`}>
          <path d="M -24 0 A 24 24 0 0 1 24 0" strokeWidth="4" strokeLinecap="round" opacity="0.25" />
          <line x1="0" y1="0" x2="0" y2="-20" strokeWidth="3" strokeLinecap="round" transform={`rotate(${deg})`} />
          <circle r="3.5" fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

/** A processor. */
function Chip() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <rect x="16" y="16" width="32" height="32" rx="5" />
      <rect x="25" y="25" width="14" height="14" rx="2" fill="currentColor" opacity="0.35" stroke="none" />
      {[22, 32, 42].map((v) => (
        <g key={v} strokeLinecap="round">
          <line x1={v} y1="6" x2={v} y2="16" />
          <line x1={v} y1="48" x2={v} y2="58" />
          <line x1="6" y1={v} x2="16" y2={v} />
          <line x1="48" y1={v} x2="58" y2={v} />
        </g>
      ))}
    </svg>
  );
}

/** One organ pipe with its own wind. */
function Pipe({ animate }: { animate: boolean }) {
  return (
    <svg viewBox="0 0 80 64" className="h-16 w-auto" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M14 4 h14 v40 l-7 14 l-7 -14 z" strokeLinejoin="round" />
      <line x1="14" y1="34" x2="28" y2="34" />
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${38 + i * 12} 22 q 6 10 0 20`}
          strokeLinecap="round"
          initial={{ opacity: 0.3 }}
          animate={animate ? { opacity: [0.15, 1, 0.15] } : { opacity: 0.7 }}
          transition={animate ? { duration: 1.8, repeat: Infinity, delay: i * 0.3 } : undefined}
        />
      ))}
    </svg>
  );
}

function Visual({ kind, animate, large }: { kind: string; animate: boolean; large: boolean }) {
  if (kind === "Ports") return <Ports animate={animate} large={large} />;
  if (kind === "Velocity") return <Velocity animate={animate} />;
  if (kind === "Wind") return <Wind />;
  if (kind === "Chip") return <Chip />;
  if (kind === "Pipe") return <Pipe animate={animate} />;
  return null;
}

const SiteBento: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const reduce = useReducedMotion();
  const cards: any[] = (slice.items || []).filter((i: any) => i?.title || i?.value);
  if (!cards.length) return null;
  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <FadeInStagger
        faster
        className={clsx(
          "grid grid-flow-dense auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4",
          hasHeader && "mt-12 lg:mt-16",
        )}
      >
        {cards.map((c, i) => {
          const s = STYLE[c.style] ?? STYLE.Light;
          const large = c.size === "Large";
          const visual = c.visual && c.visual !== "None";
          return (
            <FadeIn key={i} className={clsx("flex flex-col justify-between gap-8 rounded-3xl p-7 sm:p-8", s.card, SIZE[c.size] ?? "")}>
              {visual ? (
                <div className={clsx("flex", large ? "min-h-24 items-center lg:min-h-40" : "items-start")}>
                  <Visual kind={c.visual} animate={!reduce} large={large} />
                </div>
              ) : (
                <span />
              )}
              <div>
                {c.value && (
                  <p className={clsx("site-heading leading-none tabular-nums", large ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl")}>
                    {c.value}
                  </p>
                )}
                {c.value_label && <p className={clsx("mt-2 text-sm font-semibold", s.muted)}>{c.value_label}</p>}
                {c.title && <h3 className={clsx("font-semibold", large ? "text-2xl" : "text-xl", c.value && "mt-5")}>{c.title}</h3>}
                {c.body && <p className={clsx("mt-2 leading-relaxed", s.muted, large && "max-w-md text-lg")}>{c.body}</p>}
                {c.link_label && isFilled.link(c.link) && (
                  <SiteLink field={c.link} className="mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline">
                    {c.link_label} <span aria-hidden="true">›</span>
                  </SiteLink>
                )}
              </div>
            </FadeIn>
          );
        })}
      </FadeInStagger>
    </Section>
  );
};

export default SiteBento;
