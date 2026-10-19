import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { taskPatchSchema } from "@/modules/shop/schemas";
import { updateTask } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  const task = await updateTask({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, taskPatchSchema));
  return NextResponse.json({ id: task.id, status: task.status });
});
