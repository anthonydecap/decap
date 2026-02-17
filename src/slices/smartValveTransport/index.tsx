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

type SmartValveTransportProps = SliceComponentProps<any>;

const accentGradients: Record<string, string> = {
  blue: "from-indigo-600 via-blue-500 to-cyan-400",
  green: "from-teal-600 via-green-500 to-emerald-400",
  purple: "from-indigo-600 via-purple-500 to-violet-400",
  orange: "from-pink-600 via-red-500 to-orange-400",
  red: "from-purple-600 via-pink-500 to-red-400",
  yellow: "from-red-600 via-orange-500 to-yellow-400",
};

const SmartValveTransport: FC<SmartValveTransportProps> = ({ slice }) => {
  const { title, subtitle, section_image, background_color } = slice.primary;
  const bgColor = background_color || "#0a0a0a";

  return (
    <div className="py-8 sm:py-12 lg:py-38" style={{ backgroundColor: bgColor }}>
      <Container>
        <div
          className={clsx("text-center mb-16 text-white")}
          style={{ position: "relative", zIndex: 2 }}
        >
          {title && (
            <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-white">
              <PrismicRichText field={title} components={components} />
            </div>
          )}
          {subtitle && (
            <div className="mt-6 text-xl text-neutral-400">
              <PrismicRichText field={subtitle} components={components} />
            </div>
          )}
        </div>

        <div className="mx-auto max-w-2xl lg:max-w-none relative pb-8 sm:pb-12 lg:pt-16">
          {section_image?.url && (
            <div
              className="relative w-full flex items-center justify-center mb-16"
              style={{ minHeight: "264px" }}
            >
              <PrismicNextImage
                field={section_image}
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          <div className="mb-16" style={{ zIndex: 2 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {slice.items.map((item: any, index: number) => {
                const accentColor = (item.accent_color as string) || "blue";
                const gradient =
                  accentGradients[accentColor] ||
                  "from-indigo-600 via-blue-500 to-cyan-400";

                return (
                  <div
                    key={index}
                    className={clsx(
                      "group relative overflow-hidden rounded-3xl p-8 h-full flex flex-col",
                      "bg-neutral-900 border border-neutral-800"
                    )}
                  >
                    <div
                      className={clsx(
                        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                        gradient
                      )}
                    />
                    {item.card_image?.url && (
                      <div className="mb-6 rounded-2xl overflow-hidden">
                        <PrismicNextImage
                          field={item.card_image}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    <h3
                      className={clsx(
                        "text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r",
                        gradient
                      )}
                    >
                      {item.card_title || ""}
                    </h3>
                    {item.card_description && (
                      <div className="text-lg leading-relaxed text-neutral-300 flex-grow">
                        <PrismicRichText
                          field={item.card_description}
                          components={components}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SmartValveTransport;
