"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

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
 * Props for `FeatureBlocks`.
 */
type FeatureBlocksProps = SliceComponentProps<any>;

/**
 * Component for "FeatureBlocks" Slices.
 */
const FeatureBlocks: FC<FeatureBlocksProps> = ({ slice }) => {
  const { title, subtitle, background_image } = slice.primary;

  return (
    <div className="py-8 sm:py-12 lg:py-38 bg-neutral-950">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 min-h-[600px]">
          {/* Left side - Background Image */}
          <div className="relative min-h-[400px] lg:min-h-[600px]">
            <FadeIn>
              <div className="w-full h-full min-h-[400px] lg:min-h-[600px] rounded-3xl overflow-hidden bg-neutral-950 relative">
                {background_image ? (
                  <PrismicNextImage
                    field={background_image}
                    className="w-full h-full object-cover"
                    priority
                    alt=""
                  />
                ) : (
                  <div 
                    className="w-full h-full min-h-[400px] lg:min-h-[600px] rounded-3xl overflow-hidden bg-neutral-950 relative"
                    style={{
                      backgroundImage: "url(/images/pipepanel_v3.png)",
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}
              </div>
            </FadeIn>
          </div>

          {/* Right side - Feature Blocks */}
          <div className="flex flex-col justify-center space-y-8 min-h-[400px] lg:min-h-[600px]">
            <FadeIn>
              {/* Title and subtitle */}
              <div className="mb-12">
                {title && (
                  <div className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-white">
                    <PrismicRichText field={title} components={components} />
                  </div>
                )}
                {subtitle && (
                  <div className="text-xl text-neutral-400">
                    <PrismicRichText field={subtitle} components={components} />
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Feature blocks */}
            <FadeInStagger faster>
              <div className="space-y-6">
                {slice.items.map((item: any, index: number) => (
                  <FadeIn key={index}>
                    <div className="group relative bg-neutral-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-800/50 hover:border-neutral-700/50">
                      <div className="flex items-start gap-4">
                        {/* Feature icon */}
                        {item.feature_icon && (
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-300">
                              <div className="flex items-center justify-center h-6 w-6 text-neutral-300 group-hover:text-white transition-colors duration-300">
                                <span className="text-lg font-bold text-neutral-400 group-hover:text-white">
                                  {item.feature_icon}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Feature content */}
                        <div className="flex-1 min-w-0">
                          {item.feature_title && (
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight text-white mb-2">
                              {item.feature_title}
                            </h3>
                          )}
                          {item.feature_description && (
                            <div className="text-neutral-400 leading-relaxed">
                              <PrismicRichText
                                field={item.feature_description}
                                components={components}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </FadeInStagger>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FeatureBlocks;
