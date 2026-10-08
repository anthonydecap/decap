import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { resolveUrlLang } from "@/i18n";
import { loginUrl } from "@/modules/shop/auth/auth0";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { shopConfig } from "@/modules/shop/config";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { OnboardingForm } from "@/modules/shop/ui/store/OnboardingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account setup", robots: { index: false } };

export default async function OnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { lang } = await params;
  const { returnTo } = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  // Only same-site paths are accepted as a destination.
  const safeReturn = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : shopPath(urlLang, "/account");
  const customer = await getCurrentCustomer();
  if (!customer) redirect(loginUrl(`${shopPath(urlLang, "/account/onboarding")}?returnTo=${encodeURIComponent(safeReturn)}`));

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">{t.onboardingTitle}</h1>
          <p className="mt-3 text-neutral-600">{t.onboardingBody}</p>
          <div className="mt-10">
            <OnboardingForm
              lang={urlLang}
              returnTo={safeReturn}
              versions={shopConfig.legalVersions}
              termsUrl={process.env.SHOP_TERMS_URL ?? `/${urlLang}/terms-of-sale`}
              privacyUrl={process.env.SHOP_PRIVACY_URL ?? `/${urlLang}/privacy-policy`}
              defaults={{
                firstName: customer.firstName ?? "",
                lastName: customer.lastName ?? "",
                countryCode: customer.countryCode ?? "",
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
