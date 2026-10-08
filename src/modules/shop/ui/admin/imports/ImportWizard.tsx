"use client";

import { ArrowLeft, CheckCircle, FileCsv, Trash, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { runBoundedQueue } from "../../bounded-queue";
import { formatBytes } from "../../format";
import { sha256File } from "../../upload";
import { btn, EmptyState, Field, inputClass, Notice, Panel, StatusBadge, Table, td, th, tr } from "../primitives";
import { setBatchFiles } from "./file-store";
import type { PickResult } from "./file-pick";
import { FilePicker, IssueList, MiniStat, ProgressBar } from "./parts";
import {
  cleanText, HASH_INLINE_LIMIT, KIND_LABELS, ROW_ACTION_LABELS, type DryRunResponse, type Issue, type PlannedItem,
} from "./types";

const TEMPLATE_URL = "/api/admin/shop/imports/template";

type Selected = { clientId: string; file: File; relativePath: string | null };
type CsvState = { name: string; text: string; bytes: number };
type Phase = "idle" | "hashing" | "planning" | "confirming";

const MAX_CSV_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5000;

const fileKey = (f: File, relativePath: string | null) => `${relativePath ?? f.name}|${f.size}|${f.lastModified}`;

function planStatus(it: PlannedItem): string {
  if (it.status === "FAILED") return "REJECTED";
  if (it.status === "NEEDS_REVIEW") return "NEEDS_REVIEW";
  return it.sku ? "QUEUED" : "UNMATCHED";
}

export function ImportWizard() {
  const router = useRouter();
  const labelId = useId();
  const csvId = useId();

  const [label, setLabel] = useState("");
  const [csv, setCsv] = useState<CsvState | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [files, setFiles] = useState<Selected[]>([]);
  const [step, setStep] = useState<"select" | "review">("select");
  const [phase, setPhase] = useState<Phase>("idle");
  const [hashProgress, setHashProgress] = useState<{ loaded: number; total: number; done: number; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<DryRunResponse | null>(null);
  const [batchInfo, setBatchInfo] = useState<{ id: string; csvErrors: Issue[]; rowCount: number } | null>(null);

  const nextId = useRef(1);
  const hashes = useRef(new Map<string, string>());
  const batchSignature = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const busy = phase !== "idle";
  const totalBytes = useMemo(() => files.reduce((s, f) => s + f.file.size, 0), [files]);

  function addFiles(r: PickResult) {
    setFiles((prev) => {
      const seen = new Set(prev.map((p) => fileKey(p.file, p.relativePath)));
      const added: Selected[] = [];
      for (const f of r.files) {
        const k = fileKey(f.file, f.relativePath);
        if (seen.has(k)) continue;
        seen.add(k);
        added.push({ clientId: `f${nextId.current++}`, file: f.file, relativePath: f.relativePath });
      }
      return [...prev, ...added];
    });
  }

  function removeFile(clientId: string) {
    hashes.current.delete(clientId);
    setFiles((prev) => prev.filter((f) => f.clientId !== clientId));
  }

  async function onCsvChange(file: File | undefined) {
    setCsvError(null);
    if (!file) return;
    if (file.size > MAX_CSV_BYTES) {
      setCsvError("The metadata CSV must be 5 MB or smaller.");
      return;
    }
    try {
      setCsv({ name: file.name, text: await file.text(), bytes: file.size });
    } catch {
      setCsvError("This file could not be read.");
    }
  }

  async function runDryRun() {
    setError(null);
    if (files.length === 0) {
      setError("Select at least one file to import.");
      return;
    }
    if (files.length > MAX_FILES) {
      setError(`At most ${MAX_FILES} files per batch. Split the selection into several imports.`);
      return;
    }
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // 1. Hash small files now so the dry run can flag duplicate content. Large files are
      //    hashed during upload instead.
      const toHash = files.filter((f) => f.file.size <= HASH_INLINE_LIMIT && !hashes.current.has(f.clientId));
      if (toHash.length > 0) {
        setPhase("hashing");
        const total = toHash.reduce((s, f) => s + f.file.size, 0);
        const loaded = new Map<string, number>();
        let done = 0;
        const report = () =>
          setHashProgress({ loaded: [...loaded.values()].reduce((a, b) => a + b, 0), total, done, count: toHash.length });
        report();
        await runBoundedQueue(
          toHash,
          3,
          async (f) => {
            const sha = await sha256File(f.file, (p) => {
              loaded.set(f.clientId, p.loaded);
              report();
            }, ac.signal);
            hashes.current.set(f.clientId, sha);
          },
          {
            signal: ac.signal,
            onSettled: (r) => {
              // A file that cannot be hashed here is still verified after upload.
              loaded.set(r.item.clientId, r.item.file.size);
              done++;
              report();
            },
          },
        );
        if (ac.signal.aborted) return;
      }

      // 2. Create the batch (or reuse it when label and CSV are unchanged).
      setPhase("planning");
      const signature = JSON.stringify([label.trim(), csv?.name ?? null, csv?.text ?? null]);
      let info = batchInfo;
      if (!info || batchSignature.current !== signature) {
        const created = await apiFetch<{ id: string; rowCount: number; csvErrors: Issue[] }>("/api/admin/shop/imports", {
          body: {
            label: label.trim() || undefined,
            manifestFilename: csv?.name,
            manifestCsv: csv?.text,
          },
          signal: ac.signal,
        });
        info = { id: created.id, csvErrors: created.csvErrors ?? [], rowCount: created.rowCount };
        batchSignature.current = signature;
        setBatchInfo(info);
      }

      // 3. Dry run.
      const result = await apiFetch<DryRunResponse>(`/api/admin/shop/imports/${info.id}/dry-run`, {
        body: {
          files: files.map((f) => ({
            clientId: f.clientId,
            filename: f.file.name,
            relativePath: f.relativePath,
            bytes: f.file.size,
            contentType: f.file.type ? f.file.type.slice(0, 120) : undefined,
            sha256: hashes.current.get(f.clientId),
          })),
        },
        signal: ac.signal,
      });
      setPlan(result);
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      if (!ac.signal.aborted) setError(cleanText(errorMessage(e)));
    } finally {
      setPhase("idle");
      setHashProgress(null);
      abortRef.current = null;
    }
  }

  async function confirm() {
    if (!batchInfo || !plan) return;
    setError(null);
    setPhase("confirming");
    try {
      await apiFetch(`/api/admin/shop/imports/${batchInfo.id}/confirm`, { body: {} });
      const byClient = new Map(files.map((f) => [f.clientId, f]));
      setBatchFiles(
        batchInfo.id,
        plan.idMap.flatMap(({ clientId, itemId }) => {
          const f = byClient.get(clientId);
          return f
            ? [[itemId, { file: f.file, relativePath: f.relativePath, sha256: hashes.current.get(clientId) ?? null }] as const]
            : [];
        }),
      );
      router.push(`/admin/shop/imports/${batchInfo.id}?autostart=1`);
    } catch (e) {
      setError(cleanText(errorMessage(e)));
      setPhase("idle");
    }
  }

  if (step === "review" && plan) {
    return (
      <DryRunReview
        plan={plan}
        csvErrors={batchInfo?.csvErrors ?? []}
        error={error}
        confirming={phase === "confirming"}
        onBack={() => {
          setError(null);
          setStep("select");
        }}
        onConfirm={confirm}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Batch details" description="Name the batch so it is easy to find in the import history.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Label" htmlFor={labelId} help="Optional, for example the supplier or delivery date.">
            <input
              id={labelId}
              className={inputClass}
              value={label}
              maxLength={120}
              disabled={busy}
              onChange={(e) => setLabel(e.target.value)}
            />
          </Field>
          <Field
            label="Metadata CSV"
            htmlFor={csvId}
            error={csvError}
            help={
              <>
                Optional, up to 5 MB. Rows create draft arrangements or attach files to existing SKUs.{" "}
                <a className="font-medium text-neutral-950 underline" href={TEMPLATE_URL} download>Download the template</a>.
              </>
            }
          >
            {csv ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <FileCsv size={18} className="shrink-0 text-neutral-700" />
                  <span className="truncate font-medium text-neutral-950">{csv.name}</span>
                  <span className="shrink-0 text-neutral-500">{formatBytes(csv.bytes)}</span>
                </span>
                <button type="button" className={btn.ghost} disabled={busy} onClick={() => setCsv(null)} aria-label="Remove CSV">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <input
                id={csvId}
                type="file"
                accept=".csv,text/csv"
                disabled={busy}
                className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-full file:border file:border-neutral-300 file:bg-white file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-neutral-950 hover:file:border-neutral-950"
                onChange={(e) => {
                  void onCsvChange(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            )}
          </Field>
        </div>
      </Panel>

      <Panel
        title="Files"
        description="Masters, previews and covers. Files are matched to SKUs by the CSV or by a SKU prefix in the filename."
      >
        <FilePicker
          onPick={addFiles}
          disabled={busy}
          hint="MIDI, DMI, audio, video, images and PDF. ZIP archives are not unpacked."
        />

        <div className="mt-6">
          {files.length === 0 ? (
            <EmptyState title="No files selected" body="Choose files or a whole folder, or drop them above." />
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-neutral-600">
                  {files.length} file{files.length === 1 ? "" : "s"}, {formatBytes(totalBytes)}
                </p>
                <button type="button" className={btn.ghost} disabled={busy} onClick={() => setFiles([])}>
                  <Trash size={16} /> Clear all
                </button>
              </div>
              <div className="max-h-[28rem] overflow-y-auto">
                <Table>
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className={th}>Name</th>
                      <th className={th}>Relative path</th>
                      <th className={`${th} text-right`}>Size</th>
                      <th className={th}><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr key={f.clientId} className={tr}>
                        <td className={`${td} max-w-[18rem] truncate font-medium text-neutral-950`}>{f.file.name}</td>
                        <td className={`${td} max-w-[20rem] truncate text-neutral-500`}>{f.relativePath ?? "Not in a folder"}</td>
                        <td className={`${td} text-right tabular-nums`}>{formatBytes(f.file.size)}</td>
                        <td className={`${td} text-right`}>
                          <button
                            type="button"
                            className={btn.ghost}
                            disabled={busy}
                            onClick={() => removeFile(f.clientId)}
                            aria-label={`Remove ${f.file.name}`}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </div>
      </Panel>

      {error && <Notice tone="error">{error}</Notice>}

      {phase === "hashing" && hashProgress && (
        <Panel>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <p className="font-medium text-neutral-950">
                Computing checksums, {hashProgress.done} of {hashProgress.count} files
              </p>
              <p className="tabular-nums text-neutral-500">
                {formatBytes(hashProgress.loaded)} of {formatBytes(hashProgress.total)}
              </p>
            </div>
            <ProgressBar value={hashProgress.loaded} max={hashProgress.total} label="Checksum progress" />
            <p className="text-xs text-neutral-500">
              Files up to 256 MB are checked for duplicates now. Larger files are checked while they upload.
            </p>
          </div>
        </Panel>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {phase === "hashing" && (
          <button type="button" className={btn.secondary} onClick={() => abortRef.current?.abort()}>
            Cancel
          </button>
        )}
        <button type="button" className={btn.primary} disabled={busy || files.length === 0} onClick={() => void runDryRun()}>
          {phase === "hashing" ? "Computing checksums..." : phase === "planning" ? "Running dry run..." : "Run dry run"}
        </button>
      </div>
    </div>
  );
}

function DryRunReview({
  plan,
  csvErrors,
  error,
  confirming,
  onBack,
  onConfirm,
}: {
  plan: DryRunResponse;
  csvErrors: Issue[];
  error: string | null;
  confirming: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const s = plan.summary;
  return (
    <div className="flex flex-col gap-6">
      <Notice>
        Dry run only. Nothing has been uploaded and the catalog is unchanged. Review the plan, then confirm to start
        uploading. Mapping problems can still be fixed after confirming.
      </Notice>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MiniStat label="New drafts" value={s.newDrafts} />
        <MiniStat label="Matched SKUs" value={s.matchedExisting} />
        <MiniStat label="Invalid rows" value={s.invalidRows} emphasis />
        <MiniStat label="Missing referenced files" value={s.missingReferencedFiles} emphasis />
        <MiniStat label="Ready files" value={s.filesReady} />
        <MiniStat label="Files needing review" value={s.filesNeedingReview} emphasis />
        <MiniStat label="Rejected files" value={s.filesRejected} emphasis />
        <MiniStat label="Unmatched files" value={s.unmatchedFiles} emphasis />
        <MiniStat label="Duplicate names" value={s.duplicateFilenames} emphasis />
        <MiniStat label="Duplicate checksums" value={s.duplicateChecksums} emphasis />
      </div>

      {csvErrors.length > 0 && (
        <Notice tone="error">
          <p className="mb-1">The metadata CSV has problems:</p>
          <ul className="list-disc pl-5">
            {csvErrors.map((e, i) => <li key={i}>{cleanText(e.message)}</li>)}
          </ul>
        </Notice>
      )}

      {plan.rows.length > 0 && (
        <Panel title="CSV rows" description={`${plan.rows.length} row${plan.rows.length === 1 ? "" : "s"} in the metadata CSV.`}>
          <div className="max-h-[32rem] overflow-y-auto">
            <Table>
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className={th}>Row</th>
                  <th className={th}>SKU</th>
                  <th className={th}>Title</th>
                  <th className={th}>Action</th>
                  <th className={th}>Issues</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((r) => (
                  <tr key={r.rowNumber} className={`${tr} align-top`}>
                    <td className={`${td} tabular-nums`}>{r.rowNumber}</td>
                    <td className={`${td} font-medium text-neutral-950`}>{r.sku ?? "Missing"}</td>
                    <td className={`${td} max-w-[16rem] truncate`}>{r.title ?? ""}</td>
                    <td className={td}>
                      <span
                        className={
                          r.action === "INVALID"
                            ? "inline-flex rounded-full border border-neutral-950 px-2.5 py-0.5 text-xs font-semibold text-neutral-950"
                            : "inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700"
                        }
                      >
                        {ROW_ACTION_LABELS[r.action] ?? r.action}
                      </span>
                    </td>
                    <td className={td}><IssueList errors={r.errors} warnings={r.warnings} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Panel>
      )}

      <Panel title="Files" description={`${plan.items.length} file${plan.items.length === 1 ? "" : "s"} selected.`}>
        <div className="max-h-[36rem] overflow-y-auto">
          <Table>
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className={th}>File</th>
                <th className={th}>Path</th>
                <th className={`${th} text-right`}>Size</th>
                <th className={th}>SKU</th>
                <th className={th}>Kind</th>
                <th className={th}>Status</th>
                <th className={th}>Issues</th>
              </tr>
            </thead>
            <tbody>
              {plan.items.map((it) => (
                <tr key={it.clientId} className={`${tr} align-top`}>
                  <td className={`${td} max-w-[16rem] truncate font-medium text-neutral-950`}>{it.filename}</td>
                  <td className={`${td} max-w-[14rem] truncate text-neutral-500`}>{it.relativePath ?? ""}</td>
                  <td className={`${td} text-right tabular-nums`}>{formatBytes(it.bytes)}</td>
                  <td className={td}>{it.sku ?? <span className="text-neutral-400">Not matched</span>}</td>
                  <td className={td}>{it.kind ? KIND_LABELS[it.kind] : <span className="text-neutral-400">Unknown</span>}</td>
                  <td className={td}><StatusBadge status={planStatus(it)} /></td>
                  <td className={td}><IssueList errors={it.errors} warnings={it.warnings} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Panel>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className={btn.secondary} onClick={onBack} disabled={confirming}>
          <ArrowLeft size={16} /> Change selection
        </button>
        <button type="button" className={btn.primary} onClick={onConfirm} disabled={confirming}>
          <CheckCircle size={16} /> {confirming ? "Confirming..." : "Confirm and upload"}
        </button>
      </div>
    </div>
  );
}
