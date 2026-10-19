"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { INSTALLER_EXTENSIONS, MAX_INSTALLER_BYTES } from "../../../domain/software-status";
import type { UploadTarget } from "../../../storage/types";
import { apiFetch, ApiError, errorMessage } from "../../api";
import { formatBytes } from "../../format";
import { sha256File, uploadToTarget } from "../../upload";
import { FormGrid, ProgressBar, textareaClass } from "../catalog/ui";
import { btn, Field, inputClass, Notice, Panel } from "../primitives";
import { ARCHITECTURES, archLabel, CHANNELS, channelLabel, platformLabel, PLATFORMS } from "./labels";

type FinalizeResult = { id: string; status: string; sha256: string | null; errors: { code: string; message: string }[] };

type Phase =
  | { step: "idle" }
  | { step: "hashing" | "presigning" | "uploading" | "verifying"; progress: number }
  | { step: "done"; result: FinalizeResult; version: string }
  | { step: "error"; message: string };

const STEP_LABEL = {
  hashing: "Computing SHA-256 in your browser",
  presigning: "Preparing upload",
  uploading: "Uploading",
  verifying: "Verifying size, installer type and checksum on the server",
} as const;

const EXTENSIONS = Object.keys(INSTALLER_EXTENSIONS);
const VERSION_RE = /^[0-9A-Za-z][0-9A-Za-z.+_-]*$/;

/**
 * Upload a new installer as an immutable DRAFT release: hash in the browser, presign, upload
 * straight to private storage, then let the server verify. Uploading never publishes.
 */
export function ReleaseUpload({ productId }: { productId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [version, setVersion] = useState("");
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("WINDOWS");
  const [architecture, setArchitecture] = useState<(typeof ARCHITECTURES)[number]>("X64");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("STABLE");
  const [minOs, setMinOs] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ step: "idle" });

  const busy = phase.step === "hashing" || phase.step === "presigning" || phase.step === "uploading" || phase.step === "verifying";
  const versionError = version && !VERSION_RE.test(version.trim()) ? "Letters, digits, dots, plus, dash or underscore, for example 4.2.1" : null;
  const canSubmit = !busy && Boolean(version.trim()) && !versionError && Boolean(file) && !fileError;

  function pickFile(f: File | null) {
    setFile(f);
    setFileError(null);
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!EXTENSIONS.includes(ext)) setFileError(`.${ext || "?"} files are not accepted. Use ${EXTENSIONS.map((e) => `.${e}`).join(", ")}.`);
    else if (f.size > MAX_INSTALLER_BYTES) setFileError(`The file is larger than the ${formatBytes(MAX_INSTALLER_BYTES)} limit.`);
    else if (f.size === 0) setFileError("The file is empty.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !file) return;
    const ac = new AbortController();
    abortRef.current = ac;
    const v = version.trim();
    try {
      setPhase({ step: "hashing", progress: 0 });
      const sha256 = await sha256File(file, (p) => setPhase({ step: "hashing", progress: p.total ? p.loaded / p.total : 0 }), ac.signal);
      setPhase({ step: "presigning", progress: 0 });
      const presign = await apiFetch<{ releaseId: string; target: UploadTarget; expiresAt: string }>(`/api/admin/shop/software/${productId}/releases`, {
        body: {
          version: v,
          platform,
          architecture,
          releaseChannel: channel,
          releaseNotes: notes.trim() || null,
          minimumOsVersion: minOs.trim() || null,
          filename: file.name,
          bytes: file.size,
          sha256,
        },
        signal: ac.signal,
      });
      setPhase({ step: "uploading", progress: 0 });
      await uploadToTarget(presign.target, file, (p) => setPhase({ step: "uploading", progress: p.total ? p.loaded / p.total : 0 }), ac.signal);
      abortRef.current = null;
      setPhase({ step: "verifying", progress: 1 });
      const result = await apiFetch<FinalizeResult>(`/api/admin/shop/software/releases/${presign.releaseId}/finalize`, { body: { sha256 } });
      setPhase({ step: "done", result, version: v });
      if (result.status === "DRAFT") {
        setVersion("");
        setNotes("");
        setMinOs("");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      }
      router.refresh();
    } catch (err) {
      const known = err instanceof ApiError || (err instanceof Error && err.name === "AbortError");
      setPhase({ step: "error", message: !known && err instanceof Error && err.message ? err.message : errorMessage(err) });
      router.refresh();
    } finally {
      abortRef.current = null;
    }
  }

  return (
    <Panel
      title="Upload a new release"
      description="Each upload creates a new, immutable draft release. Uploading never publishes: publish and mark current are separate steps below."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormGrid cols={3}>
          <Field label="Version" htmlFor="rel-version" error={versionError} help="For example 4.2.1">
            <input id="rel-version" className={`${inputClass} font-mono`} value={version} maxLength={40} disabled={busy} onChange={(e) => setVersion(e.target.value)} />
          </Field>
          <Field label="Platform" htmlFor="rel-platform">
            <select id="rel-platform" className={inputClass} value={platform} disabled={busy} onChange={(e) => setPlatform(e.target.value as typeof platform)}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{platformLabel(p)}</option>)}
            </select>
          </Field>
          <Field label="Architecture" htmlFor="rel-arch">
            <select id="rel-arch" className={inputClass} value={architecture} disabled={busy} onChange={(e) => setArchitecture(e.target.value as typeof architecture)}>
              {ARCHITECTURES.map((a) => <option key={a} value={a}>{archLabel(a)}</option>)}
            </select>
          </Field>
          <Field label="Channel" htmlFor="rel-channel" help="Customers get the current Stable release by default.">
            <select id="rel-channel" className={inputClass} value={channel} disabled={busy} onChange={(e) => setChannel(e.target.value as typeof channel)}>
              {CHANNELS.map((c) => <option key={c} value={c}>{channelLabel(c)}</option>)}
            </select>
          </Field>
          <Field label="Minimum OS version" htmlFor="rel-minos" help="Optional, for example Windows 10">
            <input id="rel-minos" className={inputClass} value={minOs} maxLength={80} disabled={busy} onChange={(e) => setMinOs(e.target.value)} />
          </Field>
        </FormGrid>
        <Field label="Release notes" htmlFor="rel-notes" help="Optional. Shown to customers once the release is published.">
          <textarea id="rel-notes" rows={4} className={textareaClass} value={notes} maxLength={20000} disabled={busy} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Field
          label="Installer file"
          htmlFor="rel-file"
          error={fileError}
          help={`${EXTENSIONS.map((x) => `.${x}`).join(", ")}, up to ${formatBytes(MAX_INSTALLER_BYTES)}. The file is stored privately and is never executed.`}
        >
          <input
            ref={fileRef}
            id="rel-file"
            type="file"
            accept={EXTENSIONS.map((x) => `.${x}`).join(",")}
            disabled={busy}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-full file:border file:border-neutral-300 file:bg-white file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-neutral-950 hover:file:border-neutral-950"
          />
        </Field>
        {file && !fileError && <p className="-mt-2 break-all text-xs text-neutral-500">{file.name}, {formatBytes(file.size)}</p>}

        {busy && (
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
            <ProgressBar value={phase.progress} label={STEP_LABEL[phase.step]} />
            {(phase.step === "hashing" || phase.step === "uploading") && (
              <button type="button" className={`${btn.ghost} self-start`} onClick={() => abortRef.current?.abort()}>Cancel</button>
            )}
          </div>
        )}
        {phase.step === "done" &&
          (phase.result.status === "DRAFT" ? (
            <Notice tone="success">
              Version {phase.version} uploaded and verified. It is a draft: publish it, then mark it current, to offer it to customers.
            </Notice>
          ) : (
            <Notice tone="error">
              Version {phase.version} failed verification and was not saved as a draft.{" "}
              {phase.result.errors.map((x) => x.message).join(". ") || `Status: ${phase.result.status.toLowerCase()}.`}
            </Notice>
          ))}
        {phase.step === "error" && <Notice tone="error">{phase.message}</Notice>}

        <div>
          <button type="submit" className={btn.primary} disabled={!canSubmit}>
            <UploadSimple size={16} aria-hidden />
            {busy ? "Uploading…" : "Upload release"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
