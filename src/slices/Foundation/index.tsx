"use client";

import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import clsx from "clsx";

// Icon components for Foundation cards
const IconMap = {
  microphone: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  ),
  waveform: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l3-3 3 3v13M9 19h6M9 19H4a1 1 0 01-1-1v-6a1 1 0 011-1h5M20 19h-1a1 1 0 01-1-1v-8a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1z"
      />
    </svg>
  ),
  settings: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  shield: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  star: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  ),
  lightning: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  headphones: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
      />
    </svg>
  ),
  volume: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.072m0 0L7.05 8.464M5.636 18.364L12 12m0 0l6.364 6.364M12 12L5.636 5.636M12 12l6.364-6.364"
      />
    </svg>
  ),
  music: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l3-3 3 3v13m-3-13l-3 3m3-3l3 3M9 19a3 3 0 103 3 3 3 0 00-3-3zm9-10a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  record: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    </svg>
  ),
  chart: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  brain: (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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

/**
 * Props for `Foundation`.
 */
type FoundationProps = SliceComponentProps<Content.FoundationSlice>;

/**
 * Component for "Foundation" Slices.
 */
const Foundation: FC<FoundationProps> = ({ slice }) => {
  const { title, subtitle } = slice.primary;

  const containerClasses = "pt-8 sm:pt-12 lg:pt-16 bg-neutral-950";
  const textColor = "text-white";

  return (
    <div className={containerClasses}>
      <Container className="">
        <FadeIn>
          {/* Title and subtitle */}
          <div
            className={clsx("text-center mb-16", textColor)}
            style={{ position: "relative", zIndex: 2 }}
          >
            {title && (
              <h2 className="block font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl text-white">
                <PrismicRichText field={title} components={components} />
              </h2>
            )}
            {subtitle && (
              <div className="mt-6 text-xl text-neutral-300">
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
            {/* CPU and Connection Layout */}
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
                data-lines="true"
                aria-label="A bunch of connecting lines that form into the CPU, with the text Powered By on top of the the CPU. Gradient lines are animating along the drawn lines, dissolving into the CPU in the center."
              >
                <defs>
                  {/* Laser bullet gradients with #cca483 - much more tapered */}
                  <linearGradient
                    id="traveling-orange-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#cca483"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="10%"
                      stopColor="#cca483"
                      stopOpacity="0.4"
                    ></stop>
                    <stop
                      offset="20%"
                      stopColor="#cca483"
                      stopOpacity="0.9"
                    ></stop>
                    <stop
                      offset="30%"
                      stopColor="#cca483"
                      stopOpacity="1"
                    ></stop>
                    <stop
                      offset="45%"
                      stopColor="#cca483"
                      stopOpacity="0.7"
                    ></stop>
                    <stop
                      offset="65%"
                      stopColor="#cca483"
                      stopOpacity="0.3"
                    ></stop>
                    <stop
                      offset="85%"
                      stopColor="#cca483"
                      stopOpacity="0.1"
                    ></stop>
                    <stop
                      offset="100%"
                      stopColor="#cca483"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>

                  <linearGradient
                    id="traveling-blue-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="349"
                    y1="130"
                    x2="1"
                    y2="264"
                  >
                    <stop offset="0" stopColor="#cca483" stopOpacity="0"></stop>
                    <stop
                      offset="0.1"
                      stopColor="#cca483"
                      stopOpacity="0.4"
                    ></stop>
                    <stop
                      offset="0.2"
                      stopColor="#cca483"
                      stopOpacity="0.9"
                    ></stop>
                    <stop
                      offset="0.3"
                      stopColor="#cca483"
                      stopOpacity="1"
                    ></stop>
                    <stop
                      offset="0.45"
                      stopColor="#cca483"
                      stopOpacity="0.7"
                    ></stop>
                    <stop
                      offset="0.65"
                      stopColor="#cca483"
                      stopOpacity="0.3"
                    ></stop>
                    <stop
                      offset="0.85"
                      stopColor="#cca483"
                      stopOpacity="0.1"
                    ></stop>
                    <stop offset="1" stopColor="#cca483" stopOpacity="0"></stop>
                  </linearGradient>

                  <linearGradient
                    id="traveling-pink-gradient"
                    gradientUnits="userSpaceOnUse"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="#cca483"
                      stopOpacity="0"
                    ></stop>
                    <stop
                      offset="10%"
                      stopColor="#cca483"
                      stopOpacity="0.4"
                    ></stop>
                    <stop
                      offset="20%"
                      stopColor="#cca483"
                      stopOpacity="0.9"
                    ></stop>
                    <stop
                      offset="30%"
                      stopColor="#cca483"
                      stopOpacity="1"
                    ></stop>
                    <stop
                      offset="45%"
                      stopColor="#cca483"
                      stopOpacity="0.7"
                    ></stop>
                    <stop
                      offset="65%"
                      stopColor="#cca483"
                      stopOpacity="0.3"
                    ></stop>
                    <stop
                      offset="85%"
                      stopColor="#cca483"
                      stopOpacity="0.1"
                    ></stop>
                    <stop
                      offset="100%"
                      stopColor="#cca483"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>

                  {/* Glow filters for laser bullet effect */}
                  <filter
                    id="glow-orange"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur
                      stdDeviation="4"
                      result="coloredBlur"
                    ></feGaussianBlur>
                    <feMerge>
                      <feMergeNode in="coloredBlur"></feMergeNode>
                      <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                  </filter>

                  <filter
                    id="glow-blue"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur
                      stdDeviation="4"
                      result="coloredBlur"
                    ></feGaussianBlur>
                    <feMerge>
                      <feMergeNode in="coloredBlur"></feMergeNode>
                      <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                  </filter>

                  <filter
                    id="glow-pink"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur
                      stdDeviation="4"
                      result="coloredBlur"
                    ></feGaussianBlur>
                    <feMerge>
                      <feMergeNode in="coloredBlur"></feMergeNode>
                      <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                  </filter>

                  {/* Path definitions for animated circles */}
                  <path
                    id="path1"
                    d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264"
                  />
                  <path
                    id="path2"
                    d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
                  />
                  <path
                    id="path3"
                    d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
                  />
                  <path
                    id="path4"
                    d="M388 184L388 194C388 196.209 386.209 198 384 198L77 198C74.7909 198 73 199.791 73 202L73 264"
                  />
                  <path id="path5" d="M412 263.5L412 184" />
                  <path
                    id="path6"
                    d="M508 96L508 88C508 85.7909 509.791 84 512 84L886 84C888.209 84 890 85.7909 890 88L890 264"
                  />
                </defs>

                <path
                  d="M388 96L388 68C388 65.7909 386.209 64 384 64L310 64"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>
                <path
                  d="M349 150L73 150C70.7909 150 69 151.791 69 154L69 174"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>
                <g>
                  <path
                    d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264"
                    stroke="var(--geist-foreground)"
                    strokeOpacity="0.1"
                    pathLength="1"
                    strokeDashoffset="0px"
                    strokeDasharray="1px 1px"
                  ></path>
                  <path
                    d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264"
                    stroke="url(#animated-orange-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  ></path>
                </g>
                <g>
                  <path
                    d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
                    stroke="var(--geist-foreground)"
                    strokeOpacity="0.1"
                    pathLength="1"
                    strokeDashoffset="0px"
                    strokeDasharray="1px 1px"
                  ></path>
                  <path
                    d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
                    stroke="url(#animated-blue-gradient)"
                    strokeLinecap="round"
                    strokeWidth="2"
                  ></path>
                </g>
                <g>
                  <path
                    d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
                    stroke="var(--geist-foreground)"
                    strokeOpacity="0.1"
                    pathLength="1"
                    strokeDashoffset="0px"
                    strokeDasharray="1px 1px"
                  ></path>
                  <path
                    d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
                    stroke="url(#animated-pink-gradient)"
                    strokeLinecap="round"
                    strokeWidth="2"
                  ></path>
                </g>
                <g>
                  <path
                    d="M388 184L388 194C388 196.209 386.209 198 384 198L77 198C74.7909 198 73 199.791 73 202L73 264"
                    stroke="var(--geist-foreground)"
                    strokeOpacity="0.1"
                    pathLength="1"
                    strokeDashoffset="0px"
                    strokeDasharray="1px 1px"
                  ></path>
                  <path
                    d="M388 184L388 194C388 196.209 386.209 198 384 198L77 198C74.7909 198 73 199.791 73 202L73 264"
                    stroke="url(#animated-blue-gradient)"
                    strokeLinecap="round"
                    strokeWidth="2"
                  ></path>
                </g>

                {/* Complete network paths with traveling light animation */}
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
                    begin="0s"
                  />
                  <animate
                    attributeName="stroke-width"
                    values="6;6;2"
                    dur="1.8s"
                    repeatCount="indefinite"
                    begin="0s"
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
                  <animate
                    attributeName="stroke-width"
                    values="6;6;2"
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
                  <animate
                    attributeName="stroke-width"
                    values="6;6;2"
                    dur="1.8s"
                    repeatCount="indefinite"
                    begin="1.1s"
                  />
                </path>

                <path
                  d="M412 96L412 0"
                  stroke="url(#paint0_linear_341_27683)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>
                <g>
                  <path
                    d="M412 263.5L412 184"
                    stroke="var(--geist-foreground)"
                    strokeOpacity="0.1"
                    pathLength="1"
                    strokeDashoffset="0px"
                    strokeDasharray="1px 1px"
                    style={{
                      transform: "scale(-1)",
                      transformOrigin: "50% 50%",
                      transformBox: "fill-box",
                    }}
                  ></path>
                  <path
                    d="M412 263.5L412 184"
                    stroke="url(#animated-pink-gradient)"
                    strokeLinecap="round"
                    strokeWidth="2"
                  ></path>
                </g>
                {/* TOP RIGHT */}
                <g>
                  <path
                    d="M508 96L508 88C508 85.7909 509.791 84 512 84L886 84C888.209 84 890 85.7909 890 88L890 264"
                    stroke="var(--geist-foreground)"
                    strokeOpacity="0.1"
                    pathLength="1"
                    strokeDashoffset="0px"
                    strokeDasharray="1px 1px"
                  ></path>
                  <path
                    d="M508 96L508 88C508 85.7909 509.791 84 512 84L886 84C888.209 84 890 85.7909 890 88L890 264"
                    stroke="url(#animated-orange-gradient)"
                    strokeWidth=""
                  ></path>
                </g>
                <path
                  d="M436 96L436 0"
                  stroke="url(#paint1_linear_341_27683)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>

                {/* Todo Move up 5px */}
                <path
                  d="M436 214L436 184"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                  style={{
                    transform: "scale(-1)",
                    transformOrigin: "50% 50%",
                    transformBox: "fill-box",
                  }}
                ></path>
                <path
                  d="M460 96L460 64"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>
                <path
                  d="M460 239L460 184"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                  style={{
                    transform: "scale(-1)",
                    transformOrigin: "50% 50%",
                    transformBox: "fill-box",
                  }}
                ></path>
                <path
                  d="M484 96L484 24C484 21.7909 485.791 20 488 20L554 20"
                  stroke="url(#paint2_linear_341_27683)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>
                <path
                  d="M484 184L484 210C484 212.209 485.791 214 488 214L560 214"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>
                <path
                  d="M508 184L508 193C508 195.209 509.791 197 512 197L560 197"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                ></path>
                <circle
                  cx="460"
                  cy="64"
                  fill="var(--geist-background)"
                  r="4"
                  opacity="1"
                ></circle>
                <circle
                  cx="460"
                  cy="64"
                  r="3.5"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  opacity="1"
                ></circle>
                <circle
                  cx="308"
                  cy="64"
                  fill="var(--geist-background)"
                  r="4"
                  opacity="1"
                ></circle>
                <circle
                  cx="308"
                  cy="64"
                  r="3.5"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  opacity="1"
                ></circle>
                <circle
                  cx="69"
                  cy="173"
                  fill="var(--geist-background)"
                  r="4"
                  opacity="1"
                ></circle>
                <circle
                  cx="69"
                  cy="173"
                  r="3.5"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  opacity="1"
                ></circle>
                <circle
                  cx="436"
                  cy="214"
                  fill="var(--geist-background)"
                  r="4"
                  opacity="1"
                ></circle>
                <circle
                  cx="436"
                  cy="214"
                  r="3.5"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  opacity="1"
                ></circle>
                <circle
                  cx="460"
                  cy="240"
                  fill="var(--geist-background)"
                  r="4"
                  opacity="1"
                ></circle>
                <circle
                  cx="460"
                  cy="240"
                  r="3.5"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  opacity="1"
                ></circle>
                <circle
                  cx="560"
                  cy="214"
                  fill="var(--geist-background)"
                  r="4"
                  opacity="1"
                ></circle>
                <circle
                  cx="560"
                  cy="214"
                  r="3.5"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  opacity="1"
                ></circle>
                <circle
                  cx="560"
                  cy="197"
                  fill="var(--geist-background)"
                  r="4"
                  opacity="1"
                ></circle>
                <circle
                  cx="560"
                  cy="197"
                  r="3.5"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  opacity="1"
                ></circle>
              </svg>
              {/* CPU Component - Made with divs */}
              <div className="relative z-10 flex justify-center">
                <div className="relative" aria-hidden="true">
                  {/* Top connection pins - 8 pins */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-3">
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                  </div>

                  {/* Left connection pins - 3 pins */}
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
                    <div className="connector-pin-horizontal"></div>
                    <div className="connector-pin-horizontal"></div>
                    <div className="connector-pin-horizontal"></div>
                  </div>

                  {/* Right connection pins - 3 pins */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-3">
                    <div className="connector-pin-horizontal"></div>
                    <div className="connector-pin-horizontal"></div>
                    <div className="connector-pin-horizontal"></div>
                  </div>

                  {/* Bottom connection pins - 8 pins */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-3">
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                    <div className="connector-pin"></div>
                  </div>

                  {/* CPU Core - Exact Next.js styling */}

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
                    {/* CPU Shine Effect */}
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
                    ></div>

                    {/* "Powered By" text */}
                    <div className="relative z-10 px-7 py-1">smART</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Foundation Cards - Apple-style design */}
            <div className="mb-16" style={{ zIndex: 2 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {slice.items.map((item, index) => {
                  const iconKey = item.card_icon as keyof typeof IconMap;
                  const icon = IconMap[iconKey] || IconMap.lightning;

                  return (
                    <div
                      key={index}
                      className="group relative bg-neutral-900 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Icon */}
                      <div className="mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-300">
                          <div className="flex items-center justify-center h-8 w-8 text-neutral-300 group-hover:text-white transition-colors duration-300">
                            {icon}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white mb-4 leading-tight">
                        {item.card_title || ""}
                      </h3>

                      {/* Description */}
                      {item.card_description && (
                        <div className="text-neutral-400 leading-relaxed">
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
        </FadeIn>
      </Container>

      {/* CSS Styles for CPU shine and connector pins */}
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Connector Pin Styles - Exact Next.js styling */
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

export default Foundation;
