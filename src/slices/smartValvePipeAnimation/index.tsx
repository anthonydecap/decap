"use client";

import { type FC, useEffect, useRef, useState } from "react";
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

// Resolve image URL from site root so it never gets /en/ or locale prefixed (fixes 404 with i18n routes)
function getAbsoluteImageUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SmartValvePipeAnimationProps = SliceComponentProps<any>;

/** Random SmartValve curve shapes — each page load picks one to show that valves can be shaped (ADSR, pluck, swell, etc.) */
const SMARTVALVE_CURVES = [
  "M 0 65 C 25 65 45 25 60 15 L 140 15 C 155 25 175 65 200 65",
  "M 0 65 C 15 65 35 15 55 15 L 145 15 C 165 15 185 65 200 65",
  "M 0 65 Q 50 65 80 20 T 160 20 T 200 65",
  "M 0 65 C 40 65 60 20 80 15 L 120 15 C 140 20 160 65 200 65",
  "M 0 65 C 20 65 50 10 100 10 L 150 10 C 180 10 190 65 200 65",
  "M 0 65 C 30 65 55 25 70 15 L 130 15 C 145 25 170 65 200 65",
  "M 0 65 Q 40 65 80 12 Q 120 12 160 45 Q 180 65 200 65",
];

const SmartValvePipeAnimation: FC<SmartValvePipeAnimationProps> = ({ slice }) => {
  const { title, subtitle, background_color } = slice.primary;
  const bgColor = background_color || "#0a0a0a";
  const containerRef = useRef<HTMLDivElement>(null);
  const curveSvgRef = useRef<SVGSVGElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [smartValvePath, setSmartValvePath] = useState(
    () => SMARTVALVE_CURVES[Math.floor(Math.random() * SMARTVALVE_CURVES.length)]
  );

  // Pick a different random curve after each animation cycle (event bubbles from path to SVG)
  useEffect(() => {
    const svg = curveSvgRef.current;
    if (!svg) return;
    const handler = (e: AnimationEvent) => {
      if (e.animationName?.includes("valve-curve-draw")) {
        setSmartValvePath((prev) => {
          const others = SMARTVALVE_CURVES.filter((p) => p !== prev);
          return others[Math.floor(Math.random() * others.length)] ?? prev;
        });
      }
    };
    svg.addEventListener("animationiteration", handler);
    return () => svg.removeEventListener("animationiteration", handler);
  }, []);

  // Pause CSS animations when slice is off-screen to save CPU/GPU
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsInView(entry.isIntersecting));
      },
      { rootMargin: "100px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative py-16 sm:py-24 lg:py-32 text-white overflow-hidden ${!isInView ? "pipe-animation-paused" : ""}`}
      style={{ backgroundColor: bgColor }}
    >
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

          {/* Right side - Title, description + Traditional vs SmartValve comparison */}
          <div className="flex flex-col justify-center order-1 lg:order-2 gap-10">
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

            {/* Traditional (step curve) vs SmartValve (smooth curve) comparison */}
            <FadeIn>
              <div className="valve-curve-comparison">
                {/* Traditional: step curve */}
                <div className="valve-curve-panel valve-curve-panel-binary">
                  <p className="valve-curve-label">Traditional valve</p>
                  <p className="valve-curve-sublabel">
                    Binary — open or closed
                  </p>
                  <div className="valve-curve-chart">
                    <svg
                      className="valve-curve-svg"
                      viewBox="-8 -12 216 104"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        className="valve-curve-binary"
                        d="M 0 65 L 45 65 L 45 15 L 155 15 L 155 65 L 200 65"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="valve-curve-divider" aria-hidden />
                {/* SmartValve: smooth curve — valveHero gradient */}
                <div className="valve-curve-panel valve-curve-panel-smooth">
                  <p className="valve-curve-label">SmartValve</p>
                  <p className="valve-curve-sublabel">
                    Curve — shape the response
                  </p>
                  <div className="valve-curve-chart">
                    <svg
                      ref={curveSvgRef}
                      className="valve-curve-svg"
                      viewBox="-8 -12 216 104"
                      fill="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient
                          id="valve-hero-gradient"
                          x1="0"
                          y1="0"
                          x2="200"
                          y2="0"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="25%" stopColor="#a855f7" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="70%" stopColor="#ef4444" />
                          <stop offset="85%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#eab308" />
                        </linearGradient>
                      </defs>
                      <path
                        className="valve-curve-line valve-curve-smooth"
                        d={smartValvePath}
                        stroke="url(#valve-hero-gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
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

        .pipe-animation-paused .wind-stream,
        .pipe-animation-paused .particle-stream {
          animation-play-state: paused;
        }

        /* Traditional vs SmartValve — curves (valveHero gradient on SmartValve) */
        .valve-curve-comparison {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0;
          align-items: stretch;
          border-radius: 1.5rem;
          background: rgba(23, 23, 23, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        @media (max-width: 639px) {
          .valve-curve-comparison {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }
        }

        .valve-curve-panel {
          padding: 1.5rem 1.75rem;
        }

        .valve-curve-panel-binary {
          padding-right: 1rem;
        }

        .valve-curve-panel-smooth {
          padding-left: 1rem;
        }

        @media (max-width: 639px) {
          .valve-curve-panel-binary {
            padding-right: 1.75rem;
          }
          .valve-curve-panel-smooth {
            padding-left: 1.75rem;
          }
        }

        .valve-curve-divider {
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent
          );
          align-self: stretch;
        }

        @media (max-width: 639px) {
          .valve-curve-divider {
            width: 100%;
            height: 1px;
            background: linear-gradient(
              to right,
              transparent,
              rgba(255, 255, 255, 0.08),
              transparent
            );
          }
        }

        .valve-curve-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 0.25rem;
        }

        .valve-curve-sublabel {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 1rem;
        }

        .valve-curve-chart {
          width: 100%;
          min-height: 90px;
        }

        .valve-curve-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .valve-curve-line {
          fill: none;
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: valve-curve-draw 3.5s ease-in-out infinite;
        }

        .valve-curve-binary {
          fill: none;
          stroke: rgba(161, 161, 170, 0.7);
        }

        .valve-curve-smooth {
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        @keyframes valve-curve-draw {
          0% {
            stroke-dashoffset: 520;
          }
          38% {
            stroke-dashoffset: 0;
          }
          62% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 520;
          }
        }

        .pipe-animation-paused .valve-curve-line {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default SmartValvePipeAnimation;
