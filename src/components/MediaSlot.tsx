"use client";

import clsx from "clsx";
import { useUiCopy } from "@/lib/ui-copy";
import { isFilled, type ImageField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

/**
 * An image from Prismic, or, while it is still empty, a typographic placeholder that says
 * which photo belongs here (the "brief"). The placeholders double as the shot list: walk the
 * site and every empty slot tells you what to photograph. Like the shop's Artwork tile, it is
 * a real fallback, never a fake stock image.
 *
 * Theme-aware: the placeholder uses the page style's surface, line and ink colors. Pass
 * `tone="dark"` on a dark section inside a light page.
 */
export function MediaSlot({
  field,
  brief,
  className,
  imgClassName,
  aspect = "aspect-[4/3]",
  rounded = "rounded-2xl lg:rounded-3xl",
  tone,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  fit = "auto",
}: {
  field?: ImageField | null;
  /** What to photograph, e.g. "Accordion Pedestal, front view, black backdrop, 4:3". */
  brief: string;
  className?: string;
  imgClassName?: string;
  /** Tailwind aspect class, or "" when the parent sets the size. */
  aspect?: string;
  rounded?: string;
  tone?: "light" | "dark";
  sizes?: string;
  priority?: boolean;
  /** "auto" shows portrait images whole in a landscape slot and crops the rest. */
  fit?: "auto" | "cover" | "contain";
}) {
  const filled = !!field && isFilled.image(field);
  // Portrait images (e.g. an Accordion Pedestal) in a landscape slot are shown whole, not cropped.
  const portrait = filled && field.dimensions && field.dimensions.height > field.dimensions.width * 1.15;
  const contain = fit === "contain" || (fit === "auto" && portrait);

  return (
    <div className={clsx("relative overflow-hidden", aspect, rounded, className)}>
      {filled ? (
        <PrismicNextImage
          field={field}
          fill
          sizes={sizes}
          priority={priority}
          className={clsx(contain ? "bg-surface object-contain" : "object-cover", imgClassName)}
          fallbackAlt=""
        />
      ) : (
        <MediaPlaceholder brief={brief} tone={tone} />
      )}
    </div>
  );
}

export function MediaPlaceholder({ brief, tone, kind = "Photo" }: { brief: string; tone?: "light" | "dark"; kind?: "Photo" | "Video" | "Audio" }) {
  const t = useUiCopy();
  const label = kind === "Audio" ? t.audioToCome : kind === "Video" ? t.videoToCome : t.photoToCome;
  return (
    <div
      role="img"
      aria-label={`${label}: ${brief}`}
      className={clsx(
        "absolute inset-0 flex flex-col justify-between border border-dashed p-5 sm:p-6",
        tone === "dark"
          ? "border-neutral-700 bg-neutral-900 text-neutral-300"
          : tone === "light"
            ? "border-neutral-300 bg-neutral-100 text-neutral-600"
            : "border-line bg-surface text-ink-muted",
      )}
      data-media-placeholder={brief}
    >
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.5}>
          {kind === "Audio" ? (
            <path d="M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          ) : kind === "Video" ? (
            <path d="m15 10 5-3v10l-5-3M4 6h11v12H4z" />
          ) : (
            <path d="M3 8h3l2-3h8l2 3h3v11H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          )}
        </svg>
        {label}
      </span>
      <span className="max-w-sm text-sm leading-relaxed">{brief}</span>
    </div>
  );
}
