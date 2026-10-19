import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { revealActivationKey } from "@/modules/shop/services/players";

export const dynamic = "force-dynamic";

/**
 * Reveals one activation key, to one member of staff, once.
 *
 * POST rather than GET on purpose: a GET would land in browser history, server logs and
 * any proxy in between. Rate-limited per staff member, and every call is audited, so a
 * burst of reveals is visible afterwards. The response is marked no-store by `route`.
 */
export const POST = adminRoute<{ id: string }>(
  "players:activation-key",
  async (_req, { params, staff }) => {
    const { id } = await params;
    const activationKey = await revealActivationKey({ actorStaffId: staff.staff.id, playerId: uuidParam(id) });
    return NextResponse.json({ activationKey });
  },
  { rateLimit: { key: "player-activation-key", limit: 30, windowSeconds: 300 } },
);
