/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import type { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
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

// MIDI-related icons
const MidiIconMap = {
  speed: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  bandwidth: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6M9 19H4a1 1 0 01-1-1v-6a1 1 0 011-1h5M20 19h-1a1 1 0 01-1-1v-8a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1z" />
    </svg>
  ),
  connector: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  precision: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  compatibility: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  control: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  protocol: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  none: null,
};

/**
 * Props for `Midi`.
 */
type MidiProps = SliceComponentProps<Content.MidiSlice>;

/**
 * Component for "Midi" Slices.
 */
const Midi: FC<MidiProps> = ({ slice }) => {
  const { title, eyebrow, description, invert, main_image } = slice.primary;

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
        {/* Main Image Section */}
        {main_image?.url && (
          <FadeIn className="mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 sm:p-12">
              <div className="mx-auto max-w-4xl">
                <PrismicNextImage
                  field={main_image}
                  className="w-full rounded-2xl shadow-2xl"
                  priority
                  alt=""
                />
              </div>
            </div>
          </FadeIn>
        )}

        {/* Features Grid */}
        {slice.items && slice.items.length > 0 && (
          <div className="mb-16">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {slice.items.map((item: any, index: number) => {
                const iconKey = item.feature_icon as keyof typeof MidiIconMap;
                const icon = MidiIconMap[iconKey] || MidiIconMap.none;

                return (
                  <FadeIn key={index}>
                    <div
                      className={clsx(
                        "group relative overflow-hidden rounded-2xl p-6 transition-all duration-300",
                        invert
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
                                invert
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
                              {item.feature_title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        {item.feature_description && (
                          <div
                            className={clsx(
                              "text-sm leading-relaxed",
                              invert ? "text-white/70" : "text-neutral-600"
                            )}
                          >
                            <PrismicRichText
                              field={item.feature_description}
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
              })}
            </div>
          </div>
        )}

        {/* Stats Section */}
        {slice.primary.stats && slice.primary.stats.length > 0 && (
          <div className="mb-16">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {slice.primary.stats.map((stat: any, index: number) => (
                <FadeIn key={index}>
                  <div
                    className={clsx(
                      "text-center p-6 rounded-2xl transition-all duration-300",
                      invert
                        ? "bg-white/5 backdrop-blur-sm hover:bg-white/10"
                        : "bg-white/60 backdrop-blur-sm hover:bg-white/80"
                    )}
                  >
                    <div
                      className={clsx(
                        "text-3xl sm:text-4xl font-display font-bold mb-2",
                        invert ? "text-white" : "text-neutral-900"
                      )}
                    >
                      {stat.stat_value}
                    </div>
                    <div
                      className={clsx(
                        "text-sm font-medium",
                        invert ? "text-white/70" : "text-neutral-600"
                      )}
                    >
                      {stat.stat_label}
                    </div>
                    {stat.stat_description && (
                      <div
                        className={clsx(
                          "text-xs mt-2",
                          invert ? "text-white/60" : "text-neutral-500"
                        )}
                      >
                        {stat.stat_description}
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Subscript Section */}
        {slice.primary.subscript && (
          <FadeIn>
            <div
              className={clsx(
                "text-center p-8 rounded-2xl",
                invert
                  ? "bg-white/5 backdrop-blur-sm"
                  : "bg-neutral-50/80 backdrop-blur-sm"
              )}
            >
              <div
                className={clsx(
                  "text-sm leading-relaxed max-w-4xl mx-auto",
                  invert ? "text-white/70" : "text-neutral-600"
                )}
              >
                <PrismicRichText
                  field={slice.primary.subscript}
                  components={components}
                />
              </div>
            </div>
          </FadeIn>
        )}
      </FadeInStagger>
    </Container>
  );
};

export default Midi;
