import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { noteSchema } from "@/modules/shop/schemas";
import { editNote } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  const { body } = await parseJson(req, noteSchema);
  await editNote({ staffId: staff.staff.id }, uuidParam(id), body);
  return NextResponse.json({ ok: true });
});
