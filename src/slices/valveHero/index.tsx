/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { type FC } from "react";
import type { Content } from '@prismicio/client'
import { PrismicNextLink } from "@prismicio/next";
import {
  type SliceComponentProps,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { useCartStore } from "@/lib/cart-store";
import { getCurrencySymbol } from "@/lib/stripe-client";
import { createCartItemFromProductId, getProductForSlice } from "@/lib/product-utils";
import { Button } from "@/components/Button";

/**
 * Props for `ValveHero`.
 */
type ValveHeroProps = SliceComponentProps<Content.ValveHeroSlice>;

/**
 * Component for "ValveHero" Slices.
 */
const ValveHeroSlice: FC<ValveHeroProps> = ({ slice }) => {
  const { addItem } = useCartStore();
  const { 
    title, 
    subtitle, 
    buy_button_text,
    stripeid,
    product_price,
    currency,
    product_id,
    product_weight
  } = slice.primary as any;

  // For DISPLAY: Use Prismic data first, fall back to database
  const productData = getProductForSlice(product_id);
  const displayName = title || productData?.name || 'Product';
  const displayPrice = product_price || productData?.price;
  const displayCurrency = currency || productData?.currency || 'USD';
  const displayImage = productData?.image || '';
  
  const currencySymbol = getCurrencySymbol(displayCurrency);
  const hasStripeId = stripeid && stripeid.trim() !== '';
  const hasProductFields = displayPrice && product_id;

  const handleAddToCart = () => {
    if (hasStripeId && hasProductFields) {
      // For CART: Always use database data for consistency
      const cartItem = createCartItemFromProductId(product_id);
      
      if (cartItem) {
        addItem(cartItem);
      } else {
        // Only as last resort if product not in database
        console.warn(`Product ${product_id} not found in database, using slice data for cart`);
        addItem({
          id: product_id,
          name: displayName,
          price: displayPrice,
          currency: displayCurrency,
          image: displayImage,
          weight: product_weight || 1,
        });
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Apple-style animation */}
      <div className="absolute inset-0 mx-auto">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat max-w-6xl mx-auto animate-apple-hero "
          style={{
            backgroundImage: 'url(/images/cantedvalve.png)',
            backgroundPosition: 'center 150px', // X first, then Y
            backgroundSize: 'cover',
          }}
        />
      </div>
      
      {/* Content */}
      <Container className="relative z-10 flex min-h-screen">
        <div className="flex w-full flex-col items-center justify-center py-24 sm:py-32 lg:py-40">
          <FadeInStagger className="w-full">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              
              {/* Subtitle */}
              {subtitle && (
                <FadeIn>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-relaxed text-transparent bg-clip-text mb-6 drop-shadow-lg" style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7, #ec4899, #ef4444, #f97316, #eab308)' }}>
                    {subtitle}
                  </p>
                </FadeIn>
              )}
              
              {/* Main Title */}
              {displayName && (
                <FadeIn>
                  <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl xl:text-8xl font-display leading-tight text-black mb-8">
                    {displayName}
                  </h1>
                </FadeIn>
              )}

  
       
              
              {/* Buy Button Section */}
              {hasStripeId && hasProductFields && (
                <FadeIn>
                  <div className="flex flex-col items-center gap-6">
                    {/* Price Display d*/}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                        {currencySymbol}{displayPrice?.toFixed(2)}
                      </span>
                      {displayCurrency && (
                        <span className="text-base sm:text-lg text-white/80 uppercase tracking-wide drop-shadow-md">
                          {displayCurrency}
                        </span>
                      )}
                    </div>
                    
                    {/* Buy Button */}
                    <Button 
                      onClick={handleAddToCart}
                      className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    >
                      {buy_button_text || 'Buy Now'}
                    </Button>
                  </div>
                </FadeIn>
              )}
              
              {/* Fallback button if no product functionality */}
              {(!hasStripeId || !hasProductFields) && buy_button_text && (
                <FadeIn>
                  <PrismicNextLink
                    href="#"
                    className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    {buy_button_text}
                  </PrismicNextLink>
                </FadeIn>
              )}
            </div>
          </FadeInStagger>
        </div>
      </Container>
    </div>
  );
};

export default ValveHeroSlice;
