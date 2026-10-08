"use client";

/** Collects files from inputs and drag and drop, keeping folder-relative paths when known. */

export type PickedFile = { file: File; relativePath: string | null };

export type PickResult = { files: PickedFile[]; ignored: { hidden: number; empty: number } };

function isHidden(name: string) {
  return name.startsWith(".") || name === "Thumbs.db" || name === "desktop.ini";
}

export function finishPick(raw: PickedFile[]): PickResult {
  const files: PickedFile[] = [];
  const ignored = { hidden: 0, empty: 0 };
  for (const f of raw) {
    const segments = (f.relativePath ?? f.file.name).split("/");
    if (segments.some(isHidden)) ignored.hidden++;
    else if (f.file.size <= 0) ignored.empty++;
    else files.push(f);
  }
  return { files, ignored };
}

export function fromFileList(list: FileList | null): PickResult {
  const raw: PickedFile[] = [];
  for (const file of Array.from(list ?? [])) {
    raw.push({ file, relativePath: file.webkitRelativePath ? file.webkitRelativePath : null });
  }
  return finishPick(raw);
}

/** True when the browser supports picking a whole folder through a file input. */
export function supportsFolderInput(): boolean {
  if (typeof document === "undefined") return false;
  return "webkitdirectory" in document.createElement("input");
}

function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  // readEntries returns results in chunks (about 100 at a time); keep reading until empty.
  return new Promise((resolve, reject) => {
    const out: FileSystemEntry[] = [];
    const next = () =>
      reader.readEntries((batch) => {
        if (batch.length === 0) resolve(out);
        else {
          out.push(...batch);
          next();
        }
      }, reject);
    next();
  });
}

function entryFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function walk(entry: FileSystemEntry, out: PickedFile[]): Promise<void> {
  if (entry.isFile) {
    const file = await entryFile(entry as FileSystemFileEntry);
    const path = entry.fullPath.replace(/^\/+/, "");
    out.push({ file, relativePath: path.includes("/") ? path : null });
  } else if (entry.isDirectory) {
    const children = await readAllEntries((entry as FileSystemDirectoryEntry).createReader());
    for (const child of children) await walk(child, out);
  }
}

/**
 * Reads a drop. Entries must be captured synchronously inside the drop handler (the
 * DataTransfer is cleared afterwards), so call this directly from onDrop.
 */
export async function fromDataTransfer(dt: DataTransfer): Promise<PickResult> {
  const items = Array.from(dt.items ?? []);
  const entries = items
    .filter((i) => i.kind === "file")
    .map((i) => (typeof i.webkitGetAsEntry === "function" ? i.webkitGetAsEntry() : null));
  if (entries.length > 0 && entries.every((e) => e !== null)) {
    const out: PickedFile[] = [];
    for (const e of entries) await walk(e!, out);
    return finishPick(out);
  }
  return fromFileList(dt.files);
}

export function describeIgnored(ignored: PickResult["ignored"]): string | null {
  const parts: string[] = [];
  if (ignored.hidden) parts.push(`${ignored.hidden} hidden system file${ignored.hidden === 1 ? "" : "s"}`);
  if (ignored.empty) parts.push(`${ignored.empty} empty file${ignored.empty === 1 ? "" : "s"}`);
  return parts.length ? `Ignored ${parts.join(" and ")}.` : null;
}
