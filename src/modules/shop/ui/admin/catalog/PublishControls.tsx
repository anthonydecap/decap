"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../api";
import { btn, Notice, Panel, StatusBadge } from "../primitives";
import { apiErrorParts } from "./helpers";
import { IssueList } from "./ui";

type Issue = { code: string; message: string };
type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/**
 * Status workflow for an arrangement or collection. The server re-runs the publish validator
 * on every publish; the list shown here is the same validator's output.
 */
export function PublishControls({
  noun,
  status,
  statusUrl,
  checkUrl,
  initialIssues,
}: {
  noun: "arrangement" | "collection";
  status: string;
  statusUrl: string;
  /** Optional GET endpoint returning `{ publishable, issues }` for a live re-check. */
  checkUrl?: string;
  initialIssues: Issue[];
}) {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [busy, setBusy] = useState<null | Status | "check">(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function recheck() {
    setBusy("check");
    setError(null);
    setSuccess(null);
    try {
      if (checkUrl) {
        const r = await apiFetch<{ publishable: boolean; issues: Issue[] }>(checkUrl);
        setIssues(r.issues);
      }
      router.refresh();
    } catch (e) {
      setError(apiErrorParts(e).message);
    } finally {
      setBusy(null);
    }
  }

  async function change(next: Status) {
    if (next === "ARCHIVED" && !window.confirm(`Archive this ${noun}? It disappears from the storefront. Existing customer purchases are not affected.`)) return;
    setBusy(next);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch(statusUrl, { body: { status: next } });
      setSuccess(next === "PUBLISHED" ? `The ${noun} is live.` : next === "DRAFT" ? `The ${noun} is back in draft.` : `The ${noun} is archived.`);
      if (next === "PUBLISHED") setIssues([]);
      router.refresh();
    } catch (e) {
      const parts = apiErrorParts(e);
      setError(parts.message);
      if (parts.issues.length) setIssues(parts.issues);
    } finally {
      setBusy(null);
    }
  }

  const publishable = issues.length === 0;

  return (
    <Panel
      title="Status"
      actions={<StatusBadge status={status} />}
      description={
        status === "PUBLISHED"
          ? `This ${noun} is visible on the storefront.`
          : status === "ARCHIVED"
            ? `This ${noun} is archived and hidden from the storefront.`
            : `This ${noun} is a draft and not visible on the storefront.`
      }
    >
      <div className="flex flex-col gap-5">
        {error && <Notice tone="error">{error}</Notice>}
        {success && <Notice tone="success">{success}</Notice>}

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-neutral-950">Publish check</h3>
            <button type="button" className={btn.ghost} onClick={recheck} disabled={busy !== null}>
              {busy === "check" ? "Checking…" : "Check again"}
            </button>
          </div>
          <div className="mt-3">
            {publishable ? (
              <p className="text-sm text-neutral-700">All publish requirements are met.</p>
            ) : (
              <>
                <p className="mb-3 text-sm text-neutral-700">
                  Resolve {issues.length === 1 ? "this issue" : `these ${issues.length} issues`} before publishing:
                </p>
                <IssueList issues={issues} />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-200 pt-5 sm:flex-row sm:flex-wrap">
          {status !== "PUBLISHED" && (
            <button type="button" className={btn.primary} onClick={() => change("PUBLISHED")} disabled={busy !== null || !publishable}>
              {busy === "PUBLISHED" ? "Publishing…" : "Publish"}
            </button>
          )}
          {status !== "DRAFT" && (
            <button type="button" className={btn.secondary} onClick={() => change("DRAFT")} disabled={busy !== null}>
              {busy === "DRAFT" ? "Saving…" : status === "PUBLISHED" ? "Unpublish to draft" : "Restore to draft"}
            </button>
          )}
          {status !== "ARCHIVED" && (
            <button type="button" className={btn.danger} onClick={() => change("ARCHIVED")} disabled={busy !== null}>
              {busy === "ARCHIVED" ? "Archiving…" : "Archive"}
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}
