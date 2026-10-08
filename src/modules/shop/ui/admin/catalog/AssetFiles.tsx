"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { ASSET_POLICIES, type AssetKindValue } from "../../../domain/asset-policy";
import type { MidiMetadata } from "../../../domain/midi";
import type { UploadTarget } from "../../../storage/types";
import { apiFetch, ApiError, errorMessage } from "../../api";
import { formatBytes, formatDateTime, formatDuration } from "../../format";
import { sha256File, uploadToTarget } from "../../upload";
import { btn, EmptyState, Notice, Panel, StatusBadge } from "../primitives";
import { ProgressBar } from "./ui";

export type AssetVersionRow = {
  id: string;
  versionNumber: number;
  originalFilename: string;
  status: string;
  bytes: number;
  mimeType: string | null;
  validationErrors: { code: string; message: string }[];
  validationWarnings: { code: string; message: string }[];
  technicalMetadata: unknown;
  uploadedBy: string | null;
  createdAt: Date | string;
  validatedAt: Date | string | null;
  isActive: boolean;
};

export type AssetRow = { id: string; kind: string; label: string | null; activeVersionId: string | null; versions: AssetVersionRow[] };

export const KIND_INFO: Record<AssetKindValue, { title: string; description: string }> = {
  SOURCE_MIDI: { title: "MIDI master", description: "Private master. Used to build customer deliveries; never shown to customers." },
  SOURCE_DMI: { title: "DMI master", description: "Private master in the DMI container format; never shown to customers." },
  SOURCE_AUDIO: { title: "Audio master", description: "Private master audio; never shown to customers." },
  SOURCE_VIDEO: { title: "Video master", description: "Private master video; never shown to customers." },
  PREVIEW_AUDIO: { title: "Audio preview", description: "Public. Played on the storefront product page." },
  PREVIEW_VIDEO: { title: "Video preview", description: "Public. Played on the storefront product page." },
  COVER_IMAGE: { title: "Cover image", description: "Public artwork shown on the storefront." },
  DOCUMENT: { title: "Document", description: "Private PDF, for example a rights proof or score. Never shown to customers." },
};

export const ARRANGEMENT_KINDS: AssetKindValue[] = [
  "SOURCE_MIDI", "SOURCE_DMI", "SOURCE_AUDIO", "SOURCE_VIDEO", "PREVIEW_AUDIO", "PREVIEW_VIDEO", "COVER_IMAGE", "DOCUMENT",
];

type FinalizeResult = { id: string; status: string; errors: { code: string; message: string }[]; warnings: { code: string; message: string }[] };

type Phase =
  | { step: "idle" }
  | { step: "hashing" | "presigning" | "uploading" | "validating"; progress: number; filename: string }
  | { step: "done"; result: FinalizeResult; filename: string; hadActive: boolean }
  | { step: "error"; message: string };

function MidiSummary({ meta }: { meta: unknown }) {
  const midi = (meta as { midi?: MidiMetadata } | null)?.midi;
  if (!midi) return null;
  const tempo = midi.tempos[0] ? `${Math.round(midi.tempos[0].bpm)} BPM${midi.tempos.length > 1 ? ` (+${midi.tempos.length - 1} changes)` : ""}` : "Not set";
  const ts = midi.timeSignatures[0] ? `${midi.timeSignatures[0].numerator}/${midi.timeSignatures[0].denominator}` : "Not set";
  const items: [string, string][] = [
    ["Format", `SMF ${midi.format}`],
    ["Tracks", String(midi.trackCount)],
    ["PPQ", midi.ppq != null ? String(midi.ppq) : "SMPTE"],
    ["Tempo", tempo],
    ["Key", midi.keySignatures[0]?.key ?? "Not set"],
    ["Time signature", ts],
    ["Duration", formatDuration(midi.durationSeconds) ?? "Unknown"],
    ["SysEx", midi.hasSysEx ? "Yes" : "No"],
    ["Channels", midi.channelsUsed.length ? midi.channelsUsed.map((c) => c + 1).join(", ") : "None"],
  ];
  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-neutral-50 p-3 text-xs sm:grid-cols-3">
      {items.map(([k, v]) => (
        <div key={k} className="flex flex-col">
          <dt className="text-neutral-500">{k}</dt>
          <dd className="font-medium text-neutral-900 tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function VersionItem({
  v,
  canDownload,
  canUpload,
  hasActive,
}: {
  v: AssetVersionRow;
  canDownload: boolean;
  canUpload: boolean;
  hasActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "activate" | "revalidate" | "download">(null);
  const [msg, setMsg] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null);

  async function activate() {
    if (hasActive && !window.confirm(`Make version ${v.versionNumber} the active file? The current active version stays in the history and can be re-activated.`)) return;
    setBusy("activate");
    setMsg(null);
    try {
      await apiFetch(`/api/admin/shop/asset-versions/${v.id}/activate`, { method: "POST" });
      setMsg({ tone: "success", text: `Version ${v.versionNumber} is now active.` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }

  async function revalidate() {
    setBusy("revalidate");
    setMsg(null);
    try {
      const r = await apiFetch<FinalizeResult>(`/api/admin/shop/asset-versions/${v.id}/finalize`, { method: "POST" });
      setMsg(r.status === "VALID"
        ? { tone: "success", text: "File is valid." }
        : { tone: "error", text: r.errors.map((x) => x.message).join(" ") || `Status: ${r.status}` });
      router.refresh();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }

  async function download() {
    setBusy("download");
    setMsg(null);
    try {
      const r = await apiFetch<{ url: string; expiresAt: string }>(`/api/admin/shop/asset-versions/${v.id}/download`, { method: "POST" });
      setMsg({ tone: "info", text: "Download started. This download was recorded in the audit log." });
      window.location.href = r.url;
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    } finally {
      setBusy(null);
    }
  }

  const canActivate = canUpload && v.status === "VALID" && !v.isActive;
  const canRevalidate = canUpload && (v.status === "INVALID" || v.status === "UPLOADING" || v.status === "VALIDATING");
  const downloadable = canDownload && (v.status === "VALID" || v.status === "INVALID");

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold text-neutral-950">v{v.versionNumber}</span>
            <StatusBadge status={v.status} />
            {v.isActive && <StatusBadge status="ACTIVE" />}
          </div>
          <p className="mt-1 break-all text-sm text-neutral-800">{v.originalFilename}</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {formatBytes(v.bytes)}
            {v.mimeType ? `, ${v.mimeType}` : ""}
            {`. Uploaded ${formatDateTime(v.createdAt)}`}
            {v.uploadedBy ? ` by ${v.uploadedBy}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {canActivate && (
            <button type="button" className={btn.secondary} onClick={activate} disabled={busy !== null}>
              {busy === "activate" ? "Activating…" : "Make active"}
            </button>
          )}
          {canRevalidate && (
            <button type="button" className={btn.secondary} onClick={revalidate} disabled={busy !== null}>
              {busy === "revalidate" ? "Validating…" : "Re-validate"}
            </button>
          )}
          {downloadable && (
            <button
              type="button"
              className={btn.ghost}
              onClick={download}
              disabled={busy !== null}
              title="Audited download. The link is valid for 2 minutes."
            >
              <DownloadSimple size={16} />
              {busy === "download" ? "Preparing…" : "Download (audited)"}
            </button>
          )}
        </div>
      </div>
      {v.validationErrors.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {v.validationErrors.map((e, i) => (
            <li key={i} className="rounded-lg border border-neutral-950 px-3 py-1.5 font-medium text-neutral-950">{e.message}</li>
          ))}
        </ul>
      )}
      {v.validationWarnings.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {v.validationWarnings.map((w, i) => (
            <li key={i} className="rounded-lg bg-neutral-100 px-3 py-1.5 text-neutral-700">Warning: {w.message}</li>
          ))}
        </ul>
      )}
      <MidiSummary meta={v.technicalMetadata} />
      {msg && <div className="mt-3"><Notice tone={msg.tone}>{msg.text}</Notice></div>}
    </li>
  );
}

const STEP_LABEL = {
  hashing: "Computing checksum",
  presigning: "Preparing upload",
  uploading: "Uploading",
  validating: "Validating on the server",
} as const;

export function AssetKindPanel({
  kind,
  versions,
  presignUrl,
  canUpload,
  canDownload,
  title,
  description,
}: {
  kind: AssetKindValue;
  versions: AssetVersionRow[];
  presignUrl: string;
  canUpload: boolean;
  canDownload: boolean;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<Phase>({ step: "idle" });
  const policy = ASSET_POLICIES[kind];
  const accept = policy.extensions.map((e) => `.${e}`).join(",");
  const hasActive = versions.some((v) => v.isActive);
  const busy = phase.step === "hashing" || phase.step === "presigning" || phase.step === "uploading" || phase.step === "validating";

  async function onFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!policy.extensions.includes(ext)) {
      setPhase({ step: "error", message: `.${ext || "?"} files are not allowed here. Allowed: ${policy.extensions.join(", ")}.` });
      return;
    }
    if (file.size > policy.maxBytes) {
      setPhase({ step: "error", message: `File is larger than the ${formatBytes(policy.maxBytes)} limit.` });
      return;
    }
    const ac = new AbortController();
    abortRef.current = ac;
    const hadActive = hasActive;
    try {
      setPhase({ step: "hashing", progress: 0, filename: file.name });
      const sha256 = await sha256File(file, (p) => setPhase({ step: "hashing", progress: p.loaded / p.total, filename: file.name }), ac.signal);
      setPhase({ step: "presigning", progress: 0, filename: file.name });
      const presign = await apiFetch<{ assetVersionId: string; target: UploadTarget; expiresAt: string }>(presignUrl, {
        body: { kind, filename: file.name, contentType: file.type || undefined, bytes: file.size, sha256 },
        signal: ac.signal,
      });
      setPhase({ step: "uploading", progress: 0, filename: file.name });
      await uploadToTarget(presign.target, file, (p) => setPhase({ step: "uploading", progress: p.total ? p.loaded / p.total : 0, filename: file.name }), ac.signal);
      setPhase({ step: "validating", progress: 1, filename: file.name });
      const result = await apiFetch<FinalizeResult>(`/api/admin/shop/asset-versions/${presign.assetVersionId}/finalize`, { method: "POST" });
      setPhase({ step: "done", result, filename: file.name, hadActive });
      router.refresh();
    } catch (e) {
      const known = e instanceof ApiError || (e instanceof Error && e.name === "AbortError");
      setPhase({ step: "error", message: !known && e instanceof Error && e.message ? e.message : errorMessage(e) });
      router.refresh();
    } finally {
      abortRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const info = KIND_INFO[kind];
  return (
    <Panel
      title={title ?? info.title}
      description={
        <>
          {description ?? info.description} Allowed: {policy.extensions.map((e) => `.${e}`).join(", ")}, up to {formatBytes(policy.maxBytes)}.
        </>
      }
      actions={
        canUpload ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="sr-only"
              id={`upload-${kind}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFile(file);
              }}
              disabled={busy}
            />
            <button type="button" className={btn.secondary} onClick={() => inputRef.current?.click()} disabled={busy}>
              <UploadSimple size={16} />
              {busy ? "Uploading…" : versions.length ? "Upload new version" : "Upload"}
            </button>
          </>
        ) : undefined
      }
    >
      {busy && (
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
          <p className="break-all text-sm font-medium text-neutral-900">{phase.filename}</p>
          <ProgressBar value={phase.progress} label={STEP_LABEL[phase.step]} />
          {(phase.step === "hashing" || phase.step === "uploading") && (
            <button type="button" className={`${btn.ghost} self-start`} onClick={() => abortRef.current?.abort()}>Cancel</button>
          )}
        </div>
      )}
      {phase.step === "done" && (
        <div className="mb-5">
          {phase.result.status === "VALID" ? (
            <Notice tone="success">
              {phase.filename} uploaded and valid.
              {phase.hadActive ? " It is not active yet: use Make active to replace the current file." : " It is now the active file."}
              {phase.result.warnings.length ? ` Warnings: ${phase.result.warnings.map((w) => w.message).join(" ")}` : ""}
            </Notice>
          ) : (
            <Notice tone="error">
              {phase.filename} failed validation. {phase.result.errors.map((x) => x.message).join(" ")}
            </Notice>
          )}
        </div>
      )}
      {phase.step === "error" && <div className="mb-5"><Notice tone="error">{phase.message}</Notice></div>}

      {versions.length === 0 ? (
        <p className="text-sm text-neutral-500">No file uploaded yet.</p>
      ) : (
        <>
          {hasActive && versions.length > 1 && (
            <p className="mb-4 text-xs text-neutral-500">
              Versions are immutable. A new upload never replaces the active file automatically: choose Make active to switch.
            </p>
          )}
          <ul className="flex flex-col divide-y divide-neutral-100">
            {versions.map((v) => (
              <VersionItem key={v.id} v={v} canDownload={canDownload} canUpload={canUpload} hasActive={hasActive} />
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}

export function ArrangementFiles({
  arrangementId,
  assets,
  canUpload,
  canDownload,
}: {
  arrangementId: string;
  assets: AssetRow[];
  canUpload: boolean;
  canDownload: boolean;
}) {
  const byKind = new Map<string, AssetVersionRow[]>();
  for (const a of assets) byKind.set(a.kind, [...(byKind.get(a.kind) ?? []), ...a.versions]);
  const any = assets.some((a) => a.versions.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <Notice>
        Master files (MIDI, DMI, audio, video and documents) are stored privately and are never shown or linked to customers.
        Customers only receive generated deliveries after purchase. Previews and cover images are public.
        {canDownload ? " Master downloads are audited and use a link that expires after 2 minutes." : ""}
      </Notice>
      {!canUpload && <Notice tone="error">Your role cannot upload files. You can still review version history.</Notice>}
      {!any && (
        <EmptyState
          title="No files yet"
          body="Upload at least one MIDI or DMI master to make this arrangement publishable. A preview may also be required."
        />
      )}
      {ARRANGEMENT_KINDS.map((kind) => (
        <AssetKindPanel
          key={kind}
          kind={kind}
          versions={byKind.get(kind) ?? []}
          presignUrl={`/api/admin/shop/arrangements/${arrangementId}/assets`}
          canUpload={canUpload}
          canDownload={canDownload}
        />
      ))}
    </div>
  );
}
