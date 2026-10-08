import Link from "next/link";
import { dashboardMetrics } from "@/modules/shop/services/admin-ops";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, PageHeader, Panel, Stat, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const guard = await guardStaffPage(undefined, "/admin/shop");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const m = await dashboardMetrics();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Sales, catalog health and recent activity across the DMI Music Shop."
        actions={
          <>
            <Link className={btn.secondary} href="/admin/shop/imports/new">Bulk import</Link>
            <Link className={btn.primary} href="/admin/shop/arrangements/new">New arrangement</Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Net sales, last 30 days"
          value={formatMoney(m.grossCents30 - m.refundedCents30)}
          hint={m.refundedCents30 ? `${formatMoney(m.refundedCents30)} refunded` : `${m.orders30} paid orders`}
        />
        <Stat label="Published arrangements" value={m.published} hint={`${m.drafts} in draft`} />
        <Stat label="Live collections" value={m.bundles} />
        <Stat label="Customers" value={m.customers} />
      </div>

      {(m.pendingImports > 0 || m.invalidAssets > 0) && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-neutral-950 bg-white p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-neutral-800">
            {m.pendingImports > 0 && <span>{m.pendingImports} import batch{m.pendingImports === 1 ? "" : "es"} waiting for review. </span>}
            {m.invalidAssets > 0 && <span>{m.invalidAssets} uploaded file{m.invalidAssets === 1 ? "" : "s"} failed validation.</span>}
          </p>
          <Link href="/admin/shop/imports" className={btn.secondary}>Review</Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Panel title="Recent orders" className="lg:col-span-3" padded={false}
          actions={<Link className={btn.ghost} href="/admin/shop/orders">All orders</Link>}>
          {m.recentOrders.length === 0 ? (
            <div className="p-6"><EmptyState title="No orders yet" body="Orders appear here as soon as a customer starts checkout." /></div>
          ) : (
            <div className="px-5 pb-2 sm:px-6">
              <Table>
                <thead>
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Status</th>
                    <th className={`${th} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {m.recentOrders.map((o) => (
                    <tr key={o.id} className={tr}>
                      <td className={td}>
                        <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${o.id}`}>{o.orderNumber}</Link>
                        <p className="text-xs text-neutral-500">{formatDateTime(o.createdAt)}</p>
                      </td>
                      <td className={`${td} max-w-[14rem] truncate`}>{o.customerEmailSnapshot}</td>
                      <td className={td}><StatusBadge status={o.status} /></td>
                      <td className={`${td} text-right tabular-nums`}>{formatMoney(o.totalCents, o.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Panel>

        <Panel title="Recent activity" className="lg:col-span-2"
          actions={<Link className={btn.ghost} href="/admin/shop/audit">Audit log</Link>}>
          {m.recentAudit.length === 0 ? (
            <p className="text-sm text-neutral-500">Nothing recorded yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {m.recentAudit.map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium text-neutral-900">{a.action.replace(/[._]/g, " ")}</p>
                  <p className="text-xs text-neutral-500">
                    {a.entityType} {a.actorType.toLowerCase()} {formatDateTime(a.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </>
  );
}
