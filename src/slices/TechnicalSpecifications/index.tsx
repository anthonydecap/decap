/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import type { Content } from "@prismicio/client";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { SectionIntro } from "@/components/SectionIntro";
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

// Technical specification icons with Apple-style design
const SpecIconMap = {
  power: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  dimensions: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  weight: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  frequency: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l3-3 3 3v13M9 19h6M9 19H4a1 1 0 01-1-1v-6a1 1 0 011-1h5M20 19h-1a1 1 0 01-1-1v-8a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1z" />
    </svg>
  ),
  temperature: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  humidity: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  material: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  connector: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  battery: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  certification: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
 * Props for `TechnicalSpecifications`.
 */
type TechnicalSpecificationsProps =
  SliceComponentProps<Content.TechnicalSpecificationsSlice>;

/**
 * Component for "TechnicalSpecifications" Slices.
 */
const TechnicalSpecifications: FC<TechnicalSpecificationsProps> = ({ slice }) => {
  const { title, eyebrow, description, invert, layout = "grid", columns = "2" } = slice.primary;

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

  const renderSpecItem = (spec: any, index: number) => {
    const iconKey = spec.spec_icon as keyof typeof SpecIconMap;
    const icon = SpecIconMap[iconKey] || SpecIconMap.none;
    const isHighlighted = spec.highlight;

    return (
      <FadeIn key={index}>
        <div
          className={clsx(
            "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
            isHighlighted
              ? invert
                ? "bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.1)]"
                : "bg-neutral-950/5 backdrop-blur-sm border border-neutral-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
              : invert
              ? "bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:shadow-[0_4px_16px_rgba(255,255,255,0.1)]"
              : "bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          )}
        >
          {/* Apple-style subtle gradient overlay */}
          <div
            className={clsx(
              "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              invert
                ? "bg-gradient-to-br from-white/5 to-transparent"
                : "bg-gradient-to-br from-neutral-50/50 to-transparent"
            )}
          />

          <div className="relative z-10">
            {/* Icon and title row */}
            <div className="flex items-start gap-4 mb-4">
              {icon && (
                <div
                  className={clsx(
                    "flex-shrink-0 rounded-xl p-2.5 transition-all duration-300",
                    isHighlighted
                      ? invert
                        ? "bg-white/20 text-white"
                        : "bg-neutral-950/10 text-neutral-900"
                      : invert
                      ? "bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white"
                      : "bg-neutral-950/5 text-neutral-600 group-hover:bg-neutral-950/10 group-hover:text-neutral-900"
                  )}
                >
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3
                  className={clsx(
                    "font-display text-lg font-semibold tracking-tight mb-1",
                    invert ? "text-white" : "text-neutral-900"
                  )}
                >
                  {spec.spec_title}
                </h3>
                {spec.spec_category && (
                  <p
                    className={clsx(
                      "text-xs font-medium tracking-wide uppercase",
                      invert ? "text-white/60" : "text-neutral-500"
                    )}
                  >
                    {spec.spec_category}
                  </p>
                )}
              </div>
            </div>

            {/* Specification value */}
            {spec.spec_value && (
              <div
                className={clsx(
                  "text-2xl font-display font-medium mb-3",
                  isHighlighted
                    ? invert
                      ? "text-white"
                      : "text-neutral-900"
                    : invert
                    ? "text-white/90"
                    : "text-neutral-800"
                )}
              >
                {spec.spec_value}
              </div>
            )}

            {/* Description */}
            {spec.spec_description && (
              <div
                className={clsx(
                  "text-sm leading-relaxed",
                  invert ? "text-white/70" : "text-neutral-600"
                )}
              >
                <PrismicRichText
                  field={spec.spec_description}
                  components={components}
                />
              </div>
            )}
          </div>

          {/* Apple-style subtle corner accent */}
          <div
            className={clsx(
              "absolute top-3 right-3 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              invert ? "bg-white/30" : "bg-neutral-400/40"
            )}
          />
        </div>
      </FadeIn>
    );
  };

  const renderListLayout = () => (
    <div className="space-y-6">
      {Object.entries(groupedSpecs).map(([category, specs]) => (
        <FadeIn key={category}>
          <div className="space-y-4">
            {category !== "General" && (
              <h3
                className={clsx(
                  "font-display text-xl font-semibold tracking-tight",
                  invert ? "text-white" : "text-neutral-900"
                )}
              >
                {category}
              </h3>
            )}
            <div className="space-y-3">
              {specs.map((spec, index) => (
                <FadeIn key={index}>
                  <div
                    className={clsx(
                      "group flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                      spec.highlight
                        ? invert
                          ? "bg-white/10 backdrop-blur-sm border border-white/20"
                          : "bg-neutral-950/5 backdrop-blur-sm border border-neutral-200/60"
                        : invert
                        ? "bg-white/5 backdrop-blur-sm hover:bg-white/10"
                        : "bg-white/60 backdrop-blur-sm hover:bg-white/80"
                    )}
                  >
                    {spec.spec_icon && SpecIconMap[spec.spec_icon as keyof typeof SpecIconMap] && (
                      <div
                        className={clsx(
                          "flex-shrink-0 rounded-lg p-2",
                          invert ? "bg-white/10 text-white/80" : "bg-neutral-950/5 text-neutral-600"
                        )}
                      >
                        {SpecIconMap[spec.spec_icon as keyof typeof SpecIconMap]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4
                          className={clsx(
                            "font-display text-base font-medium",
                            invert ? "text-white" : "text-neutral-900"
                          )}
                        >
                          {spec.spec_title}
                        </h4>
                        {spec.spec_value && (
                          <div
                            className={clsx(
                              "text-sm font-medium text-right",
                              invert ? "text-white/70" : "text-neutral-600"
                            )}
                          >
                            {spec.spec_value}
                          </div>
                        )}
                      </div>
                      {spec.spec_description && (
                        <div
                          className={clsx(
                            "mt-1 text-sm",
                            invert ? "text-white/60" : "text-neutral-500"
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
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );

  const renderGridLayout = () => (
    <div className={`grid gap-6 ${getColumnClasses(columns || "2")}`}>
      {slice.items.map((spec, index) => renderSpecItem(spec, index))}
    </div>
  );

  const renderCardsLayout = () => (
    <div className="space-y-8">
      {Object.entries(groupedSpecs).map(([category, specs]) => (
        <FadeIn key={category}>
          <div className="space-y-6">
            {category !== "General" && (
              <h3
                className={clsx(
                  "font-display text-2xl font-semibold tracking-tight",
                  invert ? "text-white" : "text-neutral-900"
                )}
              >
                {category}
              </h3>
            )}
            <div className={`grid gap-6 ${getColumnClasses(columns || "2")}`}>
              {specs.map((spec, index) => renderSpecItem(spec, index))}
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );

  return (
    <Container className="py-24 sm:py-32">
      {(title || eyebrow || description) && (
        <SectionIntro
          title={title || ""}
          eyebrow={eyebrow || ""}
          invert={invert}
        >
          {description && (
            <PrismicRichText field={description} components={components} />
          )}
        </SectionIntro>
      )}

      <FadeInStagger className="mt-16">
        {layout === "list" && renderListLayout()}
        {layout === "grid" && renderGridLayout()}
        {layout === "cards" && renderCardsLayout()}
      </FadeInStagger>
    </Container>
  );
};

export default TechnicalSpecifications; 