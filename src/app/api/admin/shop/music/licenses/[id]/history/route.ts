import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { licenseHistory } from "@/modules/shop/services/music-licenses";

export const dynamic = "force-dynamic";

/** Full lineage history of one license (purchase, moves, replacement, revocation). */
export const GET = adminRoute<{ id: string }>("music:read", async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json({ events: await licenseHistory(uuidParam(id)) });
});
