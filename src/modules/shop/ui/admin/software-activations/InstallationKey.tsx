"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Notice } from "../primitives";
import { CopyButton } from "./CopyButton";

/**
 * Staff reveal of an installation's activation key. Never part of the page: fetched only on
 * an explicit click (which is what makes it auditable) and dropped from state when hidden.
 */
export function InstallationKey({ installationId, hasKey }: { installationId: string; hasKey: boolean }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasKey) return <span className="text-xs text-neutral-400">No key stored</span>;

  async function reveal() {
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch<{ activationKey: string }>(`/api/admin/shop/software/installations/${installationId}/key`, { body: {} });
      setRevealed(data.activationKey);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {revealed ? (
        <div className="flex flex-wrap items-center gap-2">
          <code className="break-all rounded-lg bg-neutral-100 px-3 py-1.5 font-mono text-sm text-neutral-900">{revealed}</code>
          <CopyButton value={revealed} className={btn.ghost} />
          <button type="button" className={btn.ghost} onClick={() => setRevealed(null)}>
            <EyeSlash size={16} aria-hidden />
            Hide
          </button>
        </div>
      ) : (
        <button type="button" className={`${btn.ghost} self-start`} onClick={reveal} disabled={busy} aria-busy={busy}>
          <Eye size={16} aria-hidden />
          {busy ? "Revealing..." : "Reveal key"}
        </button>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {!revealed && !error && <p className="text-xs text-neutral-500">Each reveal is recorded in the audit log.</p>}
    </div>
  );
}
