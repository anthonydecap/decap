/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { SectionIntro } from "@/components/SectionIntro";
import { GridList, GridListItem } from "@/components/GridList";
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

// Icon components
const IconMap = {
  microphone: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  waveform: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13M9 19h6M9 19H4a1 1 0 01-1-1v-6a1 1 0 011-1h5M20 19h-1a1 1 0 01-1-1v-8a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1z" />
    </svg>
  ),
  settings: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  shield: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  star: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  lightning: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  headphones: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  volume: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.072m0 0L7.05 8.464M5.636 18.364L12 12m0 0l6.364 6.364M12 12L5.636 5.636M12 12l6.364-6.364" />
    </svg>
  ),
  music: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13m-3-13l-3 3m3-3l3 3M9 19a3 3 0 103 3 3 3 0 00-3-3zm9-10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  record: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
};

/**
 * Props for `Feature`.
 */
type FeatureProps = SliceComponentProps<Content.FeatureSlice>;

/**
 * Component for "Feature" Slices.
 */
const Feature: FC<FeatureProps> = ({ slice }) => {
  const { title, eyebrow, description, invert } = slice.primary;
  const background_color = (slice.primary as { background_color?: string }).background_color;
  const bgColor = background_color || (invert ? "#0a0a0a" : "#ffffff");

  return (
    <div style={{ backgroundColor: bgColor }}>
    <Container className="mt-8 sm:mt-12 lg:mt-16">
      {(title || eyebrow || description) && (
        <SectionIntro title={title || ""} eyebrow={eyebrow || ""} invert={invert}>
          {description && (
            <PrismicRichText field={description} components={components} />
          )}
        </SectionIntro>
      )}
      
      <div className="mt-16">
        <GridList>
          {slice.items.map((item: any, index: number) => {
            const iconKey = item.feature_icon as keyof typeof IconMap;
            const icon = IconMap[iconKey] || IconMap.microphone;
            
            return (
              <GridListItem key={index} title={item.feature_title || ""} invert={invert}>
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "flex-shrink-0 rounded-lg p-2",
                    invert ? "bg-white/10" : "bg-neutral-950/5"
                  )}>
                    <div className={clsx(
                      "h-6 w-6",
                      invert ? "text-white" : "text-neutral-950"
                    )}>
                      {icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    {item.feature_description && (
                      <div className="mt-2">
                        <PrismicRichText
                          field={item.feature_description}
                          components={components}
                        />
                      </div>
                    )}
                    {item.feature_link && (
                      <div className="mt-4">
                        <PrismicNextLink
                          field={item.feature_link}
                          className={clsx(
                            "inline-flex items-center gap-2 text-sm font-semibold transition-colors",
                            invert
                              ? "text-white hover:text-neutral-300"
                              : "text-neutral-950 hover:text-neutral-600"
                          )}
                        >
                          Learn More
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
                </div>
              </GridListItem>
            );
          })}
        </GridList>
      </div>
    </Container>
    </div>
  );
};

export default Feature; 