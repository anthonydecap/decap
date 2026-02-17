"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useRef, useEffect } from "react";
import Hls from "hls.js";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import clsx from "clsx";

const isHlsUrl = (url: string) =>
  typeof url === "string" && url.includes(".m3u8");

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
 * Props for `SmartValveVideoHero`.
 */
type SmartValveVideoHeroProps = SliceComponentProps<any>;

/**
 * Component for "SmartValveVideoHero" Slices.
 */
const SmartValveVideoHero: FC<SmartValveVideoHeroProps> = ({ slice }) => {
  const {
    title,
    subtitle,
    button_text,
    button_link,
    background_video,
    overlay_opacity,
    background_color,
  } = slice.primary;
  const bgColor = background_color || "#0a0a0a";

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const videoUrl = background_video?.url;
  const useHls = videoUrl && isHlsUrl(videoUrl);

  // HLS: use hls.js so .m3u8 plays in Chrome/Firefox (Safari uses native <source>)
  useEffect(() => {
    if (!useHls || !videoUrl || !videoRef.current) return;
    if (!Hls.isSupported()) return;

    const hls = new Hls();
    hlsRef.current = hls;
    hls.loadSource(videoUrl);
    hls.attachMedia(videoRef.current);

    return () => {
      hls.destroy();
      hlsRef.current = null;
    };
  }, [useHls, videoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const overlayClasses = {
    light: "bg-black/40",
    medium: "bg-black/60",
    dark: "bg-black/80",
  };

  const overlayValue = overlay_opacity || "medium";
  const overlayClass =
    overlayClasses[overlayValue as keyof typeof overlayClasses] || "bg-black/50";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: videoUrl ? undefined : bgColor }}>
      {videoUrl && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster=""
        >
          {useHls ? (
            <source src={videoUrl} type="application/vnd.apple.mpegurl" />
          ) : (
            <source src={videoUrl} type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </video>
      )}

      <div className={clsx("absolute inset-0", overlayClass)} />

      <Container className="relative z-10 text-center text-white">
        <div className="max-w-6xl mx-auto space-y-8">
          {title && (
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              {title}
            </h1>
          )}

          {subtitle && (
            <div className="text-xl sm:text-2xl lg:text-3xl text-white/90 max-w-5xl mx-auto">
              <PrismicRichText field={subtitle} components={components} />
            </div>
          )}

          {button_text && button_link && (
            <div className="pt-8">
              <PrismicNextLink field={button_link}>
                <Button className="text-lg px-8 py-4 bg-white text-neutral-900 hover:bg-white/90 transition-colors">
                  {button_text}
                </Button>
              </PrismicNextLink>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SmartValveVideoHero;
