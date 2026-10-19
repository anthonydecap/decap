import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile, open } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { signPayload } from "./tickets";
import type { CreateUploadInput, ObjectHead, ObjectRef, StorageService, UploadTarget } from "./types";
import { isGeneratedKey } from "./keys";

/**
 * Local-disk driver for development and automated tests only. Uploads go to
 * `/api/shop/dev-storage/upload` (PUT, ticket-verified); downloads to
 * `/api/shop/dev-storage/object` with a short-lived HMAC token. Refuses to run on a
 * Vercel production deployment.
 */
export class LocalStorageService implements StorageService {
  readonly provider = "local";

  constructor(private readonly opts: { root: string; baseUrl: string; secret: string }) {
    if (process.env.VERCEL_ENV === "production") {
      throw new Error("The local storage driver must not be used in production");
    }
  }

  filePath(ref: ObjectRef): string {
    if (!isGeneratedKey(ref.key)) throw new Error("Refusing non-generated storage key");
    const p = path.resolve(this.opts.root, ref.store.toLowerCase(), ref.key);
    if (!p.startsWith(path.resolve(this.opts.root) + path.sep)) throw new Error("Path escape");
    return p;
  }

  async createUploadTarget(input: CreateUploadInput): Promise<UploadTarget> {
    return {
      strategy: "put",
      url: `${this.opts.baseUrl}/api/shop/dev-storage/upload?ticket=${encodeURIComponent(input.ticket)}`,
      headers: { "content-type": input.contentType },
      expiresAt: new Date(Date.now() + input.expiresInSeconds * 1000).toISOString(),
    };
  }

  async head(ref: ObjectRef): Promise<ObjectHead | null> {
    try {
      const s = await stat(this.filePath(ref));
      let contentType: string | null = null;
      try { contentType = (await readFile(`${this.filePath(ref)}.type`, "utf8")).trim() || null; } catch { /* none */ }
      return { bytes: s.size, contentType, uploadedAt: s.mtime };
    } catch {
      return null;
    }
  }

  async readHead(ref: ObjectRef, maxBytes: number): Promise<Uint8Array> {
    const fh = await open(this.filePath(ref), "r");
    try {
      const buf = Buffer.alloc(maxBytes);
      const { bytesRead } = await fh.read(buf, 0, maxBytes, 0);
      return new Uint8Array(buf.subarray(0, bytesRead));
    } finally {
      await fh.close();
    }
  }

  async openRead(ref: ObjectRef): Promise<ReadableStream<Uint8Array>> {
    return Readable.toWeb(createReadStream(this.filePath(ref))) as ReadableStream<Uint8Array>;
  }

  async write(ref: ObjectRef, body: Uint8Array, contentType: string): Promise<void> {
    const p = this.filePath(ref);
    await mkdir(path.dirname(p), { recursive: true });
    await writeFile(p, body, { flag: "wx" }); // never overwrite
    await writeFile(`${p}.type`, contentType);
  }

  async createDownloadUrl(ref: ObjectRef, opts: { expiresInSeconds: number; filename?: string }) {
    const exp = Date.now() + opts.expiresInSeconds * 1000;
    const token = signPayload({ store: ref.store, key: ref.key, exp, filename: opts.filename }, this.opts.secret, "dev-download");
    return {
      url: `${this.opts.baseUrl}/api/shop/dev-storage/object?t=${encodeURIComponent(token)}`,
      expiresAt: new Date(exp).toISOString(),
    };
  }

  publicUrl(ref: ObjectRef): string | null {
    if (ref.store !== "PREVIEWS") return null;
    // Previews are long-lived in dev: a 7-day token keeps pages simple.
    const token = signPayload(
      { store: ref.store, key: ref.key, exp: Date.now() + 7 * 24 * 3600 * 1000 },
      this.opts.secret,
      "dev-download",
    );
    return `${this.opts.baseUrl}/api/shop/dev-storage/object?t=${encodeURIComponent(token)}`;
  }

  async delete(ref: ObjectRef): Promise<void> {
    await rm(this.filePath(ref), { force: true });
    await rm(`${this.filePath(ref)}.type`, { force: true });
  }
}
