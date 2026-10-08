import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { grantSchema } from "@/modules/shop/schemas";
import { adminGrantEntitlement } from "@/modules/shop/services/entitlements";

export const dynamic = "force-dynamic";

/** Manual grant: adds an ADMIN_GRANT (or PROMOTION / LEGACY_IMPORT) source — never a fake order. */
export const POST = adminRoute<{ id: string }>("entitlements:grant", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, grantSchema);
  const result = await adminGrantEntitlement({
    staffId: staff.staff.id,
    customerId: uuidParam(id),
    arrangementId: input.arrangementId,
    reason: input.reason,
    sourceType: input.sourceType,
    reference: input.reference,
  });
  return NextResponse.json({ entitlementId: result.entitlement.id, sourceId: result.source.id }, { status: 201 });
});
