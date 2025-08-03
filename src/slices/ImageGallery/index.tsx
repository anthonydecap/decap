/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import type { Content } from '@prismicio/client'
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
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
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

/**
 * Props for `ImageGallery`.
 */
type ImageGalleryProps = SliceComponentProps<Content.ImageGallerySlice>;

/**
 * Component for "ImageGallery" Slices.
 */
const ImageGallery: FC<ImageGalleryProps> = ({ slice }) => {
  const { title, eyebrow, description, invert, layout, columns } = slice.primary;

  const getLayoutClasses = () => {
    const columnCount = parseInt(columns || "3");
    
    switch (layout) {
      case "masonry":
        return "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4";
      case "grid":
        return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columnCount} gap-6`;
      case "carousel":
        return "flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory";
      case "mosaic":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
      default:
        return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columnCount} gap-6`;
    }
  };

  const getImageClasses = (index: number) => {
    const baseClasses = "transition-all duration-300 hover:scale-105";
    
    switch (layout) {
      case "masonry":
        return clsx(
          baseClasses,
          "w-full rounded-2xl mb-4 break-inside-avoid"
        );
      case "grid":
        return clsx(
          baseClasses,
          "w-full rounded-2xl aspect-square object-cover"
        );
      case "carousel":
        return clsx(
          baseClasses,
          "w-80 h-80 rounded-2xl object-cover flex-shrink-0 snap-center"
        );
      case "mosaic":
        const mosaicClasses = [
          "col-span-1 row-span-1",
          "col-span-1 row-span-2",
          "col-span-2 row-span-1",
          "col-span-2 row-span-2"
        ];
        return clsx(
          baseClasses,
          "w-full rounded-2xl object-cover",
          mosaicClasses[index % mosaicClasses.length]
        );
      default:
        return clsx(
          baseClasses,
          "w-full rounded-2xl aspect-square object-cover"
        );
    }
  };

  return (
    <Container className="mt-8 sm:mt-12 lg:mt-16">
      {(title || eyebrow || description) && (
        <SectionIntro title={title || ""} eyebrow={eyebrow || ""} invert={invert}>
          {description && (
            <PrismicRichText field={description} components={components} />
          )}
        </SectionIntro>
      )}
      
      <FadeInStagger className="mt-16">
        <div className={getLayoutClasses()}>
          {slice.items.map((item: any, index: number) => {
            const imageUrl = item.image?.url;
            const imageAlt = item.image?.alt || item.title || "";
            
            if (!imageUrl) return null;
            
            return (
              <FadeIn key={index} className={layout === "masonry" ? "break-inside-avoid" : ""}>
                <div className="group relative">
                  <PrismicNextImage
                    field={item.image}
                    className={getImageClasses(index)}
                    priority={index < 6}
                    alt={imageAlt}
                  />
                  
                  {/* Overlay with content */}
                  {(item.title || item.description || item.link) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        {item.title && (
                          <h3 className="font-display text-xl font-semibold text-white mb-2">
                            {item.title}
                          </h3>
                        )}
                        
                        {item.description && (
                          <div className="text-sm text-neutral-200 mb-4">
                            <PrismicRichText
                              field={item.description}
                              components={components}
                            />
                          </div>
                        )}
                        
                        {item.link && (
                          <PrismicNextLink
                            field={item.link}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-neutral-300"
                          >
                            {item.link_text || "View"}
                            <svg
                              className="h-4 w-4 transition-transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </PrismicNextLink>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-neutral-950">
                      {item.badge}
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

export default ImageGallery; 