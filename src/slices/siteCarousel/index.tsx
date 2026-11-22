"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState } from "react";
import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { MediaPlaceholder } from "@/components/MediaSlot";
import { ShowcaseBlock, ShowcaseHeader } from "@/components/Showcase";
import { SiteLink } from "@/lib/site-ui";

/*
 * "Where they play", in the home page's Showcase style: a dark rounded block with a centered
 * header and the places as tall photo panels side by side. Desktop: the panel under the mouse
 * (or keyboard focus) widens and shows its line; the others narrow to a strip with their label.
 * Phones and tablets: the places one under the other. A place with a link opens it as a whole.
 */

const POSITION: Record<string, string> = {
  Center: "object-center",
  Top: "object-top",
  Bottom: "object-bottom",
  Left: "object-left",
  Right: "object-right",
};

function Photo({ item, sizes }: { item: any; sizes: string }) {
  return isFilled.image(item.image) ? (
    <PrismicNextImage
      field={item.image}
      fill
      sizes={sizes}
      className={clsx(
        "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none",
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

/** A place as a link when it has one, else a plain box; same look either way. */
function Shell({
  item,
  className,
  children,
  ...rest
}: {
  item: any;
  className: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return isFilled.link(item.link) ? (
    <SiteLink
      field={item.link}
      className={clsx(
        className,
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
      )}
      {...(rest as any)}
    >
      {children}
    </SiteLink>
  ) : (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

const SiteCarousel: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const items: any[] = (slice.items || []).filter(
    (i: any) => i?.title || i?.eyebrow || isFilled.image(i?.image),
  );
  const [open, setOpen] = useState(0);
  if (!items.length) return null;

  return (
    <ShowcaseBlock tone="dark">
      <ShowcaseHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      {/* Desktop: panels that widen on hover or focus. */}
      <div className="mt-14 hidden h-[34rem] gap-3 lg:flex">
        {items.map((item, i) => {
          const isOpen = i === open;
          return (
            <Shell
              key={i}
              item={item}
              onMouseEnter={() => setOpen(i)}
              onFocus={() => setOpen(i)}
              className={clsx(
                "group relative min-w-0 basis-0 overflow-hidden rounded-2xl bg-neutral-900 transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                isOpen ? "grow-[4]" : "grow",
              )}
            >
              <Photo item={item} sizes="(min-width: 1280px) 700px, 60vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              {/* Closed: the label, upright along the strip. */}
              <p
                aria-hidden={isOpen || undefined}
                className={clsx(
                  "absolute bottom-6 left-5 rotate-180 whitespace-nowrap text-lg font-semibold text-white transition-opacity duration-300 [writing-mode:vertical-rl]",
                  isOpen ? "opacity-0" : "opacity-100 delay-200",
                )}
              >
                {item.eyebrow || item.title}
              </p>
              {/* Open: label and line. A fixed width, so the text doesn't reflow while the panel grows. */}
              <div
                className={clsx(
                  "absolute bottom-0 left-0 w-[30rem] max-w-full p-8 text-left transition-[opacity,transform] duration-500",
                  isOpen
                    ? "translate-y-0 opacity-100 delay-200"
                    : "translate-y-3 opacity-0",
                )}
              >
                {item.eyebrow && (
                  <p className="text-lg font-semibold text-white/85">
                    {item.eyebrow}
                  </p>
                )}
                {item.title && (
                  <p className="site-heading mt-1.5 text-3xl leading-tight text-white [text-wrap:balance]">
                    {item.title}
                  </p>
                )}
              </div>
            </Shell>
          );
        })}
      </div>

      {/* Phones and tablets: one under the other. */}
      <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:hidden">
        {items.map((item, i) => (
          <Shell
            key={i}
            item={item}
            className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900"
          >
            <Photo item={item} sizes="(min-width: 640px) 50vw, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-left sm:p-6">
              {item.eyebrow && (
                <p className="text-base font-semibold text-white/85">
                  {item.eyebrow}
                </p>
              )}
              {item.title && (
                <p className="site-heading mt-1 text-2xl leading-tight text-white">
                  {item.title}
                </p>
              )}
            </div>
          </Shell>
        ))}
      </div>
    </ShowcaseBlock>
  );
};

export default SiteCarousel;
