"use client";

import { useState } from "react";
import { apiFetch } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";
import { COMMUNICATION_TYPES } from "./labels";
import { useMutation } from "./useMutation";

/** Records contact that happened outside the ticket system (a call, a visit, a WhatsApp). */
export function CommunicationForm({ customerId }: { customerId: string }) {
  const [type, setType] = useState("PHONE_CALL");
  const [direction, setDirection] = useState("INBOUND");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [done, setDone] = useState(false);
  const { busy, error, run } = useMutation();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);
    const ok = await run(() =>
      apiFetch(`/api/admin/shop/customers/${customerId}/communications`, {
        body: {
          type,
          direction,
          subject: subject || null,
          body,
          ...(occurredAt ? { occurredAt: new Date(occurredAt).toISOString() } : {}),
        },
      }),
    );
    if (ok) {
      setSubject("");
      setBody("");
      setOccurredAt("");
      setDone(true);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Type" htmlFor="comm-type">
          <select id="comm-type" className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {COMMUNICATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Direction" htmlFor="comm-direction">
          <select id="comm-direction" className={inputClass} value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="INBOUND">Inbound (customer contacted us)</option>
            <option value="OUTBOUND">Outbound (we contacted them)</option>
          </select>
        </Field>
        <Field label="Occurred at (optional)" htmlFor="comm-at" help="Leave empty for now.">
          <input id="comm-at" type="datetime-local" className={inputClass} value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </Field>
      </div>
      <Field label="Subject (optional)" htmlFor="comm-subject">
        <input id="comm-subject" className={inputClass} maxLength={200} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Summary" htmlFor="comm-body">
        <textarea id="comm-body" className={inputClass} rows={3} maxLength={10000} required value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      {done && <Notice tone="success">Logged. It now appears on the timeline.</Notice>}
      <div>
        <button type="submit" className={btn.primary} disabled={busy || !body.trim()} aria-busy={busy}>
          {busy ? "Logging..." : "Log communication"}
        </button>
      </div>
    </form>
  );
}
