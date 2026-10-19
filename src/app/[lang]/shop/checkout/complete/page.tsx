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
  const software = order.items
    .filter((i) => i.itemType === "SOFTWARE_LICENSE" && i.softwareProduct)
    .map((i) => ({ name: i.softwareProduct!.name, slug: i.softwareProduct!.slug }))
    .filter((p, idx, list) => list.findIndex((x) => x.slug === p.slug) === idx);
  const hasMusic = order.items.some((i) => i.itemType !== "SOFTWARE_LICENSE");
  // Who each license is for, from the order's snapshots (stays right if a player is renamed).
  const music = order.items
    .filter((i) => i.itemType !== "SOFTWARE_LICENSE")
    .map((i) => ({
      id: i.id,
      title: i.titleSnapshot,
      playerId: i.targetPlayerId,
      playerName: i.targetPlayerNameSnapshot,
      maskedRegistration: i.targetRegistrationMaskedSnapshot,
    }));

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.completeTitle}</h1>
        <div className="mt-8">
          <OrderStatus
            lang={urlLang}
            orderId={order.id}
            redirectStatus={redirect_status ?? null}
            software={software}
            hasMusic={hasMusic}
            music={music}
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
