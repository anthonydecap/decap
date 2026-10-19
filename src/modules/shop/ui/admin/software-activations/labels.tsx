import clsx from "clsx";

/**
 * Display helpers for software activations, licenses and installations in the admin.
 * No hooks and no server imports: server pages and client components both use them.
 */

export const ACTIVATION_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "New",
  IN_REVIEW: "In review",
  WAITING_FOR_CUSTOMER: "Waiting for customer",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

export const LICENSE_STATUS_LABEL: Record<string, string> = {
  PENDING_ACTIVATION: "Pending activation",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  REVOKED: "Revoked",
};

export const INSTALLATION_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  DEACTIVATED: "Deactivated",
  RETIRED: "Retired",
};

export const LICENSE_SOURCE_LABEL: Record<string, string> = {
  PURCHASE: "Purchase",
  ADMIN: "Manual",
  LEGACY_IMPORT: "Legacy",
  PROMOTION: "Promotion",
};

export const OPEN_ACTIVATION = ["SUBMITTED", "IN_REVIEW", "WAITING_FOR_CUSTOMER"];

/**
 * Monochrome tones: work for staff is solid, good outcomes are solid, closed or blocked states
 * are outlined, the rest is quiet.
 */
const TONES: Record<string, string> = {
  SUBMITTED: "bg-neutral-950 text-white",
  IN_REVIEW: "border border-neutral-950 bg-white text-neutral-950",
  WAITING_FOR_CUSTOMER: "bg-neutral-100 text-neutral-600",
  APPROVED: "bg-neutral-950 text-white",
  ACTIVE: "bg-neutral-950 text-white",
  REJECTED: "border border-neutral-950 bg-white text-neutral-950",
  REVOKED: "border border-neutral-950 bg-white text-neutral-950",
  SUSPENDED: "border border-neutral-400 bg-white text-neutral-700",
  CANCELLED: "bg-neutral-100 text-neutral-500",
  RETIRED: "bg-neutral-100 text-neutral-500",
  DEACTIVATED: "bg-neutral-100 text-neutral-500",
  PENDING_ACTIVATION: "bg-neutral-100 text-neutral-700",
};

export function SoftwareBadge({
  status,
  kind,
  className,
}: {
  status: string;
  kind: "activation" | "license" | "installation";
  className?: string;
}) {
  const labels = kind === "activation" ? ACTIVATION_STATUS_LABEL : kind === "license" ? LICENSE_STATUS_LABEL : INSTALLATION_STATUS_LABEL;
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONES[status] ?? "bg-neutral-100 text-neutral-600",
        className,
      )}
    >
      {labels[status] ?? status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}

/** Quiet outlined flag for queue rows ("Review needed", "Replacement"). */
export function Flag({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs",
        strong ? "bg-neutral-950 font-semibold text-white" : "border border-neutral-300 font-medium text-neutral-700",
      )}
    >
      {children}
    </span>
  );
}

/** Registration codes are stored without separators; staff read them in groups of four. */
export const groupCode = (code: string) => code.match(/.{1,4}/g)?.join("-") ?? code;

export function staffName(s: { displayName: string | null; email: string | null } | null | undefined): string | null {
  if (!s) return null;
  return s.displayName ?? s.email ?? null;
}

export function customerLabel(c: { firstName: string | null; lastName: string | null; companyName?: string | null; email: string }): string {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return c.companyName || name || c.email;
}
