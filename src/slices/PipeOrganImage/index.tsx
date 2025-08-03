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

// Pipe Organ shape component
const PipeOrganImage = ({ 
  field, 
  className 
}: { 
  field: any; 
  className?: string;
}) => {
  const id = `pipe-organ-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("relative", className)}>
      <svg viewBox="0 0 400 600" fill="none" className="w-full h-full">
        <defs>
          <clipPath id={`${id}-clip`}>
            {/* Main organ body */}
            <rect x="50" y="100" width="300" height="400" rx="20" ry="20" />
            
            {/* Pipe shapes - multiple pipes of different heights */}
            <rect x="60" y="80" width="15" height="120" rx="7.5" ry="7.5" />
            <rect x="85" y="60" width="15" height="160" rx="7.5" ry="7.5" />
            <rect x="110" y="40" width="15" height="200" rx="7.5" ry="7.5" />
            <rect x="135" y="20" width="15" height="240" rx="7.5" ry="7.5" />
            <rect x="160" y="10" width="15" height="260" rx="7.5" ry="7.5" />
            <rect x="185" y="20" width="15" height="240" rx="7.5" ry="7.5" />
            <rect x="210" y="40" width="15" height="200" rx="7.5" ry="7.5" />
            <rect x="235" y="60" width="15" height="160" rx="7.5" ry="7.5" />
            <rect x="260" y="80" width="15" height="120" rx="7.5" ry="7.5" />
            
            {/* Additional smaller pipes */}
            <rect x="285" y="90" width="12" height="100" rx="6" ry="6" />
            <rect x="305" y="100" width="10" height="80" rx="5" ry="5" />
            <rect x="320" y="110" width="8" height="60" rx="4" ry="4" />
            
            {/* Left side pipes */}
            <rect x="25" y="90" width="12" height="100" rx="6" ry="6" />
            <rect x="5" y="100" width="10" height="80" rx="5" ry="5" />
          </clipPath>
        </defs>
        
        <g clipPath={`url(#${id}-clip)`} className="group">
          <g className="origin-center scale-100 transition duration-500 motion-safe:group-hover:scale-105">
            <foreignObject width="400" height="600">
              <PrismicNextImage
                field={field}
                className="w-full h-full object-cover"
                style={{ aspectRatio: "400 / 600" }}
                fallbackAlt=""
              />
            </foreignObject>
          </g>
          
          {/* Pipe outlines */}
          <g className="stroke-neutral-950/20" strokeWidth="1" fill="none">
            {/* Main organ body outline */}
            <rect x="50" y="100" width="300" height="400" rx="20" ry="20" />
            
            {/* Pipe outlines */}
            <rect x="60" y="80" width="15" height="120" rx="7.5" ry="7.5" />
            <rect x="85" y="60" width="15" height="160" rx="7.5" ry="7.5" />
            <rect x="110" y="40" width="15" height="200" rx="7.5" ry="7.5" />
            <rect x="135" y="20" width="15" height="240" rx="7.5" ry="7.5" />
            <rect x="160" y="10" width="15" height="260" rx="7.5" ry="7.5" />
            <rect x="185" y="20" width="15" height="240" rx="7.5" ry="7.5" />
            <rect x="210" y="40" width="15" height="200" rx="7.5" ry="7.5" />
            <rect x="235" y="60" width="15" height="160" rx="7.5" ry="7.5" />
            <rect x="260" y="80" width="15" height="120" rx="7.5" ry="7.5" />
            <rect x="285" y="90" width="12" height="100" rx="6" ry="6" />
            <rect x="305" y="100" width="10" height="80" rx="5" ry="5" />
            <rect x="320" y="110" width="8" height="60" rx="4" ry="4" />
            <rect x="25" y="90" width="12" height="100" rx="6" ry="6" />
            <rect x="5" y="100" width="10" height="80" rx="5" ry="5" />
          </g>
        </g>
      </svg>
    </div>
  );
};

/**
 * Props for `PipeOrganImage`.
 */
type PipeOrganImageProps = SliceComponentProps<Content.PipeOrganImageSlice>;

/**
 * Component for "PipeOrganImage" Slices.
 */
const PipeOrganImageSlice: FC<PipeOrganImageProps> = ({ slice }) => {
  const { title, eyebrow, description, invert } = slice.primary;

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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {slice.items.map((item: any, index: number) => (
            <FadeIn key={index} className="flex">
              <div className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
                {item.image && (
                  <div className="mb-6">
                    <PipeOrganImage
                      field={item.image}
                      className="w-full aspect-[2/3]"
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
                  <div className="mt-auto">
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
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </FadeInStagger>
    </Container>
  );
};

export default PipeOrganImageSlice; 