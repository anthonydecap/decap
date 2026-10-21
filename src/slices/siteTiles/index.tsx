"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { BrandText } from "@/components/BrandText";
import { SiteLink, toneFromSelect } from "@/lib/site-ui";

/*
 * Apple-style product tiles: one product per tile, one headline, one line, two links, a big image.
 * Full tiles stack; half tiles sit side by side. Each tile carries its own style, so a page can
 * move from the light Decap style to the SmartValve rainbow and the Orchestrionix brass.
 */

const STYLES: Record<string, { tile: string; title: string; muted: string; button: string; link: string; tone: "light" | "dark" }> = {
  Light: { tile: "bg-[#f5f5f7] text-neutral-950", title: "", muted: "text-neutral-600", button: "bg-neutral-950 text-white hover:bg-neutral-800", link: "text-neutral-950", tone: "light" },
  Dark: { tile: "bg-black text-white", title: "", muted: "text-neutral-400", button: "bg-white text-neutral-950 hover:bg-neutral-200", link: "text-white", tone: "dark" },
  SmartValve: { tile: "bg-black text-white", title: "text-smartvalve", muted: "text-neutral-400", button: "bg-white text-neutral-950 hover:bg-neutral-200", link: "text-white", tone: "dark" },
  Orchestrionix: { tile: "bg-[#0c0a09] text-[#faf7f2]", title: "text-orchestrionix", muted: "text-[#c9bfb3]", button: "bg-[#cca483] text-[#0c0a09] hover:bg-[#d9b796]", link: "text-[#cca483]", tone: "dark" },
  Atelier: { tile: "bg-[#eee7db] text-[#1f1a14]", title: "", muted: "text-[#5c5348]", button: "bg-[#1f1a14] text-[#f7f3ec] hover:bg-[#30271e]", link: "text-[#1f1a14]", tone: "light" },
};

function Tile({ item, half }: { item: any; half: boolean }) {
  const s = STYLES[item.style] ?? STYLES.Light;
  const brief = item.image_brief || `Image for “${item.title || item.eyebrow || "this tile"}”`;
  return (
    <FadeIn
      className={clsx(
        "relative flex flex-col overflow-hidden rounded-3xl text-center",
        s.tile,
        half ? "min-h-[520px] lg:min-h-[600px]" : "min-h-[560px] lg:min-h-[680px]",
      )}
    >
      <div className={clsx("relative z-10 px-6", half ? "pt-12 sm:pt-14" : "pt-14 sm:pt-16")}>
        {item.eyebrow && (
          <p className={clsx("text-base font-semibold sm:text-lg", s.title || "")}>
            <BrandText>{item.eyebrow}</BrandText>
          </p>
        )}
        {item.title && (
          <h3
            className={clsx(
              "site-heading mx-auto mt-2 max-w-3xl leading-tight",
              half ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl",
              !item.eyebrow && s.title,
            )}
          >
            {item.title}
          </h3>
        )}
        {item.tagline && <p className={clsx("mx-auto mt-3 max-w-xl text-lg sm:text-xl", s.muted)}>{item.tagline}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {item.primary_label && isFilled.link(item.primary_link) && (
            <SiteLink field={item.primary_link} className={clsx("rounded-full px-5 py-2 text-sm font-semibold transition", s.button)}>
              {item.primary_label}
            </SiteLink>
          )}
          {item.secondary_label && isFilled.link(item.secondary_link) && (
            <SiteLink field={item.secondary_link} className={clsx("text-sm font-semibold underline-offset-4 hover:underline", s.link)}>
              {item.secondary_label} <span aria-hidden="true">›</span>
            </SiteLink>
          )}
        </div>
        {item.note && <p className={clsx("mt-4 text-sm", s.muted)}>{item.note}</p>}
      </div>
      <div className="relative mt-8 flex-1">
        <MediaSlot
          field={item.image}
          brief={brief}
          aspect=""
          rounded=""
          tone={s.tone}
          className="absolute inset-0"
          sizes={half ? "(min-width: 1024px) 50vw, 100vw" : "100vw"}
        />
      </div>
    </FadeIn>
  );
}

const SiteTiles: FC<SliceComponentProps<any>> = ({ slice }) => {
  const items: any[] = (slice.items || []).filter((i: any) => i?.title || i?.eyebrow);
  if (!items.length) return null;

  // Consecutive half tiles form a two-column row; full tiles take the whole width.
  const rows: any[][] = [];
  for (const item of items) {
    const last = rows[rows.length - 1];
    if (item.size === "Half" && last && last[0].size === "Half" && last.length < 2) last.push(item);
    else rows.push([item]);
  }

  const tone = toneFromSelect(slice.primary?.tone);
  return (
    <section data-tone={tone === "page" ? undefined : tone} className="bg-page px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto max-w-[1800px] space-y-3 sm:space-y-4">
        {rows.map((row, i) => (
          <div key={i} className={clsx("grid gap-3 sm:gap-4", row[0].size === "Half" && "lg:grid-cols-2")}>
            {row.map((item, j) => (
              <Tile key={j} item={item} half={item.size === "Half"} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SiteTiles;
