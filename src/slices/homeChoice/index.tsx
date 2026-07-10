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

const HEADER_OFFSET = "calc(3.5rem + 2.25rem + 0.5rem)";

function ChoiceLink({
  link,
  urlLang,
  label,
  className,
}: {
  link: ChoiceItem["choice_link"];
  urlLang: UrlLocale;
  label: string;
  className: string;
}) {
  const href = prismicLinkHref(link, "#", urlLang);
  if (href === "#") return null;
  return <Link href={href} className={className} aria-label={label} />;
}

type ChoiceItem = {
  choice_label?: string;
  choice_title?: string;
  choice_subtitle?: string;
  choice_image?: any;
  choice_link?: any;
};

const panelBase =
  "group relative h-full overflow-hidden transition-[width,left] duration-700 ease-[cubic-bezier(.22,1,.36,1)]";

const HomeChoice: FC<SliceComponentProps<any>> = ({ slice, context }) => {
  const { urlLang } = getSliceLocale(context as Partial<SliceZoneContext> | undefined);
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);
  const choices = ((slice.items ?? []) as ChoiceItem[]).slice(0, 2);

  const left = choices[0];
  const right = choices[1];

  const leftWidth = hovered === "left" ? 58 : hovered === "right" ? 42 : 50;
  const bg = slice.primary?.background_color || "#0a0a0a";
  const panelHeight = `calc(100svh - ${HEADER_OFFSET})`;
  const dividerCut = 140;

  const mobileChoices = choices;

  if (choices.length < 2) {
    return null;
  }

  return (
    <section className="relative" style={{ backgroundColor: bg }}>
      <Container className="!max-w-none !px-0">
        <div
          className="relative overflow-hidden"
          style={{ height: panelHeight, minHeight: panelHeight }}
        >
          {/* Mobile: stacked split with diagonal seam */}
          <div className="relative h-full md:hidden">
            {mobileChoices.map((choice, idx) => {
              const isTop = idx === 0;
              return (
                <div
                  key={`mobile-${idx}`}
                  className={`absolute inset-x-0 block h-[56%] ${
                    isTop ? "top-0" : "bottom-0 h-[54%]"
                  }`}
                  style={{
                    clipPath: isTop
                      ? "polygon(0 0,100% 0,100% 86%,0 100%)"
                      : "polygon(0 14%,100% 0,100% 100%,0 100%)",
                  }}
                >
                  <ChoiceLink
                    link={choice.choice_link}
                    urlLang={urlLang}
                    label={choice.choice_title || choice.choice_label || "choice"}
                    className="absolute inset-0 block"
                  />
                  <div className="relative h-full w-full">
                    {choice.choice_image?.url ? (
                      <PrismicNextImage
                        field={choice.choice_image}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-x-6 bottom-8 text-white">
                      {choice.choice_label ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                          {choice.choice_label}
                        </p>
                      ) : null}
                      {choice.choice_title ? (
                        <h2 className="font-display text-5xl font-semibold leading-[0.95]">
                          {choice.choice_title}
                        </h2>
                      ) : null}
                      {choice.choice_subtitle ? (
                        <p className="mt-1 text-3xl font-light leading-none text-white/85">
                          {choice.choice_subtitle}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: two choices with animated expansion */}
          <div className="relative hidden h-full md:block">
            <div
              className={panelBase}
              style={{
                position: "absolute",
                insetBlock: 0,
                left: 0,
                width: `${leftWidth}%`,
                zIndex: 2,
                clipPath: `polygon(
                  0 0,
                  calc(100% - ${dividerCut}px) 0,
                  calc(100% - ${dividerCut - 34}px) 46%,
                  100% 100%,
                  0 100%
                )`,
              }}
              onMouseEnter={() => setHovered("left")}
              onMouseLeave={() => setHovered(null)}
            >
              <ChoiceLink
                link={left.choice_link}
                urlLang={urlLang}
                label={left.choice_title || left.choice_label || "left choice"}
                className="absolute inset-0 z-20 block"
              />
              <div className="relative h-full w-full">
                {left.choice_image?.url ? (
                  <PrismicNextImage
                    field={left.choice_image}
                    className="h-full w-full object-cover object-center"
                    alt=""
                  />
                ) : null}
                {/* Darker base for title contrast */}
                <div className="absolute inset-0 bg-black/55 transition-opacity duration-500 group-hover:bg-black/40" />
                {/* Left outer vignette to fuse into background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.24)_24%,rgba(0,0,0,0)_52%)]" />
                {/* Top vignette */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.44)_0%,rgba(0,0,0,0.12)_20%,rgba(0,0,0,0)_42%)]" />
                <div className="absolute left-[8%] top-1/2 -translate-y-1/2 text-white">
                  {left.choice_label ? (
                    <p className="mb-3 text-sm uppercase tracking-[0.22em] text-white/75">
                      {left.choice_label}
                    </p>
                  ) : null}
                  {left.choice_title ? (
                    <h2 className="font-display text-6xl font-semibold leading-[0.95] lg:text-7xl">
                      {left.choice_title}
                    </h2>
                  ) : null}
                  {left.choice_subtitle ? (
                    <p className="text-5xl font-light leading-none text-white/85 lg:text-6xl">
                      {left.choice_subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              className={panelBase}
              style={{
                position: "absolute",
                insetBlock: 0,
                left: `${leftWidth}%`,
                width: `${100 - leftWidth}%`,
                zIndex: 1,
              }}
              onMouseEnter={() => setHovered("right")}
              onMouseLeave={() => setHovered(null)}
            >
              <ChoiceLink
                link={right.choice_link}
                urlLang={urlLang}
                label={right.choice_title || right.choice_label || "right choice"}
                className="absolute inset-0 z-20 block"
              />
              <div className="relative h-full w-full">
                {right.choice_image?.url ? (
                  <PrismicNextImage
                    field={right.choice_image}
                    className="h-full w-full object-cover object-center"
                    alt=""
                  />
                ) : null}
                {/* Darker base for title contrast */}
                <div className="absolute inset-0 bg-black/55 transition-opacity duration-500 group-hover:bg-black/40" />
                {/* Right outer vignette to fuse into background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.24)_24%,rgba(0,0,0,0)_52%)]" />
                {/* Top vignette */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.44)_0%,rgba(0,0,0,0.12)_20%,rgba(0,0,0,0)_42%)]" />
                <div className="absolute left-[14%] top-1/2 -translate-y-1/2 text-white">
                  {right.choice_label ? (
                    <p className="mb-3 text-sm uppercase tracking-[0.22em] text-white/75">
                      {right.choice_label}
                    </p>
                  ) : null}
                  {right.choice_title ? (
                    <h2 className="font-display text-6xl font-semibold leading-[0.95] lg:text-7xl">
                      {right.choice_title}
                    </h2>
                  ) : null}
                  {right.choice_subtitle ? (
                    <p className="text-5xl font-light leading-none text-white/85 lg:text-6xl">
                      {right.choice_subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Kinked seam softener (matches split shape, avoids arrow look) */}
            <div
              className="pointer-events-none absolute inset-y-0 z-10 transition-[left] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{
                left: `${leftWidth}%`,
                width: "56px",
                transform: "translateX(-50%)",
                clipPath: "polygon(42% 0, 58% 0, 68% 46%, 58% 100%, 42% 100%, 32% 46%)",
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 100%)",
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HomeChoice;
