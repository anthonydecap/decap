import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { taskSchema } from "@/modules/shop/schemas";
import { createTask } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

export const POST = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  const task = await createTask({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, taskSchema));
  return NextResponse.json({ id: task.id }, { status: 201 });
});
