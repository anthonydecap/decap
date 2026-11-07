"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import clsx from "clsx";
import { FadeIn } from "@/components/FadeIn";
import { useUiCopy } from "@/lib/ui-copy";

const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const isBlack = (n: number) => [1, 3, 6, 8, 10].includes(((n % 12) + 12) % 12);
/** MIDI 60 = C4 (middle C) */
const noteName = (n: number) => `${NAMES[((n % 12) + 12) % 12]}${Math.floor(n / 12) - 1}`;

type Family = "stopped" | "open" | "reed" | "other";
const FAMILIES: Family[] = ["stopped", "open", "reed", "other"];

/** Pipe family from the editor's note, in any site language ("3 octaves, stopped" / "bouché" …) */
function familyOf(note?: string | null): Family {
  const s = (note || "").toLowerCase();
  if (/stopped|bouch|gedekt|gedackt/.test(s)) return "stopped";
  if (/reed|anche|tong|zunge/.test(s)) return "reed";
  if (/open|ouvert|offen/.test(s)) return "open";
  return "other";
}

/** "MIDI 48–84" → [48, 84] */
function parseRange(value?: string | null): [number, number] | null {
  const m = (value || "").match(/(\d{1,3})\s*[–—-]\s*(\d{1,3})/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  return lo < hi && hi <= 127 ? [lo, hi] : null;
}

/** One keyboard over the shared compass; the keys this rank covers are solid, the rest ghosted. */
function Keyboard({ from, to, lo, hi }: { from: number; to: number; lo: number; hi: number }) {
  const notes = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const whites = notes.filter((n) => !isBlack(n));
  const keyWidth = 100 / whites.length;
  const inRange = (n: number) => n >= lo && n <= hi;

  return (
    <div className="relative h-11 sm:h-14" aria-hidden="true">
      <div className="flex h-full">
        {whites.map((n) => (
          <div
            key={n}
            className={clsx(
              "relative h-full flex-1 rounded-b-[3px] border-y border-r first:border-l transition-colors duration-500",
              inRange(n) ? "border-ink/30 bg-page" : "border-line bg-surface",
            )}
          >
            {n === 60 && <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ink/40 sm:bottom-2" />}
          </div>
        ))}
      </div>
      {notes.filter(isBlack).map((n) => {
        const whitesBefore = whites.filter((w) => w < n).length;
        return (
          <div
            key={n}
            className={clsx(
              "absolute top-0 h-[60%] rounded-b-[2px] transition-colors duration-500",
              inRange(n) ? "bg-ink" : "bg-ink/10",
            )}
            style={{ left: `${(whitesBefore - 0.3) * keyWidth}%`, width: `${keyWidth * 0.6}%` }}
          />
        );
      })}
    </div>
  );
}

/** Octave labels (C1, C2 …) under the C keys of the shared compass */
function OctaveScale({ from, to }: { from: number; to: number }) {
  const whites = Array.from({ length: to - from + 1 }, (_, i) => from + i).filter((n) => !isBlack(n));
  const keyWidth = 100 / whites.length;
  return (
    <div className="relative h-5 text-xs tabular-nums text-ink-muted" aria-hidden="true">
      {whites.map((n, i) =>
        n % 12 === 0 ? (
          <span key={n} className="absolute top-0" style={{ left: `${i * keyWidth}%` }}>
            {noteName(n)}
          </span>
        ) : null,
      )}
    </div>
  );
}

/**
 * "Pipe ranges" layout of SiteFacts: every rank as a keyboard on one shared compass, grouped
 * into stopped, open and reed pipes. Reads the existing items: label = rank, value = "MIDI lo–hi",
 * note = "3 octaves, stopped" (the family keyword picks the group).
 */
export function PipeRanges({ facts }: { facts: any[] }) {
  const t = useUiCopy();
  const ranks = facts.map((fact) => ({ ...fact, range: parseRange(fact.value), family: familyOf(fact.note) }));
  const ranged = ranks.filter((r) => r.range);
  if (ranged.length === 0) return null;

  // Shared compass from the C at or below the lowest note to the C at or above the highest
  const from = Math.floor(Math.min(...ranged.map((r) => r.range![0])) / 12) * 12;
  const to = Math.ceil(Math.max(...ranged.map((r) => r.range![1])) / 12) * 12;

  const groups = FAMILIES.map((family) => ({ family, items: ranks.filter((r) => r.family === family) })).filter(
    (g) => g.items.length > 0,
  );
  const showGroups = groups.length > 1;

  return (
    <div className="space-y-14 lg:space-y-16">
      {groups.map(({ family, items }) => (
        <section key={family} aria-label={showGroups ? t.pipeFamily[family] : undefined}>
          {showGroups && (
            <FadeIn className="mb-2 grid gap-x-10 lg:grid-cols-12">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink lg:col-span-3">
                {t.pipeFamily[family]}
              </h3>
              <div className="mt-4 lg:col-span-9 lg:mt-0">
                <OctaveScale from={from} to={to} />
              </div>
            </FadeIn>
          )}
          <div role="list">
            {items.map((rank, i) => (
              <FadeIn key={i} role="listitem">
                <div className="grid items-center gap-x-10 gap-y-4 border-t border-line py-6 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <p className="site-heading text-xl leading-tight text-ink sm:text-2xl">{rank.label}</p>
                    <p className="mt-1.5 text-sm text-ink-muted">
                      {rank.range ? (
                        <>
                          <span className="font-medium text-ink">
                            {noteName(rank.range[0])}–{noteName(rank.range[1])}
                          </span>
                          <span className="sr-only"> ({rank.value})</span>
                        </>
                      ) : (
                        <span className="font-medium text-ink">{rank.value}</span>
                      )}
                      {rank.note && <span> · {rank.note}</span>}
                    </p>
                  </div>
                  <div className="lg:col-span-9">
                    {rank.range && <Keyboard from={from} to={to} lo={rank.range[0]} hi={rank.range[1]} />}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
