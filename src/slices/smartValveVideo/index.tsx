"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import clsx from "clsx";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

/** Extract YouTube video ID from URL or return as-is if it looks like an ID (11 chars). */
function getYouTubeVideoId(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

type SmartValveVideoProps = SliceComponentProps<any>;

const SmartValveVideo: FC<SmartValveVideoProps> = ({ slice }) => {
  const { title, description, youtube_url } = slice.primary as any;
  const videoId = getYouTubeVideoId(youtube_url);

  const embedParams = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
  }).toString();

  return (
    <div className="py-8 sm:py-12 lg:py-24 bg-neutral-950">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: title + description */}
          <div className="text-white">
            {title && (
              <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-white">
                <PrismicRichText field={title} components={components} />
              </div>
            )}
            {description && (
              <div className="mt-6 text-xl text-neutral-400 leading-relaxed">
                <PrismicRichText field={description} components={components} />
              </div>
            )}
          </div>

          {/* Right: video in same card style as other SmartValve slices */}
          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
            <div
              className={clsx(
                "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                "from-indigo-600 via-blue-500 to-cyan-400"
              )}
            />
            {videoId ? (
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?${embedParams}`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <p className="text-neutral-500 text-sm">Add a YouTube URL or video ID in Prismic</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SmartValveVideo;
