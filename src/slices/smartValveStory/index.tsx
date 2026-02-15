"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
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
 * Props for `SmartValveStory`.
 */
type SmartValveStoryProps = SliceComponentProps<any>;

/**
 * Step Visual Component - Handles video or image display ,
 */
const StepVisual: FC<{ step: any; isActive: boolean }> = ({
  step,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const videoUrl = step.step_video?.url;
  const useHls = videoUrl && isHlsUrl(videoUrl);

  // HLS: attach hls.js so .m3u8 plays in Chrome/Firefox (native <video> only supports HLS in Safari)
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
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  if (videoUrl) {
    return (
      <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          poster={step.step_image?.url}
        >
          {useHls ? (
            <source src={videoUrl} type="application/vnd.apple.mpegurl" />
          ) : (
            <source src={videoUrl} type="video/mp4" />
          )}
        </video>
      </div>
    );
  }

  if (step.step_image?.url) {
    return (
      <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900">
        <PrismicNextImage
          field={step.step_image}
          fallbackAlt={step.step_headline || "Step illustration"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl bg-neutral-900 flex items-center justify-center border border-neutral-800">
      <p className="text-neutral-600 text-sm">No media provided</p>
    </div>
  );
};

/**
 * Component for "SmartValveStory" Slices - How It Works scroll storytelling
 */
const SmartValveStory: FC<SmartValveStoryProps> = ({ slice }) => {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const [currentStep, setCurrentStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const bgColor = background_color || "#0a0a0a";

  const steps =
    slice.items.length > 0
      ? slice.items
      : [
          {
            step_headline: "MIDI command → target pressure",
            step_subline:
              "Every note begins as a pressure curve — attack, decay, sustain, release — not an on/off.",
            step_number: 1,
          },
          {
            step_headline: "Voice-coil motor → ultra-fast control",
            step_subline:
              "A loudspeaker-like motor moves a featherweight piston to shape airflow continuously.",
            step_number: 2,
          },
          {
            step_headline: "Pressure sensor → real-time regulation",
            step_subline:
              "Wind is measured 9,000×/s and corrected 2,000×/s so actual pressure follows the curve exactly.",
            step_number: 3,
          },
          {
            step_headline: "Real wind control → living sound",
            step_subline:
              "Because SmartValve regulates pressure, pipes breathe, swell and speak with natural expression.",
            step_number: 4,
          },
        ];

  useEffect(() => {
    const handleScroll = () => {
      if (!stepsRef.current) return;

      const stepElements = stepsRef.current.querySelectorAll(".story-step");
      const viewportHeight = window.innerHeight;
      const centerPoint = viewportHeight * 0.4;

      stepElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(elementCenter - centerPoint);

        if (distanceFromCenter < viewportHeight * 0.5) {
          setCurrentStep(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden py-16 sm:py-24 lg:py-32 text-white"
      style={{ backgroundColor: bgColor }}
    >
      <Container>
        <div className="relative z-10 text-center mb-16">
          <FadeIn>
            {section_title && (
              <div className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
                <PrismicRichText
                  field={section_title}
                  components={components}
                />
              </div>
            )}
            {section_subtitle && (
              <div className="max-w-3xl mx-auto text-xl text-neutral-400">
                <PrismicRichText
                  field={section_subtitle}
                  components={components}
                />
              </div>
            )}
          </FadeIn>
        </div>
      </Container>

      <div
        ref={stepsRef}
        className="relative z-10 space-y-20 sm:space-y-24 lg:space-y-32"
      >
        {steps.map((step: any, index: number) => (
          <div
            key={index}
            className={clsx(
              "story-step transition-all duration-500 ease-out",
              currentStep === index
                ? "opacity-100 scale-100"
                : "opacity-25 scale-[0.98]"
            )}
          >
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800/50 border border-neutral-700/50">
                    <span className="text-lg font-bold text-neutral-500">
                      {index + 1}
                    </span>
                  </div>

                  {step.step_headline && (
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
                      {step.step_headline}
                    </h3>
                  )}

                  {step.step_subline && (
                    <p className="text-lg leading-relaxed text-neutral-300 max-w-xl">
                      {step.step_subline}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end mt-8 lg:mt-0">
                  <StepVisual step={step} isActive={currentStep === index} />
                </div>
              </div>
            </Container>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartValveStory;
