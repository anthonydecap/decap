"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => <PrismicNextLink field={node.data}>{children}</PrismicNextLink>,
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">{children}</code>
    ) : null,
};

/** User-provided icons: MIDI 2.0, ADSR, Polyphonic. midi_cc kept as faders. */
const IconBlockIcons: Record<string, React.ReactNode> = {
  midi_2: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.15 8.26H22v7.48h-1.85M13 8.26h5.43c.57 0 .87.48.87 1.04v5.51c0 .69-.3.93-.92.93H13V11h1.87v2.91h2.63V9.95H13m-2.68-1.69h1.82v7.48h-1.82M2 8.26h6.55c.55 0 .86.48.86 1.04v6.44H7.59v-5.59H6.5v5.59H4.87v-5.59H3.83v5.59H2Z" />
    </svg>
  ),
  adsr: (
    <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path fill="none" d="M18.159 5.5v37m0-32.613c3.7 0 2.243 28.926 9.925 28.926H42.5M18.159 9.887c-3.701 0-2.243 28.926-9.925 28.926H5.5" />
      <path fill="none" d="M38.5 5.5h-29a4 4 0 0 0-4 4v29a4 4 0 0 0 4 4h29a4 4 0 0 0 4-4v-29a4 4 0 0 0-4-4" />
    </svg>
  ),
  polyphonic_aftertouch: (
    <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path fill="none" d="M14.393 24.59a11.044 11.044 0 1 1 15.864-3.458" />
      <path fill="none" d="m18.48 43.499l-7.53-7.53c-1.625-1.994 1.781-5.328 3.62-3.495l3.786 3.703l-.084-20.428c.095-3.186 5.033-3.445 5.075-.041l.042 9.277c-.06-2.326 4.623-2.548 4.785-.041l.041 2.548c-.012-2.063 4.92-1.744 5.076.322l-.042 3.162c.09-2.21 5.014-2.223 4.992-.04l.073 10.907A1.646 1.646 0 0 1 36.68 43.5h-.011Z" />
    </svg>
  ),
  midi_cc: (
    <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="4" width="6" height="24" rx="2" />
      <rect x="20" y="4" width="6" height="24" rx="2" />
      <circle cx="9" cy="10" r="2.5" fill="currentColor" />
      <circle cx="23" cy="14" r="2.5" fill="currentColor" />
      <path d="M9 14v10M23 18v10" strokeWidth="2" />
    </svg>
  ),
};

type SmartValveIconBlocksProps = SliceComponentProps<any>;

const SmartValveIconBlocks: FC<SmartValveIconBlocksProps> = ({ slice }) => {
  const { section_title, background_color } = slice.primary;
  const bgColor = background_color || "#0a0a0a";
  const items = slice.items || [];

  return (
    <div className="py-12 sm:py-16 lg:py-24 text-white" style={{ backgroundColor: bgColor }}>
      <Container>
        {section_title && section_title.length > 0 && (
          <div className="text-center mb-12 lg:mb-16">
            <FadeIn>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
                <PrismicRichText field={section_title} components={components} />
              </div>
            </FadeIn>
          </div>
        )}

        <FadeInStagger faster>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8 sm:p-10 lg:p-12 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10">
              {items.map((item: any, index: number) => {
                const iconKey = (item.icon as string) || "midi_2";
                const icon = IconBlockIcons[iconKey] ?? IconBlockIcons.midi_2;

                return (
                  <FadeIn key={index}>
                    <div className="flex flex-col items-start text-left">
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-neutral-200 mb-6 flex-shrink-0"
                        aria-hidden
                      >
                        <div className="w-full h-full max-w-[64px] max-h-[64px]">{icon}</div>
                      </div>
                      {item.description && (
                        <div className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                          <PrismicRichText field={item.description} components={components} />
                        </div>
                      )}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </FadeInStagger>
      </Container>
    </div>
  );
};

export default SmartValveIconBlocks;
