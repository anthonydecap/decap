"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps, type JSXMapSerializer } from "@prismicio/react";
import { isFilled } from "@prismicio/client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { Container } from "@/components/Container";

/** ~header offset: MotionLayout pt-14 + inner pt-9 + safe breathing room */
const HEADER_OFFSET = "calc(3.5rem + 2.25rem + 0.5rem)";

const richComponents: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-200">{children}</code>
    ) : null,
};

function resolveMuxHlsUrl(raw: string | undefined | null): string | null {
  const s = (raw || "").trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://stream.mux.com/${s}.m3u8`;
}

function collectCarouselImages(slide: any): any[] {
  return [slide.image_1, slide.image_2, slide.image_3, slide.image_4, slide.image_5].filter(
    (img) => img?.url,
  );
}

function MuxVideoLayer({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let destroyed = false;
    let hls: import("hls.js").default | null = null;

    const setup = async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        try {
          await video.play();
        } catch {
          /* autoplay policy */
        }
        return;
      }
      const Hls = (await import("hls.js")).default;
      if (destroyed || !Hls.isSupported()) return;
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    };

    setup();

    return () => {
      destroyed = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={clsx(className, "min-h-full min-w-full")}
      playsInline
      muted
      loop
      autoPlay
      controls={false}
      aria-hidden
    />
  );
}

const MEDIA_EASE = [0.22, 1, 0.36, 1] as const;

/** Inner carousel — same frame as video; enters from the right with fade */
function ImageCrossfade({
  images,
  index,
  reducedMotion,
  isFirstSlide,
}: {
  images: any[];
  index: number;
  reducedMotion: boolean;
  isFirstSlide: boolean;
}) {
  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={`${images[index]?.url}-${index}`}
        className="absolute inset-0 overflow-hidden bg-black"
        style={{ transformOrigin: "100% 50%" }}
        initial={
          reducedMotion
            ? false
            : { opacity: 0, x: 48, scale: 0.99, filter: "blur(8px)" }
        }
        animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
        exit={reducedMotion ? undefined : { opacity: 0, x: -24, filter: "blur(4px)" }}
        transition={{ duration: reducedMotion ? 0 : 0.85, ease: MEDIA_EASE }}
      >
        {images[index]?.url && (
          <div className="absolute inset-0 overflow-hidden">
            <PrismicNextImage
              field={images[index]}
              fill
              sizes="(min-width: 1280px) 65vw, (min-width: 1024px) 70vw, 100vw"
              className="object-cover object-center"
              alt=""
              priority={isFirstSlide && index === 0}
              loading={isFirstSlide && index === 0 ? "eager" : undefined}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

type HomeLandingProps = SliceComponentProps<any>;

const HomeLanding: FC<HomeLandingProps> = ({ slice }) => {
  const p = slice.primary as any;
  const items = (slice.items || []) as any[];

  const slideInterval = Math.max(4, Number(p.slide_interval_seconds) || 8) * 1000;
  const innerInterval = Math.max(2, Number(p.inner_image_interval_seconds) || 5) * 1000;
  const autoplay = p.autoplay !== false;
  const pauseOnHover = p.pause_on_hover !== false;
  const showDots = p.show_dots !== false;
  const showArrows = p.show_arrows !== false;
  const reduceMotion = useReducedMotion();

  const slides = useMemo(
    () =>
      items.filter((s) => {
        const imgs = collectCarouselImages(s);
        const mux = resolveMuxHlsUrl(s.mux_hls_url);
        const mode = s.media_type || "image_carousel";
        const hasMedia =
          (mode === "mux_video" && mux) || (mode !== "mux_video" && imgs.length > 0);
        const hasTitle = !!(s.title && String(s.title).trim());
        return hasTitle || hasMedia;
      }),
    [items],
  );

  const [active, setActive] = useState(0);
  const [innerIdx, setInnerIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const current = slides[active];
  const images = current ? collectCarouselImages(current) : [];
  const mediaMode = current?.media_type || "image_carousel";
  const muxUrl = mediaMode === "mux_video" ? resolveMuxHlsUrl(current?.mux_hls_url) : null;
  const isVideo = Boolean(muxUrl);

  useEffect(() => {
    if (!current || isVideo || images.length <= 1 || reduceMotion || paused || !autoplay) return;
    const t = window.setInterval(() => {
      setInnerIdx((i) => (i + 1) % images.length);
    }, innerInterval);
    return () => window.clearInterval(t);
  }, [current, images.length, innerInterval, isVideo, reduceMotion, paused, autoplay]);

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion || paused || !autoplay) return;
    const t = window.setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
      setInnerIdx(0);
    }, slideInterval);
    return () => window.clearInterval(t);
  }, [slides.length, slideInterval, reduceMotion, paused, autoplay]);

  const go = useCallback(
    (dir: -1 | 1) => {
      const n = slides.length;
      if (!n) return;
      setActive((a) => (a + dir + n) % n);
      setInnerIdx(0);
    },
    [slides.length],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    [go],
  );

  if (!slides.length) {
    return (
      <section className="relative flex min-h-[50vh] items-center justify-center text-neutral-500">
        <p className="text-sm">Add slides in Prismic to build your home hero.</p>
      </section>
    );
  }

  const hasCta = current?.cta_text && current?.cta_link && isFilled.link(current.cta_link);

  return (
    <section
      className="relative w-full overflow-hidden text-white"
      style={{
        minHeight: `calc(100dvh - ${HEADER_OFFSET})`,
      }}
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onKeyDown={onKeyDown}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      tabIndex={0}
      ref={carouselRef}
    >
      <Container className="relative z-10 flex min-h-[inherit] flex-col justify-center py-10 sm:py-14 lg:py-16">
        {/* Editorial overlap: large cinematic media + glass copy card (not full-bleed, not tiny TV) */}
        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-0 lg:min-h-[min(68vh,880px)]">
          {/* Copy — frosted panel: readable on white pages when slice bg was transparent */}
          <div className="order-2 flex flex-col justify-center lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:z-20 lg:-mr-4 xl:-mr-8">
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {current?.eyebrow && (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400 sm:mb-4 sm:text-sm">
                      {current.eyebrow}
                    </p>
                  )}

                  {current?.title && (
                    <>
                      {active === 0 ? (
                        <h1 className="font-display text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-white">
                          {current.title}
                        </h1>
                      ) : (
                        <p
                          className="font-display text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-white"
                          role="heading"
                          aria-level={2}
                        >
                          {current.title}
                        </p>
                      )}
                    </>
                  )}

                  {current?.subtitle?.length > 0 && (
                    <div className="mt-4 max-w-md text-base leading-relaxed text-neutral-200 sm:mt-5 sm:text-lg">
                      <PrismicRichText field={current.subtitle} components={richComponents} />
                    </div>
                  )}

                  {hasCta && (
                    <div className="mt-8 sm:mt-10">
                      <PrismicNextLink
                        field={current.cta_link}
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 transition hover:-translate-y-0.5 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-8 sm:py-4 sm:text-base"
                      >
                        {current.cta_text}
                        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </PrismicNextLink>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Media: fixed frame (identical for every asset) + fade/slide in from the right */}
          <div className="order-1 w-full min-w-0 lg:col-span-9 lg:col-start-4 lg:row-start-1 lg:self-center">
            <div className="relative flex w-full justify-end">
              {/* Left-rounded only: reads as a panel sliding in from the right, not a floating box */}
              <div
                className="relative w-full overflow-hidden rounded-l-2xl bg-black sm:rounded-l-3xl"
                style={{ transformOrigin: "100% 50%" }}
              >
                {/* Locked height + width — intrinsic media cannot resize this */}
                <div className="relative isolate h-[clamp(280px,52vh,640px)] w-full shrink-0 sm:h-[clamp(320px,54vh,700px)] lg:h-[clamp(380px,58vh,780px)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${active}-${isVideo ? String(muxUrl) : "img"}`}
                      className="absolute inset-0 overflow-hidden"
                      style={{ transformOrigin: "100% 50%" }}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, x: 64, scale: 0.98, filter: "blur(10px)" }
                      }
                      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -32, filter: "blur(6px)" }}
                      transition={{ duration: reduceMotion ? 0 : 0.8, ease: MEDIA_EASE }}
                    >
                      {isVideo && muxUrl ? (
                        <MuxVideoLayer
                          src={muxUrl}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                      ) : images.length > 0 ? (
                        <div className="relative h-full w-full">
                          <ImageCrossfade
                            images={images}
                            index={innerIdx % images.length}
                            reducedMotion={!!reduceMotion}
                            isFirstSlide={active === 0}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-sm text-neutral-500">
                          Add images or Mux URL
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {showArrows && slides.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-5">
          <button
            type="button"
            onClick={() => go(-1)}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {showDots && slides.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-full bg-neutral-950 px-3 py-2 sm:bottom-8"
          role="tablist"
          aria-label="Slides"
        >
          {slides.map((_, i) => (
            <button
              key={`${id}-dot-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to slide ${i + 1}`}
              className={clsx(
                "h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                i === active ? "w-8 bg-white" : "w-2 bg-neutral-500 hover:bg-neutral-400",
              )}
              onClick={() => {
                setActive(i);
                setInnerIdx(0);
              }}
            />
          ))}
        </div>
      )}

      {slides.length > 1 && (
        <div className="pointer-events-none absolute bottom-6 right-5 z-30 hidden rounded-md bg-neutral-950 px-2 py-1 text-xs text-neutral-300 sm:bottom-8 sm:block">
          {active + 1} / {slides.length}
        </div>
      )}
    </section>
  );
};

export default HomeLanding;
