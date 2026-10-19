import "server-only";
import { redirect } from "next/navigation";
import type { Customer } from "@/generated/shop-prisma/client";
import { loginUrl } from "../../auth/auth0";
import { getCurrentCustomer, hasCurrentLegalAcceptance } from "../../auth/session";
import { getProfile } from "../../services/profile";
import { CATEGORY_LABEL, CUSTOMER_STATUS_LABEL } from "../../services/support";
import { shopCopy, shopPath } from "./copy";
import type { ProfileDefaults } from "./ProfileForm";

/**
 * Account page guard: signed out goes to sign-in, an unfinished setup (or outdated legal
 * acceptance) goes to onboarding with a way back. `path` is the page's own URL.
 */
export async function requireAccountCustomer(lang: string, path: string): Promise<Customer> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(loginUrl(path));
  if (!customer.onboardingCompletedAt || !(await hasCurrentLegalAcceptance(customer.id))) {
    redirect(`${shopPath(lang, "/account/onboarding")}?returnTo=${encodeURIComponent(path)}`);
  }
  return customer;
}

export function ticketStatusLabel(lang: string, status: string): string {
  return shopCopy(lang).supportStatusLabels?.[status] ?? CUSTOMER_STATUS_LABEL[status as keyof typeof CUSTOMER_STATUS_LABEL] ?? status;
}

export function ticketCategoryLabel(lang: string, category: string): string {
  return shopCopy(lang).supportCategoryLabels?.[category] ?? CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL] ?? category;
}

export function ticketCategoryOptions(lang: string): { value: string; label: string }[] {
  return Object.keys(CATEGORY_LABEL).map((value) => ({ value, label: ticketCategoryLabel(lang, value) }));
}

export function formatDateTimeLang(d: Date | string, lang: string): string {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-BE" : "en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(typeof d === "string" ? new Date(d) : d);
}

/** Form defaults from the stored profile and default billing address. */
export async function profileDefaults(customerId: string): Promise<ProfileDefaults> {
  const { customer: c, billing } = await getProfile(customerId);
  return {
    accountType: c.accountType,
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    phone: c.phone ?? "",
    companyName: c.companyName ?? "",
    companyRegistrationNumber: c.companyRegistrationNumber ?? "",
    vatNumber: c.vatNumber ?? "",
    vatCountryCode: c.vatCountryCode ?? "",
    marketingConsent: c.marketingConsent,
    billing: {
      addressLine1: billing?.addressLine1 ?? "",
      addressLine2: billing?.addressLine2 ?? "",
      postalCode: billing?.postalCode ?? "",
      city: billing?.city ?? "",
      stateOrProvince: billing?.stateOrProvince ?? "",
      countryCode: billing?.countryCode ?? c.countryCode ?? "",
    },
  };
}
