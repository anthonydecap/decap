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

// StylizedImage component with shapes
const StylizedImage = ({ 
  field, 
  shape = 0, 
  className 
}: { 
  field: any; 
  shape?: 0 | 1 | 2; 
  className?: string;
}) => {
  const shapes = [
    {
      width: 655,
      height: 680,
      path: 'M537.827 9.245A11.5 11.5 0 0 1 549.104 0h63.366c7.257 0 12.7 6.64 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 586.87 151h-28.275a15.999 15.999 0 0 0-15.689 12.862l-59.4 297c-1.98 9.901 5.592 19.138 15.689 19.138h17.275l.127.001c.85.009 1.701.074 2.549.009 11.329-.874 21.411-7.529 24.88-25.981.002-.012.016-.016.023-.007.008.009.022.005.024-.006l24.754-123.771A11.5 11.5 0 0 1 580.104 321h63.366c7.257 0 12.7 6.639 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 617.87 472H559c-22.866 0-28.984 7.98-31.989 25.931-.004.026-.037.035-.052.014-.015-.02-.048-.013-.053.012l-24.759 123.798A11.5 11.5 0 0 1 490.87 631h-29.132a14.953 14.953 0 0 0-14.664 12.021c-4.3 21.502-23.18 36.979-45.107 36.979H83.502c-29.028 0-50.8-26.557-45.107-55.021l102.4-512C145.096 91.477 163.975 76 185.902 76h318.465c10.136 0 21.179-5.35 23.167-15.288l10.293-51.467Zm-512 160A11.5 11.5 0 0 1 37.104 160h63.366c7.257 0 12.7 6.639 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 74.87 311H11.504c-7.257 0-12.7-6.639-11.277-13.755l25.6-128Z',
    },
    {
      width: 719,
      height: 680,
      path: 'M89.827 9.245A11.5 11.5 0 0 1 101.104 0h63.366c7.257 0 12.7 6.64 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 138.87 151H75.504c-7.257 0-12.7-6.639-11.277-13.755l25.6-128Zm-64 321A11.5 11.5 0 0 1 37.104 321h63.366c7.257 0 12.7 6.639 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 74.87 472H11.504c-7.257 0-12.7-6.639-11.277-13.755l25.6-128ZM526.795 470a15.999 15.999 0 0 0-15.689 12.862l-32.032 160.159c-4.3 21.502-23.18 36.979-45.107 36.979H115.502c-29.028 0-50.8-26.557-45.107-55.021l102.4-512C177.096 91.477 195.975 76 217.902 76h318.465c29.028 0 50.8 26.557 45.107 55.021l-33.768 168.841c-1.98 9.901 5.592 19.138 15.689 19.138h17.075l.127.001c.85.009 1.701.074 2.549.009 11.329-.874 21.411-7.529 24.88-25.981.002-.012.016-.016.023-.007.008.009.022.005.024-.006l24.754-123.771A11.5 11.5 0 0 1 644.104 160h63.366c7.257 0 12.7 6.639 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 681.87 311H623c-22.866 0-28.984 7.98-31.989 25.931-.004.026-.037.035-.052.014-.015-.02-.048-.013-.053.012l-24.759 123.798A11.5 11.5 0 0 1 554.87 470h-28.075Z',
    },
    {
      width: 719,
      height: 680,
      path: 'M632.827 9.245A11.5 11.5 0 0 1 644.104 0h63.366c7.257 0 12.7 6.64 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 681.87 151h-28.275a15.999 15.999 0 0 0-15.689 12.862l-95.832 479.159c-4.3 21.502-23.18 36.979-45.107 36.979H178.502c-29.028 0-50.8-26.557-45.107-55.021l102.4-512C240.096 91.477 258.975 76 280.902 76h318.465c10.136 0 21.179-5.35 23.167-15.288l10.293-51.467Zm0 479A11.5 11.5 0 0 1 644.104 479h63.366c7.257 0 12.7 6.639 11.277 13.755l-25.6 128A11.5 11.5 0 0 1 681.87 630h-63.366c-7.257 0-12.7-6.639-11.277-13.755l25.6-128ZM37.104 159a11.5 11.5 0 0 0-11.277 9.245l-25.6 128C-1.196 303.361 4.247 310 11.504 310H74.87a11.5 11.5 0 0 0 11.277-9.245l24.76-123.798a.03.03 0 0 1 .052-.012c.015.021.048.012.052-.014C114.016 158.98 120.134 151 143 151h58.87a11.5 11.5 0 0 0 11.277-9.245l25.6-128C240.17 6.64 234.727 0 227.47 0h-63.366a11.5 11.5 0 0 0-11.277 9.245l-24.754 123.771c-.002.011-.016.015-.024.006-.007-.009-.021-.005-.023.007-3.469 18.452-13.551 25.107-24.88 25.981-.848.065-1.699 0-2.549-.009l-.127-.001H37.104Z',
    },
  ];

  const { width, height, path } = shapes[shape];
  const id = `stylized-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={clsx(
        className,
        'relative flex aspect-719/680 w-full grayscale',
      )}
    >
      <svg viewBox={`0 0 ${width} ${height}`} fill="none" className="h-full">
        <g clipPath={`url(#${id}-clip)`} className="group">
          <g className="origin-center scale-100 transition duration-500 motion-safe:group-hover:scale-105">
            <foreignObject width={width} height={height}>
              <PrismicNextImage
                field={field}
                className="w-full bg-neutral-100 object-cover"
                style={{ aspectRatio: `${width} / ${height}` }}
              />
            </foreignObject>
          </g>
          <use
            href={`#${id}-shape`}
            strokeWidth="2"
            className="stroke-neutral-950/10"
          />
        </g>
        <defs>
          <clipPath id={`${id}-clip`}>
            <path
              id={`${id}-shape`}
              d={path}
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

/**
 * Props for `StylizedImage`.
 */
type StylizedImageProps = SliceComponentProps<Content.StylizedImageSlice>;

/**
 * Component for "StylizedImage" Slices.
 */
const StylizedImageSlice: FC<StylizedImageProps> = ({ slice }) => {
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
          {slice.items.map((item: any, index: number) => {
            const shape = parseInt(item.image_shape || "0") as 0 | 1 | 2;
            
            return (
              <FadeIn key={index} className="flex">
                <div className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
                  {item.image && (
                    <div className="mb-6">
                      <StylizedImage
                        field={item.image}
                        shape={shape}
                        className="w-full"
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
            );
          })}
        </div>
      </FadeInStagger>
    </Container>
  );
};

export default StylizedImageSlice; 