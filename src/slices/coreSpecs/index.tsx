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
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
  ),
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

// Technical specification icons
const SpecIconMap = {
  power: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  dimensions: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  weight: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  frequency: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l3-3 3 3v13M9 19h6M9 19H4a1 1 0 01-1-1v-6a1 1 0 011-1h5M20 19h-1a1 1 0 01-1-1v-8a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1z" />
    </svg>
  ),
  temperature: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  humidity: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  material: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  connector: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  battery: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  certification: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  none: null,
};

// Group specifications by category
const groupSpecsByCategory = (specs: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  specs.forEach((spec) => {
    const category = spec.spec_category || "General";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(spec);
  });
  return grouped;
};

/**
 * Component for "CoreSpecs" Slices.
 *
 * Smart Valve "tech description" category-card look, standard (light) theme,
 * no gradient: specs are grouped by category into rounded cards, each with a
 * solid neutral top accent bar, and rendered as icon-chip property rows.
 * Supports the grid / list / cards layout options and `invert` (dark) theme.
 */
const CoreSpecs: FC<SliceComponentProps<any>> = ({ slice }) => {
  const {
    title,
    eyebrow,
    description,
    invert,
    layout = "grid",
    columns = "2",
    background_color,
  } = slice.primary;

  const groupedSpecs = groupSpecsByCategory(slice.items);

  const getColumnClasses = (cols: string) => {
    switch (cols) {
      case "1":
        return "grid-cols-1";
      case "2":
        return "grid-cols-1 md:grid-cols-2";
      case "3":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  // A single property row — icon chip + name/description + value.
  const renderSpecRow = (spec: any, index: number) => {
    const iconKey = spec.spec_icon as keyof typeof SpecIconMap;
    const icon = SpecIconMap[iconKey] || SpecIconMap.none;
    const isHighlighted = Boolean(spec.highlight);

    return (
      <div
        key={index}
        className={clsx(
          "flex items-start gap-3 rounded-xl border p-3 transition-colors duration-300",
          isHighlighted
            ? invert
              ? "border-neutral-700 bg-neutral-800"
              : "border-neutral-200 bg-neutral-100"
            : invert
              ? "border-neutral-800 bg-neutral-800/40"
              : "border-neutral-100 bg-neutral-50",
        )}
      >
        {icon && (
          <div
            className={clsx(
              "flex-shrink-0 rounded-lg p-1.5",
              invert
                ? "bg-neutral-800 text-neutral-200"
                : "bg-neutral-100 text-neutral-700",
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span
              className={clsx(
                "text-sm font-medium",
                invert ? "text-neutral-300" : "text-neutral-700",
              )}
            >
              {spec.spec_title}
            </span>
            {spec.spec_value && (
              <span
                className={clsx(
                  "flex-shrink-0 text-sm font-semibold text-right",
                  invert ? "text-white" : "text-neutral-900",
                )}
              >
                {spec.spec_value}
              </span>
            )}
          </div>
          {spec.spec_description && (
            <div
              className={clsx(
                "text-sm leading-relaxed",
                invert ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              <PrismicRichText
                field={spec.spec_description}
                components={components}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // A category card — rounded card, solid neutral accent bar, heading, rows.
  const renderCategoryCard = (
    category: string,
    specs: any[],
    showHeading: boolean,
  ) => (
    <FadeIn key={category}>
      <div
        className={clsx(
          "relative overflow-hidden rounded-2xl border lg:rounded-3xl",
          invert
            ? "border-neutral-800 bg-neutral-900"
            : "border-neutral-200 bg-white shadow-sm",
        )}
      >
        <div
          className={clsx(
            "h-1 w-full",
            invert ? "bg-neutral-700" : "bg-neutral-200",
          )}
        />
        <div className="p-6 sm:p-8">
          {showHeading && category !== "General" && (
            <h3
              className={clsx(
                "mb-6 font-display text-xl font-bold sm:text-2xl",
                invert ? "text-white" : "text-neutral-950",
              )}
            >
              {category}
            </h3>
          )}
          <div className="space-y-3">
            {specs.map((spec: any, index: number) => renderSpecRow(spec, index))}
          </div>
        </div>
      </div>
    </FadeIn>
  );

  // Cards layout — one category card per category, two-up on large screens.
  const renderCardsLayout = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      {Object.entries(groupedSpecs).map(([category, specs]) =>
        renderCategoryCard(category, specs, true),
      )}
    </div>
  );

  // List layout — grouped rows, one column, category headings inline.
  const renderListLayout = () => (
    <div className="mx-auto max-w-3xl space-y-6">
      {Object.entries(groupedSpecs).map(([category, specs]) =>
        renderCategoryCard(category, specs, true),
      )}
    </div>
  );

  // Grid layout — all specs as rows in a column grid, ignoring category groups.
  const renderGridLayout = () => (
    <FadeIn>
      <div
        className={clsx(
          "relative overflow-hidden rounded-2xl border lg:rounded-3xl",
          invert
            ? "border-neutral-800 bg-neutral-900"
            : "border-neutral-200 bg-white shadow-sm",
        )}
      >
        <div
          className={clsx(
            "h-1 w-full",
            invert ? "bg-neutral-700" : "bg-neutral-200",
          )}
        />
        <div
          className={clsx(
            "grid gap-3 p-6 sm:p-8",
            getColumnClasses(columns || "2"),
          )}
        >
          {slice.items.map((spec: any, index: number) =>
            renderSpecRow(spec, index),
          )}
        </div>
      </div>
    </FadeIn>
  );

  return (
    <div
      className="py-16 sm:py-24 lg:py-32"
      style={{ backgroundColor: background_color || "#ffffff" }}
    >
      <Container>
        {(title || eyebrow || description) && (
          <div className="mb-12 text-center lg:mb-16">
            <FadeIn>
              {eyebrow && (
                <p
                  className={clsx(
                    "mb-4 font-display text-base font-semibold",
                    invert ? "text-neutral-300" : "text-neutral-500",
                  )}
                >
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2
                  className={clsx(
                    "font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl",
                    invert ? "text-white" : "text-neutral-950",
                  )}
                >
                  {title}
                </h2>
              )}
              {description && (
                <div
                  className={clsx(
                    "mx-auto mt-6 max-w-3xl text-lg",
                    invert ? "text-neutral-300" : "text-neutral-600",
                  )}
                >
                  <PrismicRichText field={description} components={components} />
                </div>
              )}
            </FadeIn>
          </div>
        )}

        <FadeInStagger faster>
          {layout === "list" && renderListLayout()}
          {layout === "grid" && renderGridLayout()}
          {layout === "cards" && renderCardsLayout()}
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default CoreSpecs;
