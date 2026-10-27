"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useRef } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import clsx from "clsx";
import { Eyebrow, Section, SiteRichText, toneFromSelect } from "@/lib/site-ui";

/*
 * One big statement, Apple-style: the words start dim and light up one by one while the visitor
 * scrolls through the section. Words wrapped in *asterisks* are set in the accent colour.
 */

type Word = { text: string; accent: boolean };

function parse(statement: string): Word[] {
  const words: Word[] = [];
  for (const part of statement.split(/(\*[^*]+\*)/)) {
    const accent = part.startsWith("*") && part.endsWith("*");
    for (const text of part.replace(/^\*|\*$/g, "").split(/\s+/).filter(Boolean)) words.push({ text, accent });
  }
  return words;
}

function LitWord({ word, progress, range }: { word: Word; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={clsx(word.accent && "text-accent")}>
      {word.text}{" "}
    </motion.span>
  );
}

const SiteStatement: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  if (!p.statement) return null;
  const words = parse(p.statement);

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <div className="max-w-5xl">
        {p.eyebrow && <Eyebrow>{p.eyebrow}</Eyebrow>}
        <h2
          ref={ref}
          className={clsx("site-heading text-4xl leading-[1.12] text-ink sm:text-5xl lg:text-6xl", p.eyebrow && "mt-6")}
        >
          {reduce
            ? words.map((w, i) => (
                <span key={i} className={clsx(w.accent && "text-accent")}>
                  {w.text}{" "}
                </span>
              ))
            : words.map((w, i) => (
                <LitWord key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
              ))}
        </h2>
        {isFilled.richText(p.caption) && (
          <SiteRichText field={p.caption} className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl" />
        )}
      </div>
    </Section>
  );
};

export default SiteStatement;
