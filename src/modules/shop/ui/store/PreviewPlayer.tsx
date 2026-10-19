"use client";

import clsx from "clsx";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";

/**
 * One shared <audio> element for the whole shop: starting a preview stops any other.
 * Only PREVIEWS-store URLs ever reach this component.
 */
type PreviewCtx = {
  currentUrl: string | null;
  playing: boolean;
  progress: number;
  toggle: (url: string) => void;
};

const Ctx = createContext<PreviewCtx | null>(null);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onended = () => { setPlaying(false); setProgress(0); };
    a.ontimeupdate = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    audio.current = a;
    return () => { a.pause(); a.src = ""; };
  }, []);

  const toggle = useCallback((url: string) => {
    const a = audio.current;
    if (!a) return;
    if (currentUrl === url) {
      if (a.paused) void a.play().catch(() => setPlaying(false));
      else a.pause();
      return;
    }
    a.pause();
    a.src = url;
    setCurrentUrl(url);
    setProgress(0);
    void a.play().catch(() => setPlaying(false));
  }, [currentUrl]);

  const value = useMemo(() => ({ currentUrl, playing, progress, toggle }), [currentUrl, playing, progress, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePreview() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePreview must be used inside PreviewProvider");
  return c;
}

/** Round frosted control for use over artwork (DESIGN.md "controls over media"). */
export function PreviewButton({ url, label, pauseLabel, className, size = "md" }: {
  url: string;
  label: string;
  pauseLabel: string;
  className?: string;
  size?: "md" | "lg";
}) {
  const { currentUrl, playing, toggle } = usePreview();
  const active = currentUrl === url && playing;
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(url); }}
      aria-label={active ? pauseLabel : label}
      aria-pressed={active}
      className={clsx(
        "inline-flex items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95",
        size === "lg" ? "h-14 w-14" : "h-11 w-11",
        className,
      )}
    >
      {active ? <Pause size={size === "lg" ? 22 : 18} weight="fill" /> : <Play size={size === "lg" ? 22 : 18} weight="fill" />}
    </button>
  );
}

export function PreviewProgress({ url }: { url: string }) {
  const { currentUrl, progress } = usePreview();
  const value = currentUrl === url ? progress : 0;
  return (
    <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/20" aria-hidden>
      <div className="h-full bg-white transition-[width] duration-200" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}
