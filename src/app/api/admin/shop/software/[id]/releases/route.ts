import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { releasePresignSchema } from "@/modules/shop/schemas";
import { presignRelease } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

/** Creates an UPLOADING (draft-to-be) release + a short-lived single-path upload target. */
export const POST = adminRoute<{ id: string }>("software:release-write", async (req, { params, staff }) => {
  const { id } = await params;
  const result = await presignRelease({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, releasePresignSchema));
  return NextResponse.json(result, { status: 201 });
}, { rateLimit: { key: "release-presign", limit: 60, windowSeconds: 3600 } });
