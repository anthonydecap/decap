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
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import clsx from "clsx";
import { useState } from "react";

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
 * Props for `SplitFeature`.
 */
type SplitFeatureProps = SliceComponentProps<Content.SplitFeatureSlice>;

/**
 * Component for "SplitFeature" Slices.
 */
const SplitFeature: FC<SplitFeatureProps> = ({ slice }) => {
  const { title, subtitle } = slice.primary;
  
  // ADSR state for smoke shaping
  const [adsr, setAdsr] = useState({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3
  });

  return (
    <div className="py-8 sm:py-12 lg:py-38 bg-neutral-950">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 min-h-[600px]">
          {/* Left side - Background Image */}
          <div className="relative min-h-[400px] lg:min-h-[600px]">
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
                  {/* High-FPS Wind Tunnel Animation - Middle Layer */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Multiple wind tunnel layers for realistic flow */}
                    <div className="wind-tunnel-container" style={{ 
                      top: '10%',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}>
                      {/* Core wind stream */}
                      <div 
                        className="wind-stream core-stream"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      
                      {/* Secondary wind streams */}
                      <div 
                        className="wind-stream secondary-stream-1"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="wind-stream secondary-stream-2"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="wind-stream secondary-stream-3"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      
                      {/* Turbulence layers */}
                      <div 
                        className="wind-stream turbulence-1"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="wind-stream turbulence-2"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="wind-stream turbulence-3"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      
                      {/* High-speed particles */}
                      <div 
                        className="particle-stream particle-1"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="particle-stream particle-2"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="particle-stream particle-3"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="particle-stream particle-4"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                      <div 
                        className="particle-stream particle-5"
                        style={{
                          '--attack': adsr.attack,
                          '--decay': adsr.decay,
                          '--sustain': adsr.sustain,
                          '--release': adsr.release,
                        } as React.CSSProperties}
                      ></div>
                    </div>
                  </div>

                  {/* Top Image Layer - Exact same size overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: "url(/images/pipepanel_v3_half.png)",
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                    }}
                  ></div>
                </div>
            </FadeIn>
          </div>

          {/* Right side - Feature Blocks */}
          <div className="flex flex-col justify-center space-y-8 min-h-[400px] lg:min-h-[600px]">
            <FadeIn>
              {/* Title and subtitle */}
              <div className="mb-12">
                {title && (
                  <h2 className="block font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl text-white mb-6">
                    <PrismicRichText field={title} components={components} />
                  </h2>
                )}
                {subtitle && (
                  <div className="text-xl text-neutral-300">
                    <PrismicRichText field={subtitle} components={components} />
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Interactive ADSR Curve Control */}
            <FadeIn>
              <div className="mb-12">
                <div className="relative group">
                  {/* Clean glass container */}
                  <div className="bg-neutral-900/60 backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden border border-white/10 shadow-lg">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30"></div>
                    
                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* ADSR Visual Curve */}
                      <div className="mb-8">
                        <div className="h-40 bg-neutral-800/30 backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden border border-white/10">
                          {/* Subtle inner glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                          
                          <svg className="w-full h-full relative z-10" viewBox="0 0 400 120">
                            {/* Enhanced grid lines */}
                            <defs>
                              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                              </pattern>
                              {/* Glow filter for curve */}
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge> 
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {/* ADSR Curve with glow */}
                            <path
                              d={`M 0 120 L ${adsr.attack * 400} ${120 - adsr.attack * 120} L ${(adsr.attack + adsr.decay) * 400} ${120 - (adsr.attack + adsr.decay * adsr.sustain) * 120} L ${(adsr.attack + adsr.decay + adsr.sustain) * 400} ${120 - (adsr.attack + adsr.decay * adsr.sustain) * 120} L 400 ${120 - adsr.release * 120}`}
                              stroke="rgba(255,255,255,0.9)"
                              strokeWidth="4"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter="url(#glow)"
                            />
                            
                            {/* Enhanced control points */}
                            <circle cx={adsr.attack * 400} cy={120 - adsr.attack * 120} r="6" fill="#cca483" filter="url(#glow)" />
                            <circle cx={(adsr.attack + adsr.decay) * 400} cy={120 - (adsr.attack + adsr.decay * adsr.sustain) * 120} r="6" fill="#cca483" filter="url(#glow)" />
                            <circle cx={(adsr.attack + adsr.decay + adsr.sustain) * 400} cy={120 - (adsr.attack + adsr.decay * adsr.sustain) * 120} r="6" fill="#cca483" filter="url(#glow)" />
                            <circle cx="400" cy={120 - adsr.release * 120} r="6" fill="#cca483" filter="url(#glow)" />
                          </svg>
                        </div>
                      </div>

                      {/* ADSR Controls */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                 {/* Attack */}
                         <div className="group/control">
                           <label className="block text-sm font-medium text-white/80 mb-3 tracking-wide">Attack</label>
                           <div className="relative">
                             <input
                               type="range"
                               min="0"
                               max="1"
                               step="0.01"
                               value={adsr.attack}
                               onChange={(e) => setAdsr(prev => ({ ...prev, attack: parseFloat(e.target.value) }))}
                               className="w-full h-3 bg-neutral-700/30 backdrop-blur-sm rounded-full appearance-none cursor-pointer clean-slider border border-white/10"
                             />
                             <div className="text-sm text-white/60 mt-2 font-mono">{Math.round(adsr.attack * 100)}%</div>
                           </div>
                         </div>

                                                 {/* Decay */}
                         <div className="group/control">
                           <label className="block text-sm font-medium text-white/80 mb-3 tracking-wide">Decay</label>
                           <div className="relative">
                             <input
                               type="range"
                               min="0"
                               max="1"
                               step="0.01"
                               value={adsr.decay}
                               onChange={(e) => setAdsr(prev => ({ ...prev, decay: parseFloat(e.target.value) }))}
                               className="w-full h-3 bg-neutral-700/30 backdrop-blur-sm rounded-full appearance-none cursor-pointer clean-slider border border-white/10"
                             />
                             <div className="text-sm text-white/60 mt-2 font-mono">{Math.round(adsr.decay * 100)}%</div>
                           </div>
                         </div>

                         {/* Sustain */}
                         <div className="group/control">
                           <label className="block text-sm font-medium text-white/80 mb-3 tracking-wide">Sustain</label>
                           <div className="relative">
                             <input
                               type="range"
                               min="0"
                               max="1"
                               step="0.01"
                               value={adsr.sustain}
                               onChange={(e) => setAdsr(prev => ({ ...prev, sustain: parseFloat(e.target.value) }))}
                               className="w-full h-3 bg-neutral-700/30 backdrop-blur-sm rounded-full appearance-none cursor-pointer clean-slider border border-white/10"
                             />
                             <div className="text-sm text-white/60 mt-2 font-mono">{Math.round(adsr.sustain * 100)}%</div>
                           </div>
                         </div>

                         {/* Release */}
                         <div className="group/control">
                           <label className="block text-sm font-medium text-white/80 mb-3 tracking-wide">Release</label>
                           <div className="relative">
                             <input
                               type="range"
                               min="0"
                               max="1"
                               step="0.01"
                               value={adsr.release}
                               onChange={(e) => setAdsr(prev => ({ ...prev, release: parseFloat(e.target.value) }))}
                               className="w-full h-3 bg-neutral-700/30 backdrop-blur-sm rounded-full appearance-none cursor-pointer clean-slider border border-white/10"
                             />
                             <div className="text-sm text-white/60 mt-2 font-mono">{Math.round(adsr.release * 100)}%</div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Feature blocks */}
            <FadeInStagger faster>
              <div className="space-y-6">
                {slice.items.map((item, index) => (
                  <FadeIn key={index}>
                    <div className="group relative bg-neutral-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-800/50 hover:border-neutral-700/50">
                    <div className="flex items-start gap-4">
                      {/* Feature icon */}
                      {item.feature_icon && (
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-300">
                            <div className="flex items-center justify-center h-6 w-6 text-neutral-300 group-hover:text-white transition-colors duration-300">
                              {/* You can add icon mapping here if needed */}
                              <span className="text-lg font-bold text-neutral-400 group-hover:text-white">
                                {item.feature_icon}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feature content */}
                      <div className="flex-1 min-w-0">
                        {item.feature_title && (
                          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                            {item.feature_title}
                          </h3>
                        )}
                        {item.feature_description && (
                          <div className="text-neutral-400 leading-relaxed">
                            <PrismicRichText
                              field={item.feature_description}
                              components={components}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
              </div>
            </FadeInStagger>
          </div>
        </div>
      </Container>

      {/* High-FPS Wind Tunnel CSS */}
      <style jsx>{`
        .wind-tunnel-container {
          position: absolute;
          width: 120px;
          height: 500px;
          transform-origin: bottom center;
        }

        /* Core wind stream - main flow */
        .wind-stream {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50px;
          filter: blur(0.5px);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          --attack: 0.1;
          --decay: 0.2;
          --sustain: 0.7;
          --release: 0.3;
        }

        .core-stream {
          width: 16px;
          height: 400px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.95) 0%, 
            rgba(255,255,255,0.9) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.8) calc((var(--attack) + var(--decay)) * 100%), 
            rgba(255,255,255,0.7) calc((var(--attack) + var(--decay) + var(--sustain)) * 100%), 
            rgba(255,255,255,0.6) calc((var(--attack) + var(--decay) + var(--sustain) + var(--release)) * 100%), 
            transparent 100%);
          animation: wind-flow calc(0.4s + var(--attack) * 0.3s + var(--decay) * 0.2s + var(--sustain) * 0.4s + var(--release) * 0.2s) linear infinite;
        }

        /* Secondary streams for volume - all originate from same Y axis */
        .secondary-stream-1 {
          width: 10px;
          height: 350px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.8) 0%, 
            rgba(255,255,255,0.7) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.6) calc((var(--attack) + var(--decay)) * 100%), 
            rgba(255,255,255,0.5) calc((var(--attack) + var(--decay) + var(--sustain)) * 100%), 
            rgba(255,255,255,0.4) calc((var(--attack) + var(--decay) + var(--sustain) + var(--release)) * 100%), 
            transparent 100%);
          animation: wind-flow calc(0.3s + var(--attack) * 0.2s + var(--decay) * 0.15s + var(--sustain) * 0.3s + var(--release) * 0.15s) linear infinite;
          left: calc(50% - 10px);
        }

        .secondary-stream-2 {
          width: 10px;
          height: 320px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.7) 0%, 
            rgba(255,255,255,0.6) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.5) calc((var(--attack) + var(--decay)) * 100%), 
            rgba(255,255,255,0.4) calc((var(--attack) + var(--decay) + var(--sustain)) * 100%), 
            rgba(255,255,255,0.3) calc((var(--attack) + var(--decay) + var(--sustain) + var(--release)) * 100%), 
            transparent 100%);
          animation: wind-flow calc(0.5s + var(--attack) * 0.25s + var(--decay) * 0.2s + var(--sustain) * 0.35s + var(--release) * 0.2s) linear infinite;
          left: calc(50% + 10px);
        }

        .secondary-stream-3 {
          width: 8px;
          height: 280px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.6) 0%, 
            rgba(255,255,255,0.5) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.4) calc((var(--attack) + var(--decay)) * 100%), 
            rgba(255,255,255,0.3) calc((var(--attack) + var(--decay) + var(--sustain)) * 100%), 
            rgba(255,255,255,0.2) calc((var(--attack) + var(--decay) + var(--sustain) + var(--release)) * 100%), 
            transparent 100%);
          animation: wind-flow calc(0.6s + var(--attack) * 0.3s + var(--decay) * 0.25s + var(--sustain) * 0.4s + var(--release) * 0.25s) linear infinite;
          left: calc(50% - 15px);
        }

        /* Turbulence layers for realistic flow */
        .turbulence-1 {
          width: 6px;
          height: 220px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.5) 0%, 
            rgba(255,255,255,0.4) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.3) calc((var(--attack) + var(--decay)) * 100%), 
            rgba(255,255,255,0.2) calc((var(--attack) + var(--decay) + var(--sustain)) * 100%), 
            transparent 100%);
          animation: wind-flow calc(0.2s + var(--attack) * 0.1s + var(--decay) * 0.1s + var(--sustain) * 0.2s + var(--release) * 0.1s) linear infinite;
          left: calc(50% + 15px);
        }

        .turbulence-2 {
          width: 4px;
          height: 180px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.4) 0%, 
            rgba(255,255,255,0.3) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.2) calc((var(--attack) + var(--decay)) * 100%), 
            transparent 100%);
          animation: wind-flow calc(0.8s + var(--attack) * 0.4s + var(--decay) * 0.3s + var(--sustain) * 0.5s + var(--release) * 0.3s) linear infinite;
          left: calc(50% - 20px);
        }

        .turbulence-3 {
          width: 3px;
          height: 150px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.3) 0%, 
            rgba(255,255,255,0.2) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.1) calc((var(--attack) + var(--decay)) * 100%), 
            transparent 100%);
          animation: wind-flow calc(1s + var(--attack) * 0.5s + var(--decay) * 0.4s + var(--sustain) * 0.6s + var(--release) * 0.4s) linear infinite;
          left: calc(50% + 20px);
        }

        /* High-speed particle streams - all originate from same Y axis */
        .particle-stream {
          position: absolute;
          top: 0;
          width: 2px;
          height: 120px;
          background: linear-gradient(to top, 
            rgba(255,255,255,0.9) 0%, 
            rgba(255,255,255,0.8) calc(var(--attack) * 100%), 
            rgba(255,255,255,0.6) calc((var(--attack) + var(--decay)) * 100%), 
            rgba(255,255,255,0.4) calc((var(--attack) + var(--decay) + var(--sustain)) * 100%), 
            rgba(255,255,255,0.2) calc((var(--attack) + var(--decay) + var(--sustain) + var(--release)) * 100%), 
            transparent 100%);
          border-radius: 1px;
          filter: blur(0.3px);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          left: 50%;
          transform: translateX(-50%);
        }

        .particle-1 {
          left: calc(50% - 8px);
          animation: particle-flow calc(0.15s + var(--attack) * 0.1s + var(--decay) * 0.05s + var(--sustain) * 0.1s + var(--release) * 0.05s) linear infinite;
        }

        .particle-2 {
          left: calc(50% + 8px);
          animation: particle-flow calc(0.2s + var(--attack) * 0.1s + var(--decay) * 0.05s + var(--sustain) * 0.1s + var(--release) * 0.05s) linear infinite;
        }

        .particle-3 {
          left: calc(50% - 12px);
          animation: particle-flow calc(0.25s + var(--attack) * 0.1s + var(--decay) * 0.05s + var(--sustain) * 0.1s + var(--release) * 0.05s) linear infinite;
        }

        .particle-4 {
          left: calc(50% + 12px);
          animation: particle-flow calc(0.3s + var(--attack) * 0.1s + var(--decay) * 0.05s + var(--sustain) * 0.1s + var(--release) * 0.05s) linear infinite;
        }

        .particle-5 {
          left: 50%;
          animation: particle-flow calc(0.1s + var(--attack) * 0.05s + var(--decay) * 0.05s + var(--sustain) * 0.1s + var(--release) * 0.05s) linear infinite;
        }

        /* High-FPS wind flow animation with ADSR shaping */
        @keyframes wind-flow {
          0% {
            transform: translateX(-50%) translateY(0) scaleY(0.8);
            opacity: 0.95;
          }
          20% {
            transform: translateX(-50%) translateY(-100px) scaleY(0.9);
            opacity: 0.9;
          }
          40% {
            transform: translateX(-50%) translateY(-200px) scaleY(1);
            opacity: 0.8;
          }
          60% {
            transform: translateX(-50%) translateY(-300px) scaleY(1.1);
            opacity: 0.6;
          }
          80% {
            transform: translateX(-50%) translateY(-400px) scaleY(1.2);
            opacity: 0.3;
          }
          100% {
            transform: translateX(-50%) translateY(-500px) scaleY(1.3);
            opacity: 0;
          }
        }

        /* Ultra-fast particle animation with ADSR shaping */
        @keyframes particle-flow {
          0% {
            transform: translateX(-50%) translateY(0) scaleY(0.7);
            opacity: 0.9;
          }
          25% {
            transform: translateX(-50%) translateY(-30px) scaleY(0.8);
            opacity: 0.8;
          }
          50% {
            transform: translateX(-50%) translateY(-60px) scaleY(0.9);
            opacity: 0.6;
          }
          75% {
            transform: translateX(-50%) translateY(-90px) scaleY(1);
            opacity: 0.3;
          }
          100% {
            transform: translateX(-50%) translateY(-120px) scaleY(1.1);
            opacity: 0;
          }
        }

        /* Clean slider styles matching site aesthetic */
        .clean-slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #cca483;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }

        .clean-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .clean-slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #cca483;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }

        .clean-slider::-webkit-slider-track {
          background: rgba(204, 164, 131, 0.2);
          border-radius: 8px;
          height: 8px;
        }

        .clean-slider::-moz-range-track {
          background: rgba(204, 164, 131, 0.2);
          border-radius: 8px;
          height: 8px;
        }


      `}</style>
    </div>
  );
};

export default SplitFeature;
