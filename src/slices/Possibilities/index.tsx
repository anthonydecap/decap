"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState, useRef, useEffect, useCallback } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

import clsx from "clsx";

/** SmartValve gradient — distributed across cards so together they form the complete gradient */
const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];

function getGradientForCard(index: number, total: number): string {
  if (total <= 0) return `linear-gradient(to right, ${SMARTVALVE_GRADIENT[0]}, ${SMARTVALVE_GRADIENT[1]})`;
  const start = index / total;
  const end = (index + 1) / total;
  const fromIdx = Math.min(4, Math.floor(start * 6));
  let toIdx = Math.min(5, Math.floor(end * 6));
  if (toIdx <= fromIdx) toIdx = Math.min(5, fromIdx + 1);
  const from = SMARTVALVE_GRADIENT[fromIdx];
  const to = SMARTVALVE_GRADIENT[toIdx];
  return `linear-gradient(to right, ${from}, ${to})`;
}

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
 * Props for `Possibilities`.
 */
type PossibilitiesProps = SliceComponentProps<any>;

/**
 * Component for "Possibilities" Slices.
 */
const Possibilities: FC<PossibilitiesProps> = ({ slice }) => {
  const { 
    section_title, 
    section_subtitle, 
    background_color 
  } = slice.primary;

  const bgColor = background_color || "white";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Determine how many items to show based on screen size
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 768) return 1; // mobile: 1 item
    if (width < 1024) return 2; // tablet: 2 items
    return 3; // desktop: 3 items
  };

  const maxIndex = Math.max(0, slice.items.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Handle touch gestures
  const handleTouchStart = useRef({ x: 0, y: 0 });

  // Update itemsPerView on resize
  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView());
    };
    
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Add scroll event listeners
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Handle scroll/trackpad gestures
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaX !== 0) {
        if (e.deltaX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - handleTouchStart.current.x;
      const deltaY = touch.clientY - handleTouchStart.current.y;
      
      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      }
    };

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    carousel.addEventListener('touchstart', (e) => {
      handleTouchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
    carousel.addEventListener('touchend', handleTouchEnd);

    return () => {
      carousel.removeEventListener('wheel', handleWheel);
      carousel.removeEventListener('touchstart', (e) => {
        handleTouchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      });
      carousel.removeEventListener('touchmove', handleTouchMove);
      carousel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [maxIndex, nextSlide, prevSlide]);

  const backgroundClasses = {
    white: "bg-neutral-950",
    light: "bg-neutral-900",
    dark: "bg-neutral-950 text-white"
  };

  const renderPossibilityBlock = (item: any, index: number) => {
    const total = slice.items.length;
    const accentGradient = getGradientForCard(index, total);
    const isDark = bgColor === "dark";
    
    return (
      <FadeIn key={index}>
        <div className={clsx(
          "group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-105 h-full flex flex-col",
          isDark 
            ? "bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-2xl hover:shadow-3xl" 
            : "bg-neutral-900 border border-neutral-700 hover:border-neutral-600 shadow-2xl hover:shadow-3xl"
        )}>
          {/* SmartValve gradient accent line — each card = segment of full gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-1 shadow-lg"
            style={{ background: accentGradient }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-1 opacity-50 blur-sm"
            style={{ background: accentGradient }}
          />
          
          {/* Icon */}
          {item.icon && (
            <div className="mb-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl text-white"
                style={{ background: accentGradient }}
              >
                {item.icon}
              </div>
            </div>
          )}
          
          {/* Title */}
          {item.possibility_title && (
            <div className="relative mb-6">
              <div
                className="absolute inset-0 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight text-transparent bg-clip-text opacity-30 blur-sm pointer-events-none -z-10"
                style={{ backgroundImage: accentGradient }}
                aria-hidden
              >
                {item.possibility_title}
              </div>
              <h3
                className="relative text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight text-transparent bg-clip-text"
                style={{ backgroundImage: accentGradient }}
              >
                {item.possibility_title}
              </h3>
            </div>
          )}
          
          {/* Description */}
          {item.possibility_description && (
            <div className="text-lg leading-relaxed text-neutral-300 flex-grow">
              <PrismicRichText 
                field={item.possibility_description} 
                components={components}
              />
            </div>
          )}
          
          {/* Hover effect overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm pointer-events-none"
            style={{ background: accentGradient }}
          />
        </div>
      </FadeIn>
    );
  };

  const renderCarousel = () => {
    const showNavigation = slice.items.length > itemsPerView;

    return (
      <div className="relative overflow-visible">
        {/* Carousel Container */}
        <div ref={carouselRef} className="overflow-visible px-8 -mx-8">
          <div 
            className="flex gap-8 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(slice.items.length * 100) / itemsPerView}%`
            }}
          >
            {slice.items.map((item: any, index: number) => (
              <div 
                key={index} 
                className="flex-shrink-0"
                style={{ 
                  width: `${100 / slice.items.length}%`,
                  padding: '0 0.5rem' // Add small padding to prevent hover clipping
                }}
              >
                {renderPossibilityBlock(item, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        {showNavigation && (
          <div className="flex items-center justify-between mt-8">
            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
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

            {/* Dual Control Buttons */}
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
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

              {/* Next Button */}
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
  };

  return (
    <div className={clsx("py-16 sm:py-24 lg:py-32", backgroundClasses[bgColor as keyof typeof backgroundClasses])}>
      <Container className="overflow-visible">
        {/* Section Header */}
        {(section_title || section_subtitle) && (
          <div className="text-center mb-16">
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
                <div className="max-w-3xl mx-auto text-xl text-neutral-600">
                  <PrismicRichText 
                    field={section_subtitle} 
                    components={components}
                  />
                </div>
              )}
            </FadeIn>
          </div>
        )}
        
        {/* Possibilities Carousel */}
        <FadeInStagger faster>
          {renderCarousel()}
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default Possibilities;
