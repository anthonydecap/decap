import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { musicGrantSchema } from "@/modules/shop/schemas";
import { grantMusic } from "@/modules/shop/services/music-licenses";

export const dynamic = "force-dynamic";

/** Manual music grant to a player (or unassigned). Reason and source required; never a fake order. */
export const POST = adminRoute("music:grant", async (req, { staff }) => {
  const input = await parseJson(req, musicGrantSchema);
  const result = await grantMusic({ staffId: staff.staff.id, ...input });
  return NextResponse.json(result, { status: 201 });
});
