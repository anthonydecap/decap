"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import clsx from "clsx";

// Icons for SmartProcessor cards: organ stops, update, id
const IconMap = {
  organ_stops: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {/* Organ pipes / stops: vertical pipes */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V8l4-4h8l4 4v12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 20V10M12 20V6M16 20V10M20 20V8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h2M14 4h2" />
    </svg>
  ),
  update: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {/* Refresh / sync arrows */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  id: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {/* ID badge / identity card */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
      />
    </svg>
  ),
};

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

type SmartProcessorProps = SliceComponentProps<any>;

// Reversed gradients: e.g. orange goes pink → orange
const accentGradients: Record<string, string> = {
  blue: "from-indigo-600 via-blue-500 to-cyan-400",
  green: "from-teal-600 via-green-500 to-emerald-400",
  purple: "from-indigo-600 via-purple-500 to-violet-400",
  orange: "from-pink-600 via-red-500 to-orange-400",
  red: "from-purple-600 via-pink-500 to-red-400",
  yellow: "from-red-600 via-orange-500 to-yellow-400",
};

const SmartProcessor: FC<SmartProcessorProps> = ({ slice }) => {
  const { title, subtitle } = slice.primary;

  return (
    <div className="py-8 sm:py-12 lg:py-38 bg-neutral-950">
      <Container>
        <FadeIn>
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
          <div
            className="mx-auto max-w-2xl lg:max-w-none relative pb-8 sm:pb-12 lg:pt-16"
            style={{
              backgroundImage: "url(/images/valvetop.png)",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* CPU and connection layout - same as Foundation */}
            <div
              style={{
                height: "264px",
                width: "calc(100% + var(--container-padding-x) * 2)",
                left: "calc(var(--container-padding-x) * -1)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0px",
                boxSizing: "border-box",
              }}
            >
              <svg
                fill="none"
                role="img"
                viewBox="0 0 891 264"
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  minWidth: "100%",
                  minHeight: "100%",
                }}
                aria-label="Connecting lines forming CPU with smART label"
              >
                <defs>
                  <linearGradient
                    id="traveling-orange-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset="10%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="20%" stopColor="#ec4899" stopOpacity="0.9" />
                    <stop offset="30%" stopColor="#ef4444" stopOpacity="1" />
                    <stop offset="45%" stopColor="#f97316" stopOpacity="0.7" />
                    <stop offset="65%" stopColor="#eab308" stopOpacity="0.3" />
                    <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="traveling-blue-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="349"
                    y1="130"
                    x2="1"
                    y2="264"
                  >
                    <stop offset="0" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset="0.1" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="0.2" stopColor="#ec4899" stopOpacity="0.9" />
                    <stop offset="0.3" stopColor="#ef4444" stopOpacity="1" />
                    <stop offset="0.45" stopColor="#f97316" stopOpacity="0.7" />
                    <stop offset="0.65" stopColor="#eab308" stopOpacity="0.3" />
                    <stop offset="0.85" stopColor="#3b82f6" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="traveling-pink-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
                    <stop offset="10%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="20%" stopColor="#f97316" stopOpacity="0.9" />
                    <stop offset="30%" stopColor="#eab308" stopOpacity="1" />
                    <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.7" />
                    <stop offset="65%" stopColor="#a855f7" stopOpacity="0.3" />
                    <stop offset="85%" stopColor="#ec4899" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* PCB trace paths - static visible lines */}
                <path
                  d="M388 96L388 68C388 65.7909 386.209 64 384 64L310 64"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M349 150L73 150C70.7909 150 69 151.791 69 154L69 174"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M388 184L388 194C388 196.209 386.209 198 384 198L77 198C74.7909 198 73 199.791 73 202L73 264"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path d="M412 263.5L412 184" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                <path
                  d="M508 96L508 88C508 85.7909 509.791 84 512 84L886 84C888.209 84 890 85.7909 890 88L890 264"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path d="M436 96L436 0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
                <path d="M436 214L436 184" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                <path d="M460 96L460 64" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                <path d="M460 239L460 184" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                <path
                  d="M484 96L484 24C484 21.7909 485.791 20 488 20L554 20"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M484 184L484 210C484 212.209 485.791 214 488 214L560 214"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  d="M508 184L508 193C508 195.209 509.791 197 512 197L560 197"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  fill="none"
                />
                {/* Connector dots - visible on dark background */}
                <circle cx="460" cy="64" r="4" fill="#262626" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <circle cx="308" cy="64" r="4" fill="#262626" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <circle cx="69" cy="173" r="4" fill="#262626" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <circle cx="436" cy="214" r="4" fill="#262626" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <circle cx="460" cy="240" r="4" fill="#262626" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <circle cx="560" cy="214" r="4" fill="#262626" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <circle cx="560" cy="197" r="4" fill="#262626" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                {/* Animated traveling light paths */}
                <path
                  d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264"
                  stroke="url(#traveling-orange-gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="60 1000"
                  strokeDashoffset="0"
                  filter="url(#glow-orange)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-1060"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </path>
                <path
                  d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
                  stroke="url(#traveling-blue-gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="80 1000"
                  strokeDashoffset="0"
                  filter="url(#glow-blue)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-1080"
                    dur="2.2s"
                    repeatCount="indefinite"
                    begin="0.5s"
                  />
                </path>
                <path
                  d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
                  stroke="url(#traveling-pink-gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="60 1000"
                  strokeDashoffset="0"
                  filter="url(#glow-pink)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-1060"
                    dur="1.8s"
                    repeatCount="indefinite"
                    begin="1.1s"
                  />
                </path>
              </svg>
              <div className="relative z-10 flex justify-center">
                <div className="relative" aria-hidden="true">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="connector-pin" />
                    ))}
                  </div>
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="connector-pin-horizontal" />
                    ))}
                  </div>
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="connector-pin-horizontal" />
                    ))}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="connector-pin" />
                    ))}
                  </div>
                  <div
                    className="relative select-none text-white text-2xl font-bold leading-tight rounded-lg px-6 p-5 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(#161616 0%,#222 100%),linear-gradient(#ffffff0d 0% 26.56%,#0000000d 51.56% 100%)",
                      boxShadow:
                        "0 2px 4px rgba(0,0,0,0.1), 0 6px 4px -2px rgba(0,0,0,0.15), inset 0 -3px 1px -1px rgba(0,0,0,0.25)",
                      letterSpacing: "0.025em",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
                        backgroundSize: "150% 100%",
                        animation: "shine 4s ease-in-out infinite",
                        mixBlendMode: "soft-light",
                        opacity: 0.4,
                        zIndex: 2,
                      }}
                    />
                    <div
                      className="relative z-10 px-7 py-1 text-transparent bg-clip-text"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, #3b82f6, #a855f7, #ec4899, #ef4444, #f97316, #eab308)",
                      }}
                    >
                      smART
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SmartProcessor cards - Possibilities-style */}
            <div className="mb-16" style={{ zIndex: 2 }}>
              <FadeInStagger faster>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {slice.items.map((item: any, index: number) => {
                    const iconKey = (item.card_icon || "organ_stops") as keyof typeof IconMap;
                    const icon = IconMap[iconKey] ?? IconMap.organ_stops;
                    const accentColor = (item.accent_color as string) || "blue";
                    const gradient =
                      accentGradients[accentColor] ||
                      "from-indigo-600 via-blue-500 to-cyan-400";

                    return (
                      <FadeIn key={index}>
                        <div
                          className={clsx(
                            "group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] h-full flex flex-col",
                            "bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-2xl hover:shadow-3xl"
                          )}
                        >
                          {/* Accent line */}
                          <div
                            className={clsx(
                              "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r shadow-lg",
                              gradient
                            )}
                          />
                          <div
                            className={clsx(
                              "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50 blur-sm",
                              gradient
                            )}
                          />
                          {/* Icon - gradient border, no fill */}
                          <div className="mb-6">
                            <div
                              className={clsx(
                                "inline-flex p-[2px] rounded-2xl bg-gradient-to-br",
                                gradient
                              )}
                            >
                              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 text-white">
                                {icon}
                              </div>
                            </div>
                          </div>
                          {/* Title */}
                          <h3
                            className={clsx(
                              "text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r",
                              gradient
                            )}
                          >
                            {item.card_title || ""}
                          </h3>
                          {/* Description */}
                          {item.card_description && (
                            <div className="text-lg leading-relaxed text-neutral-300 flex-grow">
                              <PrismicRichText
                                field={item.card_description}
                                components={components}
                              />
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div
                            className={clsx(
                              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm pointer-events-none",
                              gradient
                            )}
                          />
                        </div>
                      </FadeIn>
                    );
                  })}
                </div>
              </FadeInStagger>
            </div>
          </div>
        </FadeIn>
      </Container>

      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .connector-pin {
          width: 6px;
          height: 10px;
          background: linear-gradient(
            #9a9a9a 0%,
            #686868 33.33%,
            #848484 66.67%,
            #3a3a3a 100%
          );
          border-radius: 1px 1px 0 0;
          box-shadow:
            0 2px 2px 1px rgba(0, 0, 0, 0.02),
            inset 0 -1px 1px 1px rgba(0, 0, 0, 0.1),
            inset 0 -1px 1px #ddd;
          box-sizing: border-box;
          border: 0 solid #e5e7eb;
        }
        .connector-pin-horizontal {
          width: 10px;
          height: 6px;
          background: linear-gradient(
            90deg,
            #9a9a9a 0%,
            #686868 33.33%,
            #848484 66.67%,
            #3a3a3a 100%
          );
          border-radius: 1px 1px 0 0;
          box-shadow:
            0 2px 2px 1px rgba(0, 0, 0, 0.02),
            inset 0 -1px 1px 1px rgba(0, 0, 0, 0.1),
            inset 0 -1px 1px #ddd;
          box-sizing: border-box;
          border: 0 solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default SmartProcessor;
