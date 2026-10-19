import clsx from "clsx";
import { CheckCircle, HandPointing, HourglassMedium } from "@phosphor-icons/react/ssr";
import type { CustomerSoftwareStatus } from "../../../domain/software-status";
import { shopCopy } from "../copy";
import { whoseMove } from "./status";

/** Friendly status label, who acts next, and a one-line "what next". Server only. */
export function StatusSummary({ lang, status, className }: { lang: string; status: CustomerSoftwareStatus; className?: string }) {
  const t = shopCopy(lang).sw;
  const s = t.statuses[status] ?? { label: status, next: "" };
  const move = whoseMove(status);
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "inline-block rounded-full px-3 py-1 text-xs font-semibold",
            move === "customer" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700",
          )}
        >
          {s.label}
        </span>
        {move && (
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
            {move === "customer" ? (
              <HandPointing size={14} weight="bold" aria-hidden />
            ) : move === "dmi" ? (
              <HourglassMedium size={14} weight="bold" aria-hidden />
            ) : (
              <CheckCircle size={14} weight="bold" aria-hidden />
            )}
            {move === "customer" ? t.yourMove : move === "dmi" ? t.dmiMove : t.allSet}
          </span>
        )}
      </div>
      {s.next && <p className="mt-2 text-sm text-neutral-600">{s.next}</p>}
    </div>
  );
}
