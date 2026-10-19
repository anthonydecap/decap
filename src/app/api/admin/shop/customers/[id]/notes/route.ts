import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { noteSchema } from "@/modules/shop/schemas";
import { addNote } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

/** Internal note. Never shown to the customer. */
export const POST = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  const { body } = await parseJson(req, noteSchema);
  const note = await addNote({ staffId: staff.staff.id }, uuidParam(id), body);
  return NextResponse.json({ id: note.id }, { status: 201 });
});
