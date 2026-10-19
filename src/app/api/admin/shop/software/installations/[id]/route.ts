import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { installationActionSchema } from "@/modules/shop/schemas";
import { installationAction } from "@/modules/shop/services/software-licensing";

export const dynamic = "force-dynamic";

/** retire / suspend / reactivate (part of activation handling). History is never deleted. */
export const POST = adminRoute<{ id: string }>("software:activations-process", async (req, { params, staff }) => {
  const { id } = await params;
  const { action, reason } = await parseJson(req, installationActionSchema);
  await installationAction({ staffId: staff.staff.id }, uuidParam(id), action, reason);
  return NextResponse.json({ ok: true });
});
