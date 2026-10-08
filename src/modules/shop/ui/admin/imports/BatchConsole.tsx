"use client";

import { ArrowClockwise, CheckCircle, Pause, Play } from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { UploadTarget } from "../../../storage/types";
import { apiFetch, ApiError, errorMessage } from "../../api";
import { runBoundedQueue } from "../../bounded-queue";
import { formatBytes } from "../../format";
import { sha256File, uploadToTarget } from "../../upload";
import { btn, EmptyState, Field, inputClass, Notice, PageHeader, Panel, Stat, StatusBadge, Table, td, th, tr } from "../primitives";
import {
  attachFiles, fileStoreVersion, getStoredFile, hasStoredFile, setStoredHash, subscribeFileStore,
} from "./file-store";
import type { PickResult } from "./file-pick";
import { FilePicker, IssueList, MiniStat, ProgressBar } from "./parts";
import {
  allowedKindsFor, cleanText, isUploadable, KIND_LABELS, ROW_ACTION_LABELS,
  type BatchDetail, type BatchItem, type Issue,
} from "./types";
import type { AssetKindValue } from "../../../domain/asset-policy";

type LocalPhase = "waiting" | "hashing" | "uploading" | "finalizing" | "done" | "error" | "paused";
type LocalProgress = { phase: LocalPhase; loaded: number; total: number; message?: string };
type Filter = "all" | "review" | "failed" | "ready" | "skipped";
type PresignResult = { itemId: string; target?: UploadTarget; expiresAt?: string; error?: string };
type FinalizeResult = { id: string; status: BatchItem["status"]; errors: Issue[]; warnings: Issue[] };
type ApplyResult = { createdArrangements: number; attachedVersions: number; skipped: number };

const ACTIVE_PHASES: LocalPhase[] = ["waiting", "hashing", "uploading", "finalizing"];
const PRESIGN_PAGE = 20;
const POLL_MS = 4000;

const PHASE_LABEL: Record<LocalPhase, string> = {
  waiting: "Waiting",
  hashing: "Computing checksum",
  uploading: "Uploading",
  finalizing: "Verifying",
  done: "Uploaded",
  error: "Upload failed",
  paused: "Paused",
};

async function fetchBatch(batchId: string): Promise<BatchDetail> {
  const data = await apiFetch<BatchDetail>(`/api/admin/shop/imports/${batchId}`);
  data.items = [...data.items].sort((a, b) =>
    (a.relativePath ?? a.originalFilename).localeCompare(b.relativePath ?? b.originalFilename),
  );
  return data;
}

function loadErrorText(e: unknown) {
  return e instanceof ApiError && e.status === 404 ? "This import batch does not exist." : cleanText(errorMessage(e));
}

/** Like errorMessage, but keeps the text of plain upload errors (network, storage, validation). */
function describeError(e: unknown): string {
  if (e instanceof ApiError) return cleanText(e.message);
  if (e instanceof Error && e.name === "AbortError") return "Cancelled";
  if (e instanceof Error && e.message) return cleanText(e.message);
  return "Something went wrong. Please try again.";
}

function needsReview(i: BatchItem) {
  if (i.applied || i.status === "SKIPPED" || i.status === "READY") return false;
  return i.status === "NEEDS_REVIEW" || !i.targetSku || !i.kind;
}

export function BatchConsole({ batchId, autostart }: { batchId: string; autostart: boolean }) {
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [concurrency, setConcurrency] = useState(4);
  const [progress, setProgress] = useState<Record<string, LocalProgress>>({});
  const [notice, setNotice] = useState<{ tone: "info" | "error" | "success"; text: string } | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const concurrencyId = useId();

  const abortRef = useRef<AbortController | null>(null);
  const progressRef = useRef<Record<string, LocalProgress>>({});
  const flushPending = useRef(false);
  const autostartDone = useRef(!autostart);

  // Re-render when files are attached to the in-memory store.
  const storeVersion = useSyncExternalStore(subscribeFileStore, fileStoreVersion, () => 0);

  const setItemProgress = useCallback((id: string, p: LocalProgress) => {
    progressRef.current[id] = p;
    if (flushPending.current) return;
    flushPending.current = true;
    requestAnimationFrame(() => {
      flushPending.current = false;
      setProgress({ ...progressRef.current });
    });
  }, []);

  const patchLocalItem = useCallback((id: string, patch: Partial<BatchItem>) => {
    setBatch((b) => (b ? { ...b, items: b.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) } : b));
  }, []);

  const load = useCallback(async (): Promise<BatchDetail | null> => {
    try {
      const data = await fetchBatch(batchId);
      setBatch(data);
      setLoadError(null);
      return data;
    } catch (e) {
      setLoadError(loadErrorText(e));
      return null;
    }
  }, [batchId]);

  /** Runs the bounded upload queue over the given items (each one independent of the rest). */
  const startUploads = useCallback(
    async (items: BatchItem[]) => {
      const queue = items.filter((i) => isUploadable(i) && hasStoredFile(batchId, i.id));
      if (queue.length === 0) {
        setNotice({ tone: "info", text: "Nothing to upload. Every pending file is either uploaded or not available in this tab." });
        return;
      }
      const ac = new AbortController();
      abortRef.current = ac;
      setRunning(true);
      setNotice(null);
      for (const i of queue) setItemProgress(i.id, { phase: "waiting", loaded: 0, total: i.bytes });

      // Upload targets are short-lived, so they are requested in small pages just ahead of use.
      const order = queue.map((i) => i.id);
      const started = new Set<string>();
      const targets = new Map<string, { target: UploadTarget; expiresAt: number }>();
      const presignErrors = new Map<string, string>();
      let inflight: Promise<void> | null = null;

      async function getTarget(id: string): Promise<UploadTarget> {
        for (let attempt = 0; attempt < 4; attempt++) {
          const cached = targets.get(id);
          if (cached) {
            targets.delete(id);
            if (cached.expiresAt - Date.now() > 90_000) return cached.target;
          }
          const err = presignErrors.get(id);
          if (err) {
            presignErrors.delete(id);
            throw new Error(err);
          }
          if (inflight) {
            await inflight;
            continue;
          }
          const page = [id, ...order.filter((x) => x !== id && !started.has(x) && !targets.has(x))].slice(0, PRESIGN_PAGE);
          inflight = (async () => {
            const res = await apiFetch<PresignResult[]>(`/api/admin/shop/imports/${batchId}/items/presign`, {
              body: { itemIds: page },
              signal: ac.signal,
            });
            for (const r of res) {
              if (r.target) {
                const exp = r.expiresAt ? Date.parse(r.expiresAt) : NaN;
                targets.set(r.itemId, { target: r.target, expiresAt: Number.isFinite(exp) ? exp : Date.now() + 300_000 });
              } else {
                presignErrors.set(r.itemId, r.error ?? "The upload could not be prepared.");
              }
            }
          })().finally(() => {
            inflight = null;
          });
          await inflight;
        }
        throw new Error("The upload could not be prepared.");
      }

      let ok = 0;
      let failed = 0;
      await runBoundedQueue(
        queue,
        concurrency,
        async (item) => {
          started.add(item.id);
          const stored = getStoredFile(batchId, item.id);
          if (!stored) throw new Error("The file is not available in this tab.");
          const file = stored.file;

          let sha = stored.sha256;
          if (!sha && !item.hasChecksum) {
            setItemProgress(item.id, { phase: "hashing", loaded: 0, total: file.size });
            sha = await sha256File(file, (p) => setItemProgress(item.id, { phase: "hashing", loaded: p.loaded, total: p.total }), ac.signal);
            setStoredHash(batchId, item.id, sha);
          }

          setItemProgress(item.id, { phase: "uploading", loaded: 0, total: file.size });
          const target = await getTarget(item.id);
          await uploadToTarget(target, file, (p) => setItemProgress(item.id, { phase: "uploading", loaded: p.loaded, total: p.total }), ac.signal);

          setItemProgress(item.id, { phase: "finalizing", loaded: file.size, total: file.size });
          const res = await apiFetch<FinalizeResult>(`/api/admin/shop/imports/${batchId}/items/${item.id}/finalize`, {
            body: { sha256: sha ?? null },
            signal: ac.signal,
          });
          patchLocalItem(item.id, { status: res.status, errors: res.errors ?? [], warnings: res.warnings ?? [], hasChecksum: true });
          if (res.status === "FAILED" || res.status === "UPLOADING") {
            throw new Error(res.errors?.[0]?.message ?? "The uploaded file did not pass validation.");
          }
        },
        {
          signal: ac.signal,
          onSettled: (r) => {
            if (r.ok) {
              ok++;
              setItemProgress(r.item.id, { phase: "done", loaded: r.item.bytes, total: r.item.bytes });
            } else if (ac.signal.aborted) {
              setItemProgress(r.item.id, { phase: "paused", loaded: 0, total: r.item.bytes });
            } else {
              failed++;
              setItemProgress(r.item.id, { phase: "error", loaded: 0, total: r.item.bytes, message: describeError(r.error) });
            }
          },
        },
      );

      // Items that never started because of a pause.
      if (ac.signal.aborted) {
        for (const i of queue) {
          if (progressRef.current[i.id]?.phase === "waiting") setItemProgress(i.id, { phase: "paused", loaded: 0, total: i.bytes });
        }
      }
      abortRef.current = null;
      setRunning(false);
      setNotice(
        ac.signal.aborted
          ? { tone: "info", text: `Paused. ${ok} file${ok === 1 ? "" : "s"} uploaded so far; start again to continue.` }
          : failed > 0
            ? { tone: "error", text: `${ok} file${ok === 1 ? "" : "s"} uploaded, ${failed} failed. Failed files can be retried on their own.` }
            : { tone: "success", text: `${ok} file${ok === 1 ? "" : "s"} uploaded and verified.` },
      );
      await load();
    },
    [batchId, concurrency, load, patchLocalItem, setItemProgress],
  );

  // Initial load, plus an automatic start when the wizard handed over the selected files.
  useEffect(() => {
    let cancelled = false;
    fetchBatch(batchId).then(
      (data) => {
        if (cancelled) return;
        setBatch(data);
        setLoadError(null);
        if (autostartDone.current) return;
        autostartDone.current = true;
        if (data.confirmedAt && data.status !== "COMPLETED" && data.items.some((i) => isUploadable(i) && hasStoredFile(batchId, i.id))) {
          void startUploads(data.items);
        }
      },
      (e: unknown) => {
        if (!cancelled) setLoadError(loadErrorText(e));
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per batch
  }, [batchId]);

  // Poll only while uploads run; otherwise the page refreshes after each action.
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(t);
  }, [running, load]);

  // Warn before leaving mid-upload (selected files are lost on reload).
  useEffect(() => {
    if (!running) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [running]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const items = useMemo(() => batch?.items ?? [], [batch]);
  const counts = useMemo(() => {
    const c = { ready: 0, skipped: 0, failed: 0, review: 0, pending: 0, applied: 0, local: 0, missingLocal: 0, retryable: 0 };
    for (const i of items) {
      if (i.status === "READY") c.ready++;
      if (i.status === "SKIPPED") c.skipped++;
      if (i.status === "FAILED" || progress[i.id]?.phase === "error") c.failed++;
      if (needsReview(i)) c.review++;
      if (["QUEUED", "UPLOADING", "UPLOADED", "VALIDATING"].includes(i.status)) c.pending++;
      if (i.applied) c.applied++;
      if (isUploadable(i)) {
        if (hasStoredFile(batchId, i.id)) {
          c.local++;
          if (i.status === "FAILED" || progress[i.id]?.phase === "error") c.retryable++;
        } else c.missingLocal++;
      }
    }
    return c;
    // storeVersion changes whenever files are attached; hasStoredFile reads the store directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, progress, batchId, storeVersion]);

  if (!batch) {
    return loadError ? (
      <>
        <PageHeader title="Import batch" back={{ href: "/admin/shop/imports", label: "Imports" }} />
        <Notice tone="error">{loadError}</Notice>
        <div className="mt-4">
          <button type="button" className={btn.secondary} onClick={() => void load()}>Try again</button>
        </div>
      </>
    ) : (
      <>
        <PageHeader title="Import batch" back={{ href: "/admin/shop/imports", label: "Imports" }} />
        <p className="text-sm text-neutral-500" role="status">Loading batch...</p>
      </>
    );
  }

  const confirmed = Boolean(batch.confirmedAt);
  const completed = batch.status === "COMPLETED";
  const total = items.length;
  const blocking = items.filter((i) => !i.applied && i.status !== "READY" && i.status !== "SKIPPED").length;
  const canApply = confirmed && !completed && total > 0 && blocking === 0 && !running;
  const activeItems = items.filter((i) => progress[i.id] && ACTIVE_PHASES.includes(progress[i.id]!.phase));
  const resultRows = batch.rows.filter((r) => r.resultingArrangementId);

  const filtered = items.filter((i) => {
    switch (filter) {
      case "review": return needsReview(i);
      case "failed": return i.status === "FAILED" || progress[i.id]?.phase === "error";
      case "ready": return i.status === "READY";
      case "skipped": return i.status === "SKIPPED";
      default: return true;
    }
  });

  async function confirmBatch() {
    setConfirming(true);
    setNotice(null);
    try {
      await apiFetch(`/api/admin/shop/imports/${batchId}/confirm`, { body: {} });
      await load();
    } catch (e) {
      setNotice({ tone: "error", text: cleanText(errorMessage(e)) });
    } finally {
      setConfirming(false);
    }
  }

  async function apply() {
    setApplying(true);
    setNotice(null);
    try {
      const res = await apiFetch<ApplyResult>(`/api/admin/shop/imports/${batchId}/apply`, { body: {} });
      setApplyResult(res);
      await load();
    } catch (e) {
      setNotice({ tone: "error", text: cleanText(errorMessage(e)) });
      await load();
    } finally {
      setApplying(false);
    }
  }

  function resumeFrom(r: PickResult) {
    const candidates = items.filter((i) => !i.applied && i.status !== "READY" && i.status !== "SKIPPED" && !hasStoredFile(batchId, i.id));
    const byKey = new Map<string, BatchItem[]>();
    for (const i of candidates) {
      const k = `${i.originalFilename.toLowerCase()}|${i.bytes}`;
      byKey.set(k, [...(byKey.get(k) ?? []), i]);
    }
    const assigned = new Set<string>();
    const matches: [string, { file: File; sha256: null; relativePath: string | null }][] = [];
    let unmatched = 0;
    let ambiguous = 0;
    for (const p of r.files) {
      const list = (byKey.get(`${p.file.name.toLowerCase()}|${p.file.size}`) ?? []).filter((i) => !assigned.has(i.id));
      if (list.length === 0) {
        unmatched++;
        continue;
      }
      const rel = p.relativePath;
      const pick =
        (rel && list.find((i) => i.relativePath === rel)) ||
        (rel && list.find((i) => i.relativePath && (rel.endsWith(`/${i.relativePath}`) || i.relativePath.endsWith(`/${rel}`)))) ||
        (list.length === 1 ? list[0] : list.find((i) => !i.relativePath && !rel));
      if (!pick) {
        ambiguous++;
        continue;
      }
      assigned.add(pick.id);
      matches.push([pick.id, { file: p.file, sha256: null, relativePath: rel }]);
    }
    if (matches.length) attachFiles(batchId, matches);
    const parts = [`Matched ${matches.length} file${matches.length === 1 ? "" : "s"} to pending items.`];
    if (unmatched) parts.push(`${unmatched} did not match any pending file by name and size.`);
    if (ambiguous) parts.push(`${ambiguous} matched several items and were left out; select the folder so paths can tell them apart.`);
    setNotice({ tone: matches.length ? "success" : "error", text: parts.join(" ") });
  }

  async function itemAction(item: BatchItem, body: { action: "remap" | "skip" | "unskip" | "retry"; targetSku?: string | null; assetKind?: AssetKindValue }) {
    await apiFetch(`/api/admin/shop/imports/${batchId}/items/${item.id}`, { method: "PATCH", body });
    if (body.action === "retry" || body.action === "unskip") {
      delete progressRef.current[item.id];
      setProgress({ ...progressRef.current });
    }
    const fresh = await load();
    if (body.action === "retry" && fresh && !running && hasStoredFile(batchId, item.id)) {
      const next = fresh.items.find((i) => i.id === item.id);
      if (next && isUploadable(next)) void startUploads([next]);
    }
  }

  async function revalidate(item: BatchItem) {
    const stored = getStoredFile(batchId, item.id);
    const res = await apiFetch<FinalizeResult>(`/api/admin/shop/imports/${batchId}/items/${item.id}/finalize`, {
      body: { sha256: stored?.sha256 ?? null },
    });
    patchLocalItem(item.id, { status: res.status, errors: res.errors ?? [], warnings: res.warnings ?? [] });
    await load();
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    { key: "review", label: "Needs review", count: counts.review },
    { key: "failed", label: "Failed", count: counts.failed },
    { key: "ready", label: "Ready", count: counts.ready },
    { key: "skipped", label: "Skipped", count: counts.skipped },
  ];

  return (
    <>
      <PageHeader
        title={batch.label || "Import batch"}
        back={{ href: "/admin/shop/imports", label: "Imports" }}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge status={batch.status} />
            <span>
              {total} file{total === 1 ? "" : "s"}
              {batch.rows.length ? `, ${batch.rows.length} CSV row${batch.rows.length === 1 ? "" : "s"}` : ""}
            </span>
          </span>
        }
        actions={
          <button type="button" className={btn.secondary} onClick={() => void load()} disabled={running}>
            <ArrowClockwise size={16} /> Refresh
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total files" value={total} hint={counts.skipped ? `${counts.skipped} skipped` : undefined} />
        <Stat label="Uploaded" value={batch.uploadedItems} hint={counts.pending ? `${counts.pending} pending` : undefined} />
        <Stat label="Valid" value={batch.validItems} hint={counts.review ? `${counts.review} need review` : undefined} />
        <Stat label="Failed" value={batch.failedItems} />
      </div>
      <div className="mt-4">
        <ProgressBar value={counts.ready + counts.skipped} max={total} label="Batch progress" />
        <p className="mt-2 text-xs text-neutral-500">
          {counts.ready + counts.skipped} of {total} files ready or skipped
        </p>
      </div>

      {notice && <div className="mt-6"><Notice tone={notice.tone}>{notice.text}</Notice></div>}

      <div className="mt-8 flex flex-col gap-6">
        {!confirmed ? (
          <Panel title="Not confirmed yet">
            <p className="text-sm text-neutral-600">
              This batch has a dry run but uploads have not been confirmed. Confirm to start uploading, or start a new import
              to change the file selection.
            </p>
            {batch.dryRunSummary && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <MiniStat label="New drafts" value={batch.dryRunSummary.newDrafts ?? 0} />
                <MiniStat label="Matched SKUs" value={batch.dryRunSummary.matchedExisting ?? 0} />
                <MiniStat label="Invalid rows" value={batch.dryRunSummary.invalidRows ?? 0} emphasis />
                <MiniStat label="Ready files" value={batch.dryRunSummary.filesReady ?? 0} />
                <MiniStat label="Need review" value={batch.dryRunSummary.filesNeedingReview ?? 0} emphasis />
                <MiniStat label="Rejected" value={batch.dryRunSummary.filesRejected ?? 0} emphasis />
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className={btn.primary} onClick={() => void confirmBatch()} disabled={confirming || total === 0}>
                {confirming ? "Confirming..." : "Confirm and upload"}
              </button>
              <Link href="/admin/shop/imports/new" className={btn.secondary}>New import</Link>
            </div>
          </Panel>
        ) : completed ? null : (
          <Panel
            title="Upload queue"
            description="Files go straight to private storage. Each file is verified on its own; a failure never stops the others."
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <Field label="Parallel uploads" htmlFor={concurrencyId} className="sm:w-48">
                  <select
                    id={concurrencyId}
                    className={inputClass}
                    value={concurrency}
                    disabled={running}
                    onChange={(e) => setConcurrency(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
                <div className="flex flex-wrap gap-2">
                  {running ? (
                    <button type="button" className={btn.secondary} onClick={() => abortRef.current?.abort()}>
                      <Pause size={16} /> Pause
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={btn.secondary}
                        disabled={counts.retryable === 0}
                        onClick={() => void startUploads(items.filter((i) => i.status === "FAILED" || progress[i.id]?.phase === "error"))}
                      >
                        <ArrowClockwise size={16} /> Retry failed{counts.retryable ? ` (${counts.retryable})` : ""}
                      </button>
                      <button type="button" className={btn.primary} disabled={counts.local === 0} onClick={() => void startUploads(items)}>
                        <Play size={16} /> Start upload{counts.local ? ` (${counts.local})` : ""}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-neutral-600">
                {running
                  ? `Uploading with ${concurrency} in parallel. Keep this tab open until it finishes.`
                  : counts.local > 0
                    ? `${counts.local} file${counts.local === 1 ? " is" : "s are"} waiting to upload from this tab.`
                    : counts.missingLocal > 0
                      ? "No pending files are available in this tab."
                      : "Every file has been uploaded. Review the mapping below, then apply."}
              </p>

              {activeItems.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {activeItems.slice(0, 12).map((i) => {
                    const p = progress[i.id]!;
                    return (
                      <li key={i.id} className="rounded-xl border border-neutral-200 p-3">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="truncate font-medium text-neutral-950">{i.originalFilename}</span>
                          <span className="shrink-0 tabular-nums text-xs text-neutral-500">
                            {PHASE_LABEL[p.phase]}
                            {p.phase === "uploading" || p.phase === "hashing" ? ` ${formatBytes(p.loaded)} of ${formatBytes(p.total)}` : ""}
                          </span>
                        </div>
                        <ProgressBar className="mt-2" value={p.loaded} max={p.total} label={`${i.originalFilename} progress`} />
                      </li>
                    );
                  })}
                  {activeItems.length > 12 && (
                    <li className="text-xs text-neutral-500">and {activeItems.length - 12} more in the queue</li>
                  )}
                </ul>
              )}

              {counts.missingLocal > 0 && !running && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-neutral-700">
                    <span className="font-medium text-neutral-950">
                      {counts.missingLocal} pending file{counts.missingLocal === 1 ? " is" : "s are"} not available in this tab.
                    </span>{" "}
                    Browsers forget selected files when the page reloads. Re-select the same files or folder to resume; they are
                    matched by name and size (and folder path when available). Files that are already uploaded are never sent
                    again.
                  </p>
                  <FilePicker onPick={resumeFrom} title="Re-select files to resume" hint="Drop the original files or folder here." />
                </div>
              )}
            </div>
          </Panel>
        )}

        <Panel title="Mapping and review" description="Fix SKUs and file types, skip files you do not want, and retry failures.">
          <div className="mb-4 flex flex-wrap gap-1" role="tablist" aria-label="Filter files">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={filter === t.key}
                onClick={() => setFilter(t.key)}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  filter === t.key ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                )}
              >
                {t.label} <span className="tabular-nums opacity-70">{t.count}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              title={total === 0 ? "No files in this batch" : "Nothing here"}
              body={total === 0 ? "This batch has no files." : "No files match this filter."}
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th className={th}>File</th>
                  <th className={`${th} text-right`}>Size</th>
                  <th className={th}>Kind</th>
                  <th className={th}>Target SKU</th>
                  <th className={th}>Status</th>
                  <th className={th}>Issues</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    progress={progress[item.id]}
                    locked={completed || item.applied || (running && Boolean(progress[item.id] && ACTIVE_PHASES.includes(progress[item.id]!.phase)))}
                    hasFile={hasStoredFile(batchId, item.id)}
                    onAction={(body) => itemAction(item, body)}
                    onRevalidate={() => revalidate(item)}
                  />
                ))}
              </tbody>
            </Table>
          )}
        </Panel>

        {confirmed && (
          <Panel title={completed ? "Applied" : "Apply to catalog"}>
            {completed ? (
              <p className="text-sm text-neutral-600">
                This batch has been applied. New arrangements were created as drafts and still need review and publishing.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600">
                  <li>New arrangements from the CSV are created as drafts. Nothing is published automatically and publish checks still apply.</li>
                  <li>Each file becomes a new version. When an arrangement already has an active master, the new version is not activated; activate it from the arrangement page.</li>
                  <li>Apply is available once every file is ready or skipped.</li>
                </ul>
                {blocking > 0 && (
                  <p className="text-sm font-medium text-neutral-950">
                    {blocking} file{blocking === 1 ? " still needs" : "s still need"} an upload, a review or a skip decision.
                  </p>
                )}
                <div>
                  <button type="button" className={btn.primary} disabled={!canApply || applying} onClick={() => void apply()}>
                    <CheckCircle size={16} /> {applying ? "Applying..." : "Apply import"}
                  </button>
                </div>
              </div>
            )}
            {applyResult && (
              <div className="mt-4">
                <Notice tone="success">
                  Created {applyResult.createdArrangements} draft arrangement{applyResult.createdArrangements === 1 ? "" : "s"} and attached{" "}
                  {applyResult.attachedVersions} file{applyResult.attachedVersions === 1 ? "" : "s"}. {applyResult.skipped} skipped.
                </Notice>
              </div>
            )}
            {resultRows.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-medium text-neutral-800">Resulting arrangements</h3>
                <ul className="mt-2 flex flex-col divide-y divide-neutral-100 text-sm">
                  {resultRows.map((r) => (
                    <li key={r.rowNumber} className="flex items-center justify-between gap-3 py-2">
                      <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/arrangements/${r.resultingArrangementId}`}>
                        {r.sku ?? `Row ${r.rowNumber}`}
                      </Link>
                      <span className="text-xs text-neutral-500">
                        {r.action === "CREATE_DRAFT" ? "New draft" : r.action ? ROW_ACTION_LABELS[r.action] ?? r.action : "Updated"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}

function ItemRow({
  item,
  progress,
  locked,
  hasFile,
  onAction,
  onRevalidate,
}: {
  item: BatchItem;
  progress: LocalProgress | undefined;
  locked: boolean;
  hasFile: boolean;
  onAction: (body: { action: "remap" | "skip" | "unskip" | "retry"; targetSku?: string | null; assetKind?: AssetKindValue }) => Promise<void>;
  onRevalidate: () => Promise<void>;
}) {
  const skuId = useId();
  const kindId = useId();
  const [skuDraft, setSkuDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kinds = allowedKindsFor(item.originalFilename);
  if (item.kind && !kinds.includes(item.kind)) kinds.unshift(item.kind);
  const skuValue = skuDraft ?? item.targetSku ?? "";
  const skuDirty = skuDraft !== null && skuDraft.trim() !== (item.targetSku ?? "");
  const disabled = locked || busy !== null;
  const localError = progress?.phase === "error";
  const showProgress = progress && ACTIVE_PHASES.includes(progress.phase);
  const canRevalidate = !item.applied && item.attemptCount > 0 && ["UPLOADING", "UPLOADED", "VALIDATING", "FAILED", "NEEDS_REVIEW"].includes(item.status);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <tr className={`${tr} align-top`}>
      <td className={`${td} max-w-[16rem]`}>
        <p className="truncate font-medium text-neutral-950" title={item.originalFilename}>{item.originalFilename}</p>
        {item.relativePath && <p className="truncate text-xs text-neutral-500" title={item.relativePath}>{item.relativePath}</p>}
        {!hasFile && isUploadable(item) && <p className="text-xs text-neutral-500">File not selected in this tab</p>}
      </td>
      <td className={`${td} text-right tabular-nums`}>{formatBytes(item.bytes)}</td>
      <td className={td}>
        <label htmlFor={kindId} className="sr-only">File type for {item.originalFilename}</label>
        <select
          id={kindId}
          className={`${inputClass} w-40 py-1.5`}
          value={item.kind ?? ""}
          disabled={disabled || kinds.length === 0}
          onChange={(e) => {
            const v = e.target.value as AssetKindValue;
            if (v) void run("kind", () => onAction({ action: "remap", assetKind: v }));
          }}
        >
          {!item.kind && <option value="">Choose a type</option>}
          {kinds.map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
        </select>
      </td>
      <td className={td}>
        <label htmlFor={skuId} className="sr-only">Target SKU for {item.originalFilename}</label>
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!skuDirty) return;
            const next = skuValue.trim() || null;
            void run("sku", async () => {
              await onAction({ action: "remap", targetSku: next });
              setSkuDraft(null);
            });
          }}
        >
          <input
            id={skuId}
            className={`${inputClass} w-36 py-1.5`}
            value={skuValue}
            maxLength={64}
            disabled={disabled}
            onChange={(e) => setSkuDraft(e.target.value)}
          />
          <button type="submit" className={btn.ghost} disabled={disabled || !skuDirty}>
            {busy === "sku" ? "Saving..." : "Save"}
          </button>
        </form>
      </td>
      <td className={td}>
        <div className="flex w-40 flex-col gap-1.5">
          <StatusBadge status={item.applied ? "APPLIED" : item.status} className="self-start" />
          {showProgress && (
            <>
              <ProgressBar value={progress.loaded} max={progress.total} label={`${item.originalFilename} progress`} />
              <span className="text-xs text-neutral-500">{PHASE_LABEL[progress.phase]}</span>
            </>
          )}
          {progress?.phase === "paused" && <span className="text-xs text-neutral-500">Paused</span>}
          {localError && <span className="whitespace-normal text-xs font-medium text-neutral-950">{progress.message}</span>}
        </div>
      </td>
      <td className={td}>
        <IssueList errors={item.errors} warnings={item.warnings} />
        {error && <p className="mt-1 whitespace-normal text-xs font-medium text-neutral-950" role="alert">{error}</p>}
      </td>
      <td className={`${td} text-right`}>
        {!item.applied && !locked && (
          <div className="flex justify-end gap-1">
            {(item.status === "FAILED" || localError) && (
              <button type="button" className={btn.ghost} disabled={disabled} onClick={() => void run("retry", () => onAction({ action: "retry" }))}>
                {busy === "retry" ? "Retrying..." : "Retry"}
              </button>
            )}
            {canRevalidate && (
              <button type="button" className={btn.ghost} disabled={disabled} onClick={() => void run("revalidate", onRevalidate)}>
                {busy === "revalidate" ? "Checking..." : "Revalidate"}
              </button>
            )}
            {item.status === "SKIPPED" ? (
              <button type="button" className={btn.ghost} disabled={disabled} onClick={() => void run("unskip", () => onAction({ action: "unskip" }))}>
                {busy === "unskip" ? "Restoring..." : "Unskip"}
              </button>
            ) : (
              <button type="button" className={btn.ghost} disabled={disabled} onClick={() => void run("skip", () => onAction({ action: "skip" }))}>
                {busy === "skip" ? "Skipping..." : "Skip"}
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

