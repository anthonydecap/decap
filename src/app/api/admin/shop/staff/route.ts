import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { staffPromoteSchema } from "@/modules/shop/schemas";
import { promoteToStaff, searchPromotionCandidates } from "@/modules/shop/services/staff";

export const dynamic = "force-dynamic";

/** People who have signed in but are not staff yet, for the promote field. */
export const GET = adminRoute("staff:manage", async (req) => {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const candidates = await searchPromotionCandidates(q);
  return NextResponse.json({
    candidates: candidates.map((c) => ({
      authSubject: c.authSubject,
      email: c.email,
      name: [c.firstName, c.lastName].filter(Boolean).join(" ") || null,
    })),
  });
});

/** Grants staff access to an existing Auth0 identity. Their Customer record is untouched. */
export const POST = adminRoute("staff:manage", async (req, { staff }) => {
  const input = await parseJson(req, staffPromoteSchema);
  const created = await promoteToStaff({
    actorStaffId: staff.staff.id,
    authSubject: input.authSubject,
    role: input.role,
    displayName: input.displayName,
  });
  return NextResponse.json({ staffId: created.id }, { status: 201 });
});
