import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { playerTypeCreateSchema } from "@/modules/shop/schemas";
import { createPlayerType, listPlayerTypes } from "@/modules/shop/services/players";

export const dynamic = "force-dynamic";

export const GET = adminRoute("players:read", async () => NextResponse.json({ types: await listPlayerTypes() }));

export const POST = adminRoute("players:write", async (req, { staff }) => {
  const input = await parseJson(req, playerTypeCreateSchema);
  const type = await createPlayerType({ actorStaffId: staff.staff.id, ...input });
  return NextResponse.json({ typeId: type.id }, { status: 201 });
});
