"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Copy, DownloadSimple, PencilSimple } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { formatBytes, formatDateTime } from "../../format";
import { Checkbox, textareaClass } from "../catalog/ui";
import { btn, EmptyState, Field, inputClass, Notice, StatusBadge, Table, td, th, tr } from "../primitives";
import { archLabel, channelLabel, platformLabel } from "./labels";

export type ReleaseRow = {
  id: string;
  version: string;
  platform: string;
  architecture: string;
  releaseChannel: string;
  status: "UPLOADING" | "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isCurrent: boolean;
  isDownloadable: boolean;
  bytes: number | null;
  sha256: string | null;
  originalFilename: string;
  uploadedBy: string | null;
  uploadedAt: string | null;
  createdAt: string;
  downloadCount: number;
  releaseNotes: string | null;
  minimumOsVersion: string | null;
  validationErrors: { code: string; message: string }[];
};

function CopySha({ sha }: { sha: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono text-xs" title={sha}>{sha.slice(0, 12)}…</span>
      <button
        type="button"
        className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
        aria-label={copied ? "SHA-256 copied" : "Copy full SHA-256"}
        title={copied ? "Copied" : "Copy full SHA-256"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(sha);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Copy the SHA-256", sha);
          }
        }}
      >
        <Copy size={14} aria-hidden />
      </button>
      {copied && <span className="text-xs text-neutral-500">Copied</span>}
    </span>
  );
}

function EditRelease({ r, onClose }: { r: ReleaseRow; onClose: () => void }) {
  const router = useRouter();
  const [notes, setNotes] = useState(r.releaseNotes ?? "");
  const [minOs, setMinOs] = useState(r.minimumOsVersion ?? "");
  const [downloadable, setDownloadable] = useState(r.isDownloadable);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!downloadable && r.isDownloadable && r.isCurrent && r.status === "PUBLISHED"
      && !window.confirm("This is a current published release. Customers will no longer be able to download it. Continue?")) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/software/releases/${r.id}`, {
        method: "PATCH",
        body: { releaseNotes: notes.trim() || null, minimumOsVersion: minOs.trim() || null, isDownloadable: downloadable },
      });
      router.refresh();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 whitespace-normal py-2">
      <p className="text-xs text-neutral-500">The installer file, version, platform and channel cannot change. Upload a new release for a new build.</p>
      <Field label="Release notes" htmlFor={`rn-${r.id}`}>
        <textarea id={`rn-${r.id}`} rows={4} className={textareaClass} value={notes} maxLength={20000} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <Field label="Minimum OS version" htmlFor={`ro-${r.id}`}>
        <input id={`ro-${r.id}`} className={inputClass} value={minOs} maxLength={80} onChange={(e) => setMinOs(e.target.value)} />
      </Field>
      <Checkbox
        id={`rd-${r.id}`}
        label="Downloadable"
        help="When off, customers cannot download this release even if it is current."
        checked={downloadable}
        onChange={setDownloadable}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-2">
        <button type="button" className={btn.primary} disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
        <button type="button" className={btn.secondary} disabled={busy} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function RowActions({
  r,
  canPublish,
  canEdit,
  onEdit,
}: {
  r: ReleaseRow;
  canPublish: boolean;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "publish" | "mark_current" | "archive" | "verify" | "discard">(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "publish" | "mark_current" | "archive") {
    const label = `${r.version} (${platformLabel(r.platform)} ${archLabel(r.architecture)}, ${channelLabel(r.releaseChannel)})`;
    if (action === "publish" && !window.confirm(`Publish ${label}? Published releases can be downloaded once they are marked current.`)) return;
    if (action === "mark_current" && !window.confirm(`Mark ${label} as current? Customers get this release by default from now on. The previous current release for this platform, architecture and channel stays published but is no longer current.`)) return;
    if (action === "archive") {
      const warning = r.isCurrent
        ? `Archive ${label}? This is the current release: customers lose this download until another release is marked current. Archiving cannot be undone.`
        : `Archive ${label}? Archived releases cannot be published or downloaded by customers again. Archiving cannot be undone.`;
      if (!window.confirm(warning)) return;
    }
    setBusy(action);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/software/releases/${r.id}/action`, { body: { action } });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function verify() {
    setBusy("verify");
    setError(null);
    try {
      const res = await apiFetch<{ status: string; errors: { message: string }[] }>(`/api/admin/shop/software/releases/${r.id}/finalize`, { body: {} });
      if (res.status !== "DRAFT") setError(res.errors.map((e) => e.message).join(". ") || "The upload is still not verified.");
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function discard() {
    if (!window.confirm(`Discard the unverified upload of ${r.version}? This frees the version number so you can upload it again.`)) return;
    setBusy("discard");
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/software/releases/${r.id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1">
        {canPublish && r.status === "DRAFT" && (
          <button type="button" className={btn.ghost} disabled={busy !== null} onClick={() => act("publish")}>
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        )}
        {canPublish && r.status === "PUBLISHED" && !r.isCurrent && (
          <button type="button" className={btn.ghost} disabled={busy !== null} onClick={() => act("mark_current")}>
            {busy === "mark_current" ? "Saving…" : "Mark current"}
          </button>
        )}
        {canEdit && r.status === "UPLOADING" && (
          <button type="button" className={btn.ghost} disabled={busy !== null} onClick={verify}>
            {busy === "verify" ? "Verifying…" : "Verify again"}
          </button>
        )}
        {canEdit && r.status === "UPLOADING" && (
          <button type="button" className={btn.ghost} disabled={busy !== null} onClick={discard}>
            {busy === "discard" ? "Discarding…" : "Discard upload"}
          </button>
        )}
        {canEdit && r.status !== "UPLOADING" && (
          <button type="button" className={btn.ghost} disabled={busy !== null} onClick={onEdit}>
            <PencilSimple size={14} aria-hidden /> Edit notes
          </button>
        )}
        {r.status !== "UPLOADING" && (
          <a
            className={btn.ghost}
            href={`/api/admin/shop/software/releases/${r.id}/download`}
            title="Staff download. Recorded in the audit log; the link expires after 2 minutes."
          >
            <DownloadSimple size={14} aria-hidden /> Download
          </a>
        )}
        {canPublish && r.status !== "ARCHIVED" && (
          <button type="button" className={btn.ghost} disabled={busy !== null} onClick={() => act("archive")}>
            {busy === "archive" ? "Archiving…" : "Archive"}
          </button>
        )}
      </div>
      {error && <p role="alert" className="max-w-xs whitespace-normal text-right text-xs font-medium text-neutral-950">{error}</p>}
    </div>
  );
}

export function ReleasesTable({ releases, canPublish, canEdit }: { releases: ReleaseRow[]; canPublish: boolean; canEdit: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);

  if (releases.length === 0) {
    return <EmptyState title="No releases yet" body="Upload an installer above. It becomes a draft release that you can publish and mark current." />;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th className={th}>Version</th>
          <th className={th}>Platform</th>
          <th className={th}>Channel</th>
          <th className={th}>Status</th>
          <th className={`${th} text-right`}>Size</th>
          <th className={th}>SHA-256</th>
          <th className={th}>Uploaded</th>
          <th className={`${th} text-right`}>Downloads</th>
          <th className={`${th} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {releases.map((r) => (
          <Fragment key={r.id}>
            <tr className={`${tr} align-top`}>
              <td className={td}>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-neutral-950">{r.version}</span>
                  {r.isCurrent && (
                    <span className="rounded-full border border-neutral-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-950">
                      Current
                    </span>
                  )}
                </div>
                <p className="max-w-[14rem] truncate text-xs text-neutral-500" title={r.originalFilename}>{r.originalFilename}</p>
                {!r.isDownloadable && <p className="text-xs text-neutral-500">Not downloadable</p>}
              </td>
              <td className={td}>
                {platformLabel(r.platform)} <span className="text-neutral-500">{archLabel(r.architecture)}</span>
                {r.minimumOsVersion && <p className="text-xs text-neutral-500">{r.minimumOsVersion}</p>}
              </td>
              <td className={td}>{channelLabel(r.releaseChannel)}</td>
              <td className={td}>
                <StatusBadge status={r.status} />
                {r.status === "UPLOADING" && r.validationErrors.length > 0 && (
                  <ul className="mt-1 max-w-[16rem] whitespace-normal text-xs font-medium text-neutral-950">
                    {r.validationErrors.map((e) => <li key={e.code}>{e.message}</li>)}
                  </ul>
                )}
              </td>
              <td className={`${td} text-right tabular-nums`}>{r.bytes != null ? formatBytes(r.bytes) : "Not verified"}</td>
              <td className={td}>{r.sha256 ? <CopySha sha={r.sha256} /> : <span className="text-neutral-400">Not verified</span>}</td>
              <td className={td}>
                <p>{r.uploadedAt ? formatDateTime(r.uploadedAt) : `Started ${formatDateTime(r.createdAt)}`}</p>
                <p className="text-xs text-neutral-500">{r.uploadedBy ?? "Unknown"}</p>
              </td>
              <td className={`${td} text-right tabular-nums`}>{r.downloadCount.toLocaleString("en-GB")}</td>
              <td className={`${td} text-right`}>
                <RowActions r={r} canPublish={canPublish} canEdit={canEdit} onEdit={() => setEditing(editing === r.id ? null : r.id)} />
              </td>
            </tr>
            {editing === r.id && (
              <tr className="border-t border-neutral-100 bg-neutral-50">
                <td colSpan={9} className="px-5 py-3 sm:px-6">
                  <EditRelease r={r} onClose={() => setEditing(null)} />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </Table>
  );
}
