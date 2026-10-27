"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { isFilled } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import clsx from "clsx";
import { FadeIn } from "@/components/FadeIn";
import { Section, SectionHeader, toneFromSelect } from "@/lib/site-ui";

/*
 * Apple-style comparison: two or three options side by side, one feature per row. "yes" in a cell
 * shows a check mark, "no" a dash; anything else is shown as text. One column can be highlighted.
 * On phones the feature name sits above its row of values.
 */

const COLS: Record<number, string> = {
  2: "grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]",
  3: "grid-cols-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]",
};
const SPAN: Record<number, string> = { 2: "col-span-2", 3: "col-span-3" };

function Value({ value }: { value: string }) {
  const v = (value || "").trim();
  const low = v.toLowerCase();
  if (["yes", "oui", "ja"].includes(low)) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-contrast">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">{v}</span>
      </span>
    );
  }
  if (["no", "non", "nee", "nein", "-", "—"].includes(low)) {
    return (
      <span className="text-xl leading-none text-ink-muted/60">
        <span aria-hidden="true">—</span>
        <span className="sr-only">{v}</span>
      </span>
    );
  }
  return <span className="text-sm leading-snug text-ink sm:text-base">{v}</span>;
}

const SiteCompare: FC<SliceComponentProps<any>> = ({ slice }) => {
  const p = slice.primary;
  const columns = [1, 2, 3]
    .map((n) => ({ n, name: p[`col${n}`] as string, note: p[`col${n}_note`] as string }))
    .filter((c) => c.name);
  const rows: any[] = (slice.items || []).filter((r: any) => r?.feature);
  if (columns.length < 2 || !rows.length) return null;
  const count = columns.length;
  const hi = Number(p.highlight) || 0;
  const hasHeader = !!(p.eyebrow || p.title || isFilled.richText(p.intro));
  // The highlighted column is tinted from md up; on phones its values are set in bold instead.
  const tint = (n: number) => n === hi && "md:bg-accent/[0.07]";

  return (
    <Section tone={toneFromSelect(p.tone)}>
      <SectionHeader eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <FadeIn className={clsx("mx-auto max-w-6xl", hasHeader && "mt-12 lg:mt-16")}>
        <div role="table" className={clsx("grid gap-x-2 sm:gap-x-4", COLS[count])}>
          {/* Header */}
          <div role="row" className="contents">
            <div role="columnheader" className="hidden md:block" />
            {columns.map((c) => (
              <div
                key={c.n}
                role="columnheader"
                className={clsx("flex flex-col items-center justify-end rounded-t-3xl px-2 pt-6 pb-6 text-center sm:px-4", tint(c.n))}
              >
                {c.n === hi && p.highlight_label && (
                  <span className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-contrast">
                    {p.highlight_label}
                  </span>
                )}
                <p className="site-heading text-base leading-tight text-ink sm:text-xl">{c.name}</p>
                {c.note && <p className="mt-1.5 hidden text-sm text-ink-muted sm:block">{c.note}</p>}
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((r, i) => {
            const last = i === rows.length - 1;
            return (
              <div role="row" key={i} className="contents">
                <div
                  role="rowheader"
                  className={clsx(
                    "border-t border-line pt-5 pb-2 text-sm font-semibold text-ink md:col-span-1 md:py-5 md:pr-4 md:text-base",
                    SPAN[count],
                  )}
                >
                  {r.feature}
                </div>
                {columns.map((c) => (
                  <div
                    role="cell"
                    key={c.n}
                    className={clsx(
                      "flex items-start justify-center px-2 pb-5 text-center sm:px-4 md:items-center md:border-t md:border-line md:py-5",
                      tint(c.n),
                      c.n === hi && "font-semibold md:font-normal",
                      last && "rounded-b-3xl",
                    )}
                  >
                    <Value value={r[`col${c.n}`]} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </FadeIn>
    </Section>
  );
};

export default SiteCompare;
