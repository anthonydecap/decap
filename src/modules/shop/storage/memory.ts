import type { CreateUploadInput, ObjectHead, ObjectRef, StorageService, UploadTarget } from "./types";

/** In-memory driver for unit/integration tests. */
export class MemoryStorageService implements StorageService {
  readonly provider = "memory";
  readonly objects = new Map<string, { body: Uint8Array; contentType: string; uploadedAt: Date }>();
  readonly issuedUploads: CreateUploadInput[] = [];
  readonly issuedDownloads: Array<ObjectRef & { expiresInSeconds: number }> = [];

  private id(ref: ObjectRef) { return `${ref.store}:${ref.key}`; }

  async createUploadTarget(input: CreateUploadInput): Promise<UploadTarget> {
    this.issuedUploads.push(input);
    return {
      strategy: "put",
      url: `memory://upload/${encodeURIComponent(input.key)}`,
      headers: { "content-type": input.contentType },
      expiresAt: new Date(Date.now() + input.expiresInSeconds * 1000).toISOString(),
    };
  }
  async head(ref: ObjectRef): Promise<ObjectHead | null> {
    const o = this.objects.get(this.id(ref));
    return o ? { bytes: o.body.length, contentType: o.contentType, uploadedAt: o.uploadedAt } : null;
  }
  async readHead(ref: ObjectRef, maxBytes: number) {
    const o = this.objects.get(this.id(ref));
    if (!o) throw new Error("Object not found");
    return o.body.subarray(0, maxBytes);
  }
  async openRead(ref: ObjectRef) {
    const o = this.objects.get(this.id(ref));
    if (!o) throw new Error("Object not found");
    const body = o.body;
    return new ReadableStream<Uint8Array>({ start(c) { c.enqueue(body); c.close(); } });
  }
  async write(ref: ObjectRef, body: Uint8Array, contentType: string) {
    if (this.objects.has(this.id(ref))) throw new Error("Object exists");
    this.objects.set(this.id(ref), { body, contentType, uploadedAt: new Date() });
  }
  async createDownloadUrl(ref: ObjectRef, opts: { expiresInSeconds: number }) {
    this.issuedDownloads.push({ ...ref, expiresInSeconds: opts.expiresInSeconds });
    return { url: `memory://download/${encodeURIComponent(ref.key)}`, expiresAt: new Date(Date.now() + opts.expiresInSeconds * 1000).toISOString() };
  }
  publicUrl(ref: ObjectRef) {
    return ref.store === "PREVIEWS" ? `memory://public/${ref.key}` : null;
  }
  async delete(ref: ObjectRef) {
    this.objects.delete(this.id(ref));
  }
}
