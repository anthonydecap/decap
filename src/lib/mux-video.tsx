"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

export function resolveMuxHlsUrl(raw: string | undefined | null): string | null {
  const s = (raw || "").trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://stream.mux.com/${s}.m3u8`;
}

const OVERLAY_MAP = {
  light: "bg-black/40",
  medium: "bg-black/60",
  dark: "bg-black/80",
} as const;

export function overlayClass(opacity?: string | null): string {
  const key = (opacity || "medium") as keyof typeof OVERLAY_MAP;
  return OVERLAY_MAP[key] ?? "bg-black/60";
}

type MuxVideoLayerProps = {
  src: string;
  className?: string;
};

export function MuxVideoLayer({ src, className }: MuxVideoLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let destroyed = false;
    let hls: import("hls.js").default | null = null;

    const setup = async () => {
      // hls.js first: some browsers (recent Chrome) claim native HLS but play it unreliably.
      // Native playback only where hls.js can't run (older iPhone Safari).
      const Hls = (await import("hls.js")).default;
      if (destroyed) return;
      if (!Hls.isSupported()) {
        if (!video.canPlayType("application/vnd.apple.mpegurl")) return;
        video.src = src;
        try {
          await video.play();
        } catch {
          /* autoplay policy */
        }
        return;
      }
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    };

    setup();

    return () => {
      destroyed = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={clsx(className, "min-h-full min-w-full object-cover")}
      playsInline
      muted
      loop
      autoPlay
      controls={false}
      aria-hidden
    />
  );
}
