import { NextResponse } from "next/server";
import { z } from "zod";
import { parseMultipart, uuidParam } from "@/modules/shop/http";
import { ShopError } from "@/modules/shop/errors";
import { adminRoute } from "@/modules/shop/http-admin";
import { uploadCustomerDocument } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({ title: z.string().trim().min(1).max(200), registeredPlayerId: z.uuid().nullable().optional() });

/** Internal customer / player document (private DOCUMENTS namespace). */
export const POST = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  const { data, files } = await parseMultipart(req, schema);
  if (files.length !== 1) throw new ShopError("VALIDATION_FAILED", "Attach exactly one file");
  const doc = await uploadCustomerDocument({ staffId: staff.staff.id }, uuidParam(id), { ...data, file: files[0]! });
  return NextResponse.json({ id: doc.id }, { status: 201 });
});
