import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/modules/shop/auth/session";
import { ShopError } from "@/modules/shop/errors";
import { assertSameOrigin, parseJson, route } from "@/modules/shop/http";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { acceptStaffInvite } from "@/modules/shop/services/staff";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  assertSameOrigin(req);
  const user = await getSessionUser();
  if (!user) throw new ShopError("UNAUTHENTICATED", "Sign in to accept the invitation");
  await rateLimit(`invite-accept:${user.sub}`, 10, 3600);
  const { token } = await parseJson(req, z.object({ token: z.string().min(20).max(100) }));
  const staff = await acceptStaffInvite({
    token, authSubject: user.sub, email: user.email, emailVerified: user.email_verified === true, name: user.name ?? null,
  });
  return NextResponse.json({ staffId: staff.id, role: staff.role });
});
