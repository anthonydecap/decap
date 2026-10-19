import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { finalizeRelease } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

/** Verifies size, installer signature and SHA-256. Creates a DRAFT; never publishes. */
export const POST = adminRoute<{ id: string }>("software:release-write", async (req, { params, staff }) => {
  const { id } = await params;
  const { sha256 } = await parseJson(req, z.object({ sha256: z.string().regex(/^[0-9a-f]{64}$/i).nullable().optional() }));
  const r = await finalizeRelease({ staffId: staff.staff.id }, uuidParam(id), sha256);
  return NextResponse.json({ id: r.id, status: r.status, sha256: r.sha256, errors: r.validationErrors ?? [] });
});
