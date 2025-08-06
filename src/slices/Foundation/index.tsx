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
  const { title, subtitle, show_animation } = slice.primary;

  return (
    <section className="mt-24 sm:mt-32 lg:mt-40 bg-neutral-950">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-2xl lg:max-w-none">
            {/* Title and subtitle */}
            <div className="max-w-3xl">
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

            <hr className="text-white" />

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
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  minWidth: '100%', 
                  minHeight: '100%' 
                }}
                data-lines="true"
                aria-label="A bunch of connecting lines that form into the CPU, with the text Powered By on top of the the CPU. Gradient lines are animating along the drawn lines, dissolving into the CPU in the center."
              >
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="blue-pulse-1" x1="400" y1="83" x2="350" y2="133.75">
                    <stop stopColor="#2EB9DF" stopOpacity="0"></stop>
                    <stop offset="0.05" stopColor="#2EB9DF"></stop>
                    <stop offset="1" stopColor="#2EB9DF" stopOpacity="0"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="blue-pulse-2" x1="400" y1="83" x2="350" y2="133.75">
                    <stop stopColor="#2EB9DF" stopOpacity="0"></stop>
                    <stop offset="0.05" stopColor="#2EB9DF"></stop>
                    <stop offset="1" stopColor="#2EB9DF" stopOpacity="0"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="pink-pulse-1" x1="400" y1="83" x2="350" y2="133.75">
                    <stop stopColor="#FF4A81" stopOpacity="0"></stop>
                    <stop offset="0.030" stopColor="#FF4A81"></stop>
                    <stop offset="0.27" stopColor="#DF6CF6"></stop>
                    <stop offset="1" stopColor="#0196FF" stopOpacity="0"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="pink-pulse-2" x1="476.1975344235252" y1="124.92036448494764" x2="486.9210970677959" y2="154.51595096563688">
                    <stop stopColor="#FF4A81" stopOpacity="0"></stop>
                    <stop offset="0.0564843" stopColor="#FF4A81"></stop>
                    <stop offset="0.4616" stopColor="#DF6CF6"></stop>
                    <stop offset="1" stopColor="#0196FF" stopOpacity="0"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="orange-pulse-1" x1="360" y1="130" x2="400" y2="170">
                    <stop stopColor="#FF7432" stopOpacity="0"></stop>
                    <stop offset="0.0550784" stopColor="#FF7432"></stop>
                    <stop offset="0.373284" stopColor="#F7CC4B"></stop>
                    <stop offset="1" stopColor="#F7CC4B" stopOpacity="0"></stop>
                  </linearGradient>
                  <linearGradient gradientUnits="userSpaceOnUse" id="orange-pulse-2" x1="300" y1="140" x2="400" y2="180">
                    <stop stopColor="#FF7432" stopOpacity="0"></stop>
                    <stop offset="0.0531089" stopColor="#FF7432"></stop>
                    <stop offset="0.415114" stopColor="#F7CC4B"></stop>
                    <stop offset="1" stopColor="#F7CC4B" stopOpacity="0"></stop>
                  </linearGradient>
                  
                  {/* Path definitions for animated circles */}
                  <path id="path1" d="M547 130L822 130C824.209 130 826 131.791 826 134L826 264" />
                  <path id="path2" d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264" />
                  <path id="path3" d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264" />
                  <path id="path4" d="M388 184L388 194C388 196.209 386.209 198 384 198L77 198C74.7909 198 73 199.791 73 202L73 264" />
                  <path id="path5" d="M412 263.5L412 184" />
                  <path id="path6" d="M508 96L508 88C508 85.7909 509.791 84 512 84L886 84C888.209 84 890 85.7909 890 88L890 264" />
                  
                  {/* Animated gradient definitions for traveling light pulses */}
                  <linearGradient id="animated-orange-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse" gradientTransform="rotate(0)">
                    <stop offset="0%" stopColor="var(--geist-foreground)" stopOpacity="0.1">
                      <animate attributeName="stop-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" begin="0s"/>
                    </stop>
                    <stop offset="5%" stopColor="#FF7432" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin="0.1s"/>
                    </stop>
                    <stop offset="15%" stopColor="#F7CC4B" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.2s"/>
                    </stop>
                    <stop offset="25%" stopColor="#F7CC4B" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.3s"/>
                    </stop>
                    <stop offset="35%" stopColor="#FF7432" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin="0.4s"/>
                    </stop>
                    <stop offset="100%" stopColor="var(--geist-foreground)" stopOpacity="0.1">
                      <animate attributeName="stop-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                    </stop>
                  </linearGradient>
                  
                  <linearGradient id="animated-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="var(--geist-foreground)" stopOpacity="0.1">
                      <animate attributeName="stop-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" begin="0.7s"/>
                    </stop>
                    <stop offset="5%" stopColor="#2EB9DF" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin="0.8s"/>
                    </stop>
                    <stop offset="15%" stopColor="#0196FF" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.9s"/>
                    </stop>
                    <stop offset="25%" stopColor="#0196FF" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s"/>
                    </stop>
                    <stop offset="35%" stopColor="#2EB9DF" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin="1.1s"/>
                    </stop>
                    <stop offset="100%" stopColor="var(--geist-foreground)" stopOpacity="0.1">
                      <animate attributeName="stop-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" begin="1.2s"/>
                    </stop>
                  </linearGradient>
                  
                  <linearGradient id="animated-pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="var(--geist-foreground)" stopOpacity="0.1">
                      <animate attributeName="stop-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" begin="1.4s"/>
                    </stop>
                    <stop offset="5%" stopColor="#FF4A81" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                    </stop>
                    <stop offset="15%" stopColor="#DF6CF6" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1.6s"/>
                    </stop>
                    <stop offset="25%" stopColor="#DF6CF6" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1.7s"/>
                    </stop>
                    <stop offset="35%" stopColor="#FF4A81" stopOpacity="0">
                      <animate attributeName="stop-opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" begin="1.8s"/>
                    </stop>
                    <stop offset="100%" stopColor="var(--geist-foreground)" stopOpacity="0.1">
                      <animate attributeName="stop-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" begin="1.9s"/>
                    </stop>
                  </linearGradient>
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
                  stroke="#FF7432"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="20 1000"
                  strokeDashoffset="0"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-1020"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                </path>
                
                <path
                  d="M349 130L5.00002 130C2.79088 130 1.00001 131.791 1.00001 134L1.00001 264"
                  stroke="#2EB9DF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="20 1000"
                  strokeDashoffset="0"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-1020"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0.7s"
                  />
                </path>
                
                <path
                  d="M547 150L633 150C635.209 150 637 151.791 637 154L637 236C637 238.209 635.209 240 633 240L488 240C485.791 240 484 241.791 484 244L484 264"
                  stroke="#FF4A81"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="20 1000"
                  strokeDashoffset="0"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-1020"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="1.4s"
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
                    style={{transform: 'scale(-1)', transformOrigin: '50% 50%', transformBox: 'fill-box'}}
                  ></path>
                  <path
                    d="M412 263.5L412 184"
                    stroke="url(#animated-pink-gradient)"
                    strokeLinecap="round"
                    strokeWidth="2"
                  ></path>
                </g>
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
                    strokeWidth="2"
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
                <path
                  d="M436 214L436 184"
                  stroke="var(--geist-foreground)"
                  strokeOpacity="0.1"
                  pathLength="1"
                  strokeDashoffset="0px"
                  strokeDasharray="1px 1px"
                  style={{transform: 'scale(-1)', transformOrigin: '50% 50%', transformBox: 'fill-box'}}
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
                  style={{transform: 'scale(-1)', transformOrigin: '50% 50%', transformBox: 'fill-box'}}
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
                <defs>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint0_linear_341_27683"
                    x1="412.5"
                    x2="412.5"
                    y1="-3.27835e-08"
                    y2="96"
                  >
                    <stop stopOpacity="0"></stop>
                    <stop offset="1"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint1_linear_341_27683"
                    x1="436.5"
                    x2="436.5"
                    y1="-3.27835e-08"
                    y2="96"
                  >
                    <stop stopOpacity="0"></stop>
                    <stop offset="1"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="paint2_linear_341_27683"
                    x1="554"
                    x2="484"
                    y1="20"
                    y2="96"
                  >
                    <stop stopOpacity="0"></stop>
                    <stop offset="1"></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="blue-pulse-1"
                    x1="400"
                    y1="83"
                    x2="350"
                    y2="133.75"
                  >
                    <stop stopColor="#2EB9DF" stopOpacity="0"></stop>
                    <stop offset="0.05" stopColor="#2EB9DF"></stop>
                    <stop
                      offset="1"
                      stopColor="#2EB9DF"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="blue-pulse-2"
                    x1="400"
                    y1="83"
                    x2="350"
                    y2="133.75"
                  >
                    <stop stopColor="#2EB9DF" stopOpacity="0"></stop>
                    <stop offset="0.05" stopColor="#2EB9DF"></stop>
                    <stop
                      offset="1"
                      stopColor="#2EB9DF"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="pink-pulse-1"
                    x1="400"
                    y1="83"
                    x2="350"
                    y2="133.75"
                  >
                    <stop stopColor="#FF4A81" stopOpacity="0"></stop>
                    <stop offset="0.030" stopColor="#FF4A81"></stop>
                    <stop offset="0.27" stopColor="#DF6CF6"></stop>
                    <stop
                      offset="1"
                      stopColor="#0196FF"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="pink-pulse-2"
                    x1="477.58522599513526"
                    y1="131.60900575079722"
                    x2="485.5615039500699"
                    y2="160.65484089456731"
                  >
                    <stop stopColor="#FF4A81" stopOpacity="0"></stop>
                    <stop offset="0.0564843" stopColor="#FF4A81"></stop>
                    <stop offset="0.4616" stopColor="#DF6CF6"></stop>
                    <stop
                      offset="1"
                      stopColor="#0196FF"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="orange-pulse-1"
                    x1="752.2895280746161"
                    y1="247.8552230267087"
                    x2="758.6166072098422"
                    y2="313.10991367528914"
                  >
                    <stop stopColor="#FF7432" stopOpacity="0"></stop>
                    <stop offset="0.0550784" stopColor="#FF7432"></stop>
                    <stop offset="0.373284" stopColor="#F7CC4B"></stop>
                    <stop
                      offset="1"
                      stopColor="#F7CC4B"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>
                  <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id="orange-pulse-2"
                    x1="300"
                    y1="140"
                    x2="400"
                    y2="180"
                  >
                    <stop stopColor="#FF7432" stopOpacity="0"></stop>
                    <stop offset="0.0531089" stopColor="#FF7432"></stop>
                    <stop offset="0.415114" stopColor="#F7CC4B"></stop>
                    <stop
                      offset="1"
                      stopColor="#F7CC4B"
                      stopOpacity="0"
                    ></stop>
                  </linearGradient>
                </defs>
              </svg>
              {/* CPU Component - Made with divs */}
              <div className="relative z-10 flex justify-center mb-32">
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
                    className="relative select-none text-white text-2xl font-bold leading-tight rounded-lg px-6 py-5"
                    style={{
                      background:
                        "linear-gradient(180deg, #374151 0%, #1f2937 100%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 26.56%, rgba(0,0,0,0.1) 51.56%, rgba(0,0,0,0.1) 100%)",
                      boxShadow:
                        "0 2px 4px rgba(0,0,0,0.1), 0 6px 4px -2px rgba(0,0,0,0.15), inset 0 -3px 1px -1px rgba(0,0,0,0.25)",
                      letterSpacing: "0.025em",
                    }}
                  >
                    {/* CPU Shine Effect */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 20% 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 55%, transparent 70% 100%)",
                        backgroundSize: "200% 100%",
                        animation: "shine 5s infinite",
                        mixBlendMode: "plus-lighter",
                        opacity: 0.6,
                        zIndex: 2,
                      }}
                    ></div>

                    {/* "Powered By" text */}
                    <div className="relative z-10">Powered By</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Foundation Cards - positioned to align with connection lines */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 relative z-10">
              {/* React Card */}
              <a
                href="https://react.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-start p-6 rounded-3xl bg-white shadow-sm ring-1 ring-neutral-950/5 transition-all hover:shadow-md hover:ring-neutral-950/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/10 ring-1 ring-blue-600/25 group-hover:bg-blue-600/15 transition-colors">
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.867.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-base font-display font-semibold text-neutral-950">
                  React
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  The library for web and native user interfaces. Next.js is
                  built on the latest React features, including Server
                  Components and Actions.
                </p>
              </a>

              {/* Turbopack Card */}
              <a
                href="https://nextjs.org/docs/app/api-reference/turbopack"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-start p-6 rounded-3xl bg-white shadow-sm ring-1 ring-neutral-950/5 transition-all hover:shadow-md hover:ring-neutral-950/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 ring-1 ring-blue-500/25 group-hover:from-blue-500/15 group-hover:to-purple-500/15 transition-all">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-sm"></div>
                </div>
                <h3 className="mt-6 text-base font-display font-semibold text-neutral-950">
                  Turbopack
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  An incremental bundler optimized for JavaScript and
                  TypeScript, written in Rust, and built into Next.js.
                </p>
              </a>

              {/* SWC Card */}
              <a
                href="https://swc.rs"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-start p-6 rounded-3xl bg-white shadow-sm ring-1 ring-neutral-950/5 transition-all hover:shadow-md hover:ring-neutral-950/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 ring-1 ring-orange-500/25 group-hover:bg-orange-500/15 transition-colors">
                  <svg
                    className="h-4 w-4 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.795 3.272h1.963c1.208 0 1.208 1.208 0 1.208H2.795V3.272ZM0 8.457h6.04V6.85H2.795V5.662h1.51c1.66 0 .754 2.867 2.112 2.867h3.774V5.662H9.43v.302c0 1.208-1.359 1.057-1.51.302-.15-.755-.754-1.359-.905-1.359 2.264-1.208.905-3.62-.905-3.62H0v1.66h1.51v3.925H0v1.66Z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-base font-display font-semibold text-neutral-950">
                  Speedy Web Compiler
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  An extensible Rust-based platform for the next generation of
                  fast developer tools, and can be used for both compilation and
                  minification.
                </p>
              </a>
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
    </section>
  );
};

export default Foundation;
