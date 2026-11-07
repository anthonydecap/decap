"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useInView, useReducedMotion } from "framer-motion";
import { Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useUiCopy } from "@/lib/ui-copy";

/** Playback id from a Mux player, stream or image link (or a bare id), or null for other links. */
export function muxPlaybackId(raw?: string | null): string | null {
  const s = (raw || "").trim();
  const fromUrl = s.match(/(?:player|stream|image)\.mux\.com\/([A-Za-z0-9]{20,})/);
  if (fromUrl) return fromUrl[1];
  return /^[A-Za-z0-9]{30,}$/.test(s) ? s : null;
}

export const muxThumbnail = (id: string) => `https://image.mux.com/${id}/thumbnail.webp?width=1920`;

type MuxPlayerProps = {
  playbackId: string;
  title: string;
  /** Shown until the first frame plays; defaults to the Mux thumbnail */
  poster?: ReactNode;
  /** false = no sound button, the video always stays muted */
  sound?: boolean;
  /** Sizing and position (and a bg- class to replace the black); defaults to a relative 16:9 box */
  className?: string;
};

const control =
  "flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-11 sm:w-11";

/**
 * A Mux video as a muted loop that plays while it is on screen, with a pause button and a sound
 * button (like the hero film). The stream (hls.js) loads once the video comes near the viewport.
 * Reduced motion: it waits on the poster until the visitor presses play.
 */
export function MuxPlayer({ playbackId, title, poster, sound = true, className = "relative aspect-video" }: MuxPlayerProps) {
  const t = useUiCopy();
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const near = useInView(boxRef, { margin: "300px 0px" });
  const visible = useInView(boxRef, { amount: 0.25 });

  const [loaded, setLoaded] = useState(false);
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [firstFrame, setFirstFrame] = useState(false);

  // Latch: once near the viewport the stream stays attached
  if (near && !loaded) setLoaded(true);
  const wantPlay = choice ? choice === "play" : !reduce;
  const shouldPlay = loaded && visible && wantPlay;
  const shouldPlayRef = useRef(shouldPlay);

  const src = `https://stream.mux.com/${playbackId}.m3u8`;

  // Attach the stream: hls.js first, native HLS only where hls.js can't run (older iOS)
  useEffect(() => {
    const video = videoRef.current;
    if (!loaded || !video) return;
    let destroyed = false;
    let hls: import("hls.js").default | null = null;

    (async () => {
      const Hls = (await import("hls.js")).default;
      if (destroyed) return;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, capLevelToPlayerSize: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    })();

    return () => {
      destroyed = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [loaded, src]);

  // Play only while on screen and wanted; pause off screen to save data and battery
  useEffect(() => {
    shouldPlayRef.current = shouldPlay;
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) video.play().catch(() => {});
    else video.pause();
  }, [shouldPlay]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const togglePlay = () => setChoice(playing ? "pause" : "play");

  return (
    <div ref={boxRef} className={clsx("overflow-hidden", !/(^|\s)bg-/.test(className) && "bg-black", className)}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        aria-label={title}
        onCanPlay={(e) => {
          if (shouldPlayRef.current) e.currentTarget.play().catch(() => {});
        }}
        onPlaying={() => {
          setPlaying(true);
          setFirstFrame(true);
        }}
        onPause={() => setPlaying(false)}
      />

      {/* Poster until the first frame, then it fades away */}
      <div
        aria-hidden="true"
        className={clsx("absolute inset-0 transition-opacity duration-700", firstFrame ? "pointer-events-none opacity-0" : "opacity-100")}
      >
        {poster ?? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={muxThumbnail(playbackId)} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        )}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2 sm:bottom-6 sm:right-6">
        {sound && (
          <button
            type="button"
            onClick={() => {
              setMuted(!muted);
              if (muted && !playing) setChoice("play");
            }}
            aria-label={muted ? t.videoUnmute : t.videoMute}
            aria-pressed={!muted}
            className={control}
          >
            {muted ? <SpeakerSlash weight="fill" className="h-4 w-4" /> : <SpeakerHigh weight="fill" className="h-4 w-4" />}
          </button>
        )}
        <button type="button" onClick={togglePlay} aria-label={playing ? t.filmPause : t.filmPlay} className={control}>
          {playing ? <Pause weight="fill" className="h-4 w-4" /> : <Play weight="fill" className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
