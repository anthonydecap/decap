"use client";

/**
 * In-memory hand-off of selected File objects from the import wizard to the batch console,
 * keyed by batch id + item id. Survives client-side navigation, not a page reload (browsers
 * cannot persist File handles), which is why the console offers "re-select files to resume".
 */

export type StoredFile = { file: File; sha256: string | null; relativePath: string | null };

const store = new Map<string, Map<string, StoredFile>>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  for (const l of listeners) l();
}

/** Snapshot for useSyncExternalStore: changes whenever files are added or released. */
export function fileStoreVersion(): number {
  return version;
}

export function subscribeFileStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function batchMap(batchId: string) {
  let m = store.get(batchId);
  if (!m) {
    m = new Map();
    store.set(batchId, m);
  }
  return m;
}

export function setBatchFiles(batchId: string, entries: Iterable<[string, StoredFile]>) {
  store.set(batchId, new Map(entries));
  emit();
}

export function attachFiles(batchId: string, entries: Iterable<[string, StoredFile]>) {
  const m = batchMap(batchId);
  for (const [itemId, f] of entries) m.set(itemId, f);
  emit();
}

export function getStoredFile(batchId: string, itemId: string): StoredFile | undefined {
  return store.get(batchId)?.get(itemId);
}

export function hasStoredFile(batchId: string, itemId: string): boolean {
  return store.get(batchId)?.has(itemId) ?? false;
}

export function setStoredHash(batchId: string, itemId: string, sha256: string) {
  const f = store.get(batchId)?.get(itemId);
  if (f) f.sha256 = sha256;
}

export function releaseStoredFile(batchId: string, itemId: string) {
  if (store.get(batchId)?.delete(itemId)) emit();
}

export function storedFileCount(batchId: string): number {
  return store.get(batchId)?.size ?? 0;
}
