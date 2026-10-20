"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useMemo, useState } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn } from "@/components/FadeIn";
import { MediaSlot } from "@/components/MediaSlot";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Section, SectionHeader, SiteRichText, cardClass, toneFromSelect } from "@/lib/site-ui";

/*
 * Organ Composer: a guided starting point for a new organ, not a price calculator. Visitors pick a
 * design (renders from Prismic), then answer a few questions; the choices travel into the
 * consultation request as structured details. Option lists live here so they stay consistent.
 */

type Step = { key: string; title: string; hint?: string; multi?: boolean; options: string[] };

const STEPS: Step[] = [
  {
    key: "Setting",
    title: "Where will the organ play?",
    options: ["Dance hall or café", "Fairground", "Street organ", "Church or concert hall", "Private collection", "Museum"],
  },
  {
    key: "Size",
    title: "How large?",
    hint: "Keys are no limit: our Virtual Orchestrion player adds missing ranks virtually, so a 105-key organ also plays 121-key music.",
    options: ["105 keys", "121 keys", "Another size", "Not sure yet"],
  },
  {
    key: "Sound",
    title: "Pipes, digital, or both?",
    options: ["Pipes", "Digital", "Pipes and digital combined"],
  },
  {
    key: "Ranks",
    title: "Which voices would you like to hear?",
    multi: true,
    options: ["Bourdon", "Flute", "Jazz flute", "Violin", "Vibraton", "Bariton", "Trumpet"],
  },
  {
    key: "Front",
    title: "What plays in the front?",
    multi: true,
    options: ["Accordion", "Drum kit", "Percussion (woodblock, tambourine, cowbell…)", "Xylophone or glockenspiel", "Animated figures"],
  },
  {
    key: "Control",
    title: "How will you play music?",
    multi: true,
    options: ["Virtual Orchestrion player (music library on a card)", "Live over MIDI", "SmartValve: expression per pipe", "Book or roll"],
  },
  {
    key: "Timing",
    title: "When would you like it?",
    options: ["Within a year", "In one to two years", "Just exploring"],
  },
];

const SCRATCH = "Start from scratch (fully bespoke)";

const OrganComposer: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const designs = (slice.items || []).filter((d: any) => d?.name);
  const [design, setDesign] = useState<string | null>(null);
  const [choices, setChoices] = useState<Record<string, string[]>>({});
  const [stage, setStage] = useState<"compose" | "send">("compose");

  const toggle = (step: Step, option: string) =>
    setChoices((c) => {
      const current = c[step.key] ?? [];
      if (!step.multi) return { ...c, [step.key]: current[0] === option ? [] : [option] };
      return { ...c, [step.key]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option] };
    });

  const details = useMemo(() => {
    const d: Record<string, string> = { "Starting design": design ?? "None chosen" };
    for (const s of STEPS) if (choices[s.key]?.length) d[s.key] = choices[s.key].join(", ");
    return d;
  }, [design, choices]);

  const chosenDesign = designs.find((d: any) => d.name === design);
  const answered = STEPS.filter((s) => choices[s.key]?.length).length;

  return (
    <Section tone={toneFromSelect(p.tone)} id="organ-composer">
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />

      {stage === "compose" ? (
        <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="space-y-14 lg:col-span-2">
            {/* 1. Starting design */}
            <fieldset>
              <legend className="site-heading text-2xl text-ink">Start from one of our designs</legend>
              <p className="mt-2 text-ink-muted">Pick the closest match. Every design can be changed, or start with a blank page.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {designs.map((d: any) => (
                  <label key={d.name} className="group cursor-pointer">
                    <input
                      type="radio"
                      name="design"
                      className="peer sr-only"
                      checked={design === d.name}
                      onChange={() => setDesign(d.name)}
                    />
                    <div className={clsx(cardClass, "overflow-hidden peer-checked:border-accent peer-checked:ring-2 peer-checked:ring-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50")}>
                      <MediaSlot field={d.image} brief={d.image_brief || `Render of the ${d.name}`} rounded="" aspect="aspect-[4/3]" sizes="(min-width: 1024px) 33vw, 100vw" />
                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{d.kind || "Modular"}</p>
                        <p className="site-heading mt-2 text-lg text-ink">{d.name}</p>
                        {d.description && <p className="mt-1 text-sm text-ink-muted">{d.description}</p>}
                      </div>
                    </div>
                  </label>
                ))}
                <label className="cursor-pointer">
                  <input type="radio" name="design" className="peer sr-only" checked={design === SCRATCH} onChange={() => setDesign(SCRATCH)} />
                  <div className={clsx(cardClass, "flex h-full min-h-48 flex-col justify-end p-5 peer-checked:border-accent peer-checked:ring-2 peer-checked:ring-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50")}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Bespoke</p>
                    <p className="site-heading mt-2 text-lg text-ink">Start from scratch</p>
                    <p className="mt-1 text-sm text-ink-muted">Every dimension, voice and façade designed for you.</p>
                  </div>
                </label>
              </div>
            </fieldset>

            {/* 2. Questions */}
            {STEPS.map((step, i) => (
              <FadeIn key={step.key}>
                <fieldset>
                  <legend className="site-heading text-2xl text-ink">
                    <span className="mr-3 tabular-nums text-accent">{String(i + 2).padStart(2, "0")}</span>
                    {step.title}
                  </legend>
                  {step.multi && <p className="mt-2 text-sm text-ink-muted">Choose as many as you like.</p>}
                  {step.hint && <p className="mt-2 max-w-2xl text-ink-muted">{step.hint}</p>}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {step.options.map((option) => {
                      const on = choices[step.key]?.includes(option) ?? false;
                      return (
                        <button
                          key={option}
                          type="button"
                          role={step.multi ? "checkbox" : "radio"}
                          aria-checked={on}
                          onClick={() => toggle(step, option)}
                          className={clsx(
                            "rounded-full border px-4 py-2 text-sm transition focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none",
                            on ? "border-accent bg-accent text-accent-contrast" : "border-line text-ink hover:border-ink",
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </FadeIn>
            ))}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className={clsx(cardClass, "overflow-hidden")}>
              {chosenDesign && (
                <MediaSlot field={chosenDesign.image} brief={chosenDesign.image_brief || `Render of the ${chosenDesign.name}`} rounded="" aspect="aspect-[4/3]" sizes="(min-width: 1024px) 33vw, 100vw" />
              )}
              <div className="p-6">
                <h3 className="site-heading text-xl text-ink">Your starting point</h3>
                <dl className="mt-4 divide-y divide-line text-sm">
                  <div className="flex justify-between gap-4 py-2">
                    <dt className="text-ink-muted">Design</dt>
                    <dd className="text-right text-ink">{design ?? "Not chosen yet"}</dd>
                  </div>
                  {STEPS.filter((s) => choices[s.key]?.length).map((s) => (
                    <div key={s.key} className="flex justify-between gap-4 py-2">
                      <dt className="text-ink-muted">{s.key}</dt>
                      <dd className="text-right text-ink">{choices[s.key].join(", ")}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={() => setStage("send")}
                  disabled={!design && answered === 0}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 font-semibold text-accent-contrast transition hover:opacity-90 disabled:opacity-50"
                >
                  Send this as a starting point
                </button>
                <p className="mt-3 text-center text-xs text-ink-muted">No commitment. We reply with questions and a first idea.</p>
              </div>
            </div>
            <SiteRichText field={p.bespoke_note} className="mt-6 text-sm leading-relaxed text-ink-muted" />
          </aside>
        </div>
      ) : (
        <div className="mx-auto mt-16 grid max-w-5xl gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className={clsx(cardClass, "p-6")}>
              <h3 className="site-heading text-xl text-ink">Your starting point</h3>
              <dl className="mt-4 divide-y divide-line text-sm">
                {Object.entries(details).map(([k, v]) => (
                  <div key={k} className="py-2">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="mt-0.5 text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={() => setStage("compose")} className="mt-4 text-sm font-medium text-ink underline decoration-accent-soft underline-offset-4">
                Change choices
              </button>
            </div>
          </div>
          <div className="lg:col-span-3">
            <EnquiryForm
              to="decap"
              topics={[]}
              defaultTopic="Organ Composer"
              showLocation
              details={details}
              messagePlaceholder="Tell us a little more: the room, who will listen, music you love, ideas for the façade…"
              submitLabel="Send my starting point"
              success={
                <div className={clsx(cardClass, "p-8")}>
                  <h3 className="site-heading text-2xl text-ink">{p.success_title || "Your starting point is on its way"}</h3>
                  {isFilled.richText(p.success_body) ? (
                    <SiteRichText field={p.success_body} className="mt-4 text-lg text-ink-muted" />
                  ) : (
                    <p className="mt-4 text-lg text-ink-muted">We will study your choices and get back to you within a few working days.</p>
                  )}
                </div>
              }
            />
          </div>
        </div>
      )}
    </Section>
  );
};

export default OrganComposer;
