"use client";

import { uploadPresigned } from "@vercel/blob/client";
import { createSHA256 } from "hash-wasm";
import type { UploadTarget } from "../storage/types";

/**
 * Browser upload helpers for admin master/preview uploads. Files go straight to storage via
 * the short-lived target the server issued; nothing large passes through Next.js.
 */

export type UploadProgress = { loaded: number; total: number };

/** Streams the file through SHA-256 in 4 MB slices (works for multi-GB masters). */
export async function sha256File(file: Blob, onProgress?: (p: UploadProgress) => void, signal?: AbortSignal): Promise<string> {
  const hasher = await createSHA256();
  hasher.init();
  const chunk = 4 * 1024 * 1024;
  for (let offset = 0; offset < file.size; offset += chunk) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const buf = new Uint8Array(await file.slice(offset, offset + chunk).arrayBuffer());
    hasher.update(buf);
    onProgress?.({ loaded: Math.min(offset + chunk, file.size), total: file.size });
  }
  return hasher.digest("hex");
}

export async function uploadToTarget(
  target: UploadTarget,
  file: Blob,
  onProgress?: (p: UploadProgress) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (target.strategy === "vercel-blob") {
    await uploadPresigned(target.pathname, file, {
      access: target.access,
      handleUploadUrl: target.handleUploadUrl,
      clientPayload: target.clientPayload,
      contentType: target.contentType,
      multipart: target.multipart,
      abortSignal: signal,
      onUploadProgress: (e) => onProgress?.({ loaded: e.loaded, total: e.total }),
    });
    return;
  }
  // Signed PUT (local development driver) with progress via XHR.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", target.url);
    for (const [k, v] of Object.entries(target.headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => onProgress?.({ loaded: e.loaded, total: e.total || file.size });
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(uploadErrorText(xhr))));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}

function uploadErrorText(xhr: XMLHttpRequest) {
  try {
    return (JSON.parse(xhr.responseText) as { error?: { message?: string } }).error?.message ?? `Upload failed (${xhr.status})`;
  } catch {
    return `Upload failed (${xhr.status})`;
  }
}
