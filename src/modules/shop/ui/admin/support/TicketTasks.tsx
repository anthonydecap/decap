"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Check, Plus } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { formatDate } from "../../format";
import { btn, Field, inputClass, Notice, StatusBadge } from "../primitives";
import { PRIORITY_LABEL, PriorityBadge, TASK_PRIORITIES } from "./labels";

export type TicketTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt: string | null;
  /** Computed on the server so the client render stays deterministic. */
  overdue: boolean;
  assignedLabel: string | null;
};

/** Follow-up tasks linked to this ticket, created through the customer tasks API. */
export function TicketTasks({
  ticketId,
  customerId,
  registeredPlayerId,
  tasks,
  canWrite,
  assignees,
  currentStaffId,
}: {
  ticketId: string;
  customerId: string;
  registeredPlayerId: string | null;
  tasks: TicketTask[];
  canWrite: boolean;
  assignees: { id: string; label: string }[];
  currentStaffId: string;
}) {
  const router = useRouter();
  const ids = useId();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<string>("NORMAL");
  const [assignee, setAssignee] = useState(currentStaffId);
  const [busy, setBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/customers/${customerId}/tasks`, {
        body: {
          title: title.trim(),
          priority,
          assignedStaffId: assignee || null,
          // End of the chosen local day, so "due today" stays due today.
          dueAt: dueAt ? new Date(`${dueAt}T23:59:00`).toISOString() : null,
          supportTicketId: ticketId,
          registeredPlayerId,
        },
      });
      setTitle("");
      setDueAt("");
      setPriority("NORMAL");
      setAssignee(currentStaffId);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function complete(task: TicketTask) {
    setRowBusy(task.id);
    setError(null);
    try {
      // Priority is sent along so the partial update cannot fall back to a default.
      await apiFetch(`/api/admin/shop/tasks/${task.id}`, { method: "PATCH", body: { status: "DONE", priority: task.priority } });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {tasks.length === 0 ? (
        <p className="text-sm text-neutral-500">No follow-up tasks for this ticket.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-100">
          {tasks.map((t) => {
            const finished = t.status === "DONE" || t.status === "CANCELLED";
            const overdue = !finished && t.overdue;
            return (
              <li key={t.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className={clsx("text-sm font-medium", finished ? "text-neutral-400 line-through" : "text-neutral-950")}>{t.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                    <StatusBadge status={t.status} />
                    {!finished && <PriorityBadge priority={t.priority} />}
                    {t.dueAt && (
                      <span className={clsx(overdue && "font-bold text-neutral-950")}>
                        {overdue ? "Overdue, due " : "Due "}
                        {formatDate(t.dueAt)}
                      </span>
                    )}
                    <span>{t.assignedLabel ?? "Unassigned"}</span>
                  </p>
                </div>
                {canWrite && !finished && (
                  <button
                    type="button"
                    className={btn.ghost}
                    disabled={rowBusy !== null}
                    onClick={() => complete(t)}
                    aria-label={`Mark "${t.title}" done`}
                  >
                    <Check size={16} weight="bold" aria-hidden />
                    {rowBusy === t.id ? "Saving..." : "Done"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && <Notice tone="error">{error}</Notice>}

      {canWrite &&
        (!open ? (
          <button type="button" className={`${btn.secondary} self-start`} onClick={() => setOpen(true)}>
            <Plus size={16} weight="bold" aria-hidden />
            Create follow-up task
          </button>
        ) : (
          <form onSubmit={create} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
            <Field label="Task" htmlFor={`${ids}-title`}>
              <input
                id={`${ids}-title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                className={inputClass}
                placeholder="Call back about the firmware update"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Due date" htmlFor={`${ids}-due`}>
                <input id={`${ids}-due`} type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Priority" htmlFor={`${ids}-priority`}>
                <select id={`${ids}-priority`} value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Assign to" htmlFor={`${ids}-assignee`}>
              <select id={`${ids}-assignee`} value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputClass}>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>{a.id === currentStaffId ? `${a.label} (you)` : a.label}</option>
                ))}
              </select>
            </Field>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={btn.primary} disabled={busy || !title.trim()} aria-busy={busy}>
                {busy ? "Creating..." : "Create task"}
              </button>
              <button type="button" className={btn.ghost} disabled={busy} onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        ))}
    </div>
  );
}
