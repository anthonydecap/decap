import Link from "next/link";
import { DownloadSimple } from "@phosphor-icons/react/ssr";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { shopDb } from "@/modules/shop/db";
import { royaltyReport } from "@/modules/shop/services/admin-ops";
import { formatOrderNumber } from "@/modules/shop/services/checkout";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, Notice, PageHeader, Panel, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { firstParam, humanize, qs } from "@/modules/shop/ui/admin/sales/labels";
import { formatDate, formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const DAY = 86_400_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parses YYYY-MM-DD as a UTC day start; null when invalid. */
function parseDay(v: string | undefined): Date | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || isoDay(d) !== v ? null : d;
}

export default async function AdminRoyaltiesPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("royalties:read", "/admin/shop/royalties");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/royalties" />;
  const canSeeOrders = roleHasPermission(guard.ctx.staff.role, "orders:read");

  const sp = await searchParams;
  const today = parseDay(isoDay(new Date()))!;
  const rawFrom = firstParam(sp.from);
  const rawTo = firstParam(sp.to);
  let from = parseDay(rawFrom) ?? new Date(today.getTime() - 30 * DAY);
  let to = parseDay(rawTo) ?? today;
  const invalidInput = Boolean((rawFrom && !parseDay(rawFrom)) || (rawTo && !parseDay(rawTo)));
  const swapped = from.getTime() > to.getTime();
  if (swapped) [from, to] = [to, from];
  const rawArranger = firstParam(sp.arranger) ?? "";
  const arrangerId = UUID.test(rawArranger) ? rawArranger : "";

  const fromStr = isoDay(from);
  const toStr = isoDay(to);
  // "To" is inclusive in the UI; the service and export route treat it as exclusive.
  const toExclusive = new Date(to.getTime() + DAY);

  const db = shopDb();
  const [report, arrangers] = await Promise.all([
    royaltyReport({ from, to: toExclusive, arrangerId: arrangerId || undefined }),
    db.arranger.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const arrangerName = new Map(arrangers.map((a) => [a.id, a.name]));

  const arrangementIds = [...new Set(report.entries.map((e) => e.arrangementId))];
  const orderIds = [...new Set(report.entries.map((e) => e.orderId).filter((v): v is string => Boolean(v)))];
  const [arrangementRows, orderRows] = await Promise.all([
    arrangementIds.length
      ? db.arrangement.findMany({ where: { id: { in: arrangementIds } }, select: { id: true, sku: true, displayTitle: true } })
      : Promise.resolve([]),
    orderIds.length ? db.order.findMany({ where: { id: { in: orderIds } }, select: { id: true, number: true } }) : Promise.resolve([]),
  ]);
  const arrangementLabel = new Map(arrangementRows.map((a) => [a.id, a]));
  const orderNumber = new Map(orderRows.map((o) => [o.id, formatOrderNumber(o.number)]));

  const totals = new Map<string, { salesCount: number; refundCount: number; netRevenueCents: number; royaltyCents: number }>();
  for (const r of report.rows) {
    const t = totals.get(r.currency) ?? { salesCount: 0, refundCount: 0, netRevenueCents: 0, royaltyCents: 0 };
    t.salesCount += r.salesCount;
    t.refundCount += r.refundCount;
    t.netRevenueCents += r.netRevenueCents;
    t.royaltyCents += r.royaltyCents;
    totals.set(r.currency, t);
  }

  const exportHref = `/api/admin/shop/royalties/export${qs({ from: fromStr, to: isoDay(toExclusive), arrangerId })}`;
  const filterQs = (extra: Record<string, string>) => `/admin/shop/royalties${qs({ from: fromStr, to: toStr, ...extra })}`;
  const selectedName = arrangerId ? arrangerName.get(arrangerId) ?? "Unknown arranger" : null;

  return (
    <>
      <PageHeader
        title="Royalties"
        description="Royalty owed per arranger from the ledger. Sales add, refunds subtract. Dates are in UTC, both ends included."
        actions={
          <a className={btn.secondary} href={exportHref}>
            <DownloadSimple size={16} weight="bold" aria-hidden />
            Export CSV
          </a>
        }
      />

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[10rem_10rem_1fr_auto] lg:items-end">
        <Field label="From" htmlFor="roy-from">
          <input id="roy-from" name="from" type="date" defaultValue={fromStr} className={inputClass} />
        </Field>
        <Field label="To" htmlFor="roy-to">
          <input id="roy-to" name="to" type="date" defaultValue={toStr} className={inputClass} />
        </Field>
        <Field label="Arranger" htmlFor="roy-arranger">
          <select id="roy-arranger" name="arranger" defaultValue={arrangerId} className={inputClass}>
            <option value="">All arrangers</option>
            {arrangers.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Apply</button>
          {(rawFrom || rawTo || arrangerId) && <Link href="/admin/shop/royalties" className={btn.ghost}>Reset</Link>}
        </div>
      </form>

      {(invalidInput || swapped) && (
        <div className="mb-6">
          <Notice>
            {invalidInput ? "An invalid date was replaced with the default. " : ""}
            {swapped ? "From was after To, so the dates were swapped." : ""}
          </Notice>
        </div>
      )}

      <Panel
        title={`${formatDate(from)} to ${formatDate(to)}`}
        description={selectedName ? `Filtered to ${selectedName}.` : undefined}
        padded={false}
      >
        {report.rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No royalty activity" body="No sales or refunds were booked in this period." />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Arranger</th>
                  <th className={`${th} text-right`}>Sales</th>
                  <th className={`${th} text-right`}>Refunds</th>
                  <th className={`${th} text-right`}>Net revenue</th>
                  <th className={`${th} text-right`}>Royalty owed</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r) => (
                  <tr key={`${r.arrangerId}:${r.currency}`} className={tr}>
                    <td className={td}>
                      <Link className="font-medium text-neutral-950 hover:underline" href={filterQs({ arranger: r.arrangerId })}>
                        {arrangerName.get(r.arrangerId) ?? "Unknown arranger"}
                      </Link>
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{r.salesCount}</td>
                    <td className={`${td} text-right tabular-nums`}>{r.refundCount}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatMoney(r.netRevenueCents, r.currency)}</td>
                    <td className={`${td} text-right font-medium tabular-nums text-neutral-950`}>{formatMoney(r.royaltyCents, r.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {[...totals.entries()].map(([currency, t]) => (
                  <tr key={currency} className="border-t border-neutral-300">
                    <td className={`${td} font-semibold text-neutral-950`}>Total{totals.size > 1 ? ` ${currency}` : ""}</td>
                    <td className={`${td} text-right font-semibold tabular-nums text-neutral-950`}>{t.salesCount}</td>
                    <td className={`${td} text-right font-semibold tabular-nums text-neutral-950`}>{t.refundCount}</td>
                    <td className={`${td} text-right font-semibold tabular-nums text-neutral-950`}>{formatMoney(t.netRevenueCents, currency)}</td>
                    <td className={`${td} text-right font-semibold tabular-nums text-neutral-950`}>{formatMoney(t.royaltyCents, currency)}</td>
                  </tr>
                ))}
              </tfoot>
            </Table>
          </div>
        )}
      </Panel>

      {arrangerId && (
        <Panel
          title={`Ledger entries for ${selectedName}`}
          description={report.entries.length >= 500 ? "Showing the 500 most recent entries. Narrow the date range to see more." : undefined}
          className="mt-6"
          padded={false}
          actions={<Link className={btn.ghost} href={filterQs({})}>All arrangers</Link>}
        >
          {report.entries.length === 0 ? (
            <p className="p-5 text-sm text-neutral-500 sm:p-6">No entries for this arranger in this period.</p>
          ) : (
            <div className="px-5 pb-2 sm:px-6">
              <Table>
                <thead>
                  <tr>
                    <th className={th}>Date</th>
                    <th className={th}>Type</th>
                    <th className={th}>Arrangement</th>
                    <th className={th}>Order</th>
                    <th className={`${th} text-right`}>Net revenue</th>
                    <th className={`${th} text-right`}>Royalty</th>
                  </tr>
                </thead>
                <tbody>
                  {report.entries.map((e) => {
                    const arr = arrangementLabel.get(e.arrangementId);
                    const num = e.orderId ? orderNumber.get(e.orderId) : undefined;
                    return (
                      <tr key={e.id} className={tr}>
                        <td className={`${td} tabular-nums`}>{formatDateTime(e.occurredAt)}</td>
                        <td className={td}>{humanize(e.entryType)}</td>
                        <td className={`${td} max-w-[16rem]`}>
                          <p className="truncate text-neutral-950">{arr?.displayTitle ?? "Unknown arrangement"}</p>
                          {arr && <p className="text-xs text-neutral-500">{arr.sku}</p>}
                        </td>
                        <td className={td}>
                          {e.orderId && num ? (
                            canSeeOrders ? (
                              <Link className="hover:underline" href={`/admin/shop/orders/${e.orderId}`}>{num}</Link>
                            ) : (
                              num
                            )
                          ) : (
                            <span className="text-neutral-400">None</span>
                          )}
                        </td>
                        <td className={`${td} text-right tabular-nums`}>{formatMoney(e.netRevenueCents, e.currency)}</td>
                        <td className={`${td} text-right tabular-nums`}>
                          {e.amountCents > 0 ? "+" : ""}
                          {formatMoney(e.amountCents, e.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
