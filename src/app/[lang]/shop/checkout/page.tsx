import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { resolveUrlLang } from "@/i18n";
import { loginUrl } from "@/modules/shop/auth/auth0";
import { checkoutReadiness, getCurrentCustomer } from "@/modules/shop/auth/session";
import { storefrontPlayerContext } from "@/modules/shop/services/storefront-player";
import { CheckoutClient } from "@/modules/shop/ui/store/CheckoutClient";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const here = shopPath(urlLang, "/checkout");

  const customer = await getCurrentCustomer();
  if (!customer) redirect(loginUrl(here));
  const readiness = await checkoutReadiness(customer);
  if (!readiness.ready && readiness.reason === "ONBOARDING_REQUIRED") {
    redirect(`${shopPath(urlLang, "/account/onboarding")}?returnTo=${encodeURIComponent(here)}`);
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  // Names for the "This music license is for <player>" summary (server-validated players).
  const { players } = await storefrontPlayerContext(customer.id);

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h1 className="mb-10 font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.checkoutTitle}</h1>
        {!readiness.ready ? (
          <div className="max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-bold text-neutral-950">{t.verifyEmailTitle}</h2>
            <p className="mt-3 text-neutral-600">{t.verifyEmailBody}</p>
            <p className="mt-2 text-sm text-neutral-500">{customer.email}</p>
            <a
              href={`/auth/login?${new URLSearchParams({ returnTo: here, prompt: "login" }).toString()}`}
              className="mt-8 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800"
            >
              {t.verifiedSignInAgain}
            </a>
          </div>
        ) : (
          <CheckoutClient lang={urlLang} publishableKey={publishableKey} testMode={publishableKey.startsWith("pk_test_")} players={players} />
        )}
      </Container>
    </section>
  );
}
