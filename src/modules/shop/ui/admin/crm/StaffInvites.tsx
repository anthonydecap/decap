"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { apiFetch } from "../../api";
import { formatDate, formatDateTime } from "../../format";
import { btn, EmptyState, Field, inputClass, Notice, Panel } from "../primitives";
import { STAFF_ROLES } from "../staff/StaffManager";
import { useMutation } from "./useMutation";

export type InviteRow = { id: string; email: string; role: string; createdAt: string; expiresAt: string; invitedByName: string | null };
type Created = { id: string; link: string; emailed: boolean; expiresAt: string; email: string };

/** Invite someone who has no account yet. Staff-only (staff:manage). */
export function StaffInvites({ invites }: { invites: InviteRow[] }) {
  const roles = STAFF_ROLES;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("SUPPORT");
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);
  const { busy, error, run } = useMutation();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setCopied(false);
    const holder: { result?: Omit<Created, "email"> } = {};
    const sentTo = email.trim();
    const ok = await run(async () => {
      holder.result = await apiFetch<Omit<Created, "email">>("/api/admin/shop/staff/invites", { body: { email: sentTo, role } });
    });
    if (ok && holder.result) {
      setCreated({ ...holder.result, email: sentTo });
      setEmail("");
    }
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const roleHelp = roles.find((r) => r.value === role)?.help;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Invite an employee"
        description="For someone without an account yet. They sign in or sign up with this exact email address; access is granted only once that address is verified. No password is created here."
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="invite-email">
              <input id="invite-email" type="email" required autoComplete="off" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Role" htmlFor="invite-role" help={roleHelp}>
              <select id="invite-role" className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {error && <Notice tone="error">{error}</Notice>}
          <div>
            <button type="submit" className={btn.primary} disabled={busy || !email.trim()} aria-busy={busy}>
              {busy ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>

        {created && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm text-neutral-800">
              {created.emailed ? (
                <>Invitation emailed to <span className="font-medium text-neutral-950">{created.email}</span>.</>
              ) : (
                <>
                  No email was sent: no email provider is configured. Copy this link and share it with{" "}
                  <span className="font-medium text-neutral-950">{created.email}</span> yourself.
                </>
              )}{" "}
              It is valid until {formatDateTime(created.expiresAt)} and is shown only once.
            </p>
            <label htmlFor="invite-link" className="text-sm font-medium text-neutral-800">Invitation link</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="invite-link" readOnly value={created.link} className={`${inputClass} font-mono text-xs`} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" className={btn.secondary} onClick={copy}>
                {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Pending invitations" description="Unaccepted invitations that have not expired." padded={false}>
        {invites.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No pending invitations" />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {invites.map((i) => (
              <InviteItem key={i.id} invite={i} roleLabel={roles.find((r) => r.value === i.role)?.label ?? i.role} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function InviteItem({ invite, roleLabel }: { invite: InviteRow; roleLabel: string }) {
  const { busy, error, run } = useMutation();

  async function revoke() {
    if (!window.confirm(`Revoke the invitation for ${invite.email}? The link stops working immediately.`)) return;
    await run(() => apiFetch(`/api/admin/shop/staff/invites/${invite.id}`, { method: "DELETE" }));
  }

  return (
    <li className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0 text-sm">
        <p className="truncate font-medium text-neutral-950">{invite.email}</p>
        <p className="text-xs text-neutral-500">
          {roleLabel}, invited {formatDate(invite.createdAt)}
          {invite.invitedByName && ` by ${invite.invitedByName}`}, expires {formatDate(invite.expiresAt)}
        </p>
        {error && <p className="mt-1 text-xs font-medium text-neutral-950" role="alert">{error}</p>}
      </div>
      <button type="button" className={btn.ghost} onClick={revoke} disabled={busy} aria-busy={busy}>
        {busy ? "Revoking..." : "Revoke"}
      </button>
    </li>
  );
}
