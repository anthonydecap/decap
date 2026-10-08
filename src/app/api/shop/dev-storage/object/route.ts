import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { shopConfig } from "@/modules/shop/config";
import { storage } from "@/modules/shop/storage";
import type { StoreName } from "@/modules/shop/storage/types";
import { LocalStorageService } from "@/modules/shop/storage/local";
import { verifyPayload } from "@/modules/shop/storage/tickets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Local development download target for short-lived signed URLs (local driver only). */
export async function GET(req: Request) {
  const store = storage();
  if (!(store instanceof LocalStorageService)) return new NextResponse("Not found", { status: 404 });
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const payload = verifyPayload<{ store: StoreName; key: string; exp: number; filename?: string }>(
    token, shopConfig.uploadTicketSecret, "dev-download",
  );
  if (!payload) return new NextResponse("Link expired", { status: 410 });
  try {
    const ref = { store: payload.store, key: payload.key };
    const head = await store.head(ref);
    const body = await readFile(store.filePath(ref));
    const safeName = (payload.filename ?? "download").replace(/[^\w.\- ]/g, "_");
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "content-type": head?.contentType ?? "application/octet-stream",
        "cache-control": payload.store === "PREVIEWS" ? "private, max-age=3600" : "no-store",
        ...(payload.store !== "PREVIEWS" ? { "content-disposition": `attachment; filename="${safeName}"` } : {}),
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
