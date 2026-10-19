import Link from "next/link";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { dashboardMetrics } from "@/modules/shop/services/admin-ops";
import { crmDashboard, taskBuckets } from "@/modules/shop/services/crm-admin";
import { musicReviewSummary } from "@/modules/shop/services/music-admin-ui";
import { softwareDashboard } from "@/modules/shop/services/software";
import { supportDashboard, ticketNumber } from "@/modules/shop/services/support";
import { displayCustomer } from "@/modules/shop/ui/admin/crm/labels";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, PageHeader, Panel, Stat, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatDate, formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const guard = await guardStaffPage(undefined, "/admin/shop");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const role = guard.ctx.staff.role;
  const canSupport = roleHasPermission(role, "support:read");
  const canTasks = roleHasPermission(role, "crm:write");
  const canCustomers = roleHasPermission(role, "customers:read");
  const canPlayers = roleHasPermission(role, "players:read");
  const canSoftware = roleHasPermission(role, "software:read");
  const canActivations = roleHasPermission(role, "software:activations-read");
  const canMigration = roleHasPermission(role, "music:migration");
  const [m, support, tasks, crm, software, musicReview] = await Promise.all([
    dashboardMetrics(),
    canSupport ? supportDashboard(guard.ctx.staff.id) : Promise.resolve(null),
    canTasks ? taskBuckets(guard.ctx.staff.id) : Promise.resolve(null),
    canCustomers || canPlayers ? crmDashboard() : Promise.resolve(null),
    canSoftware ? softwareDashboard() : Promise.resolve(null),
    canMigration ? musicReviewSummary() : Promise.resolve(null),
  ]);
  const capped = (n: number) => (n >= 20 ? "20+" : String(n));
  const hasOps = Boolean(support || tasks || software || (crm && (canCustomers || canPlayers)));

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

      {musicReview && musicReview.needsReview > 0 && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-neutral-950 bg-white p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-neutral-800">
            Music needing review: <span className="font-semibold tabular-nums">{musicReview.needsReview}</span> license{musicReview.needsReview === 1 ? "" : "s"} for{" "}
            <span className="tabular-nums">{musicReview.customers}</span> customer{musicReview.customers === 1 ? "" : "s"} could not be placed on a player automatically.
          </p>
          <Link href="/admin/shop/music/migration" className={btn.secondary}>Open queue</Link>
        </div>
      )}

      {hasOps && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {support && (
            <Panel title="Support" padded={false} actions={<Link className={btn.ghost} href="/admin/shop/support">Inbox</Link>}>
              <div className="grid grid-cols-2 gap-px border-b border-neutral-200 bg-neutral-200 sm:grid-cols-4">
                {[
                  { label: "Needs reply", value: support.needsReply, href: "/admin/shop/support?filter=needs_reply" },
                  { label: "Unassigned", value: support.unassigned, href: "/admin/shop/support?filter=unassigned" },
                  { label: "Mine", value: support.mine, href: "/admin/shop/support?filter=mine" },
                  { label: "Urgent", value: support.urgent, href: "/admin/shop/support?filter=urgent" },
                ].map((c) => (
                  <Link key={c.label} href={c.href} className="bg-white px-5 py-4 transition hover:bg-neutral-50">
                    <p className="text-xs text-neutral-500">{c.label}</p>
                    <p className="mt-1 font-display text-xl font-bold text-neutral-950 tabular-nums">{c.value}</p>
                  </Link>
                ))}
              </div>
              {support.oldest.length === 0 ? (
                <p className="p-5 text-sm text-neutral-500 sm:p-6">No customer is waiting for a reply.</p>
              ) : (
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-xs font-medium text-neutral-500">Waiting longest</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {support.oldest.map((t) => (
                      <li key={t.id} className="min-w-0 text-sm">
                        <Link href={`/admin/shop/support/${t.id}`} className="font-medium text-neutral-950 hover:underline">
                          {ticketNumber(t.number)} {t.subject}
                        </Link>
                        <p className="truncate text-xs text-neutral-500">
                          {t.customer.companyName ?? t.customer.email}
                          {t.priority !== "NORMAL" && `, ${t.priority.toLowerCase()} priority`}
                          {t.lastCustomerReplyAt && `, waiting since ${formatDateTime(t.lastCustomerReplyAt)}`}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Panel>
          )}

          {tasks && (
            <Panel title="Tasks" padded={false} actions={<Link className={btn.ghost} href="/admin/shop/tasks">All tasks</Link>}>
              <div className="grid grid-cols-3 gap-px border-b border-neutral-200 bg-neutral-200">
                {[
                  { label: "My open tasks", value: capped(tasks.myTasks.length) },
                  { label: "Overdue", value: capped(tasks.overdue.length) },
                  { label: "Due today", value: capped(tasks.dueToday.length) },
                ].map((c) => (
                  <Link key={c.label} href="/admin/shop/tasks" className="bg-white px-5 py-4 transition hover:bg-neutral-50">
                    <p className="text-xs text-neutral-500">{c.label}</p>
                    <p className="mt-1 font-display text-xl font-bold text-neutral-950 tabular-nums">{c.value}</p>
                  </Link>
                ))}
              </div>
              {tasks.myTasks.length === 0 ? (
                <p className="p-5 text-sm text-neutral-500 sm:p-6">Nothing assigned to you.</p>
              ) : (
                <ul className="flex flex-col gap-2 px-5 py-4 sm:px-6">
                  {tasks.myTasks.slice(0, 5).map((t) => (
                    <li key={t.id} className="min-w-0 text-sm">
                      <Link href={`/admin/shop/customers/${t.customerId}?tab=tasks`} className="font-medium text-neutral-950 hover:underline">{t.title}</Link>
                      <p className="truncate text-xs text-neutral-500">
                        {displayCustomer(t.customer)}, {t.dueAt ? `due ${formatDateTime(t.dueAt)}` : "no due date"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {software && (
            <Panel
              title="Software"
              padded={false}
              actions={canActivations ? <Link className={btn.ghost} href="/admin/shop/software/activations">Activation queue</Link> : undefined}
            >
              <div className="grid grid-cols-2 gap-px border-b border-neutral-200 bg-neutral-200 sm:grid-cols-4">
                {[
                  { label: "Pending activations", value: software.pending, href: canActivations ? "/admin/shop/software/activations" : null },
                  { label: "Waiting for customer", value: software.waitingCustomer, href: canActivations ? "/admin/shop/software/activations?filter=waiting_customer" : null },
                  { label: "Downloads, 30 days", value: software.downloads30, href: null },
                  { label: "Licenses sold, 30 days", value: software.licenses30, href: null },
                ].map((c) =>
                  c.href ? (
                    <Link key={c.label} href={c.href} className="bg-white px-5 py-4 transition hover:bg-neutral-50">
                      <p className="text-xs text-neutral-500">{c.label}</p>
                      <p className="mt-1 font-display text-xl font-bold text-neutral-950 tabular-nums">{c.value}</p>
                    </Link>
                  ) : (
                    <div key={c.label} className="bg-white px-5 py-4">
                      <p className="text-xs text-neutral-500">{c.label}</p>
                      <p className="mt-1 font-display text-xl font-bold text-neutral-950 tabular-nums">{c.value}</p>
                    </div>
                  ),
                )}
              </div>
              {software.recentDownloads.length === 0 ? (
                <p className="p-5 text-sm text-neutral-500 sm:p-6">No software downloads yet.</p>
              ) : (
                <div className="px-5 py-4 sm:px-6">
                  <p className="text-xs font-medium text-neutral-500">Recent downloads</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {software.recentDownloads.map((d) => (
                      <li key={d.id} className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">
                          {canCustomers ? (
                            <Link href={`/admin/shop/customers/${d.customer.id}?tab=software`} className="font-medium text-neutral-950 hover:underline">
                              {displayCustomer(d.customer)}
                            </Link>
                          ) : (
                            <span className="font-medium text-neutral-950">{displayCustomer(d.customer)}</span>
                          )}
                          <span className="text-neutral-500"> {d.product.name} {d.release.version}</span>
                        </span>
                        <span className="shrink-0 text-xs text-neutral-500 tabular-nums">{formatDateTime(d.downloadedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Panel>
          )}

          {crm && canCustomers && (
            <Panel
              title="Customers"
              description={`${crm.newCustomerCount} new in the last 7 days.`}
              actions={<Link className={btn.ghost} href="/admin/shop/customers?view=recent">Recent customers</Link>}
            >
              {crm.newCustomers.length === 0 ? (
                <p className="text-sm text-neutral-500">No customers yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {crm.newCustomers.map((c) => (
                    <li key={c.id} className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
                      <Link href={`/admin/shop/customers/${c.id}`} className="min-w-0 truncate font-medium text-neutral-950 hover:underline">
                        {displayCustomer(c)}
                      </Link>
                      <span className="shrink-0 text-xs text-neutral-500 tabular-nums">{formatDate(c.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {crm && canPlayers && (
            <Panel title="Player registrations" description={`${crm.pendingPlayers} waiting for activation.`}>
              {crm.recentPlayers.length === 0 ? (
                <p className="text-sm text-neutral-500">No players registered yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {crm.recentPlayers.map((p) => (
                    <li key={p.id} className="flex min-w-0 flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <Link href={`/admin/shop/customers/${p.customer.id}?tab=players`} className="font-medium text-neutral-950 hover:underline">
                          {displayCustomer(p.customer)}
                        </Link>
                        <p className="truncate text-xs text-neutral-500">
                          {p.playerType.name} <span className="font-mono">{p.registrationCode.match(/.{1,4}/g)?.join("-")}</span>, added {formatDate(p.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={p.status} className="self-start sm:self-center" />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
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
