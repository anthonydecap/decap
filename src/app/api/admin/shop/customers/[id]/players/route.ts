import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { playerCreateSchema } from "@/modules/shop/schemas";
import { createPlayer, listCustomerPlayers } from "@/modules/shop/services/players";

export const dynamic = "force-dynamic";

export const GET = adminRoute<{ id: string }>("players:read", async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json({ players: await listCustomerPlayers(uuidParam(id)) });
});

/** Registers a player against this customer. The activation key, if given, is encrypted. */
export const POST = adminRoute<{ id: string }>("players:write", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, playerCreateSchema);
  const player = await createPlayer({ actorStaffId: staff.staff.id, customerId: uuidParam(id), ...input });
  return NextResponse.json({ playerId: player.id }, { status: 201 });
});
