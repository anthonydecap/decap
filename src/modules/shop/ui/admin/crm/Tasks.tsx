"use client";

import { useState } from "react";
import { apiFetch } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";
import { TASK_PRIORITIES } from "./labels";
import { useMutation } from "./useMutation";

type Option = { id: string; label: string };

export function TaskForm({
  customerId,
  currentStaffId,
  staff,
  players,
  tickets,
}: {
  customerId: string;
  currentStaffId: string;
  staff: Option[];
  players: Option[];
  tickets: Option[];
}) {
  const empty = { title: "", description: "", priority: "NORMAL", dueAt: "", assignedStaffId: currentStaffId, registeredPlayerId: "", supportTicketId: "" };
  const [v, setV] = useState(empty);
  const [done, setDone] = useState(false);
  const { busy, error, run } = useMutation();
  const set = (k: keyof typeof empty, value: string) => {
    setDone(false);
    setV((p) => ({ ...p, [k]: value }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() =>
      apiFetch(`/api/admin/shop/customers/${customerId}/tasks`, {
        body: {
          title: v.title,
          description: v.description || null,
          priority: v.priority,
          assignedStaffId: v.assignedStaffId || null,
          dueAt: v.dueAt ? new Date(v.dueAt).toISOString() : null,
          registeredPlayerId: v.registeredPlayerId || null,
          supportTicketId: v.supportTicketId || null,
        },
      }),
    );
    if (ok) {
      setV(empty);
      setDone(true);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Title" htmlFor="task-title">
        <input id="task-title" className={inputClass} required maxLength={200} value={v.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Description (optional)" htmlFor="task-desc">
        <textarea id="task-desc" className={inputClass} rows={2} maxLength={5000} value={v.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Priority" htmlFor="task-priority">
          <select id="task-priority" className={inputClass} value={v.priority} onChange={(e) => set("priority", e.target.value)}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Due (optional)" htmlFor="task-due">
          <input id="task-due" type="datetime-local" className={inputClass} value={v.dueAt} onChange={(e) => set("dueAt", e.target.value)} />
        </Field>
        <Field label="Assignee" htmlFor="task-assignee">
          <select id="task-assignee" className={inputClass} value={v.assignedStaffId} onChange={(e) => set("assignedStaffId", e.target.value)}>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.id === currentStaffId ? `${s.label} (me)` : s.label}</option>
            ))}
          </select>
        </Field>
        {players.length > 0 && (
          <Field label="Player (optional)" htmlFor="task-player">
            <select id="task-player" className={inputClass} value={v.registeredPlayerId} onChange={(e) => set("registeredPlayerId", e.target.value)}>
              <option value="">None</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </Field>
        )}
        {tickets.length > 0 && (
          <Field label="Ticket (optional)" htmlFor="task-ticket">
            <select id="task-ticket" className={inputClass} value={v.supportTicketId} onChange={(e) => set("supportTicketId", e.target.value)}>
              <option value="">None</option>
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </Field>
        )}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {done && <Notice tone="success">Task created.</Notice>}
      <div>
        <button type="submit" className={btn.primary} disabled={busy || !v.title.trim()} aria-busy={busy}>
          {busy ? "Creating..." : "Create task"}
        </button>
      </div>
    </form>
  );
}

const NEXT: Record<string, { to: string; label: string }[]> = {
  OPEN: [
    { to: "IN_PROGRESS", label: "Start" },
    { to: "DONE", label: "Mark done" },
    { to: "CANCELLED", label: "Cancel task" },
  ],
  IN_PROGRESS: [
    { to: "DONE", label: "Mark done" },
    { to: "OPEN", label: "Back to open" },
    { to: "CANCELLED", label: "Cancel task" },
  ],
  DONE: [{ to: "OPEN", label: "Reopen" }],
  CANCELLED: [{ to: "OPEN", label: "Reopen" }],
};

/** Status transitions for one task. `compact` shows only "Mark done" (dashboard lists). */
export function TaskStatusButtons({ taskId, status, compact = false }: { taskId: string; status: string; compact?: boolean }) {
  const { busy, error, run } = useMutation();
  const actions = (NEXT[status] ?? []).filter((a) => !compact || a.to === "DONE");

  async function apply(to: string) {
    if (to === "CANCELLED" && !window.confirm("Cancel this task? It stays on the timeline.")) return;
    await run(() => apiFetch(`/api/admin/shop/tasks/${taskId}`, { method: "PATCH", body: { status: to } }));
  }

  if (!actions.length) return null;
  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <div className="flex flex-wrap gap-1">
        {actions.map((a) => (
          <button
            key={a.to}
            type="button"
            className={a.to === "DONE" ? btn.secondary : btn.ghost}
            disabled={busy}
            aria-busy={busy}
            onClick={() => apply(a.to)}
          >
            {a.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs font-medium text-neutral-950" role="alert">{error}</p>}
    </div>
  );
}
