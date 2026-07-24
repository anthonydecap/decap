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
 * Props for `BentoGrid`.
 */
type BentoGridProps = SliceComponentProps<Content.BentoGridSlice>;

/**
 * Component for "BentoGrid" Slices.
 */
const BentoGrid: FC<BentoGridProps> = ({ slice }) => {
  const { title, eyebrow, description } = slice.primary;

  return (
    <Container className="mt-8 sm:mt-12 lg:mt-16">
      {(title || eyebrow || description) && (
        <SectionIntro title={title || ""} eyebrow={eyebrow || ""}>
          {description && (
            <PrismicRichText field={description} components={components} />
          )}
        </SectionIntro>
      )}
      
      <FadeInStagger className="mt-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {slice.items.map((item: any, index: number) => {
            const sizeClasses = {
              small: "sm:col-span-1 lg:col-span-1",
              medium: "sm:col-span-1 lg:col-span-2",
              large: "sm:col-span-2 lg:col-span-2"
            };
            
            const gridSize = item.item_size || "small";
            
            return (
              <FadeIn key={index} className={clsx(
                "group relative overflow-hidden rounded-3xl bg-neutral-100 p-6 transition-all duration-300 hover:bg-neutral-50",
                sizeClasses[gridSize as keyof typeof sizeClasses]
              )}>
                <div className="flex h-full flex-col">
                  {item.item_image && (
                    <div className="relative mb-6 flex-shrink-0">
                      <PrismicNextImage
                        field={item.item_image}
                        className="h-48 w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={index < 2}
                        alt=""
                      />
                      {item.item_badge && (
                        <div className="absolute left-4 top-4 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                          {item.item_badge}
                        </div>
                      )}
                      {item.item_price && (
                        <div className="absolute bottom-4 right-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-display font-semibold text-neutral-950">
                          {item.item_price}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex-grow">
                    {item.item_title && (
                      <h3 className="font-display text-xl font-semibold text-neutral-950 mb-3">
                        {item.item_title}
                      </h3>
                    )}
                    
                    {item.item_description && (
                      <div className="text-sm text-neutral-600 mb-4">
                        <PrismicRichText
                          field={item.item_description}
                          components={components}
                        />
                      </div>
                    )}
                  </div>
                  
                  {item.item_link && (
                    <div className="mt-auto">
                      <PrismicNextLink
                        field={item.item_link}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition-colors hover:text-neutral-600"
                      >
                        Learn More
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

export default BentoGrid; 