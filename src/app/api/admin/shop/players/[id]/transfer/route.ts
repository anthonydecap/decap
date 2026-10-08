import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { playerTransferSchema } from "@/modules/shop/schemas";
import { transferPlayer } from "@/modules/shop/services/players";

export const dynamic = "force-dynamic";

/**
 * Moves a player to another customer. SUPER_ADMIN only (via players:transfer), needs a
 * reason, and lands on both customers' timelines. Never a quiet edit of customerId: this
 * changes who may use the machine.
 */
export const POST = adminRoute<{ id: string }>("players:transfer", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, playerTransferSchema);
  const moved = await transferPlayer({
    actorStaffId: staff.staff.id,
    playerId: uuidParam(id),
    toCustomerId: input.toCustomerId,
    reason: input.reason,
  });
  return NextResponse.json({ playerId: moved.id, customerId: moved.customerId });
});
