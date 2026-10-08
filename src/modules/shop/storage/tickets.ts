import { createHmac, timingSafeEqual } from "node:crypto";
import type { StoreName } from "./types";

/**
 * Upload tickets bind one upload to one generated key, one store, one content type, a size
 * ceiling, an expiry and the staff member who requested it. They are HMAC-signed so the
 * upload handshake / dev upload route can verify scope without trusting the browser.
 */
export type UploadTicket = {
  v: 1;
  store: StoreName;
  key: string;
  contentType: string;
  maxBytes: number;
  /** Expiry, ms since epoch. */
  exp: number;
  staffId: string;
  /** What this upload is for: "asset-version:<id>" or "import-item:<id>". */
  purpose: string;
};

function b64url(buf: Buffer | string) {
  return Buffer.from(buf).toString("base64url");
}

export function signTicket(ticket: UploadTicket, secret: string): string {
  const body = b64url(JSON.stringify(ticket));
  const sig = b64url(createHmac("sha256", secret).update(`upload-ticket.${body}`).digest());
  return `${body}.${sig}`;
}

export function verifyTicket(token: string, secret: string, now = Date.now()): UploadTicket | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(`upload-ticket.${body}`).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const t = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as UploadTicket;
    if (t.v !== 1 || typeof t.exp !== "number" || t.exp < now) return null;
    return t;
  } catch {
    return null;
  }
}

/** Generic short-lived signed token for dev-storage downloads. */
export function signPayload(payload: object, secret: string, purpose: string): string {
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", secret).update(`${purpose}.${body}`).digest());
  return `${body}.${sig}`;
}

export function verifyPayload<T extends { exp: number }>(token: string, secret: string, purpose: string, now = Date.now()): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(`${purpose}.${body}`).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    return typeof p.exp === "number" && p.exp >= now ? p : null;
  } catch {
    return null;
  }
}
