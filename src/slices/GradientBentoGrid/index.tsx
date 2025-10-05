"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage } from "@prismicio/next";
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
 * Props for `GradientBentoGrid`.
 */
type GradientBentoGridProps = SliceComponentProps<any>;

/**
 * Component for "GradientBentoGrid" Slices.
 */
const GradientBentoGrid: FC<GradientBentoGridProps> = ({ slice }) => {
  const { 
    section_title, 
    section_subtitle, 
    background_color 
  } = slice.primary;

  const bgColor = background_color || "dark";

  const backgroundClasses = {
    white: "bg-neutral-950",
    light: "bg-neutral-900",
    dark: "bg-neutral-950 text-white"
  };

  const accentColors = {
    blue: "from-cyan-400 via-blue-500 to-indigo-600",
    green: "from-emerald-400 via-green-500 to-teal-600",
    purple: "from-violet-400 via-purple-500 to-indigo-600",
    orange: "from-orange-400 via-red-500 to-pink-600",
    red: "from-red-400 via-pink-500 to-purple-600",
    yellow: "from-yellow-400 via-orange-500 to-red-600"
  };

  const renderBentoItem = (item: any, index: number) => {
    const accentColor = accentColors[item.accent_color as keyof typeof accentColors] || "from-blue-500 to-blue-600";
    const isDark = bgColor === "dark";
    const hasImage = item.item_image?.url;
    const hasIcon = item.icon;
    const hasText = item.item_title || item.item_description;
    
    // Apple-style bento grid size classes (same as EnhancedBentoGrid)
    const sizeClasses = {
      small: "sm:col-span-1 lg:col-span-1 xl:col-span-1",
      medium: "sm:col-span-1 lg:col-span-2 xl:col-span-2",
      large: "sm:col-span-2 lg:col-span-2 xl:col-span-3",
      xlarge: "sm:col-span-2 lg:col-span-4 xl:col-span-4",
      tall: "sm:col-span-1 lg:col-span-1 xl:col-span-1 sm:row-span-2 lg:row-span-2 xl:row-span-2",
      wide: "sm:col-span-2 lg:col-span-3 xl:col-span-3",
      big: "sm:col-span-2 lg:col-span-3 xl:col-span-3 sm:row-span-2 lg:row-span-2 xl:row-span-2",
    };

    const gridSize = item.item_size || "medium";
    const gridClasses = sizeClasses[gridSize as keyof typeof sizeClasses];

    return (
      <FadeIn key={index}>
        <div className={clsx(
          "group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-105 h-full flex flex-col",
          gridClasses,
          "min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]",
          gridSize === "tall" && "min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]",
          gridSize === "big" && "min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]",
          isDark 
            ? "bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-2xl hover:shadow-3xl" 
            : "bg-neutral-900 border border-neutral-700 hover:border-neutral-600 shadow-2xl hover:shadow-3xl"
        )}>
          {/* Neon gradient accent line */}
          <div className={clsx(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r shadow-lg",
            accentColor
          )} />
          {/* Neon glow effect */}
          <div className={clsx(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50 blur-sm",
            accentColor
          )} />
          
          {/* Content container */}
          <div className="flex flex-col h-full p-6">
            {/* Icon */}
            {hasIcon && (
              <div className="mb-4">
                <div className={clsx(
                  "inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl bg-gradient-to-br text-white",
                  accentColor
                )}>
                  {item.icon}
                </div>
              </div>
            )}
            
            {/* Image */}
            {hasImage && (
              <div className="mb-4 flex-grow">
                <div className="h-full rounded-2xl bg-neutral-100/50 overflow-hidden">
                  <PrismicNextImage
                    field={item.item_image}
                    className="h-full w-full object-cover"
                    priority={index < 2}
                    alt={item.item_title || "Bento item image"}
                  />
                </div>
              </div>
            )}
            
            {/* Text content */}
            {hasText && (
              <div className="flex-grow">
                {/* Title */}
                {item.item_title && (
                  <div className="mb-3">
                    <h3 className={clsx(
                      "text-xl sm:text-2xl font-display font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r",
                      accentColor
                    )}>
                      {item.item_title}
                    </h3>
                  </div>
                )}
                
                {/* Description */}
                {item.item_description && (
                  <div className="text-sm leading-relaxed text-neutral-300">
                    <PrismicRichText 
                      field={item.item_description} 
                      components={components}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Neon hover effect overlay */}
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm",
            accentColor
          )} />
        </div>
      </FadeIn>
    );
  };

  return (
    <div className={clsx("py-16 sm:py-24 lg:py-32", backgroundClasses[bgColor as keyof typeof backgroundClasses])}>
      <Container>
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
        
        {/* Bento Grid */}
        <FadeInStagger faster>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 auto-rows-auto">
            {slice.items.map((item: any, index: number) => 
              renderBentoItem(item, index)
            )}
          </div>
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default GradientBentoGrid;
