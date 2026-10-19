"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import Hls from "hls.js";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Pause, Play } from "@phosphor-icons/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import clsx from "clsx";

/** SmartValve gradient — stretched across all step rules so together they read as one line */
const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];
const FULL_GRADIENT = `linear-gradient(to right, ${SMARTVALVE_GRADIENT.join(", ")})`;

/** How long a step without video stays on screen before advancing */
const IMAGE_STEP_SECONDS = 6;

function getGradientSegment(index: number, total: number) {
  if (total <= 1) return { background: FULL_GRADIENT };
  return {
    background: FULL_GRADIENT,
    backgroundSize: `${total * 100}% 100%`,
    backgroundPosition: `${(index / (total - 1)) * 100}% 0`,
  };
}

/** Static class map so Tailwind can see every column count */
const stepColumns: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

const isHlsUrl = (url: string) => typeof url === "string" && url.includes(".m3u8");

/** false on the server and during hydration, true afterwards */
const subscribeNoop = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribeNoop, () => true, () => false);

function isDarkBackground(color?: string | null): boolean {
  if (!color) return true;
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data} className="underline underline-offset-4">
      {children}
    </PrismicNextLink>
  ),
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

const FALLBACK_STEPS = [
  {
    step_headline: "MIDI command → target pressure",
    step_subline:
      "Every note begins as a pressure curve with attack, decay, sustain and release. Not an on/off.",
  },
  {
    step_headline: "Voice-coil motor → ultra-fast control",
    step_subline:
      "A loudspeaker-like motor moves a featherweight piston to shape airflow continuously.",
  },
  {
    step_headline: "Pressure sensor → real-time regulation",
    step_subline:
      "Wind is measured 9,000×/s and corrected 2,000×/s, so actual pressure follows the curve exactly.",
  },
  {
    step_headline: "Real wind control → living sound",
    step_subline:
      "Because SmartValve regulates pressure, pipes breathe, swell and speak with natural expression.",
  },
];

type StepMediaProps = {
  step: any;
  isActive: boolean;
  isPlaying: boolean;
  progress: MotionValue<number>;
  onDone: () => void;
};

/**
 * Video or image for one step, unframed so black video blends into the section.
 * The video source is only set the first time the step becomes active, so later
 * steps don't download up front. Reports playback into `progress` (no re-renders).
 */
const StepMedia: FC<StepMediaProps> = ({ step, isActive, isPlaying, progress, onDone }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasActivated, setHasActivated] = useState(isActive);
  const videoUrl: string | undefined = step.step_video?.url;
  const isClient = useIsClient();
  const useHls = Boolean(videoUrl && isHlsUrl(videoUrl));
  // Only decidable in the browser; keeps server and client markup identical
  const hasNativeHls = isClient && useHls && !Hls.isSupported();

  // Latch once active (adjusting state during render, per React docs)
  if (isActive && !hasActivated) setHasActivated(true);

  // HLS: attach hls.js so .m3u8 plays in Chrome/Firefox (Safari plays it natively via src)
  useEffect(() => {
    if (!isClient || !hasActivated || !useHls || hasNativeHls || !videoUrl || !videoRef.current) return;
    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(videoRef.current);
    return () => hls.destroy();
  }, [isClient, hasActivated, useHls, hasNativeHls, videoUrl]);

  // Each time the step comes in, start from the top
  useEffect(() => {
    if (isActive && videoRef.current) videoRef.current.currentTime = 0;
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && isPlaying) video.play().catch(() => {});
    else video.pause();
  }, [isActive, isPlaying, hasActivated, isClient]);

  // Video progress -> motion value, every frame while active
  useEffect(() => {
    const video = videoRef.current;
    if (!videoUrl || !isActive || !video) return;
    let frame = 0;
    const tick = () => {
      if (video.duration) progress.set(video.currentTime / video.duration);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [videoUrl, isActive, progress]);

  // Image (or empty) step: timed progress, resumes where it paused
  useEffect(() => {
    if (videoUrl || !isActive || !isPlaying) return;
    const controls = animate(progress, 1, {
      duration: IMAGE_STEP_SECONDS * (1 - progress.get()),
      ease: "linear",
      onComplete: onDone,
    });
    return () => controls.stop();
  }, [videoUrl, isActive, isPlaying, progress, onDone]);

  if (videoUrl) {
    const src = isClient && hasActivated && (!useHls || hasNativeHls) ? videoUrl : undefined;
    return (
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src={src}
        muted
        playsInline
        preload="none"
        poster={step.step_image?.url}
        onEnded={() => isActive && onDone()}
        aria-label={step.step_headline || undefined}
      />
    );
  }

  if (step.step_image?.url) {
    return (
      <PrismicNextImage
        field={step.step_image}
        fallbackAlt=""
        sizes="(min-width: 1280px) 1200px, 100vw"
        className="h-full w-full object-contain"
      />
    );
  }

  return null;
};

type SmartValveStoryProps = SliceComponentProps<any>;

/**
 * SmartValveStory — "How it works" as a horizontal player.
 * One media stage on top; the steps sit in a row underneath, each with a rule that
 * fills while its video plays, then hands over to the next step. Click to jump.
 */
const SmartValveStory: FC<SmartValveStoryProps> = ({ slice }) => {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const steps: any[] = slice.items.length > 0 ? slice.items : FALLBACK_STEPS;

  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const progress = useMotionValue(0);

  const sectionRef = useRef<HTMLElement>(null);
  const stepsRowRef = useRef<HTMLOListElement>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });

  // Reduced motion: start paused until the visitor presses play
  const paused = userPaused ?? Boolean(shouldReduceMotion);
  const isPlaying = inView && !paused;

  const bgColor = background_color || "#0a0a0a";
  const isDark = isDarkBackground(background_color);

  const goTo = useCallback(
    (index: number) => {
      progress.set(0);
      setActiveStep(index);
    },
    [progress]
  );

  const next = useCallback(() => {
    progress.set(0);
    setActiveStep((current) => (current + 1) % steps.length);
  }, [progress, steps.length]);

  // Mobile: keep the active step visible in the swipeable row
  useEffect(() => {
    const row = stepsRowRef.current;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const item = row.children[activeStep] as HTMLElement | undefined;
    if (item) row.scrollTo({ left: item.offsetLeft - row.offsetLeft, behavior: "smooth" });
  }, [activeStep]);

  return (
    <section
      ref={sectionRef}
      className={clsx("py-16 sm:py-24 lg:py-32", isDark ? "text-white" : "text-neutral-900")}
      style={{ backgroundColor: bgColor }}
    >
      <Container>
        {(section_title || section_subtitle) && (
          <FadeIn className="max-w-3xl">
            {section_title && (
              <div className="font-display text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
                <PrismicRichText field={section_title} components={components} />
              </div>
            )}
            {section_subtitle && (
              <div
                className={clsx(
                  "mt-6 max-w-[60ch] text-lg leading-relaxed sm:text-xl",
                  isDark ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                <PrismicRichText field={section_subtitle} components={components} />
              </div>
            )}
          </FadeIn>
        )}

        {/* Media stage — unframed, media crossfades in place. On dark sections the media
            blends with "lighten" against the section colour, so the videos' pure-black
            background turns into the slice background instead of a darker rectangle. */}
        <FadeIn
          className="relative mt-12 aspect-video max-h-[65dvh] w-full isolate sm:mt-16"
          style={{ backgroundColor: bgColor }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={clsx("absolute inset-0", isDark && "mix-blend-lighten")}
              initial={false}
              animate={{ opacity: activeStep === index ? 1 : 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden={activeStep !== index}
            >
              <StepMedia
                step={step}
                isActive={activeStep === index}
                isPlaying={isPlaying}
                progress={progress}
                onDone={next}
              />
            </motion.div>
          ))}

          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            aria-label={paused ? "Play" : "Pause"}
            className={clsx(
              "absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              isDark
                ? "bg-neutral-900/70 text-white hover:bg-neutral-800 focus-visible:outline-white"
                : "bg-white/80 text-neutral-900 hover:bg-white focus-visible:outline-neutral-900"
            )}
          >
            {paused ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}
          </button>
        </FadeIn>

        {/* Steps — swipeable row on mobile, even columns on desktop */}
        <ol
          ref={stepsRowRef}
          className={clsx(
            "-mx-6 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mt-12",
            "lg:mx-0 lg:grid lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0",
            stepColumns[steps.length] ?? "lg:grid-cols-4"
          )}
        >
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isPast = index < activeStep;
            return (
              <li key={index} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-current={isActive ? "step" : undefined}
                  className={clsx(
                    "group block w-full pt-6 text-left transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-4",
                    isDark ? "focus-visible:outline-white" : "focus-visible:outline-neutral-900",
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-90"
                  )}
                >
                  {/* Rule: track + fill (active follows playback, past stays full) */}
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "relative block h-px w-full overflow-hidden",
                      isDark ? "bg-neutral-800" : "bg-neutral-200"
                    )}
                  >
                    <motion.span
                      className="absolute inset-0 origin-left"
                      style={{
                        ...getGradientSegment(index, steps.length),
                        scaleX: isActive ? progress : isPast ? 1 : 0,
                      }}
                    />
                  </span>

                  <span className="mt-5 block font-display text-lg font-semibold leading-snug text-balance">
                    {step.step_headline}
                  </span>
                  {step.step_subline && (
                    <span
                      className={clsx(
                        "mt-2 block text-sm leading-relaxed",
                        isDark ? "text-neutral-400" : "text-neutral-600"
                      )}
                    >
                      {step.step_subline}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
};

export default SmartValveStory;
