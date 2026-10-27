"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from "clsx";
import { isFilled } from "@prismicio/client";
import { MediaSlot } from "@/components/MediaSlot";
import { MuxVideoLayer } from "@/lib/mux-video";
import { BLUR, COLOR, DIM, ORIGIN, POSITION, ZOOM } from "@/lib/image-look";

const FIT: Record<string, "cover" | "contain"> = { Cover: "cover", Contain: "contain" };

/**
 * The hero image, with an optional Mux video playing over it (the image stays as poster and
 * fallback). Fit, position, zoom and effects are chosen in Prismic; position, zoom and the
 * colour and blur effects apply to the video as well.
 */
export function HeroMedia({
  p,
  video,
  brief,
  className,
  aspect = "",
  rounded = "rounded-2xl lg:rounded-3xl",
  sizes,
  priority,
  tone,
}: {
  p: any;
  video: string | null;
  brief: string;
  className?: string;
  aspect?: string;
  rounded?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "light" | "dark";
}) {
  const filled = isFilled.image(p.image) || !!video;
  const blur = BLUR[p.blur];
  // A blurred image shows soft edges: without a zoom, enlarge it slightly so the blur stays inside.
  const zoom = ZOOM[p.image_zoom] ?? (blur && "scale-110");
  const look = clsx(POSITION[p.image_position], ORIGIN[p.image_position], zoom, blur, COLOR[p.color_effect]);
  const dim = DIM[p.dim] ?? 0;

  return (
    <div className={clsx("relative overflow-hidden", aspect, rounded, className)}>
      <div className={clsx("absolute inset-0", p.slow_zoom && "tile-slow-zoom", ORIGIN[p.image_position])}>
        <MediaSlot
          field={p.image}
          brief={brief}
          aspect=""
          rounded=""
          className="absolute inset-0 h-full w-full"
          imgClassName={look}
          fit={FIT[p.image_fit] ?? "auto"}
          sizes={sizes}
          priority={priority}
          tone={tone}
        />
        {video && <MuxVideoLayer src={video} className={clsx("absolute inset-0 h-full w-full motion-reduce:hidden", look)} />}
      </div>
      {filled && dim > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: dim }} />}
      {filled && p.vignette && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
      )}
    </div>
  );
}
