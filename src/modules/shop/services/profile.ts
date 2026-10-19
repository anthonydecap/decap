import "server-only";
import type { z } from "zod";
import type { Customer, Prisma } from "@/generated/shop-prisma/client";
import { shopDb, type ShopTx } from "../db";
import type { profileSchema } from "../schemas";
import { audit } from "./audit";
import { recordActivity } from "./crm";

/**
 * Customer profile + structured billing address.
 *
 * Auth0 only owns credentials; everything a business invoice needs (company, VAT,
 * address) lives here. A customer has one default BILLING address; orders copy it into an
 * immutable OrderBillingSnapshot so later edits never rewrite history.
 */

export type ProfileInput = z.infer<typeof profileSchema>;

export async function getProfile(customerId: string) {
  const db = shopDb();
  const [customer, billing] = await Promise.all([
    db.customer.findUniqueOrThrow({ where: { id: customerId } }),
    defaultBillingAddress(customerId),
  ]);
  return { customer, billing };
}

export async function defaultBillingAddress(customerId: string, tx?: ShopTx) {
  const db = tx ?? shopDb();
  return db.customerAddress.findFirst({
    where: { customerId, type: "BILLING" },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}

/** True when the customer has what an order needs: name + a complete billing address. */
export async function hasCompleteBillingProfile(customer: Customer): Promise<boolean> {
  if (!customer.firstName || !customer.lastName) return false;
  if (customer.accountType === "BUSINESS" && !customer.companyName) return false;
  return Boolean(await defaultBillingAddress(customer.id));
}

/**
 * Saves profile + default billing address. `actor` is the customer themselves or a staff
 * member editing from the CRM; both land on the timeline.
 */
export async function saveProfile(
  customer: Customer,
  input: ProfileInput,
  actor: { type: "CUSTOMER" } | { type: "STAFF"; staffId: string },
  tx?: ShopTx,
) {
  const run = async (db: ShopTx) => {
    const consentChanged = input.marketingConsent !== customer.marketingConsent;
    const isBusiness = input.accountType === "BUSINESS";
    await db.customer.update({
      where: { id: customer.id },
      data: {
        accountType: input.accountType,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        companyName: isBusiness ? input.companyName : null,
        companyRegistrationNumber: isBusiness ? input.companyRegistrationNumber : null,
        vatNumber: isBusiness ? input.vatNumber : null,
        vatCountryCode: isBusiness ? input.vatCountryCode ?? input.billingAddress.countryCode : null,
        countryCode: input.billingAddress.countryCode,
        ...(input.preferredLanguage ? { preferredLanguage: input.preferredLanguage } : {}),
        marketingConsent: input.marketingConsent,
        ...(consentChanged ? { marketingConsentAt: input.marketingConsent ? new Date() : null } : {}),
      },
    });

    const existing = await defaultBillingAddress(customer.id, db);
    const address: Omit<Prisma.CustomerAddressUncheckedCreateInput, "customerId"> = {
      type: "BILLING",
      isDefault: true,
      name: input.billingAddress.name ?? `${input.firstName} ${input.lastName}`,
      companyName: isBusiness ? input.billingAddress.companyName ?? input.companyName : input.billingAddress.companyName,
      addressLine1: input.billingAddress.addressLine1,
      addressLine2: input.billingAddress.addressLine2,
      postalCode: input.billingAddress.postalCode,
      city: input.billingAddress.city,
      stateOrProvince: input.billingAddress.stateOrProvince,
      countryCode: input.billingAddress.countryCode,
    };
    const billingChanged =
      !existing ||
      (["addressLine1", "addressLine2", "postalCode", "city", "stateOrProvince", "countryCode", "companyName", "name"] as const).some(
        (k) => (existing[k] ?? null) !== (address[k] ?? null),
      );
    if (existing) await db.customerAddress.update({ where: { id: existing.id }, data: address });
    else await db.customerAddress.create({ data: { ...address, customerId: customer.id } });

    const staffId = actor.type === "STAFF" ? actor.staffId : null;
    await recordActivity({
      tx: db,
      customerId: customer.id,
      type: billingChanged ? "profile.billing_updated" : "profile.updated",
      summary: `${actor.type === "STAFF" ? "Staff updated" : "Customer updated"} ${billingChanged ? "contact and billing details" : "contact details"}`,
      staffId,
      metadata: { accountType: input.accountType, country: input.billingAddress.countryCode, ...(consentChanged ? { marketingConsent: input.marketingConsent } : {}) },
    });
    await audit(
      actor.type === "STAFF" ? { type: "STAFF", staffId: actor.staffId } : { type: "CUSTOMER", customerId: customer.id },
      "customer.profile_updated",
      { type: "Customer", id: customer.id },
      { billingChanged, accountType: input.accountType, consentChanged },
      db,
    );
  };
  if (tx) return run(tx);
  return shopDb().$transaction(run);
}

/** Copied into every new order. Immutable afterwards. */
export async function writeBillingSnapshot(tx: ShopTx, orderId: string, customer: Customer) {
  const billing = await defaultBillingAddress(customer.id, tx);
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email;
  await tx.orderBillingSnapshot.create({
    data: {
      orderId,
      customerName: billing?.name ?? name,
      companyName: customer.accountType === "BUSINESS" ? customer.companyName : billing?.companyName ?? null,
      vatNumber: customer.accountType === "BUSINESS" ? customer.vatNumber : null,
      email: customer.email,
      addressLine1: billing?.addressLine1 ?? null,
      addressLine2: billing?.addressLine2 ?? null,
      postalCode: billing?.postalCode ?? null,
      city: billing?.city ?? null,
      stateOrProvince: billing?.stateOrProvince ?? null,
      countryCode: billing?.countryCode ?? customer.countryCode ?? null,
    },
  });
}
