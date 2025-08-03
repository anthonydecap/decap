'use client';

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
import { useCartStore } from "@/lib/cart-store";
import { getCurrencySymbol } from "@/lib/stripe-client";
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

// HeroImage component with optional SVG overlay
const HeroImage = ({ 
  image, 
  svgOverlay, 
  className,
  imageFit = 'cover'
}: { 
  image: any; 
  svgOverlay?: any; 
  className?: string;
  imageFit?: 'cover' | 'contain' | 'fit';
}) => {
  console.log('HeroImage component received:', { image, svgOverlay, className });
  
  // If no image, don't render anything
  if (!image) {
    console.log('No image provided to HeroImage component');
    return null;
  }

  const id = `hero-image-${Math.random().toString(36).substr(2, 9)}`;

  // Check if we have a valid SVG overlay
  const hasSvgOverlay = svgOverlay && svgOverlay.url;
  console.log('Has SVG overlay:', hasSvgOverlay, 'SVG URL:', svgOverlay?.url);

  return (
    <div className={clsx(className, 'relative w-full aspect-[3/2]')}>
      {hasSvgOverlay ? (
        // With SVG overlay - using clipPath approach
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
        // Normal image without overlay
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

/**
 * Props for `HeroImage`.
 */
type HeroImageProps = SliceComponentProps<Content.HeroImageSlice>;

/**
 * Component for "HeroImage" Slices.
 */
const HeroImageSlice: FC<HeroImageProps> = ({ slice }) => {
  const { addItem } = useCartStore();
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
    stripeid,
    product_price,
    currency,
    product_id,
    product_weight
  } = slice.primary as any;

  const currencySymbol = getCurrencySymbol(currency || 'USD');
  const hasStripeId = stripeid && stripeid.trim() !== '';
  const hasProductFields = product_price && product_id;

  const handleAddToCart = () => {
    if (hasStripeId && hasProductFields) {
      addItem({
        id: product_id,
        name: title || 'Product',
        price: product_price,
        currency: currency || 'USD',
        image: image?.url || '',
        weight: product_weight || 1,
      });
    }
  };

  // Debug logging
  console.log('HeroImage slice data:', {
    image: image,
    imageUrl: image?.url,
    imageAlt: image?.alt,
    svg_overlay: svg_overlay,
    svg_overlay_url: svg_overlay?.url,
    title: title,
    subtitle: subtitle,
    stripeid: stripeid,
    hasStripeId: hasStripeId,
    product_price: product_price,
    product_id: product_id
  });

  const getTextPositionClasses = () => {
    switch (text_position as any) {
      case "left":
        return "lg:flex-row lg:text-left";
      case "right":
        return "lg:flex-row-reverse lg:text-right";
      case "center":
      default:
        return "lg:flex-col lg:text-center";
    }
  };

  const getImagePositionClasses = () => {
    switch (text_position as any) {
      case "left":
        return "lg:order-2";
      case "right":
        return "lg:order-1";
      case "center":
      default:
        return "lg:order-1";
    }
  };

  const getTextOrderClasses = () => {
    switch (text_position as any) {
      case "left":
        return "lg:order-1";
      case "right":
        return "lg:order-2";
      case "center":
      default:
        return "lg:order-2";
    }
  };

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 " />
      
      {/* Content */}
      <Container className="relative z-10 flex h-full">
        <div className={clsx(
          "flex w-full flex-col items-center justify-center py-24 sm:py-32 lg:py-40",
          getTextPositionClasses()
        )}>
          <FadeInStagger className="w-full">
            <div className={clsx(
              "grid w-full gap-12 lg:grid-cols-2 lg:items-center lg:gap-16",
              (text_position as any) === "center" && "lg:grid-cols-1 lg:max-w-4xl lg:mx-auto"
            )}>
              
              {/* Hero Image */}
              {image ? (
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
                    <div className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl">
                      <div className="w-full aspect-[3/2] bg-neutral-200 rounded-2xl flex items-center justify-center">
                        <p className="text-neutral-500">No image selected</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )}
              
              {/* Text Content */}
              <FadeIn className={getTextOrderClasses()}>
                <div className={clsx(
                  "max-w-2xl",
                  (text_position as any) === "center" && "mx-auto text-center"
                )}>
                  {/* Eyebrow/Subtitle */}
                  {subtitle && (
                    <p className={clsx(
                      "text-lg font-semibold tracking-wide sm:text-xl",
                      invert_text ? "text-neutral-600" : "text-neutral-600"
                    )}>
                      {subtitle}
                    </p>
                  )}
                  
                  {/* Main Title */}
                  {title && (
                    <h1 className={clsx(
                      "mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl",
                      invert_text ? "text-neutral-950" : "text-neutral-950"
                    )}>
                      {title}
                    </h1>
                  )}
                  
                  {/* Description */}
                  {description && (
                    <div className={clsx(
                      "mt-6 text-lg sm:text-xl lg:text-2xl",
                      invert_text ? "text-neutral-700" : "text-neutral-700"
                    )}>
                      <PrismicRichText
                        field={description}
                        components={components}
                      />
                    </div>
                  )}
                  
                  {/* Product Price and Buy Button - Apple Style */}
                  {hasStripeId && hasProductFields && (
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                      {/* Price Display */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-neutral-900">
                          {currencySymbol}{product_price}
                        </span>
                        {currency && (
                          <span className="text-sm text-neutral-500 uppercase tracking-wide">
                            {currency}
                          </span>
                        )}
                      </div>
                      
                      {/* Buy Button - Apple Style */}
                      <Button 
                        onClick={handleAddToCart}
                        className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      >
                        Buy
                      </Button>
                    </div>
                  )}
                  
                  {/* Regular Buttons (when no product functionality) */}
                  {(!hasStripeId || !hasProductFields) && ((primary_button_link && primary_button_text) || (secondary_button_link && secondary_button_text)) && (
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
                      {primary_button_link && primary_button_text && (
                        <PrismicNextLink
                          field={primary_button_link}
                          className={clsx(
                            "inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105",
                            invert_text 
                              ? "bg-neutral-950 text-white hover:bg-neutral-800" 
                              : "bg-neutral-950 text-white hover:bg-neutral-800"
                          )}
                        >
                          {primary_button_text}
                        </PrismicNextLink>
                      )}
                      
                      {secondary_button_link && secondary_button_text && (
                        <PrismicNextLink
                          field={secondary_button_link}
                          className={clsx(
                            "inline-flex items-center justify-center rounded-full border-2 px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105",
                            invert_text 
                              ? "border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white" 
                              : "border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white"
                          )}
                        >
                          {secondary_button_text}
                        </PrismicNextLink>
                      )}
                    </div>
                  )}
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