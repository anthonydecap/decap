import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route } from "@/modules/shop/http";
import { onboardingSchema } from "@/modules/shop/schemas";
import { completeOnboarding } from "@/modules/shop/services/onboarding";
import { rateLimit, RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  const { limit, windowSeconds } = RATE_LIMITS.onboarding;
  await rateLimit(`onboarding:${customer.id}`, limit, windowSeconds);
  const input = await parseJson(req, onboardingSchema);
  await completeOnboarding(customer, input);
  return NextResponse.json({ ok: true });
});
