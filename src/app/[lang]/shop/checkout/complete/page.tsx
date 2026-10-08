import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { resolveUrlLang } from "@/i18n";
import { loginUrl } from "@/modules/shop/auth/auth0";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { getOrderForCustomer } from "@/modules/shop/services/checkout";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { OrderStatus } from "@/modules/shop/ui/store/OrderStatus";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order", robots: { index: false } };

/** Return page after payment. Reads server order state only; never fulfills. */
export default async function CheckoutCompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ order?: string; redirect_status?: string }>;
}) {
  const { lang } = await params;
  const { order: orderId, redirect_status } = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await getCurrentCustomer();
  const here = `${shopPath(urlLang, "/checkout/complete")}?order=${orderId ?? ""}`;
  if (!customer) redirect(loginUrl(here));
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) notFound();
  const order = await getOrderForCustomer(orderId, customer.id);
  if (!order) notFound();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.completeTitle}</h1>
        <div className="mt-8">
          <OrderStatus
            lang={urlLang}
            orderId={order.id}
            redirectStatus={redirect_status ?? null}
            initial={{
              status: order.status,
              orderNumber: order.orderNumber,
              fulfilled: order.status === "FULFILLED" || order.status === "PARTIALLY_REFUNDED",
            }}
          />
        </div>
      </Container>
    </section>
  );
}
