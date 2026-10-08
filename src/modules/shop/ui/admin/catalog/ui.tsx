import clsx from "clsx";
import Link from "next/link";

/** Small catalog-only building blocks (server-safe: no hooks). */

export const selectClass =
  "block w-full appearance-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50 disabled:text-neutral-500";

export const textareaClass =
  "block w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";

export function SegmentedLinks({
  items,
  current,
  label,
}: {
  items: { key: string; label: string; href: string; disabled?: boolean }[];
  current: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="mb-6 inline-flex max-w-full flex-wrap gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
      {items.map((i) =>
        i.disabled ? (
          <span key={i.key} className="cursor-not-allowed rounded-full px-4 py-1.5 text-sm text-neutral-400" aria-disabled="true">
            {i.label}
          </span>
        ) : (
          <Link
            key={i.key}
            href={i.href}
            aria-current={current === i.key ? "page" : undefined}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm transition",
              current === i.key ? "bg-neutral-950 font-semibold text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
            )}
          >
            {i.label}
          </Link>
        ),
      )}
    </nav>
  );
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  help,
  disabled,
}: {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-neutral-800">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-neutral-300 accent-neutral-950"
      />
      <span>
        <span className="font-medium">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-neutral-500">{help}</span>}
      </span>
    </label>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-600">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-neutral-950 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function IssueList({ issues }: { issues: { code: string; message: string }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {issues.map((i) => (
        <li key={i.code + i.message} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
          {i.message}
        </li>
      ))}
    </ul>
  );
}

export function FormGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={clsx("grid grid-cols-1 gap-4", cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {children}
    </div>
  );
}
