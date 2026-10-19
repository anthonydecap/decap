import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { assignMusicSchema } from "@/modules/shop/schemas";
import { assignLicenses } from "@/modules/shop/services/music-licenses";

export const dynamic = "force-dynamic";

/** Staff resolve unassigned / legacy-review music onto one of the customer's players. */
export const POST = adminRoute("music:migration", async (req, { staff }) => {
  const input = await parseJson(req, assignMusicSchema);
  const result = await assignLicenses({ actor: { type: "STAFF", staffId: staff.staff.id }, licenseIds: input.licenseIds, playerId: input.playerId, reason: input.reason ?? "Assigned by DMI staff" });
  return NextResponse.json(result);
});
