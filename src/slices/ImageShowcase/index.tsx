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

// Creative image shapes
const ImageShape = ({ 
  field, 
  shape = "rounded", 
  className 
}: { 
  field: any; 
  shape?: string; 
  className?: string;
}) => {
  const shapeClasses = {
    rounded: "rounded-3xl",
    circle: "rounded-full",
    hexagon: "clip-path-hexagon",
    diamond: "clip-path-diamond",
    wave: "clip-path-wave",
    triangle: "clip-path-triangle"
  };

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      <PrismicNextImage
        field={field}
        className={clsx(
          "w-full h-full object-cover transition-all duration-500 hover:scale-110",
          shapeClasses[shape as keyof typeof shapeClasses] || shapeClasses.rounded
        )}
      />
    </div>
  );
};

/**
 * Props for `ImageShowcase`.
 */
type ImageShowcaseProps = SliceComponentProps<Content.ImageShowcaseSlice>;

/**
 * Component for "ImageShowcase" Slices.
 */
const ImageShowcase: FC<ImageShowcaseProps> = ({ slice }) => {
  const { title, eyebrow, description, invert, layout, style } = slice.primary;

  const getLayoutClasses = () => {
    switch (layout) {
      case "hero":
        return "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center";
      case "showcase":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8";
      case "featured":
        return "grid grid-cols-1 lg:grid-cols-3 gap-8";
      case "masonry":
        return "columns-1 sm:columns-2 lg:columns-3 gap-6";
      case "zigzag":
        return "space-y-8";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8";
    }
  };

  const renderHeroLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <FadeIn>
        <div className="space-y-6">
          {slice.items[0]?.title && (
            <h2 className="font-display text-4xl font-semibold text-neutral-950 sm:text-5xl">
              {slice.items[0].title}
            </h2>
          )}
          {slice.items[0]?.description && (
            <div className="text-lg text-neutral-600">
              <PrismicRichText
                field={slice.items[0].description}
                components={components}
              />
            </div>
          )}
          {slice.items[0]?.link && (
            <PrismicNextLink
              field={slice.items[0].link}
              className="inline-flex items-center gap-2 text-lg font-semibold text-neutral-950 transition-colors hover:text-neutral-600"
            >
              {slice.items[0].link_text || "Learn More"}
              <svg
                className="h-5 w-5 transition-transform hover:translate-x-1"
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
      </FadeIn>
      
      <FadeIn>
        {slice.items[0]?.image && (
          <ImageShape
            field={slice.items[0].image}
            shape={slice.items[0].image_shape || "rounded"}
            className="aspect-square"
          />
        )}
      </FadeIn>
    </div>
  );

  const renderShowcaseLayout = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {slice.items.map((item: any, index: number) => (
        <FadeIn key={index} className="group">
          <div className="relative overflow-hidden rounded-3xl bg-neutral-100 p-6 transition-all duration-300 hover:bg-neutral-50 sm:p-8">
            {item.image && (
              <div className="mb-6">
                <ImageShape
                  field={item.image}
                  shape={item.image_shape || "rounded"}
                  className="aspect-square"
                />
              </div>
            )}
            
            {item.title && (
              <h3 className="font-display text-2xl font-semibold text-neutral-950 mb-4">
                {item.title}
              </h3>
            )}
            
            {item.description && (
              <div className="text-base text-neutral-600 mb-4">
                <PrismicRichText
                  field={item.description}
                  components={components}
                />
              </div>
            )}
            
            {item.link && (
              <PrismicNextLink
                field={item.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition-colors hover:text-neutral-600"
              >
                {item.link_text || "Learn More"}
                <svg
                  className="h-4 w-4 transition-transform hover:translate-x-1"
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
        </FadeIn>
      ))}
    </div>
  );

  const renderZigzagLayout = () => (
          <div className="space-y-8">
      {slice.items.map((item: any, index: number) => (
        <FadeIn key={index} className={clsx(
          "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
          index % 2 === 1 && "lg:grid-flow-col-dense"
        )}>
          <div className={clsx("space-y-6", index % 2 === 1 && "lg:col-start-2")}>
            {item.title && (
              <h3 className="font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
                {item.title}
              </h3>
            )}
            {item.description && (
              <div className="text-lg text-neutral-600">
                <PrismicRichText
                  field={item.description}
                  components={components}
                />
              </div>
            )}
            {item.link && (
              <PrismicNextLink
                field={item.link}
                className="inline-flex items-center gap-2 text-lg font-semibold text-neutral-950 transition-colors hover:text-neutral-600"
              >
                {item.link_text || "Learn More"}
                <svg
                  className="h-5 w-5 transition-transform hover:translate-x-1"
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
          
          <div className={clsx(index % 2 === 1 && "lg:col-start-1")}>
            {item.image && (
              <ImageShape
                field={item.image}
                shape={item.image_shape || "rounded"}
                className="aspect-square"
              />
            )}
          </div>
        </FadeIn>
      ))}
    </div>
  );

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
        {layout === "hero" && renderHeroLayout()}
        {layout === "showcase" && renderShowcaseLayout()}
        {layout === "zigzag" && renderZigzagLayout()}
        {!["hero", "showcase", "zigzag"].includes(layout || "") && renderShowcaseLayout()}
      </FadeInStagger>
    </Container>
  );
};

export default ImageShowcase; 