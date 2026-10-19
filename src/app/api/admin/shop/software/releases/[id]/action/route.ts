import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { releaseActionSchema } from "@/modules/shop/schemas";
import { releaseAction } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

/** publish / mark_current / archive: explicit, separate actions. */
export const POST = adminRoute<{ id: string }>("software:release-publish", async (req, { params, staff }) => {
  const { id } = await params;
  const { action } = await parseJson(req, releaseActionSchema);
  const r = await releaseAction({ staffId: staff.staff.id }, uuidParam(id), action);
  return NextResponse.json({ id: r.id, status: r.status, isCurrent: r.isCurrent });
});
