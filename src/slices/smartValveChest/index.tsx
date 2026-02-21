"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

const SMARTVALVE_GRADIENT = ["#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#f97316", "#eab308"];

function getGradient(index: number, total: number): string {
  if (total <= 0) return `linear-gradient(90deg, ${SMARTVALVE_GRADIENT[0]}, ${SMARTVALVE_GRADIENT[1]})`;
  const i = index % 6;
  const j = (index + 1) % 6;
  return `linear-gradient(90deg, ${SMARTVALVE_GRADIENT[i]}, ${SMARTVALVE_GRADIENT[j]})`;
}

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>
    ) : null,
};

type SmartValveChestProps = SliceComponentProps<any>;

const SmartValveChest: FC<SmartValveChestProps> = ({ slice }) => {
  const { title, description, background_color } = slice.primary;
  const bgColor = background_color || "#0a0a0a";
  const imageItems = slice.items?.filter((item: any) => item.image?.url) || [];

  return (
    <div className="py-12 sm:py-16 lg:py-24 text-white" style={{ backgroundColor: bgColor }}>
      <Container>
        <div className="text-center mb-16">
          <FadeIn>
            {title && (
              <div className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
                <PrismicRichText field={title} components={components} />
              </div>
            )}
            {description && (
              <div className="max-w-3xl mx-auto text-xl text-neutral-400 leading-relaxed">
                <PrismicRichText field={description} components={components} />
              </div>
            )}
          </FadeIn>
        </div>

        {imageItems.length > 0 && (
          <FadeInStagger>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {imageItems.slice(0, 3).map((item: any, index: number) => {
                const gradient = getGradient(index, imageItems.length);
                return (
                <FadeIn key={index} className="flex flex-col">
                  {/* Image — way higher (tall aspect), title on top */}
                  <div className="group relative overflow-hidden rounded-3xl mb-4 min-h-[320px] sm:min-h-[400px] lg:min-h-[480px]">
                    {item.image && (
                      <div className="absolute inset-0">
                        <PrismicNextImage
                          field={item.image}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={index < 2}
                          alt={item.item_title || ""}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {/* Very subtle SmartValve gradient tint at bottom */}
                        <div
                          className="absolute inset-0 opacity-[0.08] pointer-events-none"
                          style={{
                            background: `linear-gradient(to top, ${SMARTVALVE_GRADIENT[index % 6]}22, transparent 40%)`,
                          }}
                        />
                      </div>
                    )}
                    {/* Thin gradient accent line */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 z-10"
                      style={{ background: gradient }}
                    />
                    {item.item_title && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 pt-7 z-10">
                        <h3 className="text-xl sm:text-2xl font-display font-bold text-white drop-shadow-md">
                          {item.item_title}
                        </h3>
                      </div>
                    )}
                  </div>
                  {/* Description under the image */}
                  {item.item_description && (
                    <div className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                      <PrismicRichText field={item.item_description} components={components} />
                    </div>
                  )}
                </FadeIn>
              );
              })}
            </div>
          </FadeInStagger>
        )}
      </Container>
    </div>
  );
};

export default SmartValveChest;
