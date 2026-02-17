/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  type SliceComponentProps,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

/**
 * Props for `SmartValveLanding`.
 */
type SmartValveLandingProps = SliceComponentProps<any>;

/**
 * Component for "SmartValveLanding" Slices.
 */
const SmartValveLanding: FC<SmartValveLandingProps> = ({ slice }) => {
  const { 
    title, 
    subtitle, 
    button_text,
    button_link,
    background_color,
  } = slice.primary as any;
  const bgColor = background_color || "#0a0a0a";

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
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
              {title && (
                <FadeIn>
                  <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl xl:text-8xl font-display leading-tight text-black mb-8">
                    {title}
                  </h1>
                </FadeIn>
              )}

              {/* CTA Button */}
              {button_text && button_link && (
                <FadeIn>
                  <PrismicNextLink
                    field={button_link}
                    className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    {button_text}
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

export default SmartValveLanding;
