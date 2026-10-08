import "server-only";
import { BlobNotFoundError, del, get, head, issueSignedToken, presignUrl, put } from "@vercel/blob";
import type { CreateUploadInput, ObjectHead, ObjectRef, StorageService, StoreName, UploadTarget } from "./types";

/**
 * Vercel Blob implementation with three separate stores:
 *  - MASTERS    private — canonical SOURCE_* masters + rights documents
 *  - DELIVERIES private — generated device-bound DMI artifacts
 *  - PREVIEWS   public (default) or private — artwork and short previews
 *
 * Credentials per store: prefer Vercel OIDC (`BLOB_<STORE>_STORE_ID` + the runtime's
 * VERCEL_OIDC_TOKEN) in production; fall back to `BLOB_<STORE>_READ_WRITE_TOKEN` for local
 * development. Nothing here is ever sent to the browser.
 */

type StoreCredentials = { token?: string; storeId?: string };

function credentials(store: StoreName): StoreCredentials {
  // Per-store variables win; otherwise all logical stores share the project's one store
  // (keys are prefixed masters/ deliveries/ previews/). A shared store must be PRIVATE:
  // Vercel rejects public writes to a private store, so masters can never become public.
  const token = process.env[`BLOB_${store}_READ_WRITE_TOKEN`] ?? process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = process.env[`BLOB_${store}_STORE_ID`] ?? process.env.BLOB_STORE_ID;
  if (process.env.VERCEL_OIDC_TOKEN && storeId) return { storeId };
  if (token) return { token };
  if (storeId) return { storeId };
  throw new Error(`Vercel Blob store ${store} is not configured (BLOB_${store}_STORE_ID or BLOB_${store}_READ_WRITE_TOKEN)`);
}

export class VercelBlobStorageService implements StorageService {
  readonly provider = "vercel-blob";

  constructor(
    private readonly opts: {
      previewsAccess: "public" | "private";
      /** Absolute URL of our handshake route (POST /api/admin/shop/uploads/blob). */
      handleUploadUrl: string;
    },
  ) {}

  private access(store: StoreName): "public" | "private" {
    return store === "PREVIEWS" ? this.opts.previewsAccess : "private";
  }

  async createUploadTarget(input: CreateUploadInput): Promise<UploadTarget> {
    // The actual Blob token is minted later by the handshake route, after it re-verifies
    // the staff session and the ticket, and is scoped to exactly `input.key` + PUT only.
    return {
      strategy: "vercel-blob",
      pathname: input.key,
      access: this.access(input.store),
      handleUploadUrl: this.opts.handleUploadUrl,
      clientPayload: input.ticket,
      contentType: input.contentType,
      multipart: input.multipart,
      expiresAt: new Date(Date.now() + input.expiresInSeconds * 1000).toISOString(),
    };
  }

  /** Used by the handshake route: a PUT-only token for one pathname. */
  async issueUploadToken(ref: ObjectRef, constraints: { validUntil: number; contentType: string; maxBytes: number }) {
    return issueSignedToken({
      ...credentials(ref.store),
      pathname: ref.key,
      operations: ["put"],
      validUntil: constraints.validUntil,
      allowedContentTypes: [constraints.contentType],
      maximumSizeInBytes: constraints.maxBytes,
    });
  }

  async head(ref: ObjectRef): Promise<ObjectHead | null> {
    try {
      const h = await head(ref.key, credentials(ref.store));
      return { bytes: h.size, contentType: h.contentType ?? null, uploadedAt: h.uploadedAt ?? null };
    } catch (e) {
      if (e instanceof BlobNotFoundError) return null;
      throw e;
    }
  }

  async openRead(ref: ObjectRef): Promise<ReadableStream<Uint8Array>> {
    const res = await get(ref.key, { access: this.access(ref.store), useCache: false, ...credentials(ref.store) });
    if (!res || res.statusCode !== 200) throw new Error("Object not found");
    return res.stream;
  }

  async readHead(ref: ObjectRef, maxBytes: number): Promise<Uint8Array> {
    const stream = await this.openRead(ref);
    return readFirstBytes(stream, maxBytes);
  }

  async write(ref: ObjectRef, body: Uint8Array, contentType: string): Promise<void> {
    await put(ref.key, Buffer.from(body), {
      access: this.access(ref.store),
      contentType,
      addRandomSuffix: false,
      allowOverwrite: false,
      ...credentials(ref.store),
    });
  }

  async createDownloadUrl(ref: ObjectRef, opts: { expiresInSeconds: number }) {
    const validUntil = Date.now() + opts.expiresInSeconds * 1000;
    const signed = await issueSignedToken({
      ...credentials(ref.store),
      pathname: ref.key,
      operations: ["get"],
      validUntil,
    });
    const { presignedUrl } = await presignUrl(signed, {
      operation: "get",
      pathname: ref.key,
      validUntil,
      access: this.access(ref.store),
    });
    return { url: presignedUrl, expiresAt: new Date(validUntil).toISOString() };
  }

  publicUrl(ref: ObjectRef): string | null {
    if (ref.store !== "PREVIEWS" || this.opts.previewsAccess !== "public") return null;
    const base = process.env.BLOB_PREVIEWS_PUBLIC_BASE_URL;
    return base ? `${base.replace(/\/$/, "")}/${ref.key}` : null;
  }

  async delete(ref: ObjectRef): Promise<void> {
    await del(ref.key, credentials(ref.store));
  }
}

export async function readFirstBytes(stream: ReadableStream<Uint8Array>, maxBytes: number): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const out = new Uint8Array(Math.min(total, maxBytes));
  let offset = 0;
  for (const c of chunks) {
    const take = Math.min(c.length, out.length - offset);
    out.set(c.subarray(0, take), offset);
    offset += take;
    if (offset >= out.length) break;
  }
  return out;
}
