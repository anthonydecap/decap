import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { playerReplaceSchema } from "@/modules/shop/schemas";
import { replacePlayer } from "@/modules/shop/services/music-transfers";

export const dynamic = "force-dynamic";

/** Replace a failed / upgraded player: library moves, old RETIRED, new ACTIVE, one transaction. */
export const POST = adminRoute<{ id: string }>("players:replace", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, playerReplaceSchema);
  const result = await replacePlayer({ staffId: staff.staff.id, oldPlayerId: uuidParam(id), ...input });
  return NextResponse.json(result, { status: 201 });
});
