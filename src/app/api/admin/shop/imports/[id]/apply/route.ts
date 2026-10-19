import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { applyImport } from "@/modules/shop/services/imports";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Creates DRAFT arrangements + immutable versions from the reviewed plan. Never publishes. */
export const POST = adminRoute<{ id: string }>("imports:manage", async (_req, { params, staff }) => {
  const { id } = await params;
  return NextResponse.json(await applyImport({ staffId: staff.staff.id }, uuidParam(id)));
});
