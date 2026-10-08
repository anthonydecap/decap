import Link from "next/link";
import { searchOrders } from "@/modules/shop/services/admin-ops";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { firstParam, humanize, ORDER_STATUSES, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("orders:read", "/admin/shop/orders");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/orders" />;

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? "";
  const rawStatus = firstParam(sp.status) ?? "";
  const status = (ORDER_STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : "";
  const page = pageParam(sp.page);
  const result = await searchOrders({ q: q || undefined, status: status || undefined, page });
  const filtered = Boolean(q || status);

  return (
    <>
      <PageHeader title="Orders" description="Search by order number (DMI-000123), customer email or Stripe PaymentIntent id." />

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_14rem_auto] sm:items-end">
        <Field label="Search" htmlFor="orders-q">
          <input id="orders-q" name="q" type="search" defaultValue={q} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Status" htmlFor="orders-status">
          <select id="orders-status" name="status" defaultValue={status} className={inputClass}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{humanize(s)}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Search</button>
          {filtered && <Link href="/admin/shop/orders" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel
        title={`${result.total.toLocaleString("en-GB")} order${result.total === 1 ? "" : "s"}`}
        padded={false}
      >
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={filtered ? "No orders match" : "No orders yet"}
              body={filtered ? "Try a different search or status." : "Orders appear here as soon as a customer starts checkout."}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Customer</th>
                  <th className={`${th} text-right`}>Items</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Total</th>
                  <th className={`${th} text-right`}>Refunded</th>
                  <th className={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((o) => (
                  <tr key={o.id} className={tr}>
                    <td className={td}>
                      <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${o.id}`}>
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className={`${td} max-w-[16rem] truncate`}>
                      <Link className="hover:underline" href={`/admin/shop/customers/${o.customerId}`}>{o.customerEmailSnapshot}</Link>
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{o._count.allocations}</td>
                    <td className={td}><StatusBadge status={o.status} /></td>
                    <td className={`${td} text-right tabular-nums`}>{formatMoney(o.totalCents, o.currency)}</td>
                    <td className={`${td} text-right tabular-nums`}>
                      {o.refundedCents > 0 ? formatMoney(o.refundedCents, o.currency) : <span className="text-neutral-400">0</span>}
                    </td>
                    <td className={`${td} tabular-nums`}>{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(p) => `/admin/shop/orders${qs({ q, status, page: p })}`}
      />
    </>
  );
}
