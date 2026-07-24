"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: any;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="group">
      <div
        className={clsx(
          "relative overflow-hidden rounded-2xl transition-all duration-300",
          isOpen
            ? "border border-neutral-200 bg-white shadow-lg"
            : "bg-neutral-50/50 hover:bg-white hover:shadow-md",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className={clsx(
            "flex w-full items-center justify-between text-left transition-all duration-300",
            isOpen ? "p-6 pb-4" : "p-6 hover:bg-neutral-50/50",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={clsx(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
                isOpen
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-200 text-neutral-600 group-hover:bg-neutral-300",
              )}
            >
              {index + 1}
            </div>
            <span className="font-display text-lg font-bold leading-relaxed text-neutral-950">
              {question}
            </span>
          </div>
          <div
            className={clsx(
              "ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
              isOpen
                ? "rotate-180 bg-neutral-900 text-white"
                : "bg-neutral-200 text-neutral-600 group-hover:bg-neutral-300",
            )}
          >
            <svg className="h-4 w-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div
          className={clsx(
            "overflow-hidden transition-all duration-500 ease-in-out",
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="px-6 pb-6">
            <div className="ml-12 rounded-lg bg-neutral-50/50 p-4">
              <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed">
                <PrismicRichText field={answer} components={instrumentRichText} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InstrumentFaq: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { title, background_color } = slice.primary;
  const bg = background_color || "#ffffff";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={INSTRUMENT_SECTION_PY_LG} style={{ backgroundColor: bg }}>
      <Container>
        {title && (
          <FadeIn>
            <h2 className="mb-10 text-center font-display text-3xl font-bold text-neutral-950 sm:text-4xl lg:mb-12">
              {title}
            </h2>
          </FadeIn>
        )}
        <FadeInStagger faster>
          <div className="mx-auto max-w-3xl space-y-4">
            {slice.items.map((item: any, index: number) => (
              <FadeIn key={index}>
                <FaqItem
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                  index={index}
                />
              </FadeIn>
            ))}
          </div>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentFaq;
