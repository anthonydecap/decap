"use client";

import { Files, FolderOpen, UploadSimple } from "@phosphor-icons/react";
import clsx from "clsx";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { btn } from "../primitives";
import { describeIgnored, fromDataTransfer, fromFileList, supportsFolderInput, type PickResult } from "./file-pick";
import { cleanText, type Issue } from "./types";

const noopSubscribe = () => () => {};

export function useFolderInputSupport(): boolean {
  return useSyncExternalStore(noopSubscribe, supportsFolderInput, () => false);
}

/** Multi-file input, folder input (where supported) and a drag and drop zone. */
export function FilePicker({
  onPick,
  disabled,
  title = "Drop files or folders here",
  hint,
}: {
  onPick: (r: PickResult) => void;
  disabled?: boolean;
  title?: string;
  hint?: React.ReactNode;
}) {
  const filesId = useId();
  const folderId = useId();
  const folderSupported = useFolderInputSupport();
  const [over, setOver] = useState(false);
  const [reading, setReading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const deliver = (r: PickResult) => {
    setNote(describeIgnored(r.ignored));
    onPick(r);
  };

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        setOver(false);
        setReading(true);
        fromDataTransfer(e.dataTransfer)
          .then(deliver)
          .catch(() => setNote("Some dropped items could not be read. Try the file or folder buttons instead."))
          .finally(() => setReading(false));
      }}
      className={clsx(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center transition",
        over ? "border-neutral-950 bg-neutral-100" : "border-neutral-300 bg-neutral-50",
        disabled && "opacity-50",
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
        <UploadSimple size={22} />
      </span>
      <div>
        <p className="font-display text-base font-bold text-neutral-950">{reading ? "Reading dropped items..." : title}</p>
        {hint && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <label htmlFor={filesId} className={clsx(btn.secondary, "cursor-pointer", disabled && "pointer-events-none")}>
          <Files size={16} /> Choose files
        </label>
        <input
          id={filesId}
          ref={filesRef}
          type="file"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            deliver(fromFileList(e.target.files));
            if (filesRef.current) filesRef.current.value = "";
          }}
        />
        {folderSupported && (
          <>
            <label htmlFor={folderId} className={clsx(btn.secondary, "cursor-pointer", disabled && "pointer-events-none")}>
              <FolderOpen size={16} /> Choose folder
            </label>
            <input
              id={folderId}
              ref={(el) => {
                folderRef.current = el;
                if (el) el.setAttribute("webkitdirectory", "");
              }}
              type="file"
              multiple
              disabled={disabled}
              className="sr-only"
              onChange={(e) => {
                deliver(fromFileList(e.target.files));
                if (folderRef.current) folderRef.current.value = "";
              }}
            />
          </>
        )}
      </div>
      {note && <p className="text-xs text-neutral-500">{note}</p>}
    </div>
  );
}

export function ProgressBar({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-neutral-200", className)}
    >
      <div className="h-full rounded-full bg-neutral-950 transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function IssueList({ errors, warnings }: { errors?: Issue[] | null; warnings?: Issue[] | null }) {
  const e = errors ?? [];
  const w = warnings ?? [];
  if (e.length === 0 && w.length === 0) return <span className="text-neutral-400">None</span>;
  return (
    <ul className="flex max-w-md flex-col gap-1 whitespace-normal text-xs">
      {e.map((i, n) => (
        <li key={`e${n}`} className="font-medium text-neutral-950">
          <span className="mr-1 rounded bg-neutral-950 px-1 py-px text-[10px] font-semibold text-white">Error</span>
          {cleanText(i.message)}
        </li>
      ))}
      {w.map((i, n) => (
        <li key={`w${n}`} className="text-neutral-600">
          <span className="mr-1 rounded border border-neutral-300 px-1 py-px text-[10px] font-semibold text-neutral-600">Warning</span>
          {cleanText(i.message)}
        </li>
      ))}
    </ul>
  );
}

/** Small numeric tile for dense summaries (collapses to 2 columns on phones). */
export function MiniStat({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className={clsx("rounded-2xl border bg-white p-4", emphasis && value > 0 ? "border-neutral-950" : "border-neutral-200")}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 font-display text-xl font-bold tabular-nums text-neutral-950">{value}</p>
    </div>
  );
}
