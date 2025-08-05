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

/**
 * Props for `EnhancedBentoGrid`.
 */
type EnhancedBentoGridProps =
  SliceComponentProps<Content.EnhancedBentoGridSlice>;

/**
 * Component for "EnhancedBentoGrid" Slices.
 */
const EnhancedBentoGrid: FC<EnhancedBentoGridProps> = ({ slice }) => {
  const { title, eyebrow, description, invert } = slice.primary;

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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 auto-rows-auto">
          {slice.items.map((item: any, index: number) => {
            const gridSize = item.item_size || "small";

            const sizeClasses = {
              small: "sm:col-span-1 lg:col-span-1 xl:col-span-1",
              medium: "sm:col-span-1 lg:col-span-2 xl:col-span-2",
              large: "sm:col-span-2 lg:col-span-2 xl:col-span-3",
              xlarge: "sm:col-span-2 lg:col-span-4 xl:col-span-4",
              tall: "sm:col-span-1 lg:col-span-1 xl:col-span-1 sm:row-span-2 lg:row-span-2 xl:row-span-2",
              wide: "sm:col-span-2 lg:col-span-3 xl:col-span-3",
              big: "sm:col-span-2 lg:col-span-3 xl:col-span-3 sm:row-span-2 lg:row-span-2 xl:row-span-2",
            };

            // Generate custom grid classes based on width and height
            const customWidth = item.item_width || "1";
            const customHeight = item.item_height || "1";

            // Handle special "tall" height option
            const getRowSpan = (height: string, breakpoint: string) => {
              if (height === "tall") {
                switch (breakpoint) {
                  case "sm":
                    return "3";
                  case "lg":
                    return "4";
                  case "xl":
                    return "5";
                  default:
                    return "3";
                }
              }
              return Math.min(
                parseInt(height),
                breakpoint === "sm" ? 2 : breakpoint === "lg" ? 3 : 4
              ).toString();
            };

            const customGridClasses = `sm:col-span-${Math.min(parseInt(customWidth), 2)} lg:col-span-${Math.min(parseInt(customWidth), 4)} xl:col-span-${Math.min(parseInt(customWidth), 6)} sm:row-span-${getRowSpan(customHeight, "sm")} lg:row-span-${getRowSpan(customHeight, "lg")} xl:row-span-${getRowSpan(customHeight, "xl")}`;

            // Use custom dimensions if provided, otherwise fall back to size classes
            const gridClasses =
              item.item_width || item.item_height
                ? customGridClasses
                : sizeClasses[gridSize as keyof typeof sizeClasses];
            const imageType = item.image_type || "prismic";
            const hasImage =
              imageType === "prismic" ? item.item_image?.url : item.image_url;
            const textPosition = item.text_position || "bottom";
            const imageRatio = item.image_ratio || "none";
            const imageFit = item.image_fit || "contain";
            const imageHeight = item.image_height || "48";
            const shouldGrow = item.grow || false;

            return (
              <FadeIn
                key={index}
                className={clsx(
                  "relative overflow-hidden rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]",
                  gridClasses,
                  "min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]",
                  gridSize === "tall" &&
                    "min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]",
                  gridSize === "big" &&
                    "min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]",
                  customHeight === "tall" &&
                    "min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]"
                )}
              >
                {/* Apple-style card design */}
                <div className="h-full rounded-3xl bg-white/80 backdrop-blur-sm p-6 ">
                  {shouldGrow ? (
                    // Special layout for grow items - image takes remaining height
                    <div className="flex h-full flex-col">
                      {/* Text content at the top - fixed size */}
                      <div className="flex-shrink-0">
                        {item.item_title && (
                          <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3 tracking-tight">
                            {item.item_title}
                          </h3>
                        )}

                        {item.item_description && (
                          <div className="text-sm text-neutral-600 mb-4 leading-relaxed">
                            <PrismicRichText
                              field={item.item_description}
                              components={components}
                            />
                          </div>
                        )}
                      </div>

                      {/* Image takes remaining height */}
                      {hasImage && (
                        <div className="relative flex-grow">
                          <div className="h-full rounded-2xl bg-neutral-100/50">
                            {imageType === "prismic" ? (
                              <PrismicNextImage
                                field={item.item_image}
                                className={`h-full w-full rounded-xl object-${imageFit}`}
                                priority={index < 2}
                                alt=""
                              />
                            ) : (
                              <img
                                src={item.image_url}
                                alt={item.item_title || "Item image"}
                                className={`h-full w-full rounded-xl object-${imageFit}`}
                              />
                            )}
                          </div>
                          {item.item_badge && (
                            <div className="absolute left-6 top-6 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/60 px-3 py-1 text-xs font-medium text-neutral-700 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]">
                              {item.item_badge}
                            </div>
                          )}
                          {item.item_price && (
                            <div className="absolute bottom-6 right-6 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/60 px-3 py-1 text-sm font-display font-semibold text-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]">
                              {item.item_price}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Original layout for all other items
                    <div
                      className={clsx(
                        "flex h-full",
                        imageRatio === "100" ? "flex-col" : "flex-row"
                      )}
                    >
                      {hasImage && imageRatio !== "none" && (
                        <div
                          className={clsx(
                            "relative flex-shrink-0",
                            imageRatio === "100" ? "mb-6" : "mr-6",
                            imageRatio === "25" && "w-1/4",
                            imageRatio === "33" && "w-1/3",
                            imageRatio === "50" && "w-1/2",
                            imageRatio === "66" && "w-2/3",
                            imageRatio === "75" && "w-3/4"
                          )}
                        >
                          <div className="rounded-2xl bg-neutral-100/50">
                            {imageType === "prismic" ? (
                              <PrismicNextImage
                                field={item.item_image}
                                className={clsx(
                                  `w-full rounded-xl object-${imageFit}`,
                                  imageRatio === "100"
                                    ? `h-${imageHeight}`
                                    : "h-full"
                                )}
                                priority={index < 2}
                                alt=""
                              />
                            ) : (
                              <img
                                src={item.image_url}
                                alt={item.item_title || "Item image"}
                                className={clsx(
                                  `w-full rounded-xl object-${imageFit}`,
                                  imageRatio === "100"
                                    ? `h-${imageHeight}`
                                    : "h-full"
                                )}
                              />
                            )}
                          </div>
                          {item.item_badge && (
                            <div className="absolute left-6 top-6 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/60 px-3 py-1 text-xs font-medium text-neutral-700 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]">
                              {item.item_badge}
                            </div>
                          )}
                          {item.item_price && (
                            <div className="absolute bottom-6 right-6 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/60 px-3 py-1 text-sm font-display font-semibold text-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]">
                              {item.item_price}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={clsx(
                          "flex-grow",
                          imageRatio === "100"
                            ? ""
                            : "flex flex-col justify-center"
                        )}
                      >
                        {item.item_title && (
                          <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3 tracking-tight">
                            {item.item_title}
                          </h3>
                        )}

                        {item.item_description && (
                          <div className="text-sm text-neutral-600 mb-4 leading-relaxed">
                            <PrismicRichText
                              field={item.item_description}
                              components={components}
                            />
                          </div>
                        )}

                        {item.item_price && (
                          <div className="text-lg font-display font-semibold text-neutral-900">
                            {item.item_price}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </FadeInStagger>
    </Container>
  );
};

export default EnhancedBentoGrid;
