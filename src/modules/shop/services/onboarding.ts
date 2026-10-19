import "server-only";
import type { z } from "zod";
import type { Customer } from "@/generated/shop-prisma/client";
import { shopConfig } from "../config";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import type { onboardingSchema } from "../schemas";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { saveProfile } from "./profile";

/**
 * First-run account setup: customer profile (individual or business), billing address and
 * acceptance of the current Terms + Privacy versions. Also used when legal versions change.
 */
export async function completeOnboarding(customer: Customer, input: z.infer<typeof onboardingSchema>) {
  const versions = shopConfig.legalVersions;
  if (input.termsVersion !== versions.TERMS || input.privacyVersion !== versions.PRIVACY) {
    throw new ShopError("CONFLICT", "The legal documents were updated. Please review them again.");
  }
  await shopDb().$transaction(async (tx) => {
    await saveProfile(customer, input, { type: "CUSTOMER" }, tx);
    const firstTime = !customer.onboardingCompletedAt;
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        onboardingCompletedAt: customer.onboardingCompletedAt ?? new Date(),
        ...(customer.crmStatus === "PROSPECT" ? { crmStatus: "CUSTOMER" } : {}),
        ...(customer.customerSource ? {} : { customerSource: "WEBSITE" }),
      },
    });
    for (const [documentType, documentVersion] of [["TERMS", versions.TERMS], ["PRIVACY", versions.PRIVACY]] as const) {
      await tx.legalAcceptance.upsert({
        where: { customerId_documentType_documentVersion: { customerId: customer.id, documentType, documentVersion } },
        create: { customerId: customer.id, documentType, documentVersion, source: "account_onboarding" },
        update: {},
      });
    }
    await recordActivity({
      tx,
      customerId: customer.id,
      type: firstTime ? "account.onboarded" : "account.legal_accepted",
      summary: firstTime ? "Completed account setup" : "Accepted updated Terms and Privacy Policy",
      metadata: { termsVersion: versions.TERMS, privacyVersion: versions.PRIVACY },
    });
    await audit({ type: "CUSTOMER", customerId: customer.id }, "customer.onboarding_completed", { type: "Customer", id: customer.id }, {
      termsVersion: versions.TERMS, privacyVersion: versions.PRIVACY,
    }, tx);
  });
}
