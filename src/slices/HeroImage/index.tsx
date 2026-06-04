'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useId } from "react";
import type { Content } from '@prismicio/client';
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { getCurrencySymbol } from "@/lib/format-currency";
import clsx from "clsx";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
  ),
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

const HeroImage = ({
  image,
  svgOverlay,
  className,
  imageFit = 'cover',
}: {
  image: any;
  svgOverlay?: any;
  className?: string;
  imageFit?: 'cover' | 'contain' | 'fit';
}) => {
  const id = useId();
  if (!image) return null;
  const hasSvgOverlay = svgOverlay && svgOverlay.url;

  return (
    <div className={clsx(className, 'relative w-full aspect-[3/2]')}>
      {hasSvgOverlay ? (
        <svg viewBox="0 0 1200 800" fill="none" className="h-full w-full">
          <defs>
            <clipPath id={`${id}-clip`}>
              <image
                href={svgOverlay.url}
                width="1200"
                height="800"
                preserveAspectRatio="xMidYMid slice"
              />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id}-clip)`} className="group">
            <g className="origin-center scale-100 transition duration-700 motion-safe:group-hover:scale-110">
              <image
                href={image.url}
                width="1200"
                height="800"
                preserveAspectRatio={
                  imageFit === 'contain' ? "xMidYMid meet" :
                  imageFit === 'fit' ? "xMidYMid meet" :
                  "xMidYMid slice"
                }
                className={`w-full h-full object-${imageFit === 'fit' ? 'contain' : imageFit}`}
              />
            </g>
          </g>
        </svg>
      ) : (
        <div className="group overflow-hidden rounded-2xl h-full w-full">
          <img
            src={image.url}
            alt={image.alt || 'Hero image'}
            className={`w-full h-full object-${imageFit === 'fit' ? 'contain' : imageFit} transition duration-700 motion-safe:group-hover:scale-110`}
          />
        </div>
      )}
    </div>
  );
};

type HeroImageProps = SliceComponentProps<Content.HeroImageSlice>;

const HeroImageSlice: FC<HeroImageProps> = ({ slice }) => {
  const {
    title,
    subtitle,
    description,
    image,
    svg_overlay,
    text_position,
    invert_text,
    image_fit,
    primary_button_text,
    primary_button_link,
    secondary_button_text,
    secondary_button_link,
    product_price,
    currency,
  } = slice.primary as any;

  const displayName = title || 'Product';
  const displayCurrency = currency || 'EUR';
  const currencySymbol = getCurrencySymbol(displayCurrency);
  const showPrice = product_price != null && !Number.isNaN(product_price);
  const hasButtons =
    (primary_button_link && primary_button_text) ||
    (secondary_button_link && secondary_button_text);

  const getTextPositionClasses = () => {
    switch (text_position as string) {
      case "left":
        return "lg:flex-row lg:text-left";
      case "right":
        return "lg:flex-row-reverse lg:text-right";
      default:
        return "lg:flex-col lg:text-center";
    }
  };

  const getImagePositionClasses = () => {
    switch (text_position as string) {
      case "left":
        return "lg:order-2";
      case "right":
        return "lg:order-1";
      default:
        return "lg:order-1";
    }
  };

  const getTextOrderClasses = () => {
    switch (text_position as string) {
      case "left":
        return "lg:order-1";
      case "right":
        return "lg:order-2";
      default:
        return "lg:order-2";
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0" />
      <Container className="relative z-10 flex h-full">
        <div className={clsx(
          "flex w-full flex-col items-center justify-center py-24 sm:py-32 lg:py-40",
          getTextPositionClasses()
        )}>
          <FadeInStagger className="w-full">
            <div className={clsx(
              "grid w-full gap-12 lg:grid-cols-2 lg:items-center lg:gap-16",
              text_position === "center" && "lg:grid-cols-1 lg:max-w-4xl lg:mx-auto"
            )}>
              {image?.url ? (
                <FadeIn className={getImagePositionClasses()}>
                  <div className="flex justify-center">
                    <div className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl">
                      <HeroImage
                        image={image}
                        svgOverlay={svg_overlay}
                        className="w-full"
                        imageFit={image_fit || 'cover'}
                      />
                    </div>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn className={getImagePositionClasses()}>
                  <div className="flex justify-center">
                    <div className="w-full max-w-lg aspect-[3/2] rounded-2xl bg-neutral-200 flex items-center justify-center">
                      <p className="text-neutral-500">No image selected</p>
                    </div>
                  </div>
                </FadeIn>
              )}

              <FadeIn className={getTextOrderClasses()}>
                <div className={clsx(
                  "max-w-2xl",
                  text_position === "center" && "mx-auto text-center"
                )}>
                  {subtitle ? (
                    <p className="text-lg font-semibold tracking-wide sm:text-xl text-neutral-600">
                      {subtitle}
                    </p>
                  ) : null}

                  {displayName ? (
                    <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                      {displayName}
                    </h1>
                  ) : null}

                  {description ? (
                    <div className="mt-6 text-lg sm:text-xl lg:text-2xl text-neutral-700">
                      <PrismicRichText field={description} components={components} />
                    </div>
                  ) : null}

                  {showPrice ? (
                    <div className="mt-8 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-neutral-900">
                        {currencySymbol}{product_price.toFixed(2)}
                      </span>
                      <span className="text-sm text-neutral-500 uppercase tracking-wide">
                        {displayCurrency}
                      </span>
                    </div>
                  ) : null}

                  {hasButtons ? (
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
                      {primary_button_link && primary_button_text ? (
                        <PrismicNextLink
                          field={primary_button_link}
                          className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-neutral-800 hover:scale-105"
                        >
                          {primary_button_text}
                        </PrismicNextLink>
                      ) : null}
                      {secondary_button_link && secondary_button_text ? (
                        <PrismicNextLink
                          field={secondary_button_link}
                          className="inline-flex items-center justify-center rounded-full border-2 border-neutral-950 px-8 py-3 text-base font-semibold text-neutral-950 transition-all duration-300 hover:bg-neutral-950 hover:text-white hover:scale-105"
                        >
                          {secondary_button_text}
                        </PrismicNextLink>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </FadeIn>
            </div>
          </FadeInStagger>
        </div>
      </Container>
    </div>
  );
};

export default HeroImageSlice;
