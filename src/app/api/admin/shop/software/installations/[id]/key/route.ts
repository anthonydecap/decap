import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { staffRevealInstallationKey } from "@/modules/shop/services/software-licensing";

export const dynamic = "force-dynamic";

/** Explicit, audited staff reveal. Requires software:activation-key. */
export const POST = adminRoute<{ id: string }>("software:activation-key", async (_req, { params, staff }) => {
  const { id } = await params;
  const activationKey = await staffRevealInstallationKey({ staffId: staff.staff.id }, uuidParam(id));
  return NextResponse.json({ activationKey }, { headers: { "cache-control": "no-store, private" } });
}, { rateLimit: { key: "staff-key-reveal", limit: 60, windowSeconds: 3600 } });
