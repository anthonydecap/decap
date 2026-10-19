import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route, uuidParam } from "@/modules/shop/http";
import { playerRenameSchema } from "@/modules/shop/schemas";
import { renameCustomerPlayer } from "@/modules/shop/services/music-licenses";
import { rateLimit } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/** The only player field a customer may change: its friendly name. */
export const PATCH = route<{ id: string }>(async (req, { params }) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`player-rename:${customer.id}`, 30, 60);
  const { id } = await params;
  const { friendlyName } = await parseJson(req, playerRenameSchema);
  const name = await renameCustomerPlayer(customer.id, uuidParam(id), friendlyName);
  return NextResponse.json({ friendlyName: name });
});
