"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { PrismicNextImage } from "@prismicio/next";
import { MediaPlaceholder } from "@/components/MediaSlot";
import { BrandText } from "@/components/BrandText";
import { BLUR, COLOR, DIM, POSITION } from "@/lib/image-look";
import { SiteLink, toneFromSelect } from "@/lib/site-ui";

/*
 * Apple-style product tiles: one product per tile, one headline, one line, a big image. The whole
 * tile is one link (the primary link; the button labels and the second link are kept in Prismic
 * but no longer shown). It feels clickable without a button: hand cursor, the photo zooms in and
 * the tile lifts on hover, a small press on click or tap.
 * Full tiles stack; half tiles sit side by side. Each tile carries its own style, so a page can
 * move from the light Decap style to the SmartValve rainbow and the Orchestrionix brass.
 */

const STYLES: Record<
  string,
  {
    tile: string;
    title: string;
    muted: string;
    button: string;
    link: string;
    tone: "light" | "dark";
  }
> = {
  Light: {
    tile: "bg-[#f5f5f7] text-neutral-950",
    title: "",
    muted: "text-neutral-600",
    button: "bg-neutral-950 text-white hover:bg-neutral-800",
    link: "text-neutral-950",
    tone: "light",
  },
  Dark: {
    tile: "bg-black text-white",
    title: "",
    muted: "text-neutral-400",
    button: "bg-white text-neutral-950 hover:bg-neutral-200",
    link: "text-white",
    tone: "dark",
  },
  SmartValve: {
    tile: "bg-black text-white",
    title: "text-smartvalve",
    muted: "text-neutral-400",
    button: "bg-white text-neutral-950 hover:bg-neutral-200",
    link: "text-white",
    tone: "dark",
  },
  Orchestrionix: {
    tile: "bg-[#0c0a09] text-[#faf7f2]",
    title: "text-[#cca483]",
    muted: "text-[#c9bfb3]",
    button: "bg-[#cca483] text-[#0c0a09] hover:bg-[#d9b796]",
    link: "text-[#cca483]",
    tone: "dark",
  },
  Atelier: {
    tile: "bg-[#eee7db] text-[#1f1a14]",
    title: "",
    muted: "text-[#5c5348]",
    button: "bg-[#1f1a14] text-[#f7f3ec] hover:bg-[#30271e]",
    link: "text-[#1f1a14]",
    tone: "light",
  },
};

/** Contain: the image sits in the lower part of the tile (the top is for the text), inset by size. */
const CONTAIN_BOX: Record<string, string> = {
  "100%": "inset-x-0 bottom-0 top-[40%]",
  "85%": "inset-x-[7.5%] bottom-[4%] top-[42%]",
  "70%": "inset-x-[15%] bottom-[6%] top-[46%]",
  "55%": "inset-x-[22.5%] bottom-[8%] top-[50%]",
};

/**
 * The tile's background image over the tile colour (so transparent PNGs sit on it). Editors pick
 * Cover or Contain, a position and, for Contain, a size; an optional fade keeps the text legible.
 */
function TileBackground({
  item,
  tone,
  brief,
  half,
  zoom,
}: {
  item: any;
  tone: "light" | "dark";
  brief: string;
  half: boolean;
  /** Zoom the photo in on hover (always for a linked tile). */
  zoom?: boolean;
}) {
  if (!isFilled.image(item.image)) {
    return (
      <div className="absolute inset-x-6 top-[48%] bottom-6">
        <MediaPlaceholder brief={brief} tone={tone} />
      </div>
    );
  }
  const contain = item.image_fit === "Contain";
  const position = POSITION[item.image_position] ?? "object-center";
  const fade =
    item.overlay === "Strong"
      ? tone === "dark"
        ? "from-black/90 via-black/65"
        : "from-white/95 via-white/75"
      : item.overlay === "Soft"
        ? tone === "dark"
          ? "from-black/70 via-black/35"
          : "from-white/80 via-white/45"
        : null;
  const blur = BLUR[item.blur] ?? null;
  const dim = DIM[item.dim] ?? 0;
  return (
    <>
      <div
        className={clsx(
          "absolute overflow-hidden",
          contain
            ? (CONTAIN_BOX[item.image_size] ?? CONTAIN_BOX["100%"])
            : "inset-0",
        )}
      >
        {/* Three layers, so the zooms don't override each other: hover zoom, slow zoom, blur margin. */}
        <div
          className={clsx(
            "absolute inset-0 transition-transform duration-700 ease-out",
            zoom && "group-hover:scale-105 motion-reduce:group-hover:scale-100",
          )}
        >
          <div
            className={clsx(
              "absolute inset-0",
              item.slow_zoom && "tile-slow-zoom",
            )}
          >
            {/* A blurred image would show soft edges: scale it slightly so the blur stays inside. */}
            <div
              className={clsx(
                "absolute inset-0",
                blur && !contain && "scale-110",
              )}
            >
              <PrismicNextImage
                field={item.image}
                fill
                sizes={half ? "(min-width: 1024px) 50vw, 100vw" : "100vw"}
                className={clsx(
                  contain ? "object-contain" : "object-cover",
                  position,
                  blur,
                  COLOR[item.color_effect],
                )}
                fallbackAlt=""
              />
            </div>
          </div>
        </div>
      </div>
      {dim > 0 && (
        <div
          className={clsx(
            "absolute inset-0",
            tone === "dark" ? "bg-black" : "bg-white",
          )}
          style={{ opacity: dim }}
        />
      )}
      {item.vignette && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
      )}
      {fade && (
        <div
          className={clsx(
            "absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b to-transparent",
            fade,
          )}
        />
      )}
    </>
  );
}

function Tile({ item, half }: { item: any; half: boolean }) {
  const s = STYLES[item.style] ?? STYLES.Light;
  const linked = isFilled.link(item.primary_link);
  const brief =
    item.image_brief ||
    `Image for “${item.title || item.eyebrow || "this tile"}”`;

  const body = (
    <>
      <TileBackground
        item={item}
        tone={s.tone}
        brief={brief}
        half={half}
        zoom={linked || item.hover_zoom}
      />
      <div
        className={clsx(
          "relative z-10 px-6",
          half ? "pt-12 sm:pt-14" : "pt-14 sm:pt-16",
        )}
      >
        {item.eyebrow && (
          <p
            className={clsx(
              "text-base font-semibold sm:text-lg",
              s.title || "",
            )}
          >
            <BrandText>{item.eyebrow}</BrandText>
          </p>
        )}
        {item.title && (
          <h3
            className={clsx(
              "site-heading mx-auto mt-2 max-w-3xl leading-tight",
              half
                ? "text-3xl sm:text-4xl"
                : "text-4xl sm:text-5xl lg:text-6xl",
              !item.eyebrow && s.title,
            )}
          >
            {item.title}
          </h3>
        )}
        {item.tagline && (
          <p
            className={clsx(
              "mx-auto mt-3 max-w-xl text-lg sm:text-xl",
              s.muted,
            )}
          >
            {item.tagline}
          </p>
        )}
        {item.note && (
          <p className={clsx("mt-4 text-sm", s.muted)}>{item.note}</p>
        )}
      </div>
      {/* Spacer: keeps the tile's height when the image is a background. */}
      <div className="flex-1" />
    </>
  );

  const tile = clsx(
    "group relative isolate flex h-full flex-col overflow-hidden rounded-3xl text-center",
    s.tile,
    half ? "min-h-[520px] lg:min-h-[600px]" : "min-h-[560px] lg:min-h-[680px]",
  );

  return (
    <FadeIn className="h-full">
      {linked ? (
        // The whole tile is the link. It shows it the way people expect: the hand cursor, the
        // photo zooming in and the tile lifting on hover, a small press on click or tap.
        <SiteLink
          field={item.primary_link}
          className={clsx(
            tile,
            "transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.45)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transform-none",
          )}
        >
          {body}
        </SiteLink>
      ) : (
        <div className={tile}>{body}</div>
      )}
    </FadeIn>
  );
}

const SiteTiles: FC<SliceComponentProps<any>> = ({ slice }) => {
  const items: any[] = (slice.items || []).filter(
    (i: any) => i?.title || i?.eyebrow,
  );
  if (!items.length) return null;

  // Consecutive half tiles form a two-column row; full tiles take the whole width.
  const rows: any[][] = [];
  for (const item of items) {
    const last = rows[rows.length - 1];
    if (
      item.size === "Half" &&
      last &&
      last[0].size === "Half" &&
      last.length < 2
    )
      last.push(item);
    else rows.push([item]);
  }

  const tone = toneFromSelect(slice.primary?.tone);
  return (
    // Same container as the header and the other sections, so the tile edges line up with them.
    <section
      data-tone={tone === "page" ? undefined : tone}
      className="bg-page py-3 sm:py-4"
    >
      <Container>
        <div className="space-y-3 sm:space-y-4">
          {rows.map((row, i) => (
            <div
              key={i}
              className={clsx(
                "grid gap-3 sm:gap-4",
                row[0].size === "Half" && "lg:grid-cols-2",
              )}
            >
              {row.map((item, j) => (
                <Tile key={j} item={item} half={item.size === "Half"} />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default SiteTiles;
