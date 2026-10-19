import clsx from "clsx";
import { ArrowCircleRight, CheckCircle, Circle } from "@phosphor-icons/react/ssr";
import type { activationSteps } from "../../../domain/software-status";
import { shopCopy } from "../copy";

type Step = ReturnType<typeof activationSteps>[number];

/** Real recorded steps only: done, current, or not yet. No timing, no fake progress. Server only. */
export function ActivationProgress({ lang, steps }: { lang: string; steps: Step[] }) {
  const t = shopCopy(lang).sw;
  const label = (s: Step) => {
    switch (s.key) {
      case "purchased": return t.steps.purchased;
      case "submitted": return t.steps.submitted;
      case "processing": return s.done ? t.steps.processingDone : t.steps.processingWaiting;
      default: return s.done ? t.steps.readyDone : t.steps.readyWaiting;
    }
  };
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-neutral-500">{t.progressTitle}</h3>
      <ol className="mt-3 flex flex-col gap-2.5">
        {steps.map((s) => {
          const current = !s.done && s.current;
          return (
            <li key={s.key} className="flex items-center gap-3 text-sm" aria-current={current ? "step" : undefined}>
              {s.done ? (
                <CheckCircle size={20} weight="fill" className="shrink-0 text-neutral-950" aria-hidden />
              ) : current ? (
                <ArrowCircleRight size={20} weight="fill" className="shrink-0 text-neutral-950" aria-hidden />
              ) : (
                <Circle size={20} className="shrink-0 text-neutral-300" aria-hidden />
              )}
              <span className={clsx(s.done || current ? "text-neutral-950" : "text-neutral-500", current && "font-semibold")}>
                {label(s)}
              </span>
              <span className="sr-only">, {s.done ? t.stepDone : current ? t.stepCurrent : t.stepUpcoming}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
