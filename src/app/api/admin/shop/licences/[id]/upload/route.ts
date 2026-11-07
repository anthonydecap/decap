import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { licenseUploadSchema } from "@/modules/shop/schemas";
import { uploadIssuedLicense } from "@/modules/shop/services/player-licenses";

export const dynamic = "force-dynamic";

/** The signed .decaplic made offline; checked (signature, player, customer, songs) before it is kept. */
export const POST = adminRoute<{ id: string }>(
  "licences:issue",
  async (req, { params, staff }) => {
    const { id } = await params;
    const { licence } = await parseJson(req, licenseUploadSchema);
    const order = await uploadIssuedLicense({ staffId: staff.staff.id, orderId: uuidParam(id), fileText: licence });
    return NextResponse.json({ status: order.status, licenseId: order.licenseId });
  },
  { rateLimit: { key: "licence-upload", limit: 60, windowSeconds: 300 } },
);
