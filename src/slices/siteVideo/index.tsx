"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { MediaPlaceholder, MediaSlot } from "@/components/MediaSlot";
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

/** A 16:9 video that loads the provider's player only after the visitor clicks play. */
const SiteVideo: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const t = useUiCopy();
  const [active, setActive] = useState(false);
  const video = isFilled.embed(p.video) ? (p.video as any) : null;
  if (!video && !p.video_brief) return null;

  const title = video?.title || p.title || t.video;
  const src = video?.embed_url ? playerUrl(video.embed_url) : null;
  const canPlay = !!src || !!video?.html;

  let frame: React.ReactNode;
  if (active && src) {
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
    const poster = isFilled.image(p.poster) ? (
      <MediaSlot field={p.poster} brief={p.video_brief || title} aspect="" rounded="" className="absolute inset-0" sizes="(min-width: 1280px) 1216px, 100vw" />
    ) : video?.thumbnail_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={video.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
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
            className="group absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/20 focus-visible:outline-none"
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
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-surface lg:rounded-3xl">{frame}</div>
            {p.caption && <figcaption className="mt-4 text-center text-sm text-ink-muted">{p.caption}</figcaption>}
          </figure>
        </FadeIn>
      </FadeInStagger>
    </Section>
  );
};

export default SiteVideo;
