import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { playerTypeUpdateSchema } from "@/modules/shop/schemas";
import { updatePlayerType } from "@/modules/shop/services/players";

export const dynamic = "force-dynamic";

/**
 * Rename, re-describe, activate or deactivate. There is no DELETE: a type that players
 * already reference must keep existing, or their service history loses its name.
 */
export const PATCH = adminRoute<{ id: string }>("players:write", async (req, { params, staff }) => {
  const { id } = await params;
  const patch = await parseJson(req, playerTypeUpdateSchema);
  const updated = await updatePlayerType({ actorStaffId: staff.staff.id, typeId: uuidParam(id), patch });
  return NextResponse.json({ typeId: updated.id, active: updated.active });
});
