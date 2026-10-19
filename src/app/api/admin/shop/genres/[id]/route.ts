import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { taxonomySchema } from "@/modules/shop/schemas";
import { deleteGenre, saveGenre } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("catalog:write", async (req, { params, staff }) => {
  const { id } = await params;
  const data = await parseJson(req, taxonomySchema);
  return NextResponse.json(await saveGenre({ staffId: staff.staff.id }, uuidParam(id), data));
});

export const DELETE = adminRoute<{ id: string }>("catalog:write", async (_req, { params, staff }) => {
  const { id } = await params;
  await deleteGenre({ staffId: staff.staff.id }, uuidParam(id));
  return NextResponse.json({ ok: true });
});
