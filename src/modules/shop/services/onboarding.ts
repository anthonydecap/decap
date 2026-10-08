import "server-only";
import type { z } from "zod";
import type { Customer } from "@/generated/shop-prisma/client";
import { shopConfig } from "../config";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import type { onboardingSchema } from "../schemas";
import { audit } from "./audit";

/** First-run account setup: profile + acceptance of the current Terms and Privacy versions. */
export async function completeOnboarding(customer: Customer, input: z.infer<typeof onboardingSchema>) {
  const versions = shopConfig.legalVersions;
  if (input.termsVersion !== versions.TERMS || input.privacyVersion !== versions.PRIVACY) {
    throw new ShopError("CONFLICT", "The legal documents were updated. Please review them again.");
  }
  await shopDb().$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        countryCode: input.countryCode,
        onboardingCompletedAt: customer.onboardingCompletedAt ?? new Date(),
      },
    });
    for (const [documentType, documentVersion] of [["TERMS", versions.TERMS], ["PRIVACY", versions.PRIVACY]] as const) {
      await tx.legalAcceptance.upsert({
        where: { customerId_documentType_documentVersion: { customerId: customer.id, documentType, documentVersion } },
        create: { customerId: customer.id, documentType, documentVersion, source: "account_onboarding" },
        update: {},
      });
    }
    await audit({ type: "CUSTOMER", customerId: customer.id }, "customer.onboarding_completed", { type: "Customer", id: customer.id }, {
      termsVersion: versions.TERMS, privacyVersion: versions.PRIVACY,
    }, tx);
  });
}
