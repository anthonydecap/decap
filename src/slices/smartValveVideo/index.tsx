"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState, useEffect } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
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

/** Get YouTube thumbnail URL */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Fullscreen Video Modal Component
const VideoModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}> = ({ isOpen, onClose, videoId }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
      // Trigger animation after mount
      setTimeout(() => setIsClosing(false), 10);
    } else {
      setIsMounted(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsMounted(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const embedParams = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
    controls: "1",
  }).toString();

  if (!isOpen && !isMounted) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center",
        "transition-opacity duration-300 ease-out",
        isClosing ? "opacity-0" : "opacity-100"
      )}
      onClick={handleBackdropClick}
    >
      {/* Lighter backdrop - shows page content underneath */}
      <div
        className={clsx(
          "absolute inset-0 bg-black/50 backdrop-blur-[2px]",
          "transition-opacity duration-300 ease-out",
          isClosing ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Modal Content */}
      <div
        className={clsx(
          "relative w-full h-full max-w-7xl max-h-[90vh] mx-4",
          "transition-all duration-300 ease-out",
          isClosing 
            ? "opacity-0 scale-95 translate-y-4" 
            : "opacity-100 scale-100 translate-y-0"
        )}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
          aria-label="Close video"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Container */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl">
          <div className="absolute inset-0">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?${embedParams}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type SmartValveVideoProps = SliceComponentProps<any>;

const SmartValveVideo: FC<SmartValveVideoProps> = ({ slice }) => {
  const { title, description, youtube_url, thumbnail_image, background_color } = slice.primary as any;
  const videoId = getYouTubeVideoId(youtube_url);
  const bgColor = background_color || "#0a0a0a";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const customThumbnail = thumbnail_image?.url;
  const youtubeThumbnail = videoId ? getYouTubeThumbnail(videoId) : null;
  const thumbnailUrl = customThumbnail ?? youtubeThumbnail;

  return (
    <div className="py-8 sm:py-12 lg:py-24" style={{ backgroundColor: bgColor }}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          {/* Left: title + description */}
          <div className="text-white flex flex-col justify-center">
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

          {/* Right: Custom video player mockup */}
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 group cursor-pointer transition-[border-color,box-shadow] duration-200 hover:border-neutral-700 hover:shadow-xl hover:shadow-blue-500/5 h-full flex flex-col">
              {videoId && thumbnailUrl ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="relative w-full h-full flex-1 overflow-hidden bg-neutral-950 min-h-[400px]"
                  aria-label="Play video"
                >
                  {/* Thumbnail Image - GPU accelerated */}
                  <img
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover will-change-transform"
                    style={{
                      transform: 'scale(1)',
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (videoId && !customThumbnail) {
                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }
                    }}
                  />

                  {/* Dark overlay for better contrast */}
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                  {/* Play Button - glass circle, animated gradient on triangle outline */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      {/* Play triangle icon with animated gradient stroke */}
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 ml-1 play-triangle-stroke"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <defs>
                          <linearGradient id="play-triangle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="25%" stopColor="#a855f7" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="75%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#eab308" />
                          </linearGradient>
                        </defs>
                        {/* Filled triangle (white) */}
                        <path d="M8 5v14l11-7z" fill="white" fillOpacity="0.9" />
                        {/* Animated gradient outline on the triangle */}
                        <path
                          className="play-triangle-outline"
                          d="M8 5v14l11-7z"
                          fill="none"
                          stroke="url(#play-triangle-grad)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeDasharray="55"
                          strokeDashoffset="55"
                        />
                      </svg>
                    </div>
                  </div>

                  <style jsx>{`
                    @keyframes play-triangle-draw {
                      0% { stroke-dashoffset: 55; }
                      100% { stroke-dashoffset: -55; }
                    }
                    .play-triangle-outline {
                      animation: play-triangle-draw 2.5s linear infinite;
                    }
                  `}</style>

                  {/* Video player controls - glass style with single backdrop blur */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                    {/* Glass backdrop - single blur layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent backdrop-blur-sm" />
                    
                    {/* Controls content */}
                    <div className="relative flex items-center gap-3">
                      {/* Play/Pause button mockup */}
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      </div>
                      
                      {/* Progress bar mockup */}
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full w-0 bg-white/40 rounded-full" />
                      </div>
                      
                      {/* Time indicator mockup */}
                      <div className="text-white/80 text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10">
                        0:00
                      </div>
                      
                      {/* Volume control mockup */}
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                      </div>
                      
                      {/* Fullscreen button mockup */}
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="h-full min-h-[400px] flex items-center justify-center">
                  <p className="text-neutral-500 text-sm">Add a YouTube URL or video ID in Prismic</p>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </Container>

      {/* Video Modal */}
      {videoId && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoId={videoId}
        />
      )}
    </div>
  );
};

export default SmartValveVideo;
