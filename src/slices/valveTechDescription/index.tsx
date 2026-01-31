/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import type { Content } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import clsx from "clsx";

// SmartValve specific icons
const PropertyIconMap = {
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

/**
 * Props for `ValveTechDescription`.
 */
type ValveTechDescriptionProps =
  SliceComponentProps<Content.ValveTechDescriptionSlice>;

/**
 * Component for "ValveTechDescription" Slices.
 */
const ValveTechDescription: FC<ValveTechDescriptionProps> = ({ slice }) => {
  const { title, invert } = slice.primary;

  // Group properties by category
  const groupedProperties: { [key: string]: any[] } = {};
  slice.items.forEach((property) => {
    const category = property.property_category || "General";
    if (!groupedProperties[category]) {
      groupedProperties[category] = [];
    }
    groupedProperties[category].push(property);
  });

  return (
    <Container className="py-16 sm:py-20">
      {title && (
        <div
          className={clsx(
            "mb-8 text-center text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight",
            invert ? "text-white" : "text-neutral-900"
          )}
        >
          {title}
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedProperties).map(([category, properties]) => (
          <div key={category} className="space-y-4">
            <h3
              className={clsx(
                "text-lg font-medium mb-4 pb-2 border-b",
                invert ? "text-white/80 border-white/20" : "text-neutral-700 border-neutral-200"
              )}
            >
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {properties.map((property, index) => {
                const iconKey = property.property_icon as keyof typeof PropertyIconMap;
                const icon = PropertyIconMap[iconKey] || PropertyIconMap.none;
                
                return (
                  <div
                    key={index}
                    className={clsx(
                      "group flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                      invert
                        ? "bg-white/5 hover:bg-white/10 border border-white/10"
                        : "bg-neutral-50/50 hover:bg-neutral-100/50 border border-neutral-200/50"
                    )}
                  >
                    {icon && (
                      <div
                        className={clsx(
                          "flex-shrink-0 p-1.5 rounded-md",
                          invert
                            ? "bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white"
                            : "bg-neutral-200/50 text-neutral-600 group-hover:bg-neutral-300/50 group-hover:text-neutral-800"
                        )}
                      >
                        {icon}
                      </div>
                    )}
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <span
                        className={clsx(
                          "text-sm font-medium truncate",
                          invert ? "text-white/80" : "text-neutral-700"
                        )}
                      >
                        {property.property_name}
                      </span>
                      <span
                        className={clsx(
                          "text-sm font-semibold ml-2 flex-shrink-0",
                          invert ? "text-white" : "text-neutral-900"
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
        ))}
      </div>
    </Container>
  );
};

export default ValveTechDescription;
