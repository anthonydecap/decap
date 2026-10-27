"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState } from "react";
import { type SliceComponentProps } from "@prismicio/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { FadeIn } from "@/components/FadeIn";
import { Section, SectionHeader, toneFromSelect } from "@/lib/site-ui";

/*
 * Orchestra view: one lane per instrument, drawn as a small piano roll. In "book" mode every lane
 * follows the same line at the same strength, as instruments coupled to one book track do. In
 * "Decap" mode every lane plays its own part, and note height and brightness show the velocity.
 */

/** A note: [start step (of 16), length in steps, velocity 0–1, pitch 0–1]. */
type Note = [number, number, number, number];

const MELODY: Note[] = [[0, 2, 0.8, 0.6], [2, 1, 0.5, 0.75], [3, 1, 0.6, 0.9], [4, 3, 1, 0.7], [8, 2, 0.7, 0.5], [10, 1, 0.45, 0.6], [11, 1, 0.55, 0.8], [12, 4, 0.9, 0.65]];
const PARTS: Note[][] = [
  MELODY,
  // ornaments
  [[1, 0.5, 0.4, 0.9], [1.75, 0.5, 0.55, 0.8], [5, 0.5, 0.35, 0.95], [5.75, 0.5, 0.6, 0.85], [9, 0.5, 0.4, 0.9], [9.75, 0.5, 0.55, 0.7], [13, 0.5, 0.45, 0.95], [13.75, 0.5, 0.7, 0.8]],
  // counter-melody
  [[0, 3, 0.45, 0.3], [3, 1, 0.3, 0.4], [4, 4, 0.6, 0.45], [8, 3, 0.5, 0.35], [11, 1, 0.3, 0.5], [12, 2, 0.7, 0.4], [14, 1, 0.5, 0.3], [15, 1, 0.4, 0.25]],
  // accompaniment
  [[0, 1, 0.9, 0.4], [2, 1, 0.4, 0.55], [4, 1, 0.85, 0.45], [6, 1, 0.35, 0.6], [8, 1, 0.95, 0.4], [10, 1, 0.4, 0.55], [12, 1, 0.8, 0.45], [14, 1, 0.3, 0.6]],
  // accents
  [[0, 0.5, 1, 0.5], [2, 0.5, 0.35, 0.5], [4, 0.5, 0.8, 0.5], [6, 0.5, 0.3, 0.5], [8, 0.5, 1, 0.5], [10, 0.5, 0.4, 0.5], [12, 0.5, 0.75, 0.5], [14, 0.5, 0.5, 0.5]],
];
const BOOK: Note[] = MELODY.map(([s, l, , p]) => [s, l, 1, p]);
const STEPS = 16;
const LOOP = 6; // seconds for one pass of the playhead

function Lane({ notes, playing }: { notes: Note[]; playing: boolean }) {
  return (
    <div className="relative h-12 overflow-hidden rounded-xl bg-ink/[0.06] sm:h-14">
      {/* beat lines */}
      {[4, 8, 12].map((b) => (
        <div key={b} className="absolute inset-y-0 w-px bg-ink/[0.08]" style={{ left: `${(b / STEPS) * 100}%` }} />
      ))}
      {notes.map(([start, len, vel, pitch], i) => {
        const h = 5 + vel * 11;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent"
            initial={false}
            animate={{
              left: `calc(${(start / STEPS) * 100}% + 2px)`,
              width: `calc(${(len / STEPS) * 100}% - 4px)`,
              top: `calc(${(1 - pitch) * 70 + 15}% - ${h / 2}px)`,
              height: h,
              opacity: 0.3 + vel * 0.7,
            }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: i * 0.02 }}
          />
        );
      })}
      {playing && (
        <motion.div
          className="absolute inset-y-0 w-0.5 bg-ink/40"
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          transition={{ duration: LOOP, ease: "linear", repeat: Infinity }}
        />
      )}
    </div>
  );
}

const SiteOrchestra: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const reduce = useReducedMotion();
  const [decap, setDecap] = useState(true);
  const lanes: any[] = (slice.items || []).filter((i: any) => i?.instrument);
  if (!lanes.length) return null;

  const options = [
    { on: false, label: p.book_label || "Book" },
    { on: true, label: p.decap_label || "Decap" },
  ];
  const caption = decap ? p.decap_caption : p.book_caption;

  return (
    <Section tone={toneFromSelect(p.tone ?? "Dark band")}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      <FadeIn className="mt-12 lg:mt-16">
        {/* Segmented switch */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-ink/[0.08] p-1" role="group">
            {options.map((o) => (
              <button
                key={String(o.on)}
                type="button"
                aria-pressed={decap === o.on}
                onClick={() => setDecap(o.on)}
                className={clsx(
                  "relative rounded-full px-5 py-2 text-sm font-semibold transition-colors sm:px-6",
                  decap === o.on ? "text-page" : "text-ink-muted hover:text-ink",
                )}
              >
                {decap === o.on && (
                  <motion.span layoutId={`orchestra-pill-${slice.id}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className="relative">{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The orchestra */}
        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-line p-4 sm:p-8">
          <div className="space-y-3 sm:space-y-4">
            {lanes.map((lane, i) => (
              <div key={i} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink sm:text-base">{lane.instrument}</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={String(decap)}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs leading-snug text-ink-muted sm:text-sm"
                    >
                      {decap ? (
                        <>
                          {lane.role}
                          {lane.address && <span className="block text-[11px] tabular-nums opacity-70 sm:text-xs">{lane.address}</span>}
                        </>
                      ) : (
                        options[0].label
                      )}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <Lane notes={decap ? PARTS[i % PARTS.length] : BOOK} playing={!reduce} />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-2xl text-center">
          <AnimatePresence mode="wait" initial={false}>
            {caption && (
              <motion.p
                key={String(decap)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-lg leading-relaxed text-ink sm:text-xl"
              >
                {caption}
              </motion.p>
            )}
          </AnimatePresence>
          {p.note && <p className="mt-3 text-sm text-ink-muted">{p.note}</p>}
        </div>
      </FadeIn>
    </Section>
  );
};

export default SiteOrchestra;
