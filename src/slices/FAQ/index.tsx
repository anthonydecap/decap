/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type FC, useState } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { SectionIntro } from "@/components/SectionIntro";
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

interface FAQItemProps {
  question: string;
  answer: any;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const FAQItem: FC<FAQItemProps> = ({ question, answer, isOpen, onToggle, index }) => {
  return (
    <div className="group">
      <div className={clsx(
        "relative overflow-hidden rounded-2xl transition-all duration-300 ease-in-out",
        isOpen 
          ? "border border-neutral-300 bg-white shadow-lg" 
          : "bg-neutral-50/50 hover:bg-white hover:shadow-md"
      )}>
        <button
          onClick={onToggle}
          className={clsx(
            "flex w-full items-center justify-between text-left transition-all duration-300 ",
            isOpen ? "p-6 pb-4" : "p-6 hover:bg-neutral-50/50"
          )}
        >
          <div className="flex items-start gap-4">
            {/* Question number */}
            <div className={clsx(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
              isOpen 
                ? "bg-neutral-900 text-white" 
                : "bg-neutral-200 text-neutral-600 group-hover:bg-neutral-300"
            )}>
              {index + 1}
            </div>
            
            {/* Question text */}
            <span className="font-display text-lg font-semibold text-neutral-950 leading-relaxed">
              {question}
            </span>
          </div>
          
          {/* Animated chevron icon */}
          <div className="flex-shrink-0 ml-4">
            <div className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
              isOpen 
                ? "bg-neutral-900 text-white rotate-180" 
                : "bg-neutral-200 text-neutral-600 group-hover:bg-neutral-300"
            )}>
              <svg
                className="h-4 w-4 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </button>
        
        {/* Answer content with smooth animation */}
        <div
          className={clsx(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-6 pb-6">
            <div className="ml-12 rounded-lg bg-neutral-50/50 p-4">
              <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed">
                <PrismicRichText field={answer} components={components} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Props for `FAQ`.
 */
type FAQProps = SliceComponentProps<Content.FaqSlice>;

/**
 * Component for "FAQ" Slices.
 */
const FAQ: FC<FAQProps> = ({ slice }) => {
  const { title, eyebrow, description } = slice.primary;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Container className="mt-8 sm:mt-12 lg:mt-16 sm:py-28 md:py-32">
      {(title || eyebrow || description) && (
        <SectionIntro title={title || ""} eyebrow={eyebrow || ""}>
          {description && (
            <PrismicRichText field={description} components={components} />
          )}
        </SectionIntro>
      )}
      
      <FadeInStagger className="mt-16">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {slice.items.map((item: any, index: number) => (
              <FadeIn key={index}>
                <FAQItem
                  question={item.question || ""}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  onToggle={() => toggleFAQ(index)}
                  index={index}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      </FadeInStagger>
    </Container>
  );
};

export default FAQ; 