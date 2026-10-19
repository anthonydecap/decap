"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { apiFetch } from "../../api";
import { btn, Notice } from "../primitives";
import { useMutation } from "./useMutation";

export type TagOption = { id: string; name: string; description: string | null; isAlert: boolean };

/** Multi-select of every tag. Saves the whole set in one PUT. */
export function TagEditor({ customerId, tags, assigned }: { customerId: string; tags: TagOption[]; assigned: string[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(assigned));
  const { busy, error, setError, run } = useMutation();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    const ok = await run(() => apiFetch(`/api/admin/shop/customers/${customerId}/tags`, { method: "PUT", body: { tagIds: [...selected] } }));
    if (ok) setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className={btn.ghost}
        onClick={() => {
          setSelected(new Set(assigned));
          setError(null);
          setOpen(true);
        }}
      >
        Edit tags
      </button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white p-4">
      {tags.length === 0 ? (
        <p className="text-sm text-neutral-600">
          No tags exist yet.{" "}
          <Link href="/admin/shop/customer-tags" className="font-medium text-neutral-950 underline">Create tags</Link> first.
        </p>
      ) : (
        <fieldset>
          <legend className="text-sm font-medium text-neutral-800">Tags for this customer</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => {
              const on = selected.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  title={t.description ?? undefined}
                  onClick={() => toggle(t.id)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition",
                    on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950",
                  )}
                >
                  {t.isAlert && <Warning size={14} weight="bold" aria-label="Alert tag" />}
                  {t.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={btn.primary} onClick={save} disabled={busy || tags.length === 0} aria-busy={busy}>
          {busy ? "Saving..." : "Save tags"}
        </button>
        <button type="button" className={btn.ghost} onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
        <Link href="/admin/shop/customer-tags" className={clsx(btn.ghost, "sm:ml-auto")}>Manage tags</Link>
      </div>
    </div>
  );
}
