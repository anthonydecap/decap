/**
 * Storage port. The domain stores `storageProvider` + `storageStore` + `storageKey` only;
 * URLs are minted on demand, short-lived, and never persisted as identifiers.
 */
/** SUPPORT and DOCUMENTS are private namespaces for ticket attachments and internal customer files. */
export type StoreName = "MASTERS" | "DELIVERIES" | "PREVIEWS" | "SUPPORT" | "DOCUMENTS" | "SOFTWARE";

export type ObjectRef = { store: StoreName; key: string };

/** What the browser needs to upload one object. Never contains store credentials. */
export type UploadTarget =
  | {
      /** Browser calls `uploadPresigned` from @vercel/blob/client; the handshake endpoint
       *  re-verifies the ticket and issues a token scoped to exactly this pathname. */
      strategy: "vercel-blob";
      pathname: string;
      access: "public" | "private";
      handleUploadUrl: string;
      clientPayload: string;
      contentType: string;
      multipart: boolean;
      expiresAt: string;
    }
  | {
      /** Plain single-object PUT to a signed URL (local development driver). */
      strategy: "put";
      url: string;
      headers: Record<string, string>;
      expiresAt: string;
    };

export type ObjectHead = {
  bytes: number;
  contentType: string | null;
  uploadedAt: Date | null;
};

export type CreateUploadInput = ObjectRef & {
  contentType: string;
  maxBytes: number;
  expiresInSeconds: number;
  /** Opaque, signed upload ticket (see tickets.ts). */
  ticket: string;
  multipart: boolean;
};

export interface StorageService {
  readonly provider: string;
  createUploadTarget(input: CreateUploadInput): Promise<UploadTarget>;
  head(ref: ObjectRef): Promise<ObjectHead | null>;
  /** Server-side read of the first `maxBytes` (signature sniffing). */
  readHead(ref: ObjectRef, maxBytes: number): Promise<Uint8Array>;
  /** Server-side streaming read (checksum / parsing). */
  openRead(ref: ObjectRef): Promise<ReadableStream<Uint8Array>>;
  /** Server-side write (generated artifacts, seed data, tests). */
  write(ref: ObjectRef, body: Uint8Array, contentType: string): Promise<void>;
  /** Short-lived GET URL. Callers must authorize first — a URL is never the authorization. */
  createDownloadUrl(ref: ObjectRef, opts: { expiresInSeconds: number; filename?: string }): Promise<{ url: string; expiresAt: string }>;
  /** Stable public URL — only valid for the PREVIEWS store when it is public. */
  publicUrl(ref: ObjectRef): string | null;
  delete(ref: ObjectRef): Promise<void>;
}
