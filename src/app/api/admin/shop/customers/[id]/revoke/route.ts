import { NextResponse } from "next/server";
import { shopDb } from "@/modules/shop/db";
import { notFound } from "@/modules/shop/errors";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { revokeSourceSchema } from "@/modules/shop/schemas";
import { adminRevokeEntitlementSource } from "@/modules/shop/services/entitlements";

export const dynamic = "force-dynamic";

/** Revokes one entitlement source of this customer. The source must belong to the customer. */
export const POST = adminRoute<{ id: string }>("entitlements:grant", async (req, { params, staff }) => {
  const { id } = await params;
  const customerId = uuidParam(id);
  const input = await parseJson(req, revokeSourceSchema);
  const source = await shopDb().entitlementSource.findFirst({
    where: { id: input.sourceId, entitlement: { customerId } },
    select: { id: true },
  });
  if (!source) throw notFound("Entitlement source");
  const entitlement = await adminRevokeEntitlementSource({ staffId: staff.staff.id, sourceId: source.id, reason: input.reason });
  return NextResponse.json({ entitlementId: entitlement.id, status: entitlement.status });
});
