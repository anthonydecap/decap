import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { resolveUrlLang } from "@/i18n";
import { loginUrl } from "@/modules/shop/auth/auth0";
import { getCurrentCustomer, hasCurrentLegalAcceptance } from "@/modules/shop/auth/session";
import { listOrdersForCustomer } from "@/modules/shop/services/checkout";
import { formatDate, formatMoney } from "@/modules/shop/ui/format";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Account", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  FULFILLED: "Completed",
  PAID: "Paid",
  PARTIALLY_REFUNDED: "Partly refunded",
  REFUNDED: "Refunded",
};

export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await getCurrentCustomer();
  if (!customer) redirect(loginUrl(shopPath(urlLang, "/account")));
  if (!customer.onboardingCompletedAt || !(await hasCurrentLegalAcceptance(customer.id))) {
    redirect(`${shopPath(urlLang, "/account/onboarding")}?returnTo=${encodeURIComponent(shopPath(urlLang, "/account"))}`);
  }
  const orders = await listOrdersForCustomer(customer.id);
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.account}</h1>
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              {name && <p className="font-display text-lg font-bold text-neutral-950">{name}</p>}
              <p className="mt-1 break-all text-neutral-600">{customer.email}</p>
              <p className="mt-3 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                {customer.emailVerified ? t.emailVerified : t.emailNotVerified}
              </p>
              <div className="mt-6 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-sm">
                <Link href={shopPath(urlLang, "/account/library")} className="font-semibold text-neutral-950 hover:underline">{t.libraryTitle}</Link>
                <Link href={shopPath(urlLang, "/account/players")} className="font-semibold text-neutral-950 hover:underline">{t.playersTitle}</Link>
                <Link href={`${shopPath(urlLang, "/account/onboarding")}?returnTo=${encodeURIComponent(shopPath(urlLang, "/account"))}`} className="text-neutral-600 hover:text-neutral-950">
                  {t.onboardingTitle}
                </Link>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Auth0 route needs a full page load */}
                <a href="/auth/logout" className="text-neutral-600 hover:text-neutral-950">{t.signOut}</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <h2 className="font-display text-2xl font-bold text-neutral-950">{t.ordersTitle}</h2>
            {orders.length === 0 ? (
              <p className="mt-6 text-neutral-600">{t.noOrders}</p>
            ) : (
              <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                {orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-neutral-950">{o.orderNumber}</p>
                      <p className="text-sm text-neutral-500">
                        {formatDate(o.createdAt, urlLang)}, {t.items(o._count.allocations)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-950">{formatMoney(o.totalCents, o.currency, urlLang)}</p>
                      <p className="text-xs text-neutral-500">{STATUS_LABEL[o.status] ?? o.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
