import clsx from "clsx";
import Link from "next/link";

/**
 * Admin UI primitives. Same design system as the site (DESIGN.md / BRAND_STYLE.md, Light
 * theme): neutral-* only, Mona Sans display headings, rounded-full buttons, rounded-2xl
 * cards with neutral-200 borders. Denser type (text-sm) because this is a work tool.
 */

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 disabled:opacity-40",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-neutral-950 bg-white px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
};

export const inputClass =
  "block w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 shadow-none outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50 disabled:text-neutral-500";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-neutral-500 transition hover:text-neutral-950">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-2xl font-bold text-neutral-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-neutral-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={clsx("rounded-2xl border border-neutral-200 bg-white shadow-sm", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="font-display text-base font-bold text-neutral-950">{title}</h2>}
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={clsx(padded && "p-5 sm:p-6")}>{children}</div>
    </section>
  );
}

const BADGE_TONES: Record<string, string> = {
  // Active / good states are solid; everything else is quiet. Monochrome by design.
  PUBLISHED: "bg-neutral-950 text-white",
  FULFILLED: "bg-neutral-950 text-white",
  ACTIVE: "bg-neutral-950 text-white",
  VALID: "bg-neutral-950 text-white",
  READY: "bg-neutral-950 text-white",
  COMPLETED: "bg-neutral-950 text-white",
  SUCCEEDED: "bg-neutral-950 text-white",
  CLEARED: "bg-neutral-950 text-white",
  PUBLIC_DOMAIN: "bg-neutral-950 text-white",
  INVALID: "border border-neutral-950 bg-white text-neutral-950",
  FAILED: "border border-neutral-950 bg-white text-neutral-950",
  REVOKED: "border border-neutral-950 bg-white text-neutral-950",
  REJECTED: "border border-neutral-950 bg-white text-neutral-950",
  RESTRICTED: "border border-neutral-950 bg-white text-neutral-950",
  NEEDS_REVIEW: "border border-neutral-950 bg-white text-neutral-950",
  REVIEW_REQUIRED: "border border-neutral-950 bg-white text-neutral-950",
  REFUNDED: "border border-neutral-400 bg-white text-neutral-700",
  PARTIALLY_REFUNDED: "border border-neutral-400 bg-white text-neutral-700",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        BADGE_TONES[status] ?? "bg-neutral-100 text-neutral-600",
        className,
      )}
    >
      {status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  help?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-800">
        {label}
      </label>
      {children}
      {help && !error && <p className="text-xs text-neutral-500">{help}</p>}
      {error && <p className="text-xs font-medium text-neutral-950">{error}</p>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center">
      <p className="font-display text-base font-bold text-neutral-950">{title}</p>
      {body && <p className="mt-2 max-w-sm text-sm text-neutral-500">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "rounded-xl px-4 py-3 text-sm",
        tone === "error" && "border border-neutral-950 bg-white font-medium text-neutral-950",
        tone === "success" && "bg-neutral-950 text-white",
        tone === "info" && "bg-neutral-100 text-neutral-700",
      )}
    >
      {children}
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("-mx-5 overflow-x-auto sm:-mx-6", className)}>
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

export const th = "whitespace-nowrap px-5 py-3 text-xs font-medium text-neutral-500 sm:px-6 first:pl-5 sm:first:pl-6";
export const td = "whitespace-nowrap px-5 py-3 text-neutral-700 sm:px-6";
export const tr = "border-t border-neutral-100 transition hover:bg-neutral-50";

export function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (p: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-between text-sm text-neutral-600" aria-label="Pagination">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 && <Link className={btn.secondary} href={hrefFor(page - 1)}>Previous</Link>}
        {page < pageCount && <Link className={btn.secondary} href={hrefFor(page + 1)}>Next</Link>}
      </div>
    </nav>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-neutral-950 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
