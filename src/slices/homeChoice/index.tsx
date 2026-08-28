"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState } from "react";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { prismicLinkHref } from "@/lib/prismic-link";
import { getSliceLocale, type SliceZoneContext } from "@/lib/slice-context";
import type { UrlLocale } from "@/i18n";
import clsx from "clsx";

const HEADER_OFFSET = "calc(3.5rem + 2.25rem + 0.5rem)";

// --- Seam geometry -----------------------------------------------------------
// Two full-stage image layers tile a single broken (chevron) line; only the
// clip-path seam moves, so the seam/line stays crisp. The images themselves
// translate + zoom WITH the seam (see imgTransform) so the content "slides out"
// on hover — matching the FN Herstal landing.
// The seam is a single broken diagonal (like FN): near-vertical at the top,
// then it bends once and angles out toward the bottom. The three X offsets are
// MONOTONIC (top ≤ kink ≤ bottom) so the line never reverses into an arrow/
// chevron point. Offsets are relative to the seam centre (s) — tweak to taste.
const KINK_Y = 48; // height of the bend (% of height)
const SEAM_TOP = -3; // x offset at the top edge (% of width)
const SEAM_KINK = -2; // x offset at the bend
const SEAM_BOTTOM = 6; // x offset at the bottom edge
const SEAM_DEFAULT = 50;
const SEAM_EXPANDED = 60; // hovered side grows to this width
const SLIDE = 4; // how far the images slide with the seam (% of width)
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DUR = 700;

const leftClip = (s: number) =>
  `polygon(0% 0%, ${s + SEAM_TOP}% 0%, ${s + SEAM_KINK}% ${KINK_Y}%, ${s + SEAM_BOTTOM}% 100%, 0% 100%)`;
const rightClip = (s: number) =>
  `polygon(${s + SEAM_TOP}% 0%, 100% 0%, 100% 100%, ${s + SEAM_BOTTOM}% 100%, ${s + SEAM_KINK}% ${KINK_Y}%)`;

// Images move in the direction the seam travels; the hovered side zooms more so
// it reads as coming forward. Scale always exceeds the slide so no edge shows.
function imgTransform(side: "left" | "right", hovered: "left" | "right" | null) {
  if (!hovered) return "scale(1.04)";
  const dir = hovered === "left" ? SLIDE : -SLIDE; // seam moves right on hover-left
  const zoom = side === hovered ? 1.12 : 1.1;
  return `scale(${zoom}) translateX(${dir}%)`;
}

type ChoiceItem = {
  choice_label?: string;
  choice_title?: string;
  choice_subtitle?: string;
  choice_image?: any;
  choice_link?: any;
};

function ChoiceContent({ item }: { item: ChoiceItem }) {
  return (
    <div className="flex flex-col items-center text-center text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]">
      {item.choice_label ? (
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/75 sm:text-sm">
          {item.choice_label}
        </p>
      ) : null}
      {item.choice_title ? (
        <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
          {item.choice_title}
        </h2>
      ) : null}
      {item.choice_subtitle ? (
        <p className="font-display text-3xl font-light uppercase leading-none tracking-wide text-white/90 sm:text-4xl lg:text-5xl">
          {item.choice_subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** Full-stage image that translates + zooms with the seam. */
function PanelImage({
  item,
  side,
  hovered,
}: {
  item: ChoiceItem;
  side: "left" | "right";
  hovered: "left" | "right" | null;
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          transform: imgTransform(side, hovered),
          transition: `transform ${DUR}ms ${EASE}`,
        }}
      >
        {item.choice_image?.url ? (
          <PrismicNextImage
            field={item.choice_image}
            className="h-full w-full object-cover object-center"
            alt=""
          />
        ) : (
          <div className="h-full w-full bg-neutral-900" />
        )}
      </div>
      {/* Light base darken for legibility (kept low so the seam stays crisp) */}
      <div className="absolute inset-0 bg-black/15" />
      {/* Subtle darken toward the seam (centre), where the labels sit — like FN */}
      <div
        className={clsx(
          "absolute inset-0",
          side === "left"
            ? "bg-[linear-gradient(to_right,rgba(0,0,0,0)_55%,rgba(0,0,0,0.35)_100%)]"
            : "bg-[linear-gradient(to_left,rgba(0,0,0,0)_55%,rgba(0,0,0,0.35)_100%)]",
        )}
      />
    </>
  );
}

const HomeChoice: FC<SliceComponentProps<any>> = ({ slice, context }) => {
  const { urlLang } = getSliceLocale(
    context as Partial<SliceZoneContext> | undefined,
  );
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);
  const choices = ((slice.items ?? []) as ChoiceItem[]).slice(0, 2);

  const left = choices[0];
  const right = choices[1];

  if (choices.length < 2) return null;

  const seam =
    hovered === "left"
      ? SEAM_EXPANDED
      : hovered === "right"
        ? 100 - SEAM_EXPANDED
        : SEAM_DEFAULT;

  const bg = slice.primary?.background_color || "#0a0a0a";
  const stageHeight = `calc(100svh - ${HEADER_OFFSET})`;
  const positionTransition = `left ${DUR}ms ${EASE}, width ${DUR}ms ${EASE}`;

  const href = (l: ChoiceItem["choice_link"], lang: UrlLocale) =>
    prismicLinkHref(l, "#", lang);

  return (
    <section className="relative" style={{ backgroundColor: bg }}>
      <Container className="!max-w-none !px-0">
        {/* ================= Desktop ================= */}
        <div
          className="relative hidden overflow-hidden md:block"
          style={{ height: stageHeight }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Right image layer (behind) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: rightClip(seam), transition: `clip-path ${DUR}ms ${EASE}` }}
          >
            <PanelImage item={right} side="right" hovered={hovered} />
          </div>

          {/* Left image layer (in front) — casts the thin seam line */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: leftClip(seam),
              transition: `clip-path ${DUR}ms ${EASE}`,
              filter:
                "drop-shadow(1.5px 0 0 rgba(255,255,255,0.45)) drop-shadow(-1px 0 0 rgba(0,0,0,0.35))",
            }}
          >
            <PanelImage item={left} side="left" hovered={hovered} />
          </div>

          {/* Labels — centred in each region, sliding with the seam */}
          <div
            className="pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 px-6"
            style={{ left: `${seam / 2}%`, transition: positionTransition }}
          >
            <ChoiceContent item={left} />
          </div>
          <div
            className="pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 px-6"
            style={{ left: `${(100 + seam) / 2}%`, transition: positionTransition }}
          >
            <ChoiceContent item={right} />
          </div>

          {/* Hover + click regions (follow the current seam width) */}
          <Link
            href={href(left.choice_link, urlLang)}
            aria-label={left.choice_title || left.choice_label || "left choice"}
            className="absolute inset-y-0 left-0 z-30 block"
            style={{ width: `${seam}%`, transition: positionTransition }}
            onMouseEnter={() => setHovered("left")}
            onFocus={() => setHovered("left")}
          />
          <Link
            href={href(right.choice_link, urlLang)}
            aria-label={right.choice_title || right.choice_label || "right choice"}
            className="absolute inset-y-0 right-0 z-30 block"
            style={{ width: `${100 - seam}%`, transition: positionTransition }}
            onMouseEnter={() => setHovered("right")}
            onFocus={() => setHovered("right")}
          />
        </div>

        {/* ================= Mobile (stacked, diagonal seam) ================= */}
        <div className="relative overflow-hidden md:hidden" style={{ height: stageHeight }}>
          {[left, right].map((choice, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={`m-${idx}`}
                className={clsx(
                  "absolute inset-x-0 h-[54%] overflow-hidden",
                  isTop ? "top-0" : "bottom-0",
                )}
                style={{
                  clipPath: isTop
                    ? "polygon(0 0, 100% 0, 100% 88%, 0 100%)"
                    : "polygon(0 12%, 100% 0, 100% 100%, 0 100%)",
                }}
              >
                <Link
                  href={href(choice.choice_link, urlLang)}
                  aria-label={choice.choice_title || choice.choice_label || "choice"}
                  className="absolute inset-0 z-20 block"
                />
                <PanelImage item={choice} side={isTop ? "left" : "right"} hovered={null} />
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
                  <ChoiceContent item={choice} />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default HomeChoice;
