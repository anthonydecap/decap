/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import type { Content } from "@prismicio/client";
import { PrismicImage, PrismicRichText, type SliceComponentProps, type JSXMapSerializer } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import clsx from "clsx";

const components: JSXMapSerializer = {
  hyperlink: ({ children }) => {
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

// Checkmark icon for features
const CheckIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * Props for `OpticalMidi`.
 */
type OpticalMidiProps = SliceComponentProps<Content.OpticalMidiSlice>;

/**
 * Component for "OpticalMidi" Slices.
 */
const OpticalMidi: FC<OpticalMidiProps> = ({ slice }) => {
  const { 
    eyebrow_left, 
    eyebrow_right, 
    headline, 
    subheadline, 
    product_image, 
    footnote, 
    invert 
  } = slice.primary;

  // Filter items by content type
  const features = slice.items?.filter((item: any) => item.content_type === "feature") || [];
  const bullets = slice.items?.filter((item: any) => item.content_type === "bullet") || [];
  const stats = slice.items?.filter((item: any) => item.content_type === "stat") || [];

  return (
    <Container className="py-24 sm:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column - Text Content */}
        <div className="space-y-8">
          {/* Eyebrow Row */}
          <div className="flex gap-3">
            {eyebrow_left && (
              <FadeIn>
                <span
                  className={clsx(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    invert
                      ? "bg-white/10 text-white/90 border border-white/20"
                      : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                  )}
                >
                  {eyebrow_left}
                </span>
              </FadeIn>
            )}
            {eyebrow_right && (
              <FadeIn>
                <span
                  className={clsx(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    invert
                      ? "bg-white/10 text-white/90 border border-white/20"
                      : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                  )}
                >
                  {eyebrow_right}
                </span>
              </FadeIn>
            )}
          </div>

          {/* Main Heading + Subheading */}
          <div className="space-y-4">
            {headline && (
              <FadeIn>
                <h2
                  className={clsx(
                    "text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight",
                    invert ? "text-white" : "text-neutral-900"
                  )}
                >
                  {headline}
                </h2>
              </FadeIn>
            )}
            {subheadline && (
              <FadeIn>
                <div
                  className={clsx(
                    "text-xl",
                    invert ? "text-neutral-400" : "text-neutral-600"
                  )}
                >
                  {subheadline}
                </div>
              </FadeIn>
            )}
          </div>

          {/* Feature List */}
          {features.length > 0 && (
            <FadeInStagger className="space-y-4">
              {features.map((feature: any, index: number) => (
                <FadeIn key={index}>
                  <div className="flex items-start gap-4">
                    <div
                      className={clsx(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                        invert
                          ? "bg-white/10 text-white"
                          : "bg-neutral-900 text-white"
                      )}
                    >
                      {CheckIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={clsx(
                          "text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-1",
                          invert ? "text-white" : "text-neutral-900"
                        )}
                      >
                        {feature.feature_title}
                      </h3>
                      {feature.feature_description && (
                        <div
                          className={clsx(
                            "text-sm leading-relaxed",
                            invert ? "text-white/70" : "text-neutral-600"
                          )}
                        >
                          <PrismicRichText
                            field={feature.feature_description}
                            components={components}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </FadeInStagger>
          )}

          {/* Bullet List */}
          {bullets.length > 0 && (
            <FadeInStagger className="space-y-3 pt-8">
              {bullets.map((bullet: any, index: number) => (
                <FadeIn key={index}>
                  <div className="flex items-start gap-3">
                    <div
                      className={clsx(
                        "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                        invert ? "bg-white/60" : "bg-neutral-400"
                      )}
                    />
                    <div
                      className={clsx(
                        "text-sm leading-relaxed",
                        invert ? "text-white/70" : "text-neutral-600"
                      )}
                    >
                      <PrismicRichText
                        field={bullet.bullet_text}
                        components={components}
                      />
                    </div>
                  </div>
                </FadeIn>
              ))}
            </FadeInStagger>
          )}

        </div>

        {/* Right Column - Product Image */}
        {product_image && (
          <FadeIn>
            <div className="relative">
              <div
                className={clsx(
                  "relative overflow-hidden rounded-2xl",
                  invert
                    ? "bg-white/5 border border-white/10"
                    : "bg-neutral-100/50 border border-neutral-200/50"
                )}
              >
                <PrismicImage
                  field={product_image}
                  className="w-full h-auto"
                  alt=""
                />
                {/* Optional gradient overlay for light beam effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Stats Section - Below main content */}
      {stats.length > 0 && (
        <FadeInStagger className="mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat: any, index: number) => (
              <FadeIn key={index}>
                <div
                  className={clsx(
                    "text-center p-6 rounded-xl",
                    invert
                      ? "bg-white/5 border border-white/10"
                      : "bg-neutral-50/50 border border-neutral-200/50"
                  )}
                >
                  <div
                    className={clsx(
                      "text-xs font-medium mb-2",
                      invert ? "text-white/60" : "text-neutral-500"
                    )}
                  >
                    {stat.stat_kicker}
                  </div>
                  <div
                    className={clsx(
                      "font-display text-3xl sm:text-4xl font-bold mb-1",
                      invert ? "text-white" : "text-neutral-900"
                    )}
                  >
                    {stat.stat_value}
                  </div>
                  <div
                    className={clsx(
                      "text-sm",
                      invert ? "text-white/70" : "text-neutral-600"
                    )}
                  >
                    {stat.stat_unit}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeInStagger>
      )}

      {/* Footnote - Below stats */}
      {footnote && (
        <FadeIn>
          <div
            className={clsx(
              "text-sm leading-relaxed mt-8 max-w-4xl mx-auto",
              invert ? "text-white/60" : "text-neutral-500"
            )}
          >
            <PrismicRichText field={footnote} components={components} />
          </div>
        </FadeIn>
      )}
    </Container>
  );
};

export default OpticalMidi;
