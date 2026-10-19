import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route } from "@/modules/shop/http";
import { profileSchema } from "@/modules/shop/schemas";
import { getProfile, saveProfile } from "@/modules/shop/services/profile";
import { rateLimit } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/** The signed-in customer's own profile. The customer is always derived from the session. */
export const GET = route(async () => {
  const customer = await requireCustomer();
  const { customer: c, billing } = await getProfile(customer.id);
  return NextResponse.json({
    accountType: c.accountType, email: c.email, firstName: c.firstName, lastName: c.lastName, phone: c.phone,
    companyName: c.companyName, companyRegistrationNumber: c.companyRegistrationNumber, vatNumber: c.vatNumber,
    vatCountryCode: c.vatCountryCode, preferredLanguage: c.preferredLanguage, marketingConsent: c.marketingConsent,
    billingAddress: billing,
  });
});

export const PUT = route(async (req) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`profile:${customer.id}`, 20, 60);
  await saveProfile(customer, await parseJson(req, profileSchema), { type: "CUSTOMER" });
  return NextResponse.json({ ok: true });
});
