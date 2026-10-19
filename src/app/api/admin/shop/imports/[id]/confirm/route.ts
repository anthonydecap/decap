import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { confirmImport } from "@/modules/shop/services/imports";

export const dynamic = "force-dynamic";

export const POST = adminRoute<{ id: string }>("imports:manage", async (_req, { params, staff }) => {
  const { id } = await params;
  await confirmImport({ staffId: staff.staff.id }, uuidParam(id));
  return NextResponse.json({ ok: true });
});
