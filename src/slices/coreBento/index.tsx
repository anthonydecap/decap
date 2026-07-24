/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
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

/** Light overlay chip used on top of imagery (badge / price). */
function OverlayChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "absolute top-5 z-20 inline-flex items-center rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Component for "CoreBento" Slices.
 *
 * Smart Valve "immersive tile" look, standard (light) theme, no gradient:
 * photographic (cover) tiles fill edge-to-edge with a scrim + overlaid white
 * headline; product/logo (contain) or text-only tiles fall back to a clean
 * light card so real product content still reads well.
 */
const CoreBento: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { title, eyebrow, description, invert, background_color } = slice.primary;
  const bgColor = background_color || "#ffffff";

  return (
    <div style={{ backgroundColor: bgColor }}>
      <Container className="py-16 sm:py-24 lg:py-32">
        {(title || eyebrow || description) && (
          <FadeIn className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
            {eyebrow && (
              <span
                className={clsx(
                  "mb-4 block font-display text-base font-semibold",
                  invert ? "text-white" : "text-neutral-950",
                )}
              >
                {eyebrow}
              </span>
            )}
            {title && (
              <h2
                className={clsx(
                  "font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl",
                  invert ? "text-white" : "text-neutral-950",
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <div
                className={clsx(
                  "mt-6 text-lg leading-relaxed",
                  invert ? "text-neutral-300" : "text-neutral-600",
                )}
              >
                <PrismicRichText field={description} components={components} />
              </div>
            )}
          </FadeIn>
        )}

        <FadeInStagger>
          <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:grid-cols-6">
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
                  breakpoint === "sm" ? 2 : breakpoint === "lg" ? 3 : 4,
                ).toString();
              };

              const customGridClasses = `sm:col-span-${Math.min(parseInt(customWidth), 2)} lg:col-span-${Math.min(parseInt(customWidth), 4)} xl:col-span-${Math.min(parseInt(customWidth), 6)} sm:row-span-${getRowSpan(customHeight, "sm")} lg:row-span-${getRowSpan(customHeight, "lg")} xl:row-span-${getRowSpan(customHeight, "xl")}`;

              // Use custom dimensions if provided, otherwise fall back to size classes
              const gridClasses =
                item.item_width || item.item_height
                  ? customGridClasses
                  : sizeClasses[gridSize as keyof typeof sizeClasses];

              const imageType = item.image_type || "prismic";
              const imageUrl =
                imageType === "prismic" ? item.item_image?.url : item.image_url;
              const hasImage = Boolean(imageUrl);
              // "cover" imagery → immersive edge-to-edge tile; "contain" (product
              // shots / logos) → clean light card so the subject isn't cropped.
              const immersive = hasImage && (item.image_fit || "cover") !== "contain";

              const minHeights = clsx(
                "min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]",
                (gridSize === "tall" || gridSize === "big") &&
                  "min-h-[420px] sm:min-h-[520px] lg:min-h-[600px]",
                customHeight === "tall" &&
                  "min-h-[520px] sm:min-h-[600px] lg:min-h-[700px]",
              );

              return (
                <FadeIn
                  key={index}
                  className={clsx(
                    "group relative flex flex-col overflow-hidden rounded-2xl lg:rounded-3xl",
                    immersive
                      ? "bg-neutral-900"
                      : "border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md",
                    gridClasses,
                    minHeights,
                  )}
                >
                  {immersive ? (
                    <>
                      {/* Full-bleed cover image */}
                      {imageType === "prismic" ? (
                        <PrismicNextImage
                          field={item.item_image}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={index < 2}
                          alt=""
                        />
                      ) : (
                        <img
                          src={item.image_url}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      {/* Scrim for legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                      {item.item_badge && (
                        <OverlayChip className="left-5 text-xs font-medium text-neutral-800">
                          {item.item_badge}
                        </OverlayChip>
                      )}
                      {item.item_price && (
                        <OverlayChip className="right-5 font-display text-sm font-semibold text-neutral-900">
                          {item.item_price}
                        </OverlayChip>
                      )}

                      {/* Overlaid content */}
                      <div className="relative z-10 mt-auto p-6 lg:p-8">
                        {item.item_title && (
                          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-2xl lg:text-3xl">
                            {item.item_title}
                          </h3>
                        )}
                        {item.item_description && (
                          <div className="mt-2 max-w-md text-sm leading-relaxed text-white/85 drop-shadow-sm">
                            <PrismicRichText
                              field={item.item_description}
                              components={components}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Product/logo image (uncropped) */}
                      {hasImage && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                          {imageType === "prismic" ? (
                            <PrismicNextImage
                              field={item.item_image}
                              className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                              priority={index < 2}
                              alt=""
                            />
                          ) : (
                            <img
                              src={item.image_url}
                              alt=""
                              className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                            />
                          )}
                          {item.item_badge && (
                            <OverlayChip className="left-5 text-xs font-medium text-neutral-800">
                              {item.item_badge}
                            </OverlayChip>
                          )}
                        </div>
                      )}

                      {/* Text */}
                      <div className="flex flex-1 flex-col p-6 lg:p-8">
                        {item.item_title && (
                          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-neutral-950 sm:text-2xl">
                            {item.item_title}
                          </h3>
                        )}
                        {item.item_description && (
                          <div className="mt-2 flex-grow text-sm leading-relaxed text-neutral-600">
                            <PrismicRichText
                              field={item.item_description}
                              components={components}
                            />
                          </div>
                        )}
                        {item.item_price && (
                          <div className="mt-4 font-display text-lg font-semibold text-neutral-900">
                            {item.item_price}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </FadeIn>
              );
            })}
          </div>
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default CoreBento;
