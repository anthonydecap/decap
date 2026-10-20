"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useEffect, useRef, useState } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { useUiCopy } from "@/lib/ui-copy";
import { MediaPlaceholder } from "@/components/MediaSlot";
import { Section, SectionHeader, cardClass, toneFromSelect } from "@/lib/site-ui";

// Only one recording plays at a time, across every sound slice on the page.
let playing: HTMLAudioElement | null = null;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Player({ src, title, description }: { src: string; title: string; description?: string }) {
  const t = useUiCopy();
  const audio = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audio.current;
    return () => {
      if (el && playing === el) playing = null;
    };
  }, []);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <div className={`${cardClass} flex items-center gap-4 p-5 sm:gap-6 sm:p-6`}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={(e) => {
          if (playing && playing !== e.currentTarget) playing.pause();
          playing = e.currentTarget;
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? t.pause(title) : t.play(title)}
        aria-pressed={isPlaying}
        className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-accent text-accent-contrast transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-14 sm:w-14"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          {isPlaying ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 8 5.5Z" />}
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(time, duration || 0)}
            onChange={(e) => {
              const el = audio.current;
              if (el) el.currentTime = Number(e.target.value);
              setTime(Number(e.target.value));
            }}
            disabled={!duration}
            aria-label={t.seek(title)}
            aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
            className="h-1 flex-1 cursor-pointer accent-[var(--page-accent)] disabled:cursor-default"
          />
          <span className="flex-none text-xs tabular-nums text-ink-muted">
            {formatTime(time)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Recordings with a small player each, so visitors can hear the instrument. */
const SiteSound: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const t = useUiCopy();
  const items: any[] = (slice.items || []).filter((i: any) => i?.title || isFilled.link(i?.audio) || i?.audio_brief);
  if (items.length === 0) return null;

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <FadeInStagger faster className="mx-auto mt-12 max-w-3xl space-y-3 sm:mt-16">
        {items.map((item, i) => {
          const title = item.title || t.recording;
          const src = isFilled.link(item.audio) ? (item.audio as any).url : null;
          return (
            <FadeIn key={i}>
              {src ? (
                <Player src={src} title={title} description={item.description || undefined} />
              ) : (
                <div className="relative h-28 overflow-hidden rounded-2xl lg:rounded-3xl">
                  <MediaPlaceholder kind="Audio" brief={item.audio_brief || title} />
                </div>
              )}
            </FadeIn>
          );
        })}
      </FadeInStagger>
    </Section>
  );
};

export default SiteSound;
