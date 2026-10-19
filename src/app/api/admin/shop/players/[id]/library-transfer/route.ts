import { NextResponse } from "next/server";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { ShopError } from "@/modules/shop/errors";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { libraryTransferSchema } from "@/modules/shop/schemas";
import { transferLibrary } from "@/modules/shop/services/music-transfers";

export const dynamic = "force-dynamic";

/**
 * Move or copy a player's music to another player of the same customer. COPY creates new,
 * unpaid licenses, so it additionally needs `music:grant`.
 */
export const POST = adminRoute<{ id: string }>("players:library-transfer", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, libraryTransferSchema);
  if (input.mode === "COPY" && !roleHasPermission(staff.staff.role, "music:grant")) {
    throw new ShopError("FORBIDDEN", "Creating additional licenses requires the music grant permission");
  }
  const result = await transferLibrary({ staffId: staff.staff.id, fromPlayerId: uuidParam(id), toPlayerId: input.toPlayerId, mode: input.mode, type: input.type, reason: input.reason, notes: input.notes, arrangementIds: input.arrangementIds });
  return NextResponse.json(result, { status: 201 });
});
