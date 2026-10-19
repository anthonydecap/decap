import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { adminPlayerLicenses } from "@/modules/shop/services/music-admin";

export const dynamic = "force-dynamic";

const STATUSES = ["live", "all", "ACTIVE", "TRANSFER_PENDING", "RETIRED", "REVOKED", "UNASSIGNED"] as const;

/** Paged, searchable music library of one player (any license status). */
export const GET = adminRoute<{ id: string }>("music:read", async (req, { params }) => {
  const { id } = await params;
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  return NextResponse.json(await adminPlayerLicenses(uuidParam(id), {
    q: url.searchParams.get("q") ?? undefined,
    status: STATUSES.includes(status as (typeof STATUSES)[number]) ? (status as (typeof STATUSES)[number]) : "live",
    page: Number(url.searchParams.get("page") ?? 1) || 1,
  }));
});
