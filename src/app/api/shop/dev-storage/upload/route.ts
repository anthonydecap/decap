import { NextResponse } from "next/server";
import { requireStaff } from "@/modules/shop/auth/session";
import { shopConfig } from "@/modules/shop/config";
import { ShopError } from "@/modules/shop/errors";
import { route } from "@/modules/shop/http";
import { storage } from "@/modules/shop/storage";
import { LocalStorageService } from "@/modules/shop/storage/local";
import { verifyTicket } from "@/modules/shop/storage/tickets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Local development upload target (SHOP_STORAGE_DRIVER=local only). Accepts one PUT per
 * signed ticket: exact key, content type, size ceiling, expiry and the requesting staff
 * member are all enforced. Never available with the Vercel Blob driver.
 */
export const PUT = route(async (req) => {
  const store = storage();
  if (!(store instanceof LocalStorageService)) throw new ShopError("NOT_FOUND", "Not found");

  const token = new URL(req.url).searchParams.get("ticket") ?? "";
  const ticket = verifyTicket(token, shopConfig.uploadTicketSecret);
  if (!ticket) throw new ShopError("UPLOAD_EXPIRED", "Upload link expired or invalid");

  const { staff } = await requireStaff();
  if (staff.id !== ticket.staffId) throw new ShopError("FORBIDDEN", "Upload ticket belongs to another user");

  const contentType = (req.headers.get("content-type") ?? "").split(";")[0]!.trim();
  if (contentType !== ticket.contentType) throw new ShopError("VALIDATION_FAILED", "Content type not allowed for this upload");
  const declared = Number(req.headers.get("content-length") ?? NaN);
  if (Number.isFinite(declared) && declared > ticket.maxBytes) throw new ShopError("VALIDATION_FAILED", "File too large");

  const ref = { store: ticket.store, key: ticket.key };
  if (await store.head(ref)) throw new ShopError("CONFLICT", "Object already exists (single-use upload)");

  const body = new Uint8Array(await req.arrayBuffer());
  if (body.length > ticket.maxBytes) throw new ShopError("VALIDATION_FAILED", "File too large");
  await store.write(ref, body, contentType);
  return NextResponse.json({ ok: true, bytes: body.length });
});
