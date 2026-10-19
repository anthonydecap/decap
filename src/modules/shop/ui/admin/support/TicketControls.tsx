"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { CheckCircle, UserCirclePlus } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";
import { PRIORITY_LABEL, STAFF_STATUS_LABEL, TICKET_PRIORITIES, TICKET_STATUSES } from "./labels";

type Patch = { status?: string; priority?: string; category?: string; assignedStaffId?: string | null };

export type AssigneeOption = { id: string; label: string };

/**
 * Status, priority, category and assignment. Each select saves on change (the backend
 * writes a SYSTEM line into the conversation for every change). Closing asks first.
 */
export function TicketControls({
  ticketId,
  ticketLabel,
  status,
  priority,
  category,
  categories,
  canEdit,
  canAssign,
  assignedStaffId,
  assignedLabel,
  assignees,
  currentStaffId,
}: {
  ticketId: string;
  ticketLabel: string;
  status: string;
  priority: string;
  category: string;
  categories: { value: string; label: string }[];
  canEdit: boolean;
  canAssign: boolean;
  assignedStaffId: string | null;
  assignedLabel: string | null;
  assignees: AssigneeOption[];
  currentStaffId: string;
}) {
  const router = useRouter();
  const ids = useId();
  const [busy, setBusy] = useState<keyof Patch | "close" | "assign_me" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  async function save(patch: Patch, key: keyof Patch | "close" | "assign_me") {
    setBusy(key);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/support/${ticketId}`, { method: "PATCH", body: patch });
      setConfirmClose(false);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null;
  // The assignee list only holds ACTIVE staff; keep a current but inactive assignee visible.
  const assigneeOptions =
    assignedStaffId && !assignees.some((a) => a.id === assignedStaffId)
      ? [{ id: assignedStaffId, label: `${assignedLabel ?? "Unknown staff"} (inactive)` }, ...assignees]
      : assignees;

  return (
    <div className="flex flex-col gap-4">
      {!canEdit && <Notice>Your role can read tickets but not change them.</Notice>}

      <Field label="Status" htmlFor={`${ids}-status`}>
        <select
          id={`${ids}-status`}
          value={status}
          disabled={!canEdit || disabled}
          onChange={(e) => save({ status: e.target.value }, "status")}
          className={inputClass}
          aria-busy={busy === "status"}
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>{STAFF_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </Field>

      <Field label="Priority" htmlFor={`${ids}-priority`}>
        <select
          id={`${ids}-priority`}
          value={priority}
          disabled={!canEdit || disabled}
          onChange={(e) => save({ priority: e.target.value }, "priority")}
          className={inputClass}
          aria-busy={busy === "priority"}
        >
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
          ))}
        </select>
      </Field>

      <Field label="Category" htmlFor={`${ids}-category`}>
        <select
          id={`${ids}-category`}
          value={category}
          disabled={!canEdit || disabled}
          onChange={(e) => save({ category: e.target.value }, "category")}
          className={inputClass}
          aria-busy={busy === "category"}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </Field>

      {canAssign ? (
        <Field label="Assigned to" htmlFor={`${ids}-assignee`}>
          <select
            id={`${ids}-assignee`}
            value={assignedStaffId ?? ""}
            disabled={disabled}
            onChange={(e) => save({ assignedStaffId: e.target.value || null }, "assignedStaffId")}
            className={inputClass}
            aria-busy={busy === "assignedStaffId"}
          >
            <option value="">Unassigned</option>
            {assigneeOptions.map((a) => (
              <option key={a.id} value={a.id}>{a.id === currentStaffId ? `${a.label} (you)` : a.label}</option>
            ))}
          </select>
          {assignedStaffId !== currentStaffId && (
            <button
              type="button"
              className={`${btn.ghost} mt-1 self-start`}
              disabled={disabled}
              onClick={() => save({ assignedStaffId: currentStaffId }, "assign_me")}
            >
              <UserCirclePlus size={16} aria-hidden />
              {busy === "assign_me" ? "Assigning..." : "Assign to me"}
            </button>
          )}
        </Field>
      ) : (
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-neutral-800">Assigned to</span>
          <span className="text-neutral-700">{assignedLabel ?? "Unassigned"}</span>
        </div>
      )}

      {busy && busy !== "close" && busy !== "assign_me" && <p className="text-xs text-neutral-500" role="status">Saving...</p>}
      {error && <Notice tone="error">{error}</Notice>}

      {canEdit && status !== "CLOSED" && (
        <div className="border-t border-neutral-200 pt-4">
          {!confirmClose ? (
            <button type="button" className={`${btn.danger} w-full`} disabled={disabled} onClick={() => setConfirmClose(true)}>
              <CheckCircle size={16} aria-hidden />
              Close ticket
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-neutral-950 p-4">
              <p className="text-sm text-neutral-800">
                Close <span className="font-semibold">{ticketLabel}</span>? The customer cannot reply to a closed ticket and will need to open a
                new request. No email is sent. To let the customer know, send a reply with &quot;Mark resolved&quot; instead.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn.primary} disabled={disabled} onClick={() => save({ status: "CLOSED" }, "close")} aria-busy={busy === "close"}>
                  {busy === "close" ? "Closing..." : "Yes, close ticket"}
                </button>
                <button type="button" className={btn.ghost} disabled={disabled} onClick={() => setConfirmClose(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
