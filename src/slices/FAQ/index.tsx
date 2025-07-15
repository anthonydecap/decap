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
}

const FAQItem: FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
      >
        <span className="font-display text-lg font-semibold text-neutral-950 pr-8">
          {question}
        </span>
        <div className="flex-shrink-0">
          <svg
            className={clsx(
              "h-5 w-5 text-neutral-950 transition-transform duration-200",
              isOpen ? "rotate-45" : "rotate-0"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </button>
      
      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pb-6 pr-8">
          <div className="prose prose-neutral max-w-none text-neutral-600">
            <PrismicRichText field={answer} components={components} />
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
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      {(title || eyebrow || description) && (
        <SectionIntro title={title || ""} eyebrow={eyebrow || ""}>
          {description && (
            <PrismicRichText field={description} components={components} />
          )}
        </SectionIntro>
      )}
      
      <FadeInStagger className="mt-16">
        <div className="mx-auto max-w-3xl">
          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
            {slice.items.map((item: any, index: number) => (
              <FadeIn key={index}>
                <FAQItem
                  question={item.question || ""}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  onToggle={() => toggleFAQ(index)}
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