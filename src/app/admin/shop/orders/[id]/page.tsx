import Link from "next/link";
import { notFound } from "next/navigation";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { shopDb } from "@/modules/shop/db";
import { getOrderAdmin } from "@/modules/shop/services/admin-ops";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { EmptyState, Notice, PageHeader, Panel, Stat, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { customerName, humanize, royaltyTermsLabel, sourceTypeLabel } from "@/modules/shop/ui/admin/sales/labels";
import { RefundPanel, type RefundableAllocation } from "@/modules/shop/ui/admin/sales/RefundPanel";
import { formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function TimeRow({ label, value }: { label: string; value: Date | null }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="tabular-nums text-neutral-900">{value ? formatDateTime(value) : <span className="text-neutral-400">Not yet</span>}</dd>
    </div>
  );
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/admin/shop/orders/${id}`;
  const guard = await guardStaffPage("orders:read", path);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={path} />;
  if (!UUID.test(id)) notFound();

  const order = await getOrderAdmin(id);
  if (!order) notFound();

  const canRefund = roleHasPermission(guard.ctx.staff.role, "orders:refund");
  const canSeeCustomer = roleHasPermission(guard.ctx.staff.role, "customers:read");
  const cur = order.currency;

  const allAllocations = order.items.flatMap((i) => i.allocations);
  const allocationLabel = new Map(allAllocations.map((a) => [a.id, `${a.skuSnapshot} ${a.titleSnapshot}`]));

  const staffIds = [...new Set(order.refunds.map((r) => r.requestedByStaffId).filter((s): s is string => Boolean(s)))];
  const staff = staffIds.length
    ? await shopDb().staffAccount.findMany({ where: { id: { in: staffIds } }, select: { id: true, displayName: true, email: true } })
    : [];
  const staffName = new Map(staff.map((s) => [s.id, s.displayName ?? s.email ?? s.id]));

  const pendingRefund = order.refunds.some((r) => r.status === "PENDING");
  const refundableStatus = order.status === "FULFILLED" || order.status === "PARTIALLY_REFUNDED";
  const refundable: RefundableAllocation[] = allAllocations
    .filter((a) => a.allocatedCents - a.refundedCents > 0)
    .map((a) => ({
      id: a.id,
      sku: a.skuSnapshot,
      title: a.titleSnapshot,
      refundableCents: a.allocatedCents - a.refundedCents,
      sourceActive: Boolean(a.entitlementSource && !a.entitlementSource.revokedAt),
    }));

  const name = customerName(order.customer);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/orders", label: "Orders" }}
        title={order.orderNumber}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <span>
              {canSeeCustomer ? (
                <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/customers/${order.customer.id}`}>
                  {order.customerEmailSnapshot}
                </Link>
              ) : (
                order.customerEmailSnapshot
              )}
              {name && <span className="text-neutral-500"> ({name})</span>}
            </span>
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Retail value" value={formatMoney(order.retailTotalCents, cur)} />
        <Stat label="Discount" value={formatMoney(order.discountCents, cur)} hint="Complete-the-collection savings" />
        <Stat label="Total charged" value={formatMoney(order.totalCents, cur)} />
        <Stat
          label="Refunded"
          value={formatMoney(order.refundedCents, cur)}
          hint={order.refundedCents > 0 ? `${formatMoney(order.totalCents - order.refundedCents, cur)} net` : undefined}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Timeline" className="lg:col-span-1">
          <dl className="flex flex-col gap-3 text-sm">
            <TimeRow label="Created" value={order.createdAt} />
            <TimeRow label="Paid" value={order.paidAt} />
            <TimeRow label="Fulfilled" value={order.fulfilledAt} />
            {order.canceledAt && <TimeRow label="Canceled" value={order.canceledAt} />}
            <TimeRow label="Receipt sent" value={order.receiptSentAt} />
          </dl>
        </Panel>
        <Panel title="Payment" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-neutral-500">Stripe PaymentIntent</dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-neutral-900">{order.stripePaymentIntentId ?? "None"}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-neutral-500">Stripe charge</dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-neutral-900">{order.stripeChargeId ?? "None"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Currency</dt>
              <dd className="mt-0.5 text-neutral-900">{cur}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Arrangements</dt>
              <dd className="mt-0.5 tabular-nums text-neutral-900">{allAllocations.length}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl font-bold text-neutral-950">Line items</h2>
      <div className="flex flex-col gap-6">
        {order.items.map((item) => (
          <Panel
            key={item.id}
            padded={false}
            title={item.titleSnapshot}
            description={
              <span>
                {item.itemType === "BUNDLE" ? "Collection" : "Arrangement"} {item.skuSnapshot}, charged{" "}
                <span className="tabular-nums">{formatMoney(item.chargedCents, cur)}</span> for{" "}
                <span className="tabular-nums">{formatMoney(item.retailValueCents, cur)}</span> retail value
              </span>
            }
          >
            {item.itemType === "BUNDLE" && (
              <div className="grid grid-cols-1 gap-3 border-b border-neutral-200 px-5 py-4 text-sm sm:grid-cols-4 sm:px-6">
                <div>
                  <p className="text-neutral-500">Collection price</p>
                  <p className="tabular-nums text-neutral-950">{item.bundlePriceCents != null ? formatMoney(item.bundlePriceCents, cur) : "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Normal total</p>
                  <p className="tabular-nums text-neutral-950">{item.bundleRetailTotalCents != null ? formatMoney(item.bundleRetailTotalCents, cur) : "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Items in collection</p>
                  <p className="tabular-nums text-neutral-950">{item.bundleItemCount ?? "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Already owned, excluded</p>
                  <p className="tabular-nums text-neutral-950">{item.excludedArrangementIds.length}</p>
                </div>
              </div>
            )}
            <div className="px-5 pb-2 sm:px-6">
              {item.allocations.length === 0 ? (
                <p className="py-4 text-sm text-neutral-500">No arrangements were allocated to this line.</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th className={th}>Arrangement</th>
                      <th className={`${th} text-right`}>Retail</th>
                      <th className={`${th} text-right`}>Allocated</th>
                      <th className={th}>Royalty terms</th>
                      <th className={`${th} text-right`}>Royalty</th>
                      <th className={`${th} text-right`}>Refunded</th>
                      <th className={th}>Library access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.allocations.map((a) => {
                      const src = a.entitlementSource;
                      return (
                        <tr key={a.id} className={tr}>
                          <td className={`${td} max-w-[18rem]`}>
                            <p className="truncate font-medium text-neutral-950">{a.titleSnapshot}</p>
                            <p className="text-xs text-neutral-500">{a.skuSnapshot}</p>
                          </td>
                          <td className={`${td} text-right tabular-nums`}>{formatMoney(a.retailValueCents, cur)}</td>
                          <td className={`${td} text-right tabular-nums`}>{formatMoney(a.allocatedCents, cur)}</td>
                          <td className={td}>{royaltyTermsLabel(a.royaltyBasis, a.royaltyRateBps, a.royaltyFixedCents, cur)}</td>
                          <td className={`${td} text-right tabular-nums`}>{formatMoney(a.royaltyCents, cur)}</td>
                          <td className={`${td} text-right tabular-nums`}>
                            {a.refundedCents > 0 ? formatMoney(a.refundedCents, cur) : <span className="text-neutral-400">0</span>}
                          </td>
                          <td className={td}>
                            {!src ? (
                              <span className="text-neutral-400">Not granted</span>
                            ) : src.revokedAt ? (
                              <span className="flex flex-col gap-0.5">
                                <StatusBadge status="REVOKED" className="self-start" />
                                <span className="text-xs text-neutral-500">{formatDateTime(src.revokedAt)}</span>
                              </span>
                            ) : (
                              <span className="flex flex-col gap-0.5">
                                <StatusBadge status="ACTIVE" className="self-start" />
                                <span className="text-xs text-neutral-500">{sourceTypeLabel(src.sourceType)}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {canRefund && (
        <Panel title="Refund" className="mt-10">
          {!refundableStatus ? (
            <p className="text-sm text-neutral-500">
              Refunds are available once an order is fulfilled. This order is {humanize(order.status).toLowerCase()}.
            </p>
          ) : pendingRefund ? (
            <Notice>A refund on this order is still pending at Stripe. Wait for it to finish before starting another.</Notice>
          ) : (
            <RefundPanel orderId={order.id} orderNumber={order.orderNumber} currency={cur} allocations={refundable} />
          )}
        </Panel>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Refund history" padded={false}>
          {order.refunds.length === 0 ? (
            <p className="p-5 text-sm text-neutral-500 sm:p-6">No refunds on this order.</p>
          ) : (
            <ol className="divide-y divide-neutral-100">
              {order.refunds.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 px-5 py-4 text-sm sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold tabular-nums text-neutral-950">{formatMoney(r.amountCents, r.currency)}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-neutral-700">{r.reason ?? "No reason recorded"}</p>
                  <p className="text-xs text-neutral-500">
                    Requested {formatDateTime(r.createdAt)}
                    {r.requestedByStaffId && ` by ${staffName.get(r.requestedByStaffId) ?? r.requestedByStaffId}`}
                    {r.completedAt && `, completed ${formatDateTime(r.completedAt)}`}
                  </p>
                  {r.stripeRefundId && <p className="break-all font-mono text-xs text-neutral-500">{r.stripeRefundId}</p>}
                  {r.allocations.length > 0 && (
                    <ul className="flex flex-col gap-1 text-xs text-neutral-600">
                      {r.allocations.map((ra) => (
                        <li key={ra.id} className="flex justify-between gap-3">
                          <span className="truncate">{allocationLabel.get(ra.allocationId) ?? ra.allocationId}</span>
                          <span className="tabular-nums">{formatMoney(ra.amountCents, r.currency)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Royalty ledger" padded={false}>
          {order.royaltyEntries.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState title="No ledger entries" body="Sale entries are booked when the order is fulfilled." />
            </div>
          ) : (
            <div className="px-5 pb-2 sm:px-6">
              <Table>
                <thead>
                  <tr>
                    <th className={th}>Date</th>
                    <th className={th}>Type</th>
                    <th className={th}>Arrangement</th>
                    <th className={`${th} text-right`}>Net revenue</th>
                    <th className={`${th} text-right`}>Royalty</th>
                  </tr>
                </thead>
                <tbody>
                  {order.royaltyEntries.map((e) => (
                    <tr key={e.id} className={tr}>
                      <td className={`${td} tabular-nums`}>{formatDateTime(e.occurredAt)}</td>
                      <td className={td}>{humanize(e.entryType)}</td>
                      <td className={`${td} max-w-[12rem] truncate`}>
                        {(e.allocationId && allocationLabel.get(e.allocationId)) ?? e.arrangementId}
                      </td>
                      <td className={`${td} text-right tabular-nums`}>{formatMoney(e.netRevenueCents, e.currency)}</td>
                      <td className={`${td} text-right tabular-nums`}>{formatMoney(e.amountCents, e.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
