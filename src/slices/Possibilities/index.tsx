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
    layout_style, 
    background_color 
  } = slice.primary;

  const layout = layout_style || "grid";
  const bgColor = background_color || "white";

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

  const renderPossibilityBlock = (item: any, index: number) => {
    const accentColor = accentColors[item.accent_color as keyof typeof accentColors] || "from-blue-500 to-blue-600";
    const isDark = bgColor === "dark";
    
    return (
      <FadeIn key={index}>
        <div className={clsx(
          "group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-105 h-full flex flex-col",
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
          
          {/* Icon */}
          {item.icon && (
            <div className="mb-6">
              <div className={clsx(
                "inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl bg-gradient-to-br text-white",
                accentColor
              )}>
                {item.icon}
              </div>
            </div>
          )}
          
          {/* Title */}
          {item.possibility_title && (
            <div className="mb-6">
              <h3 className={clsx(
                "text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r",
                accentColor
              )}>
                {item.possibility_title}
              </h3>
              {/* Text glow effect */}
              <div className={clsx(
                "absolute inset-0 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r opacity-30 blur-sm",
                accentColor
              )}>
                {item.possibility_title}
              </div>
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
          
          {/* Neon hover effect overlay */}
          <div className={clsx(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm",
            accentColor
          )} />
        </div>
      </FadeIn>
    );
  };

  const renderLayout = () => {
    switch (layout) {
      case "masonry":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {slice.items.map((item: any, index: number) => 
              renderPossibilityBlock(item, index)
            )}
          </div>
        );
      
      case "stacked":
        return (
          <div className="space-y-8">
            {slice.items.map((item: any, index: number) => (
              <div key={index} className="max-w-4xl mx-auto">
                {renderPossibilityBlock(item, index)}
              </div>
            ))}
          </div>
        );
      
      default: // grid
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {slice.items.map((item: any, index: number) => 
              renderPossibilityBlock(item, index)
            )}
          </div>
        );
    }
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
        
        {/* Possibilities Grid */}
        <FadeInStagger faster>
          {renderLayout()}
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default Possibilities;
