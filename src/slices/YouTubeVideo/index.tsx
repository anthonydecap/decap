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
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
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

/**
 * Extract YouTube video ID from URL
 */
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Props for `YouTubeVideo`.
 */
type YouTubeVideoProps = SliceComponentProps<any>;

/**
 * Component for "YouTubeVideo" Slices.
 */
const YouTubeVideo: FC<YouTubeVideoProps> = ({ slice }) => {
  const { 
    title, 
    description, 
    youtube_url, 
    video_position, 
    video_size 
  } = slice.primary;

  const videoId = getYouTubeVideoId(youtube_url || "");
  const position = video_position || "left";
  const size = video_size || "medium";

  const sizeClasses = {
    small: "aspect-video w-full",
    medium: "aspect-video w-full",
    large: "aspect-video w-full"
  };

  const videoSizeClass = sizeClasses[size as keyof typeof sizeClasses];

  if (!videoId) {
    return (
      <Container className="py-8 sm:py-12 lg:py-16">
        <div className="text-center text-neutral-600">
          <p>Please provide a valid YouTube URL</p>
        </div>
      </Container>
    );
  }

  const VideoComponent = (
    <FadeIn>
      <div className={clsx("relative flex items-center justify-center", videoSizeClass)}>
        <iframe
          className="w-full h-full rounded-2xl shadow-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </FadeIn>
  );

  const ContentComponent = (
    <FadeIn>
      <div className="flex flex-col justify-center h-full space-y-6">
        {title && (
          <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 leading-tight">
            <PrismicRichText 
              field={title} 
              components={components}
            />
          </div>
        )}
        
        {description && (
          <div className="text-lg text-neutral-600 leading-relaxed">
            <PrismicRichText 
              field={description} 
              components={components}
            />
          </div>
        )}
      </div>
    </FadeIn>
  );

  return (
    <Container className="py-8 sm:py-12 lg:py-16">
      <FadeInStagger>
        <div className={clsx(
          "grid grid-cols-1 gap-8 lg:gap-12 items-center min-h-[400px]",
          "lg:grid-cols-2"
        )}>
          {position === "left" ? (
            <>
              <div className="flex items-center justify-center">
                {VideoComponent}
              </div>
              <div className="flex items-center">
                {ContentComponent}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                {ContentComponent}
              </div>
              <div className="flex items-center justify-center">
                {VideoComponent}
              </div>
            </>
          )}
        </div>
      </FadeInStagger>
    </Container>
  );
};

export default YouTubeVideo;
