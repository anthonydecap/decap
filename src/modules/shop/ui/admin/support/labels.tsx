import clsx from "clsx";

/**
 * Display helpers for the admin support inbox and ticket workspace. No hooks and no server
 * imports, so both server pages and client components can use them.
 */

export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_SUPPORT", "RESOLVED", "CLOSED"] as const;
export const TICKET_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const TASK_PRIORITIES = TICKET_PRIORITIES;

export type TicketStatusValue = (typeof TICKET_STATUSES)[number];
export type TicketPriorityValue = (typeof TICKET_PRIORITIES)[number];

/** Staff-facing status names (customers get friendlier labels on their side). */
export const STAFF_STATUS_LABEL: Record<TicketStatusValue, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING_FOR_CUSTOMER: "Waiting for customer",
  WAITING_FOR_SUPPORT: "Waiting for support",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABEL: Record<TicketPriorityValue, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

/** Monochrome emphasis: URGENT is solid, HIGH is outlined and bold, the rest are quiet. */
export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const p = priority as TicketPriorityValue;
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs",
        p === "URGENT" && "bg-neutral-950 font-bold text-white",
        p === "HIGH" && "border border-neutral-950 bg-white font-bold text-neutral-950",
        p === "NORMAL" && "bg-neutral-100 font-medium text-neutral-600",
        p === "LOW" && "font-medium text-neutral-400",
        className,
      )}
    >
      {PRIORITY_LABEL[p] ?? priority}
    </span>
  );
}

/** Compact duration, e.g. "3 min", "5 h", "2 d", "4 w". */
export function shortDuration(ms: number): string {
  const s = Math.max(Math.round(ms / 1000), 0);
  if (s < 60) return "under 1 min";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 28) return `${d} d`;
  return `${Math.floor(d / 7)} w`;
}

/** Request time for server-rendered relative dates (pages are force-dynamic). */
export function requestTime(): number {
  return Date.now();
}

/** Start of today (server local time), for "overdue" checks. */
export function startOfToday(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function timeAgo(d: Date | string, now = Date.now()): string {
  const ms = now - new Date(d).getTime();
  if (ms < 60_000) return "just now";
  return `${shortDuration(ms)} ago`;
}

export function personName(c: { firstName: string | null; lastName: string | null }): string | null {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return name || null;
}

export function staffLabel(s: { displayName: string | null; email: string | null } | null | undefined): string | null {
  if (!s) return null;
  return s.displayName ?? s.email ?? null;
}
