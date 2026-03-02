"use client";

import { useRef, useState, useCallback, useEffect, Children, type ReactNode } from "react";
import clsx from "clsx";

const GAP = 12;
const MIN_CARD_WIDTH = 280;

function getItemsPerView(): number {
  if (typeof window === "undefined") return 1;
  const width = window.innerWidth;
  if (width < 768) return 1;
  if (width < 1024) return 2;
  return 3;
}

/** Card width so that exactly itemsPerView cards fill the container edge-to-edge with GAP between */
function getCardWidth(containerWidth: number, itemsPerView: number): number {
  if (containerWidth <= 0) return 360;
  const totalGap = (itemsPerView - 1) * GAP;
  const w = (containerWidth - totalGap) / itemsPerView;
  return Math.max(MIN_CARD_WIDTH, w);
}

type BlogCarouselProps = {
  children: ReactNode;
  className?: string;
};

/** Client carousel with curve/depth effect and same controls as smartValvePossibilities (dots + prev/next). */
export function BlogCarousel({ children, className = "" }: BlogCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    setContainerWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setContainerWidth(el.clientWidth);
    setScrollLeft(el.scrollLeft);
    setItemsPerView(getItemsPerView());
    const ro = new ResizeObserver(() => {
      if (scrollRef.current) {
        setContainerWidth(scrollRef.current.clientWidth);
        setItemsPerView(getItemsPerView());
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => setItemsPerView(getItemsPerView());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const items = Children.toArray(children);
  const count = items.length;
  const cardWidth = getCardWidth(containerWidth, itemsPerView);
  const itemWidth = cardWidth + GAP;
  const pageScrollDistance = itemsPerView * itemWidth; // scroll by one "page" of items
  const maxIndex = Math.max(0, count - itemsPerView);
  const currentIndex = Math.min(
    maxIndex,
    Math.max(0, Math.round(scrollLeft / pageScrollDistance))
  );
  const showNavigation = count > itemsPerView;

  const totalTrackWidth = count * cardWidth + (count - 1) * GAP;
  const maxScroll = Math.max(0, totalTrackWidth - containerWidth);

  const scrollToPage = useCallback(
    (pageIndex: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const page = Math.min(maxIndex, Math.max(0, pageIndex));
      const target = Math.min(page * pageScrollDistance, maxScroll);
      el.scrollTo({ left: target, behavior: "smooth" });
    },
    [maxIndex, maxScroll, pageScrollDistance]
  );

  const nextSlide = useCallback(() => {
    scrollToPage(currentIndex + 1);
  }, [currentIndex, scrollToPage]);

  const prevSlide = useCallback(() => {
    scrollToPage(currentIndex - 1);
  }, [currentIndex, scrollToPage]);

  const viewportCenter = scrollLeft + containerWidth / 2;

  return (
    <div className={clsx("relative overflow-visible", className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto overflow-y-hidden pb-6 -mx-4 sm:-mx-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          perspective: "1200px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          className="flex flex-nowrap"
          style={{
            gap: GAP,
            transformStyle: "preserve-3d",
            perspectiveOrigin: "center center",
          }}
        >
          {items.map((child, index) => {
            const cardCenter = index * itemWidth + cardWidth / 2;
            const distance = cardCenter - viewportCenter;
            const normalized = Math.abs(distance) / (cardWidth * 0.8);
            const t = Math.min(1, normalized);
            const scale = 1 - 0.18 * t;
            const opacity = 1 - 0.25 * t;
            const rotateY = (distance / (cardWidth * 2)) * 12;
            const z = -Math.abs(distance) * 0.15;

            return (
              <div
                key={index}
                className="flex-shrink-0 snap-center transition-transform duration-200 ease-out"
                style={{
                  width: cardWidth,
                  transform: `perspective(1200px) translateZ(${z}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity,
                  transformStyle: "preserve-3d",
                }}
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>

      {/* Same controls as smartValvePossibilities: dots + prev/next */}
      {showNavigation && (
        <div className="flex items-center justify-between mt-8">
          <div className="flex space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToPage(index)}
                className={clsx(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-neutral-600 hover:bg-neutral-500"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={clsx(
                "w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700",
                "flex items-center justify-center text-white",
                "hover:bg-neutral-700 hover:border-neutral-600 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-800",
                "shadow-lg hover:shadow-xl"
              )}
              aria-label="Previous items"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className={clsx(
                "w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700",
                "flex items-center justify-center text-white",
                "hover:bg-neutral-700 hover:border-neutral-600 transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-800",
                "shadow-lg hover:shadow-xl"
              )}
              aria-label="Next items"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
