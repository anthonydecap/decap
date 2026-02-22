"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  PrismicImage,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
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
 * Props for `SmartValveImageHero`.
 */
type SmartValveImageHeroProps = SliceComponentProps<any>;

/**
 * Component for "SmartValveImageHero" Slices.
 * Hero with image background (same layout as SmartValveVideoHero).
 */
const SmartValveImageHero: FC<SmartValveImageHeroProps> = ({ slice }) => {
  const {
    title,
    subtitle,
    button_text,
    button_link,
    background_image,
    background_image_mode,
    overlay_opacity,
    background_color,
  } = slice.primary;
  const bgColor = background_color || "#0a0a0a";
  const objectFit = background_image_mode === "contain" ? "object-contain" : "object-cover";

  const overlayClasses = {
    light: "bg-black/40",
    medium: "bg-black/60",
    dark: "bg-black/80",
  };

  const overlayValue = overlay_opacity || "medium";
  const overlayClass =
    overlayClasses[overlayValue as keyof typeof overlayClasses] || "bg-black/50";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: background_image?.url ? undefined : bgColor }}
    >
      {background_image?.url && (
        <PrismicImage
          field={background_image}
          className={clsx("absolute inset-0 w-full h-full", objectFit)}
          alt=""
        />
      )}

      <div className={clsx("absolute inset-0", overlayClass)} />

      <Container className="relative z-10 text-center text-white">
        <div className="max-w-6xl mx-auto space-y-8">
          {title && (
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              {title}
            </h1>
          )}

          {subtitle && (
            <div className="text-xl sm:text-2xl lg:text-3xl text-white/90 max-w-5xl mx-auto">
              <PrismicRichText field={subtitle} components={components} />
            </div>
          )}

          {button_text && button_link && (
            <div className="pt-8">
              <PrismicNextLink field={button_link}>
                <Button className="text-lg px-8 py-4 bg-white text-neutral-900 hover:bg-white/90 transition-colors">
                  {button_text}
                </Button>
              </PrismicNextLink>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SmartValveImageHero;
