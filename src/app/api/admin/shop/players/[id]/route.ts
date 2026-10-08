import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { ShopError } from "@/modules/shop/errors";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { playerUpdateSchema } from "@/modules/shop/schemas";
import { updatePlayer } from "@/modules/shop/services/players";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("players:write", async (req, { params, staff }) => {
  const { id } = await params;
  const patch = await parseJson(req, playerUpdateSchema);
  // Writing a player is one capability; setting the secret on it is another. Someone who
  // may correct a serial number is not automatically allowed to change the activation key.
  if (patch.activationKey !== undefined && !roleHasPermission(staff.staff.role, "players:activation-key")) {
    throw new ShopError("FORBIDDEN", "Your role does not allow changing activation keys");
  }
  const updated = await updatePlayer({ actorStaffId: staff.staff.id, playerId: uuidParam(id), patch });
  return NextResponse.json({ playerId: updated.id, status: updated.status });
});
