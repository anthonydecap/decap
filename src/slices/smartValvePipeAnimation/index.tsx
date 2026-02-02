"use client";

import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

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

/* eslint-disable @typescript-eslint/no-explicit-any */
type SmartValvePipeAnimationProps = SliceComponentProps<any>;

const SmartValvePipeAnimation: FC<SmartValvePipeAnimationProps> = ({ slice }) => {
  const { title, subtitle } = slice.primary;

  return (
    <div className="relative py-16 sm:py-24 lg:py-32 bg-neutral-950 text-white overflow-hidden">
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 min-h-[600px] items-center">
          {/* Left side - Pipe + permanently animated wind */}
          <div className="relative min-h-[400px] lg:min-h-[600px] order-2 lg:order-1">
            <FadeIn>
              <div
                className="w-full h-full min-h-[400px] lg:min-h-[600px] rounded-3xl overflow-hidden bg-neutral-950 relative"
                style={{
                  backgroundImage: "url(/images/pipepanel_v3.png)",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="wind-tunnel-container"
                    style={{
                      top: "10%",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="wind-stream core-stream" />
                    <div className="wind-stream secondary-stream-1" />
                    <div className="wind-stream secondary-stream-2" />
                    <div className="wind-stream secondary-stream-3" />
                    <div className="wind-stream turbulence-1" />
                    <div className="wind-stream turbulence-2" />
                    <div className="wind-stream turbulence-3" />
                    <div className="particle-stream particle-1" />
                    <div className="particle-stream particle-2" />
                    <div className="particle-stream particle-3" />
                    <div className="particle-stream particle-4" />
                    <div className="particle-stream particle-5" />
                  </div>
                </div>
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: "url(/images/pipepanel_v3_half.png)",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            </FadeIn>
          </div>

          {/* Right side - Title and description */}
          <div className="flex flex-col justify-center order-1 lg:order-2">
            <FadeIn>
              {title && (
                <div className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-white">
                  <PrismicRichText field={title} components={components} />
                </div>
              )}
              {subtitle && (
                <div className="text-xl text-neutral-400 leading-relaxed">
                  <PrismicRichText field={subtitle} components={components} />
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .wind-tunnel-container {
          position: absolute;
          width: 140px;
          height: 500px;
          transform-origin: bottom center;
        }

        .wind-stream {
          position: absolute;
          top: 0;
          left: 50%;
          border-radius: 50px;
          filter: blur(0.5px);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .core-stream {
          width: 16px;
          height: 400px;
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.9) 15%,
            rgba(255, 255, 255, 0.8) 35%,
            rgba(255, 255, 255, 0.7) 60%,
            rgba(255, 255, 255, 0.6) 80%,
            transparent 100%
          );
          animation: wind-flow-squiggle 2.2s linear infinite;
        }

        .secondary-stream-1 {
          width: 10px;
          height: 360px;
          left: calc(50% - 12px);
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.7) 15%,
            rgba(255, 255, 255, 0.6) 35%,
            rgba(255, 255, 255, 0.5) 60%,
            rgba(255, 255, 255, 0.4) 80%,
            transparent 100%
          );
          animation: wind-flow-squiggle 1.9s linear infinite;
        }

        .secondary-stream-2 {
          width: 10px;
          height: 320px;
          left: calc(50% + 12px);
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.7) 0%,
            rgba(255, 255, 255, 0.6) 15%,
            rgba(255, 255, 255, 0.5) 35%,
            rgba(255, 255, 255, 0.4) 60%,
            rgba(255, 255, 255, 0.3) 80%,
            transparent 100%
          );
          animation: wind-flow-squiggle 2.4s linear infinite;
        }

        .secondary-stream-3 {
          width: 8px;
          height: 280px;
          left: calc(50% - 18px);
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.5) 15%,
            rgba(255, 255, 255, 0.4) 35%,
            rgba(255, 255, 255, 0.3) 60%,
            transparent 100%
          );
          animation: wind-flow-squiggle 1.7s linear infinite;
        }

        .turbulence-1 {
          width: 6px;
          height: 220px;
          left: calc(50% + 18px);
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.4) 20%,
            rgba(255, 255, 255, 0.3) 45%,
            rgba(255, 255, 255, 0.2) 70%,
            transparent 100%
          );
          animation: wind-flow-squiggle 2s linear infinite;
        }

        .turbulence-2 {
          width: 4px;
          height: 180px;
          left: calc(50% - 24px);
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.3) 25%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          animation: wind-flow-squiggle 2.6s linear infinite;
        }

        .turbulence-3 {
          width: 3px;
          height: 150px;
          left: calc(50% + 24px);
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0.25) 25%,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 100%
          );
          animation: wind-flow-squiggle 2.1s linear infinite;
        }

        .particle-stream {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100px;
          left: 50%;
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.6) 40%,
            rgba(255, 255, 255, 0.3) 70%,
            transparent 100%
          );
          border-radius: 1px;
          filter: blur(0.3px);
          animation: particle-flow-squiggle 0.55s linear infinite;
        }

        .particle-1 {
          left: calc(50% - 10px);
          animation-delay: 0s;
        }
        .particle-2 {
          left: calc(50% + 10px);
          animation-delay: 0.08s;
        }
        .particle-3 {
          left: calc(50% - 16px);
          animation-delay: 0.16s;
        }
        .particle-4 {
          left: calc(50% + 16px);
          animation-delay: 0.24s;
        }
        .particle-5 {
          left: 50%;
          animation-delay: 0.12s;
        }

        @keyframes wind-flow-squiggle {
          0% {
            transform: translateX(-50%) translateY(0) scaleY(0.85);
            opacity: 0.95;
          }
          20% {
            transform: translateX(-50%) translateY(-96px) scaleY(0.88);
            opacity: 0.9;
          }
          40% {
            transform: translateX(-50%) translateY(-192px) scaleY(0.92);
            opacity: 0.8;
          }
          60% {
            transform: translateX(-50%) translateY(-288px) scaleY(1);
            opacity: 0.65;
          }
          80% {
            transform: translateX(-50%) translateY(-384px) scaleY(1.1);
            opacity: 0.35;
          }
          100% {
            transform: translateX(-50%) translateY(-480px) scaleY(1.2);
            opacity: 0;
          }
        }

        @keyframes particle-flow-squiggle {
          0% {
            transform: translateX(-50%) translateY(0) scaleY(0.8);
            opacity: 0.9;
          }
          25% {
            transform: translateX(-50%) translateY(-25px) scaleY(0.85);
            opacity: 0.75;
          }
          50% {
            transform: translateX(-50%) translateY(-50px) scaleY(0.9);
            opacity: 0.55;
          }
          75% {
            transform: translateX(-50%) translateY(-75px) scaleY(0.95);
            opacity: 0.3;
          }
          100% {
            transform: translateX(-50%) translateY(-100px) scaleY(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartValvePipeAnimation;
