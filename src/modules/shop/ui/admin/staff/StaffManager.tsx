"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { formatDate } from "../../format";
import { btn, EmptyState, Field, inputClass, Notice, Panel, StatusBadge, Table, td, th, tr } from "../primitives";

export type StaffRow = {
  id: string;
  authSubject: string;
  email: string | null;
  displayName: string | null;
  role: string;
  status: string;
  createdAt: string;
  createdByName: string | null;
};

type Candidate = { authSubject: string; email: string | null; name: string | null };

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super admin", help: "Everything, plus staff and player transfers." },
  { value: "ADMIN", label: "Admin", help: "Day-to-day operations across the shop." },
  { value: "SUPPORT", label: "Support", help: "Customers, players and tickets. Reads orders, cannot refund." },
  { value: "CATALOG_MANAGER", label: "Catalog manager", help: "Catalog, files and imports only." },
  { value: "FINANCE", label: "Finance", help: "Orders, refunds and royalties." },
] as const;

const STATUS_ACTIONS: Record<string, { to: "ACTIVE" | "SUSPENDED" | "DISABLED"; label: string; needsReason: boolean }[]> = {
  ACTIVE: [
    { to: "SUSPENDED", label: "Suspend", needsReason: true },
    { to: "DISABLED", label: "Remove access", needsReason: true },
  ],
  SUSPENDED: [
    { to: "ACTIVE", label: "Reinstate", needsReason: false },
    { to: "DISABLED", label: "Remove access", needsReason: true },
  ],
  DISABLED: [{ to: "ACTIVE", label: "Reinstate", needsReason: false }],
};

function roleLabel(value: string) {
  return ROLES.find((r) => r.value === value)?.label ?? value;
}

/**
 * Staff administration, for SUPER_ADMIN only.
 *
 * Every rule shown here is also enforced server-side: you cannot change your own role or
 * access, and the last active super admin cannot be demoted or suspended. The UI explains
 * why a control is missing rather than silently hiding it.
 */
export function StaffManager({ rows, currentStaffId }: { rows: StaffRow[]; currentStaffId: string }) {
  const activeSuperAdmins = rows.filter((r) => r.role === "SUPER_ADMIN" && r.status === "ACTIVE").length;
  return (
    <div className="flex flex-col gap-6">
      <PromotePanel />
      <Panel
        title="Employees"
        description={`${rows.length} account${rows.length === 1 ? "" : "s"}. Access is checked on every request, so a change takes effect immediately.`}
        padded={false}
      >
        {rows.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              title="No staff accounts yet"
              body="The first account is created from the command line; everyone after that is added here."
            />
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Person</th>
                <th className={th}>Role</th>
                <th className={th}>Status</th>
                <th className={th}>Added</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <StaffRowView
                  key={row.id}
                  row={row}
                  isSelf={row.id === currentStaffId}
                  isLastSuperAdmin={row.role === "SUPER_ADMIN" && row.status === "ACTIVE" && activeSuperAdmins === 1}
                />
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </div>
  );
}

function StaffRowView({ row, isSelf, isLastSuperAdmin }: { row: StaffRow; isSelf: boolean; isLastSuperAdmin: boolean }) {
  const router = useRouter();
  const id = useId();
  const [role, setRole] = useState(row.role);
  const [pending, setPending] = useState<{ to: string; label: string; needsReason: boolean } | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = isSelf || isLastSuperAdmin;
  const lockedWhy = isSelf
    ? "You cannot change your own access."
    : "This is the last active super admin. Promote someone else first.";

  async function saveRole() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/staff/${row.id}`, { method: "PATCH", body: { role } });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
      setRole(row.role);
    } finally {
      setBusy(false);
    }
  }

  async function applyStatus() {
    if (!pending) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/staff/${row.id}`, {
        method: "PUT",
        body: { status: pending.to, ...(reason.trim() ? { reason: reason.trim() } : {}) },
      });
      setPending(null);
      setReason("");
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className={tr}>
      <td className={td}>
        <span className="font-medium text-neutral-950">{row.displayName ?? row.email ?? "Unnamed"}</span>
        {row.email && row.displayName && <span className="mt-0.5 block text-xs text-neutral-500">{row.email}</span>}
        {isSelf && <span className="mt-0.5 block text-xs text-neutral-500">This is you</span>}
      </td>
      <td className={td}>
        {locked ? (
          <span>{roleLabel(row.role)}</span>
        ) : (
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`${id}-role`}>
              Role for {row.displayName ?? row.email ?? "this account"}
            </label>
            <select
              id={`${id}-role`}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClass} w-auto py-1.5`}
              disabled={busy}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {role !== row.role && (
              <button type="button" className={btn.primary} onClick={saveRole} disabled={busy} aria-busy={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        )}
      </td>
      <td className={td}>
        <StatusBadge status={row.status} />
      </td>
      <td className={td}>
        <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>
        {row.createdByName && <span className="mt-0.5 block text-xs text-neutral-500">by {row.createdByName}</span>}
      </td>
      <td className={`${td} align-top`}>
        {error && (
          <div className="mb-2 max-w-sm">
            <Notice tone="error">{error}</Notice>
          </div>
        )}
        {locked ? (
          <span className="text-xs text-neutral-500">{lockedWhy}</span>
        ) : pending ? (
          <div className="flex max-w-sm flex-col gap-3 rounded-2xl border border-neutral-300 bg-neutral-50 p-4">
            <p className="text-sm text-neutral-700">
              {pending.to === "ACTIVE"
                ? "Give this person admin access again?"
                : pending.to === "SUSPENDED"
                  ? "Suspend access? They keep their account and can be reinstated."
                  : "Remove admin access? Their customer account, orders and library stay untouched."}
            </p>
            {pending.needsReason && (
              <Field label="Reason" htmlFor={`${id}-reason`} help="Recorded in the audit log.">
                <input
                  id={`${id}-reason`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  className={inputClass}
                />
              </Field>
            )}
            <div className="flex items-center gap-2">
              <button type="button" className={btn.danger} onClick={applyStatus} disabled={busy} aria-busy={busy}>
                {busy ? "Applying…" : `Yes, ${pending.label.toLowerCase()}`}
              </button>
              <button type="button" className={btn.ghost} onClick={() => setPending(null)} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {(STATUS_ACTIONS[row.status] ?? []).map((a) => (
              <button
                key={a.to}
                type="button"
                className={btn.ghost}
                onClick={() => {
                  setPending(a);
                  setReason("");
                  setError(null);
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

/**
 * Promotion searches people who already signed in once, because the Auth0 subject is the
 * only identity we trust. There is no "invite by e-mail": an address can be re-used, a
 * subject cannot.
 */
function PromotePanel() {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [chosen, setChosen] = useState<Candidate | null>(null);
  const [role, setRole] = useState<string>("SUPPORT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // The effect only fetches. What is shown is derived below, so a query that drops back
  // under two characters hides the list without a second render pass.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiFetch<{ candidates: Candidate[] }>(
          `/api/admin/shop/staff?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        setCandidates(data.candidates);
      } catch {
        // A failed lookup leaves the previous list alone; the submit below reports real errors.
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const visible = query.trim().length >= 2 ? candidates : [];

  async function promote() {
    if (!chosen) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch("/api/admin/shop/staff", { body: { authSubject: chosen.authSubject, role } });
      setSuccess(`${chosen.name ?? chosen.email ?? "That person"} now has ${roleLabel(role).toLowerCase()} access.`);
      setChosen(null);
      setQuery("");
      setCandidates([]);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title="Give someone admin access"
      description="Find a person who has already signed in to the shop. Their customer account, orders and library are not affected."
    >
      <div className="flex flex-col gap-5">
        {success && <Notice tone="success">{success}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Search by name, e-mail or company"
            htmlFor={`${id}-q`}
            help={searching ? "Searching…" : "At least two characters. People who are already staff are left out."}
          >
            <input
              id={`${id}-q`}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setChosen(null);
              }}
              className={inputClass}
              autoComplete="off"
            />
          </Field>
          <Field label="Role" htmlFor={`${id}-role`} help={ROLES.find((r) => r.value === role)?.help}>
            <select id={`${id}-role`} value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {query.trim().length >= 2 && visible.length === 0 && !searching && (
          <p className="text-sm text-neutral-500">
            Nobody found. They need to sign in to the shop once before they can be given admin access.
          </p>
        )}

        {visible.length > 0 && (
          <ul className="flex flex-col gap-1">
            {visible.map((c) => {
              const active = chosen?.authSubject === c.authSubject;
              return (
                <li key={c.authSubject}>
                  <button
                    type="button"
                    onClick={() => setChosen(c)}
                    aria-pressed={active}
                    className={
                      active
                        ? "flex w-full items-center justify-between gap-3 rounded-2xl border border-neutral-950 bg-neutral-950 px-4 py-2.5 text-left text-sm text-white"
                        : "flex w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-left text-sm text-neutral-700 transition hover:border-neutral-300"
                    }
                  >
                    <span className="font-medium">{c.name ?? c.email ?? "Unnamed"}</span>
                    <span className={active ? "text-xs text-neutral-300" : "text-xs text-neutral-500"}>{c.email}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end">
          <button type="button" className={btn.primary} onClick={promote} disabled={!chosen || busy} aria-busy={busy}>
            {busy ? "Granting…" : "Grant access"}
          </button>
        </div>
      </div>
    </Panel>
  );
}
