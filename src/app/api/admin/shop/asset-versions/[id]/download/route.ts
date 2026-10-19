import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { adminDownloadUrl } from "@/modules/shop/services/assets";
import { RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/** Audited, short-lived (2 min) admin re-download. Requires the master-download permission. */
export const POST = adminRoute<{ id: string }>(
  "assets:download-master",
  async (_req, { params, staff }) => {
    const { id } = await params;
    return NextResponse.json(await adminDownloadUrl({ staffId: staff.staff.id, assetVersionId: uuidParam(id) }));
  },
  { rateLimit: { key: "master-download", ...RATE_LIMITS.masterDownload } },
);
