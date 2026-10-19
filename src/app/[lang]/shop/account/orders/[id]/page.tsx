import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChatCircleText } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { shopDb } from "@/modules/shop/db";
import { licenseNumber } from "@/modules/shop/domain/software-status";
import { getOrderForCustomer } from "@/modules/shop/services/checkout";
import { formatDate, formatMoney } from "@/modules/shop/ui/format";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";
import { countryName } from "@/modules/shop/ui/store/countries";
import { accountSoftwarePath } from "@/modules/shop/ui/store/software/links";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const card = "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl";

export default async function OrderDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const a = accountCopy(urlLang);
  const customer = await requireAccountCustomer(urlLang, shopPath(urlLang, `/account/orders/${id}`));
  if (!UUID.test(id)) notFound();

  // Every query is scoped to the signed-in customer: someone else's order is a 404.
  const order = await getOrderForCustomer(id, customer.id);
  if (!order) notFound();
  const db = shopDb();
  const [snapshot, refunds] = await Promise.all([
    db.orderBillingSnapshot.findFirst({ where: { orderId: order.id, order: { customerId: customer.id } } }),
    db.refund.findMany({
      where: { orderId: order.id, order: { customerId: customer.id }, status: { in: ["PENDING", "SUCCEEDED"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true, amountCents: true, currency: true, status: true, createdAt: true, completedAt: true },
    }),
  ]);
  const money = (c: number) => formatMoney(c, order.currency, urlLang);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <Link href={shopPath(urlLang, "/account/orders")} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950">
          <ArrowLeft size={14} weight="bold" aria-hidden />
          {t.backToOrders}
        </Link>
        <FadeIn className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{order.orderNumber}</h1>
            <p className="mt-3 text-neutral-600">
              {a.purchased} {formatDate(order.createdAt, urlLang)}
              <span className="ml-3 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                {t.orderStatusLabels[order.status] ?? order.status}
              </span>
            </p>
          </div>
          <Link
            href={`${shopPath(urlLang, "/account/support/new")}?order=${order.id}`}
            className="inline-flex items-center gap-2 self-start rounded-full border-2 border-neutral-950 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white sm:self-auto"
          >
            <ChatCircleText size={16} aria-hidden />
            {t.getHelpWithOrder}
          </Link>
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className={card}>
              <h2 className="font-display text-xl font-bold text-neutral-950">{t.orderItems}</h2>
              <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                {order.items.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-950">{item.titleSnapshot}</p>
                        {item.skuSnapshot && <p className="text-xs text-neutral-500">{item.skuSnapshot}</p>}
                        {/* The player as it was named at purchase: a later rename or transfer never rewrites history. */}
                        {item.itemType !== "SOFTWARE_LICENSE" && (
                          item.targetPlayerNameSnapshot ? (
                            <p className="mt-1 text-sm text-neutral-700">
                              {a.forPlayer(item.targetPlayerNameSnapshot)}
                              {item.targetRegistrationMaskedSnapshot && (
                                <span className="ml-1 tabular-nums text-neutral-500">{a.registrationParen(item.targetRegistrationMaskedSnapshot)}</span>
                              )}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-neutral-500">{a.forLater}</p>
                          )
                        )}
                        {item.itemType === "ARRANGEMENT" && item.allocations.some((x) => x.additionalPlayer) && (
                          <p className="mt-2 text-xs text-neutral-500">
                            <span className="mr-2 inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-700">{a.additionalPrice}</span>
                            {a.additionalPriceNote}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums text-neutral-950">{money(item.chargedCents)}</p>
                    </div>
                    {item.itemType === "SOFTWARE_LICENSE" && (
                      <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                        {item.softwareLicense ? (
                          <p className="text-neutral-700">
                            {t.sw.licenseTitle(licenseNumber(item.softwareLicense.number))}
                            <span className="ml-2 inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                              {t.sw.licenseStatusLabels[item.softwareLicense.status] ?? item.softwareLicense.status}
                            </span>
                          </p>
                        ) : (
                          <p className="text-neutral-600">{t.sw.cartLine}</p>
                        )}
                        {item.softwareProduct && (
                          <Link
                            href={`${accountSoftwarePath(urlLang, item.softwareProduct.slug)}${item.softwareLicense ? `#license-${item.softwareLicense.id}` : ""}`}
                            className="inline-flex items-center gap-1.5 self-start font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950 sm:self-auto"
                          >
                            {t.sw.openInMySoftware}
                            <ArrowRight size={14} weight="bold" aria-hidden />
                          </Link>
                        )}
                      </div>
                    )}
                    {item.itemType === "BUNDLE" && item.allocations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-neutral-500">{t.collectionIncludes}</p>
                        <ul className="mt-1 flex flex-col gap-1 text-sm text-neutral-700">
                          {item.allocations.map((x) => (
                            <li key={x.arrangementId}>
                              {x.titleSnapshot}
                              {x.additionalPlayer && <span className="ml-2 text-xs text-neutral-500">{a.additionalPrice}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {refunds.length > 0 && (
              <div className={card}>
                <h2 className="font-display text-xl font-bold text-neutral-950">{t.refunds}</h2>
                <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                  {refunds.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                      <span className="text-neutral-700">
                        {formatDate(r.completedAt ?? r.createdAt, urlLang)}
                        <span className="ml-2 text-neutral-500">{r.status === "SUCCEEDED" ? t.refundSucceeded : t.refundPending}</span>
                      </span>
                      <span className="font-semibold tabular-nums text-neutral-950">{formatMoney(r.amountCents, r.currency, urlLang)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className={card}>
              <h2 className="font-display text-xl font-bold text-neutral-950">{t.orderTotals}</h2>
              <dl className="mt-6 flex flex-col gap-3 text-sm">
                {order.discountCents > 0 && (
                  <>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-600">{t.orderValue}</dt>
                      <dd className="tabular-nums text-neutral-950">{money(order.retailTotalCents)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-600">{t.orderDiscount}</dt>
                      <dd className="tabular-nums text-neutral-950">-{money(order.discountCents)}</dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3">
                  <dt className="font-semibold text-neutral-950">{t.orderPaid}</dt>
                  <dd className="font-semibold tabular-nums text-neutral-950">{money(order.totalCents)}</dd>
                </div>
                {order.refundedCents > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-600">{t.orderRefunded}</dt>
                    <dd className="tabular-nums text-neutral-950">-{money(order.refundedCents)}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 text-xs text-neutral-500">{t.vatNote}</p>
            </div>

            <div className={card}>
              <h2 className="font-display text-xl font-bold text-neutral-950">{t.billingAtPurchase}</h2>
              <p className="mt-2 text-sm text-neutral-500">{t.billingAtPurchaseNote}</p>
              {snapshot ? (
                <address className="mt-4 text-sm not-italic leading-relaxed text-neutral-700">
                  <span className="block text-neutral-950">{snapshot.customerName}</span>
                  {snapshot.companyName && <span className="block">{snapshot.companyName}</span>}
                  {snapshot.addressLine1 && <span className="block">{snapshot.addressLine1}</span>}
                  {snapshot.addressLine2 && <span className="block">{snapshot.addressLine2}</span>}
                  {(snapshot.postalCode || snapshot.city) && (
                    <span className="block">{[snapshot.postalCode, snapshot.city].filter(Boolean).join(" ")}</span>
                  )}
                  {snapshot.stateOrProvince && <span className="block">{snapshot.stateOrProvince}</span>}
                  {snapshot.countryCode && <span className="block">{countryName(snapshot.countryCode)}</span>}
                  {snapshot.vatNumber && <span className="mt-2 block">{t.vatShort} {snapshot.vatNumber}</span>}
                  <span className="mt-2 block break-all">{snapshot.email}</span>
                </address>
              ) : (
                <p className="mt-4 text-sm text-neutral-600">{t.billingNotRecorded}</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
