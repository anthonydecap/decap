import clsx from "clsx";
import Link from "next/link";
import {
  ChatCircleText,
  CheckSquare,
  DotOutline,
  FileText,
  Lifebuoy,
  MusicNotes,
  Note,
  PianoKeys,
  Receipt,
  Tag,
  User,
  Warning,
} from "@phosphor-icons/react/ssr";
import { formatDateTime } from "../../format";
import { EmptyState } from "../primitives";

/** Server-rendered CRM building blocks (no client state). */

export function TagChips({ tags }: { tags: { id?: string; name: string; isAlert: boolean }[] }) {
  if (!tags.length) return <span className="text-sm text-neutral-400">No tags</span>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li
          key={t.id ?? t.name}
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            t.isAlert ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700",
          )}
        >
          {t.isAlert && <Warning size={12} weight="bold" aria-label="Alert" />}
          {t.name}
        </li>
      ))}
    </ul>
  );
}

/** The one loud element on a customer page: alert tags staff must not miss. */
export function AlertBanner({ alerts }: { alerts: { id: string; name: string; description: string | null }[] }) {
  if (!alerts.length) return null;
  return (
    <div role="alert" className="mb-6 flex gap-3 rounded-2xl bg-neutral-950 px-5 py-4 text-white">
      <Warning size={22} weight="bold" className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="font-display text-sm font-bold">Important for this customer</p>
        <ul className="mt-1 flex flex-col gap-1 text-sm">
          {alerts.map((a) => (
            <li key={a.id}>
              <span className="font-semibold">{a.name}</span>
              {a.description && <span className="text-neutral-300">: {a.description}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SegmentedTabs({ tabs, active, hrefFor }: { tabs: { key: string; label: string }[]; active: string; hrefFor: (key: string) => string }) {
  return (
    <nav aria-label="Customer sections" className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="inline-flex gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
        {tabs.map((t) => (
          <li key={t.key}>
            <Link
              href={hrefFor(t.key)}
              scroll={false}
              aria-current={t.key === active ? "page" : undefined}
              className={clsx(
                "block whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition",
                t.key === active ? "bg-neutral-950 font-semibold text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
              )}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Metric({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-neutral-500">{label}</p>
      <div className="mt-1 break-words font-display text-lg font-bold text-neutral-950 tabular-nums">{children}</div>
      {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

const ICONS: [prefix: string, icon: typeof User][] = [
  ["order.", Receipt],
  ["entitlement.", MusicNotes],
  ["player.", PianoKeys],
  ["support.", Lifebuoy],
  ["note.", Note],
  ["task.", CheckSquare],
  ["communication.", ChatCircleText],
  ["crm.", Tag],
  ["document.", FileText],
  ["customer.", User],
  ["account.", User],
  ["profile.", User],
  ["billing.", User],
];

function iconFor(type: string) {
  return ICONS.find(([p]) => type.startsWith(p))?.[1] ?? DotOutline;
}

export type TimelineEntry = { id: string; type: string; summary: string; occurredAt: Date; staffName: string | null };

/** Newest first: the question staff ask is "what happened last". */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (!entries.length) return <EmptyState title="Nothing on the timeline yet" body="Orders, players, tickets, notes and tasks appear here automatically." />;
  return (
    <ol className="relative flex flex-col gap-4">
      {entries.map((e) => {
        const Icon = iconFor(e.type);
        return (
          <li key={e.id} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700">
              <Icon size={16} aria-hidden />
            </span>
            <div className="min-w-0 pt-1 text-sm">
              <p className="break-words text-neutral-900">{e.summary}</p>
              <p className="text-xs text-neutral-500">
                {formatDateTime(e.occurredAt)}
                {e.staffName && `, by ${e.staffName}`}
                <span className="sr-only">, event {e.type}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
