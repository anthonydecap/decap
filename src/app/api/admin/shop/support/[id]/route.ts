import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { ShopError } from "@/modules/shop/errors";
import { adminRoute } from "@/modules/shop/http-admin";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { ticketPatchSchema } from "@/modules/shop/schemas";
import { updateTicket } from "@/modules/shop/services/support";

export const dynamic = "force-dynamic";

/** Status / priority / category need support:reply; (re)assignment needs support:assign. */
export const PATCH = adminRoute<{ id: string }>("support:reply", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, ticketPatchSchema);
  if (input.assignedStaffId !== undefined && !roleHasPermission(staff.staff.role, "support:assign")) {
    throw new ShopError("FORBIDDEN", "Your role cannot assign tickets");
  }
  const t = await updateTicket({ staffId: staff.staff.id }, uuidParam(id), input);
  return NextResponse.json({ id: t.id, status: t.status, priority: t.priority, assignedStaffId: t.assignedStaffId });
});
