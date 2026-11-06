"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState } from "react";
import { isFilled } from "@prismicio/client";
import clsx from "clsx";
import { type SliceComponentProps } from "@prismicio/react";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaPlaceholder, MediaSlot } from "@/components/MediaSlot";
import { MuxPlayer, muxPlaybackId } from "@/components/MuxPlayer";
import { Section, SectionHeader, toneFromSelect } from "@/lib/site-ui";
import { useUiCopy } from "@/lib/ui-copy";

/** Privacy-friendly player URL for YouTube or Vimeo, or null for other providers. */
function playerUrl(embedUrl: string): string | null {
  const yt = embedUrl.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  if (yt && /youtu\.?be/.test(embedUrl)) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = embedUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}

/**
 * A 16:9 video. Mux videos play as a muted loop while on screen (pause and sound buttons);
 * YouTube and Vimeo load their privacy-friendly embed only after the visitor clicks play.
 */
const SiteVideo: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const t = useUiCopy();
  const [active, setActive] = useState(false);
  const video = isFilled.embed(p.video) ? (p.video as any) : null;
  // The plain Mux link field wins; a Mux link pasted in the embed field works too.
  const muxId = muxPlaybackId(p.mux_video) ?? muxPlaybackId(video?.embed_url);
  if (!muxId && !video && !p.video_brief) return null;

  const title = (video?.provider_name !== "Mux" && video?.title) || p.title || t.video;
  const src = video?.embed_url ? playerUrl(video.embed_url) : null;
  const canPlay = !!src || !!video?.html;
  // Imported links may lack oEmbed data: derive the YouTube thumbnail from the video id.
  const ytId = src?.match(/youtube-nocookie\.com\/embed\/([\w-]{6,})/)?.[1];
  const youtubeThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;

  // "Same as section": no card behind the video, the poster is shown whole on the section color
  const bare = p.media_background === "Same as section";

  const posterImage = isFilled.image(p.poster) ? (
    <MediaSlot
      field={p.poster}
      brief={p.video_brief || title}
      aspect=""
      rounded=""
      className="absolute inset-0 h-full w-full"
      sizes="(min-width: 1280px) 1216px, 100vw"
      fit={bare ? "contain" : "auto"}
      backdrop={!bare}
    />
  ) : null;

  let frame: React.ReactNode;
  if (muxId) {
    frame = <MuxPlayer playbackId={muxId} title={title} poster={posterImage ?? undefined} sound={!p.without_sound} className={clsx("absolute inset-0", bare && "bg-page")} />;
  } else if (active && src) {
    frame = (
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (active && video?.html) {
    frame = <div className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" dangerouslySetInnerHTML={{ __html: video.html }} />;
  } else {
    const poster = posterImage ? (
      posterImage
    ) : video?.thumbnail_url || youtubeThumb ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={video?.thumbnail_url || youtubeThumb!} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
    ) : (
      <MediaPlaceholder kind="Video" brief={p.video_brief || title} />
    );
    frame = (
      <>
        {poster}
        {canPlay && (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={t.playVideo(title)}
            className={clsx(
              "group absolute inset-0 flex items-center justify-center transition focus-visible:outline-none",
              !bare && "bg-black/10 hover:bg-black/20"
            )}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-lg transition-transform duration-300 group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-accent-soft sm:h-24 sm:w-24">
              <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current" aria-hidden="true">
                <path d="M8 5.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 8 5.5Z" />
              </svg>
            </span>
          </button>
        )}
      </>
    );
  }

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <FadeInStagger faster>
        <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        <FadeIn className="mt-12 sm:mt-16">
          <figure>
            <div className={clsx("relative aspect-[16/9] overflow-hidden rounded-2xl lg:rounded-3xl", !bare && "bg-surface")}>{frame}</div>
            {p.caption && <figcaption className="mt-4 text-center text-sm text-ink-muted">{p.caption}</figcaption>}
          </figure>
        </FadeIn>
      </FadeInStagger>
    </Section>
  );
};

export default SiteVideo;
