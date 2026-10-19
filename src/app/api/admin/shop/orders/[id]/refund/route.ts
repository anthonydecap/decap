import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { refundSchema } from "@/modules/shop/schemas";
import { createRefund } from "@/modules/shop/services/refunds";

export const dynamic = "force-dynamic";

export const POST = adminRoute<{ id: string }>(
  "orders:refund",
  async (req, { params, staff }) => {
    const { id } = await params;
    const input = await parseJson(req, refundSchema);
    const refund = await createRefund({ staffId: staff.staff.id, orderId: uuidParam(id), ...input });
    return NextResponse.json({ id: refund.id, status: refund.status, amountCents: refund.amountCents });
  },
  { rateLimit: { key: "refund", limit: 20, windowSeconds: 60 } },
);
