/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismicNextLink } from "@prismicio/next";
import { isFilled } from "@prismicio/client";
import type { JSXMapSerializer } from "@prismicio/react";
import clsx from "clsx";

/**
 * Shared building blocks for the home slices (homeHero, homePortfolio, homeFeature,
 * homeShowcase). One design system, two themes (DESIGN.md): every slice reads
 * `background_color` and derives light/dark from its luminance. No rainbow gradient: these
 * are general brand slices, not Smart Valve.
 */

export const HOME_SECTION_PY = "py-16 sm:py-24 lg:py-32";

export function isDarkColor(hex: string | null | undefined): boolean {
  const h = (hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) return true; // home canvas is dark by default
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}

export type HomeTheme = ReturnType<typeof homeTheme>;

/** Palette columns from DESIGN.md §2, picked by theme. */
export function homeTheme(background: string | null | undefined, fallback = "#0a0a0a") {
  const bg = background || fallback;
  const dark = isDarkColor(bg);
  return {
    bg,
    dark,
    heading: dark ? "text-white" : "text-neutral-950",
    accent: dark ? "text-neutral-500" : "text-neutral-400",
    body: dark ? "text-neutral-300" : "text-neutral-600",
    muted: dark ? "text-neutral-400" : "text-neutral-500",
    card: dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200 shadow-sm",
    cardHover: dark ? "hover:border-neutral-700" : "hover:border-neutral-300 hover:shadow-md",
    rule: dark ? "border-neutral-800" : "border-neutral-200",
    surface: dark ? "bg-neutral-900" : "bg-neutral-100",
  };
}

/** Line drawings are dark strokes on a transparent background: invert them on dark. */
export function illustrationClass(theme: HomeTheme, style: string | null | undefined) {
  if (style === "Photo") return "rounded-2xl lg:rounded-3xl";
  return theme.dark ? "invert opacity-90" : "";
}

export function homeRichText(theme: HomeTheme): JSXMapSerializer {
  return {
    paragraph: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    hyperlink: ({ node, children }) => (
      <PrismicNextLink field={node.data} className={clsx("underline underline-offset-4", theme.dark ? "decoration-neutral-600 hover:decoration-white" : "decoration-neutral-300 hover:decoration-neutral-950")}>
        {children}
      </PrismicNextLink>
    ),
    strong: ({ children }) => <strong className={clsx("font-semibold", theme.heading)}>{children}</strong>,
    label: ({ node, children }) =>
      node.data.label === "codespan" ? (
        <code className={clsx("rounded px-1 py-0.5 font-mono text-sm", theme.dark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-100 text-neutral-700")}>{children}</code>
      ) : null,
  };
}

/** Headline with an optional second line in the muted tone ("Heritage of / Innovation"). */
export function TwoToneHeading({
  title,
  accent,
  theme,
  as: Tag = "h2",
  size = "section",
  className,
}: {
  title?: string | null;
  accent?: string | null;
  theme: HomeTheme;
  as?: "h1" | "h2";
  size?: "hero" | "section";
  className?: string;
}) {
  if (!title && !accent) return null;
  return (
    <Tag
      className={clsx(
        "font-display font-bold",
        size === "hero" ? "text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl" : "text-3xl leading-tight sm:text-4xl lg:text-5xl",
        theme.heading,
        className,
      )}
    >
      {title}
      {title && accent && <br />}
      {accent && <span className={theme.accent}>{accent}</span>}
    </Tag>
  );
}

/** Rounded-full CTA (DESIGN.md §4). Primary inverts per theme; secondary is outlined. */
export function HomeButton({
  field,
  label,
  theme,
  variant = "primary",
  className,
}: {
  field: any;
  label?: string | null;
  theme: HomeTheme;
  variant?: "primary" | "secondary" | "text";
  className?: string;
}) {
  if (!label || !isFilled.link(field)) return null;
  const cls =
    variant === "primary"
      ? theme.dark
        ? "rounded-full bg-white px-8 py-3 text-base font-semibold text-neutral-950 hover:bg-neutral-200 hover:scale-105"
        : "rounded-full bg-neutral-950 px-8 py-3 text-base font-semibold text-white hover:bg-neutral-800 hover:scale-105"
      : variant === "secondary"
        ? theme.dark
          ? "rounded-full border-2 border-white/80 px-8 py-3 font-semibold text-white hover:bg-white hover:text-neutral-950"
          : "rounded-full border-2 border-neutral-950 px-8 py-3 font-semibold text-neutral-950 hover:bg-neutral-950 hover:text-white"
        : clsx("group inline-flex items-center gap-2 font-semibold", theme.heading);
  return (
    <PrismicNextLink field={field} className={clsx("inline-flex items-center justify-center whitespace-nowrap transition-all duration-300", cls, className)}>
      {label}
      {variant === "text" && <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
    </PrismicNextLink>
  );
}
