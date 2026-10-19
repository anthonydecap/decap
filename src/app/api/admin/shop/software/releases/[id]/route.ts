import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { releasePatchSchema } from "@/modules/shop/schemas";
import { discardUploadingRelease, updateRelease } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

/** Notes / minimum OS / downloadable flag. The binary itself is immutable. */
export const PATCH = adminRoute<{ id: string }>("software:release-write", async (req, { params, staff }) => {
  const { id } = await params;
  const r = await updateRelease({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, releasePatchSchema));
  return NextResponse.json({ id: r.id });
});

/** Discards an unverified upload (frees the version number). Verified releases cannot be deleted. */
export const DELETE = adminRoute<{ id: string }>("software:release-write", async (_req, { params, staff }) => {
  const { id } = await params;
  await discardUploadingRelease({ staffId: staff.staff.id }, uuidParam(id));
  return NextResponse.json({ ok: true });
});
