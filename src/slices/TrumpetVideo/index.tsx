/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type FC, useState, useRef, useEffect } from "react";
import type { Content } from "@prismicio/client";
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
    return (
      <span className="text-blue-500 underline decoration-blue-300/50 underline-offset-2">
        {children}
      </span>
    );
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return (
        <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm font-mono text-neutral-700">
          {children}
        </code>
      );
    }
  },
};

/**
 * Props for `TrumpetVideo`.
 */
type TrumpetVideoProps = SliceComponentProps<Content.TrumpetVideoSlice>;

/**
 * Component for "TrumpetVideo" Slices.
 */
const TrumpetVideo: FC<TrumpetVideoProps> = ({ slice }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { 
    title, 
    description, 
    background_type, 
    background_color, 
    background_image,
    video_url = "/videos/WhatsApp Video 2025-07-09 at 21.38.23.mp4",
    autoplay = false,
    loop = false,
    show_controls = true,
    poster_image
  } = slice.primary as any;

  // Background style
  const backgroundStyle = background_type === 'image' && background_image?.url
    ? { backgroundImage: `url(${background_image.url})` }
    : { backgroundColor: background_color || '#000000' };

  // Video event handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && progressRef.current && videoRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = percentage * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, duration]);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying && !isHovered) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls, isHovered]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Container className="py-24 sm:py-32">
      <FadeIn
        className="-mx-6 rounded-4xl px-6 py-20 sm:mx-0 sm:py-24 md:px-12"
        style={backgroundStyle}
      >
        <div className="mx-auto max-w-6xl">
          {/* Text Content */}
          <div className="mb-16 max-w-3xl mx-auto text-center">
            {title && (
              <h2 className="font-display text-4xl font-medium text-white sm:text-5xl mb-8 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <div className="text-lg text-neutral-300 leading-relaxed">
                <PrismicRichText field={description} components={components} />
              </div>
            )}
          </div>

          {/* Modern Video Player */}
          <div className="relative">
            <div
              ref={containerRef}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900/50 to-black/50 backdrop-blur-sm border border-neutral-800/50"
              onMouseEnter={() => {
                setIsHovered(true);
                setShowControls(true);
              }}
              onMouseLeave={() => {
                setIsHovered(false);
                if (isPlaying) {
                  setShowControls(false);
                }
              }}
            >
              <video
                ref={videoRef}
                className="w-full h-auto"
                poster={poster_image?.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                autoPlay={autoplay}
                loop={loop}
                muted={isMuted}
                playsInline
              >
                <source src={video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Overlay */}
              <div
                className={clsx(
                  "absolute inset-0 transition-all duration-500 ease-out",
                  showControls ? "bg-black/30" : "bg-transparent"
                )}
              >
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlayPause}
                    className={clsx(
                      "group transition-all duration-500 ease-out",
                      isPlaying ? "opacity-0 scale-90" : "opacity-100 scale-100"
                    )}
                  >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <svg
                        className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform duration-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Bottom Controls */}
                <div
                  className={clsx(
                    "absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out",
                    showControls ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  )}
                >
                  {/* Progress Bar */}
                  <div className="px-6 pb-4">
                    <div 
                      ref={progressRef}
                      className="relative h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden select-none"
                      onClick={handleProgressClick}
                      onMouseDown={handleProgressMouseDown}
                      onMouseMove={handleProgressMouseMove}
                      onMouseUp={handleProgressMouseUp}
                    >
                      <div 
                        className="absolute inset-0 bg-white/60 rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-100 ease-out cursor-pointer hover:scale-110"
                        style={{ 
                          left: `${Math.max(0, Math.min(100, (currentTime / (duration || 1)) * 100))}%`, 
                          transform: 'translate(-50%, -50%)' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Control Bar */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handlePlayPause}
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200 group"
                        >
                          {isPlaying ? (
                            <svg
                              className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-white ml-0.5 group-hover:scale-110 transition-transform duration-200"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={handleMuteToggle}
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200 group"
                        >
                          {isMuted ? (
                            <svg
                              className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          )}
                        </button>

                        <span className="text-white/80 text-sm font-medium">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <button
                        onClick={handleFullscreen}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-200 group"
                      >
                        <svg
                          className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
};

export default TrumpetVideo; 