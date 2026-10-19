import type { Metadata } from "next";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { shopDb } from "@/modules/shop/db";
import { listOrdersForCustomer } from "@/modules/shop/services/checkout";
import { formatDate, formatMoney } from "@/modules/shop/ui/format";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders", robots: { index: false } };

export default async function OrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, shopPath(urlLang, "/account/orders"));
  const a = accountCopy(urlLang);
  const orders = await listOrdersForCustomer(customer.id);
  // Player names as they were at purchase time (order snapshots), never the live name.
  const targets = orders.length
    ? await shopDb().orderItem.findMany({
        where: { orderId: { in: orders.map((o) => o.id) }, order: { customerId: customer.id }, targetPlayerNameSnapshot: { not: null } },
        select: { orderId: true, targetPlayerNameSnapshot: true },
        distinct: ["orderId", "targetPlayerNameSnapshot"],
      })
    : [];
  const playersByOrder = new Map<string, string[]>();
  for (const r of targets) playersByOrder.set(r.orderId, [...(playersByOrder.get(r.orderId) ?? []), r.targetPlayerNameSnapshot!]);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.ordersTitle}</h1>
          <p className="mt-4 text-lg text-neutral-600">{t.ordersBody}</p>
        </FadeIn>

        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
            <p className="font-display text-xl font-bold text-neutral-950">{t.noOrders}</p>
            <Link href={shopPath(urlLang, "/browse")} className="mt-8 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800">
              {t.browseCatalog}
            </Link>
          </div>
        ) : (
          <ul className="mt-12 divide-y divide-neutral-200 border-y border-neutral-200">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={shopPath(urlLang, `/account/orders/${o.id}`)}
                  className="flex items-center justify-between gap-4 py-5 transition hover:bg-neutral-50"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-bold text-neutral-950">{o.orderNumber}</span>
                    <span className="block text-sm text-neutral-500">
                      {a.purchased} {formatDate(o.createdAt, urlLang)}, {t.orderContents(o.arrangementCount, o.softwareLicenseCount)}
                    </span>
                    {playersByOrder.has(o.id) && (
                      <span className="mt-0.5 block truncate text-sm text-neutral-700">{a.forPlayers(playersByOrder.get(o.id)!.join(", "))}</span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-right">
                      <span className="block font-semibold tabular-nums text-neutral-950">{formatMoney(o.totalCents, o.currency, urlLang)}</span>
                      <span className="block text-xs text-neutral-500">{t.orderStatusLabels[o.status] ?? o.status}</span>
                    </span>
                    <CaretRight size={16} className="text-neutral-400" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
