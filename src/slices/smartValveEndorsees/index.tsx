"use client";

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

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>
    ) : null,
};

type SmartValveEndorseesProps = SliceComponentProps<any>;

const SmartValveEndorsees: FC<SmartValveEndorseesProps> = ({ slice }) => {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const endorsees = slice.items || [];
  const bgColor = background_color || "#0a0a0a";

  if (endorsees.length === 0) return null;

  return (
    <div className="py-16 sm:py-24 lg:py-32 text-white" style={{ backgroundColor: bgColor }}>
      <Container>
        {(section_title?.length > 0 || section_subtitle?.length > 0) && (
          <div className="text-center mb-12 lg:mb-16">
            <FadeIn>
              {section_title?.length > 0 && (
                <div className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
                  <PrismicRichText field={section_title} components={components} />
                </div>
              )}
              {section_subtitle?.length > 0 && (
                <div className="max-w-2xl mx-auto text-lg text-neutral-400">
                  <PrismicRichText field={section_subtitle} components={components} />
                </div>
              )}
            </FadeIn>
          </div>
        )}

        <FadeInStagger faster>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 sm:gap-x-16 sm:gap-y-12 lg:gap-x-20 lg:gap-y-14">
            {endorsees.map((item: any, index: number) => {
              const logoContent = (
                <div className="flex items-center justify-center h-16 sm:h-20 w-[140px] sm:w-[160px] grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                  {item.logo?.url ? (
                    <PrismicNextImage
                      field={item.logo}
                      className="max-h-full w-auto object-contain"
                      alt={item.company_name || "Logo"}
                    />
                  ) : (
                    <span className="text-neutral-500 text-sm font-medium">
                      {item.company_name || "Logo"}
                    </span>
                  )}
                </div>
              );

              return (
                <FadeIn key={index}>
                  {item.link?.url ? (
                    <PrismicNextLink
                      field={item.link}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 rounded-lg"
                      target={item.link.target}
                    >
                      {logoContent}
                    </PrismicNextLink>
                  ) : (
                    logoContent
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

export default SmartValveEndorsees;
