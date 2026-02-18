"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import clsx from "clsx";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>;
    }
  },
};

const PropertyIconMap: Record<string, React.ReactElement | null> = {
  weight: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  dimensions: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  height: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  power: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  voltage: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  current: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  resistance: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  electronics: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  motor: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  none: null,
};

const accentGradients: Record<string, string> = {
  blue: "from-indigo-600 via-blue-500 to-cyan-400",
  green: "from-teal-600 via-green-500 to-emerald-400",
  purple: "from-indigo-600 via-purple-500 to-violet-400",
  orange: "from-pink-600 via-red-500 to-orange-400",
  red: "from-purple-600 via-pink-500 to-red-400",
  yellow: "from-red-600 via-orange-500 to-yellow-400",
};

const gradientOrder = ["blue", "purple", "green", "orange", "red", "yellow"];

type SmartValveTechDescriptionProps = SliceComponentProps<any>;

const SmartValveTechDescription: FC<SmartValveTechDescriptionProps> = ({ slice }) => {
  const { title, description } = slice.primary;

  const groupedProperties: { [key: string]: any[] } = {};
  slice.items.forEach((property: any) => {
    const category = property.property_category || "General";
    if (!groupedProperties[category]) {
      groupedProperties[category] = [];
    }
    groupedProperties[category].push(property);
  });

  const categories = Object.entries(groupedProperties);

  const bgColor = slice.primary.background_color || "#0a0a0a";
  const effectiveIsDark = slice.primary.background_color
    ? (() => {
        const hex = (slice.primary.background_color as string).replace("#", "");
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        return lum < 0.5;
      })()
    : true;

  return (
    <div className="py-8 sm:py-12 lg:py-24" style={{ backgroundColor: bgColor }}>
      <Container>
        {/* Section header - SmartValve style */}
        <div className="text-center mb-16">
          {title && (
            <h2
              className={clsx(
                "text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight",
                effectiveIsDark ? "text-white" : "text-neutral-900"
              )}
            >
              {title}
            </h2>
          )}
          {description && (
            <div className={clsx("mt-6 text-xl max-w-3xl mx-auto", effectiveIsDark ? "text-neutral-400" : "text-neutral-600")}>
              <PrismicRichText field={description} components={components} />
            </div>
          )}
        </div>

        {/* Category cards - SmartValve style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categories.map(([category, properties], categoryIndex) => {
            const gradientKey = gradientOrder[categoryIndex % gradientOrder.length];
            const gradient = accentGradients[gradientKey] || accentGradients.blue;

            return (
              <div
                key={category}
                className={clsx(
                  "relative rounded-3xl border overflow-hidden",
                  effectiveIsDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"
                )}
              >
                <div className={clsx("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
                <div className="p-8 pt-10">
                  <h3
                    className={clsx(
                      "text-xl font-display font-bold mb-6",
                      effectiveIsDark ? "text-white" : "text-neutral-900"
                    )}
                  >
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {properties.map((property: any, index: number) => {
                      const iconKey = (property.property_icon as string) || "none";
                      const icon = PropertyIconMap[iconKey] ?? PropertyIconMap.none;
                      const isHighlight = property.highlight === true;

                      return (
                        <div
                          key={index}
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-xl",
                            isHighlight
                              ? effectiveIsDark
                                ? "bg-neutral-800/80 border border-neutral-700"
                                : "bg-neutral-100 border border-neutral-200"
                              : effectiveIsDark
                                ? "bg-neutral-800/40 border border-neutral-800"
                                : "bg-neutral-50 border border-neutral-100"
                          )}
                        >
                          {icon && (
                            <div
                              className={clsx(
                                "flex-shrink-0 p-1.5 rounded-lg",
                                effectiveIsDark ? "bg-neutral-700 text-neutral-400" : "bg-neutral-200 text-neutral-600"
                              )}
                            >
                              {icon}
                            </div>
                          )}
                          <div className="flex-1 flex justify-between items-center min-w-0 gap-4">
                            <span
                              className={clsx(
                                "text-sm font-medium truncate",
                                effectiveIsDark ? "text-neutral-300" : "text-neutral-700"
                              )}
                            >
                              {property.property_name}
                            </span>
                            <span
                              className={clsx(
                                "text-sm font-semibold flex-shrink-0",
                                effectiveIsDark ? "text-white" : "text-neutral-900"
                              )}
                            >
                              {property.property_value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default SmartValveTechDescription;
