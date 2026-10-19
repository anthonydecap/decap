import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { ShopError } from "./errors";
import { CART_COOKIE, newAnonymousToken, type CartIdentity } from "./services/cart";

/** JSON route helpers: typed errors → stable `{ error: { code, message } }` responses. */

export function jsonError(e: unknown) {
  if (e instanceof ShopError) {
    return NextResponse.json(
      { error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}) } },
      { status: e.status, headers: { "cache-control": "no-store" } },
    );
  }
  if (e instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid request",
          details: e.issues.slice(0, 20).map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      },
      { status: 422, headers: { "cache-control": "no-store" } },
    );
  }
  // Never leak internals (stack, SQL, provider messages, secrets).
  console.error("[shop] unhandled error", e instanceof Error ? `${e.name}: ${e.message.slice(0, 300)}` : "unknown");
  return NextResponse.json({ error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
}

type Ctx<P> = { params: Promise<P> };

export function route<P = Record<string, string>>(handler: (req: Request, ctx: Ctx<P>) => Promise<Response>) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const res = await handler(req, ctx);
      if (!res.headers.has("cache-control")) res.headers.set("cache-control", "no-store");
      return res;
    } catch (e) {
      return jsonError(e);
    }
  };
}

export async function parseJson<T>(req: Request, schema: ZodType<T>, maxBytes = 256 * 1024): Promise<T> {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new ShopError("VALIDATION_FAILED", "Request body too large");
  const text = await req.text();
  if (text.length > maxBytes) throw new ShopError("VALIDATION_FAILED", "Request body too large");
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new ShopError("VALIDATION_FAILED", "Body must be JSON");
  }
  return schema.parse(body);
}

export const uuidParam = (v: string) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
    throw new ShopError("NOT_FOUND", "Not found");
  }
  return v;
};

/** Same-origin check for state-changing requests (defence in depth on top of SameSite cookies). */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients (tests, Stripe) don't send it
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new ShopError("FORBIDDEN", "Cross-origin request rejected");
  } catch (e) {
    if (e instanceof ShopError) throw e;
    throw new ShopError("FORBIDDEN", "Cross-origin request rejected");
  }
}

/** Cart identity: signed-in customer, else an opaque anonymous cookie token. */
export async function cartIdentity(customerId: string | null, opts: { create: boolean }): Promise<CartIdentity> {
  if (customerId) return { customerId, anonymousToken: null };
  const jar = await cookies();
  let token = jar.get(CART_COOKIE)?.value ?? null;
  if (!token && opts.create) {
    token = newAnonymousToken();
    jar.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return { customerId: null, anonymousToken: token };
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || "unknown";
}

/**
 * multipart/form-data with a JSON `payload` field plus `files`. The whole request is capped
 * at 4 MB (serverless request limit), so attachments are validated again per file later.
 */
export async function parseMultipart<T>(req: Request, schema: ZodType<T>, maxBytes = 4 * 1024 * 1024): Promise<{ data: T; files: File[] }> {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > maxBytes + 64 * 1024) throw new ShopError("VALIDATION_FAILED", "Attachments are limited to 4 MB per message");
  const type = req.headers.get("content-type") ?? "";
  if (!type.startsWith("multipart/form-data")) {
    return { data: await parseJson(req, schema), files: [] };
  }
  const form = await req.formData();
  let payload: unknown = {};
  try {
    payload = JSON.parse(String(form.get("payload") ?? "{}"));
  } catch {
    throw new ShopError("VALIDATION_FAILED", "Invalid form payload");
  }
  const files = form.getAll("files").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && (f as File).size > 0);
  if (files.reduce((s, f) => s + f.size, 0) > maxBytes) throw new ShopError("VALIDATION_FAILED", "Attachments are limited to 4 MB per message");
  return { data: schema.parse(payload), files };
}
