"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  PrismicImage,
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

const CheckIcon = (
  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

type OpticalMidiProps = SliceComponentProps<any>;

const OpticalMidi: FC<OpticalMidiProps> = ({ slice }) => {
  const {
    eyebrow_left,
    eyebrow_right,
    headline,
    subheadline,
    product_image,
    footnote,
    invert,
  } = slice.primary;

  const features = slice.items?.filter((item: any) => item.content_type === "feature") || [];
  const bullets = slice.items?.filter((item: any) => item.content_type === "bullet") || [];
  const stats = slice.items?.filter((item: any) => item.content_type === "stat") || [];

  const isDark = invert !== true;

  return (
    <div className={clsx("py-8 sm:py-12 lg:py-24", isDark ? "bg-neutral-950" : "bg-neutral-100")}>
      <Container>
        {/* Section header - SmartValve style */}
        <div className="text-center mb-16">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {eyebrow_left && (
              <span
                className={clsx(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                  isDark ? "bg-neutral-800 text-neutral-400 border border-neutral-700" : "bg-neutral-200 text-neutral-600 border border-neutral-300"
                )}
              >
                {eyebrow_left}
              </span>
            )}
            {eyebrow_right && (
              <span
                className={clsx(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                  isDark ? "bg-neutral-800 text-neutral-400 border border-neutral-700" : "bg-neutral-200 text-neutral-600 border border-neutral-300"
                )}
              >
                {eyebrow_right}
              </span>
            )}
          </div>
          {headline && (
            <h2
              className={clsx(
                "text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight",
                isDark ? "text-white" : "text-neutral-900"
              )}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <div className={clsx("mt-6 text-xl max-w-3xl mx-auto", isDark ? "text-neutral-400" : "text-neutral-600")}>
              {subheadline}
            </div>
          )}
        </div>

        {/* Two-column: content + image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-8">
            {features.length > 0 && (
              <div
                className={clsx(
                  "rounded-3xl p-8 border",
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"
                )}
              >
                <div className="space-y-6">
                  {features.map((feature: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={clsx(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                          isDark ? "bg-neutral-700 text-white" : "bg-neutral-900 text-white"
                        )}
                      >
                        {CheckIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={clsx(
                            "text-xl font-display font-bold leading-tight mb-1",
                            isDark ? "text-white" : "text-neutral-900"
                          )}
                        >
                          {feature.feature_title}
                        </h3>
                        {feature.feature_description && (
                          <div className={clsx("text-sm leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
                            <PrismicRichText field={feature.feature_description} components={components} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bullets.length > 0 && (
              <div
                className={clsx(
                  "rounded-3xl p-8 border",
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"
                )}
              >
                <ul className="space-y-3">
                  {bullets.map((bullet: any, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className={clsx("flex-shrink-0 w-2 h-2 rounded-full mt-2", isDark ? "bg-neutral-500" : "bg-neutral-400")}
                      />
                      <div className={clsx("text-sm leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
                        <PrismicRichText field={bullet.bullet_text} components={components} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {product_image?.url && (
            <div
              className={clsx(
                "relative rounded-2xl overflow-hidden border",
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-100 border-neutral-200"
              )}
            >
              <PrismicImage field={product_image} className="w-full h-auto" alt="" />
            </div>
          )}
        </div>

        {/* Stats - SmartValve card grid */}
        {stats.length > 0 && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat: any, index: number) => (
              <div
                key={index}
                className={clsx(
                  "relative rounded-3xl p-8 border overflow-hidden",
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200 shadow-sm"
                )}
              >
                <div className={clsx("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400")} />
                <div className="text-center pt-2">
                  {stat.stat_kicker && (
                    <div className={clsx("text-xs font-medium mb-2", isDark ? "text-neutral-500" : "text-neutral-500")}>
                      {stat.stat_kicker}
                    </div>
                  )}
                  <div className={clsx("font-display text-3xl sm:text-4xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
                    {stat.stat_value}
                  </div>
                  {stat.stat_unit && (
                    <div className={clsx("text-sm mt-1", isDark ? "text-neutral-400" : "text-neutral-600")}>
                      {stat.stat_unit}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {footnote && (
          <div
            className={clsx(
              "text-sm leading-relaxed mt-12 max-w-4xl mx-auto text-center",
              isDark ? "text-neutral-500" : "text-neutral-500"
            )}
          >
            <PrismicRichText field={footnote} components={components} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default OpticalMidi;
