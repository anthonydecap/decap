import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { musicRevokeSchema } from "@/modules/shop/schemas";
import { revokeMusicLicense } from "@/modules/shop/services/music-licenses";

export const dynamic = "force-dynamic";

/** Ends one license (history kept). Future deliveries stop; offline files cannot be erased. */
export const POST = adminRoute<{ id: string }>("music:revoke", async (req, { params, staff }) => {
  const { id } = await params;
  const { reason } = await parseJson(req, musicRevokeSchema);
  await revokeMusicLicense({ staffId: staff.staff.id, licenseId: uuidParam(id), reason });
  return NextResponse.json({ ok: true });
});
