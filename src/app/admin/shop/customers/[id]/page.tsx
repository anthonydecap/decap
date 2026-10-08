import Link from "next/link";
import { notFound } from "next/navigation";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { shopDb } from "@/modules/shop/db";
import { getCustomerAdmin } from "@/modules/shop/services/admin-ops";
import { listCustomerPlayers, listPlayerTypes } from "@/modules/shop/services/players";
import { formatOrderNumber } from "@/modules/shop/services/checkout";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { EmptyState, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { CustomerPlayers } from "@/modules/shop/ui/admin/players/CustomerPlayers";
import { GrantForm } from "@/modules/shop/ui/admin/sales/GrantForm";
import { customerName, humanize, sourceTypeLabel } from "@/modules/shop/ui/admin/sales/labels";
import { RevokeSourceButton } from "@/modules/shop/ui/admin/sales/RevokeSourceButton";
import { formatDate, formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ProfileRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="mt-0.5 break-words text-neutral-900">{children}</dd>
    </div>
  );
}

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/admin/shop/customers/${id}`;
  const guard = await guardStaffPage("customers:read", path);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={path} />;
  if (!UUID.test(id)) notFound();

  const customer = await getCustomerAdmin(id);
  if (!customer) notFound();

  const role = guard.ctx.staff.role;
  const canManage = roleHasPermission(role, "entitlements:grant");
  const canSeeOrders = roleHasPermission(role, "orders:read");
  const canReadPlayers = roleHasPermission(role, "players:read");
  const canWritePlayers = roleHasPermission(role, "players:write");
  const canSeeActivationKey = roleHasPermission(role, "players:activation-key");
  const db = shopDb();

  const sources = customer.entitlements.flatMap((e) => e.sources);
  const allocationIds = sources.map((s) => s.orderAllocationId).filter((v): v is string => Boolean(v));
  const staffIds = [
    ...new Set(sources.flatMap((s) => [s.grantedByStaffId, s.revokedByStaffId]).filter((v): v is string => Boolean(v))),
  ];

  const [allocations, staff, arrangements, players, playerTypes] = await Promise.all([
    allocationIds.length
      ? db.orderItemAllocation.findMany({
          where: { id: { in: allocationIds } },
          select: { id: true, orderId: true, order: { select: { number: true } } },
        })
      : Promise.resolve([]),
    staffIds.length
      ? db.staffAccount.findMany({ where: { id: { in: staffIds } }, select: { id: true, displayName: true, email: true } })
      : Promise.resolve([]),
    canManage
      ? db.arrangement.findMany({
          where: { status: { not: "ARCHIVED" } },
          select: { id: true, sku: true, displayTitle: true },
          orderBy: { sku: "asc" },
        })
      : Promise.resolve([]),
    canReadPlayers ? listCustomerPlayers(id) : Promise.resolve([]),
    canWritePlayers ? listPlayerTypes({ activeOnly: true }) : Promise.resolve([]),
  ]);
  const allocationOrder = new Map(allocations.map((a) => [a.id, { orderId: a.orderId, orderNumber: formatOrderNumber(a.order.number) }]));
  const staffName = new Map(staff.map((s) => [s.id, s.displayName ?? s.email ?? s.id]));
  const ownedArrangementIds = customer.entitlements.filter((e) => e.status === "ACTIVE").map((e) => e.arrangementId);

  const active = customer.entitlements.filter((e) => e.status === "ACTIVE");
  const revoked = customer.entitlements.filter((e) => e.status !== "ACTIVE");
  const name = customerName(customer);

  const renderEntitlements = (list: typeof customer.entitlements) => (
    <ul className="divide-y divide-neutral-100">
      {list.map((e) => {
        const unrevoked = e.sources.filter((s) => !s.revokedAt);
        return (
          <li key={e.id} className="px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="font-medium text-neutral-950">{e.arrangement.displayTitle}</p>
                <p className="text-xs text-neutral-500">
                  {e.arrangement.sku}, first granted {formatDate(e.firstGrantedAt)}
                  {e.revokedAt && `, revoked ${formatDate(e.revokedAt)}`}
                </p>
              </div>
              <StatusBadge status={e.status} className="self-start" />
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {e.sources.map((s) => {
                const ref = s.orderAllocationId ? allocationOrder.get(s.orderAllocationId) : undefined;
                return (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-neutral-900">{sourceTypeLabel(s.sourceType)}</span>
                        {s.revokedAt && <StatusBadge status="REVOKED" />}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-600">
                        Granted {formatDateTime(s.grantedAt)}
                        {s.grantedByStaffId && ` by ${staffName.get(s.grantedByStaffId) ?? s.grantedByStaffId}`}
                      </p>
                      {ref &&
                        (canSeeOrders ? (
                          <p className="text-xs text-neutral-600">
                            Order{" "}
                            <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${ref.orderId}`}>
                              {ref.orderNumber}
                            </Link>
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-600">Order {ref.orderNumber}</p>
                        ))}
                      {s.grantReason && <p className="text-xs text-neutral-600">Reason: {s.grantReason}</p>}
                      {s.sourceReference && <p className="break-all text-xs text-neutral-600">Reference: {s.sourceReference}</p>}
                      {s.revokedAt && (
                        <p className="text-xs text-neutral-600">
                          Revoked {formatDateTime(s.revokedAt)}
                          {s.revokedByStaffId && ` by ${staffName.get(s.revokedByStaffId) ?? s.revokedByStaffId}`}
                          {s.revokeReason && `: ${s.revokeReason}`}
                        </p>
                      )}
                    </div>
                    {canManage && !s.revokedAt && (
                      <RevokeSourceButton
                        customerId={customer.id}
                        sourceId={s.id}
                        sourceLabel={sourceTypeLabel(s.sourceType)}
                        arrangementTitle={e.arrangement.displayTitle}
                        otherActiveSources={unrevoked.length - 1}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/customers", label: "Customers" }}
        title={name ?? customer.email}
        description={name ? customer.email : undefined}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Profile" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <ProfileRow label="Email">{customer.email}</ProfileRow>
            <ProfileRow label="Email verified">{customer.emailVerified ? "Yes" : "No"}</ProfileRow>
            <ProfileRow label="Name">{name ?? <span className="text-neutral-400">Not set</span>}</ProfileRow>
            <ProfileRow label="Country">{customer.countryCode ?? <span className="text-neutral-400">Not set</span>}</ProfileRow>
            <ProfileRow label="Preferred currency">{customer.preferredCurrency}</ProfileRow>
            <ProfileRow label="Stripe customer">
              <span className="break-all font-mono text-xs">{customer.stripeCustomerId ?? "None"}</span>
            </ProfileRow>
            <ProfileRow label="Joined">
              <span className="tabular-nums">{formatDateTime(customer.createdAt)}</span>
            </ProfileRow>
            <ProfileRow label="Onboarding completed">
              {customer.onboardingCompletedAt ? (
                <span className="tabular-nums">{formatDateTime(customer.onboardingCompletedAt)}</span>
              ) : (
                <span className="text-neutral-400">Not completed</span>
              )}
            </ProfileRow>
          </dl>
        </Panel>

        <Panel title="Legal acceptances">
          {customer.legalAcceptances.length === 0 ? (
            <p className="text-sm text-neutral-500">No terms or privacy policy accepted yet.</p>
          ) : (
            <ul className="flex flex-col gap-3 text-sm">
              {customer.legalAcceptances.map((l) => (
                <li key={l.id}>
                  <p className="font-medium text-neutral-900">
                    {humanize(l.documentType)} version {l.documentVersion}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDateTime(l.acceptedAt)}, via {l.source.replace(/_/g, " ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {canReadPlayers && (
        <div className="mt-6">
          <CustomerPlayers
            customerId={id}
            canWrite={canWritePlayers}
            canSeeActivationKey={canSeeActivationKey}
            types={playerTypes.map((t) => ({ id: t.id, name: t.name }))}
            players={players.map((p) => ({
              id: p.id,
              typeName: p.playerType.name,
              registrationCode: p.registrationCode,
              registrationIdentifier: p.registrationIdentifier,
              serialNumber: p.serialNumber,
              adminLabel: p.adminLabel,
              dealerName: p.dealerName,
              status: p.status,
              purchaseDate: p.purchaseDate?.toISOString() ?? null,
              warrantyUntil: p.warrantyUntil?.toISOString() ?? null,
              registeredAt: p.registeredAt?.toISOString() ?? null,
              activatedAt: p.activatedAt?.toISOString() ?? null,
              hasActivationKey: p.hasActivationKey,
            }))}
          />
        </div>
      )}

      <Panel
        title="Library access"
        description={`${active.length} active, ${revoked.length} revoked. Each arrangement can have several sources; it stays active while any source is unrevoked.`}
        className="mt-6"
        padded={false}
      >
        {customer.entitlements.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No library items" body="Purchases and manual grants appear here." />
          </div>
        ) : (
          <>
            {active.length > 0 && renderEntitlements(active)}
            {revoked.length > 0 && (
              <>
                <h3 className="border-t border-neutral-200 px-5 pb-1 pt-5 font-display text-sm font-bold text-neutral-950 sm:px-6">
                  Revoked
                </h3>
                {renderEntitlements(revoked)}
              </>
            )}
          </>
        )}
      </Panel>

      {canManage && (
        <Panel title="Grant access" className="mt-6">
          <GrantForm customerId={customer.id} arrangements={arrangements} ownedArrangementIds={ownedArrangementIds} />
        </Panel>
      )}

      <Panel title="Orders" className="mt-6" padded={false}>
        {customer.orders.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500 sm:p-6">This customer has not placed an order.</p>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Total</th>
                  <th className={`${th} text-right`}>Refunded</th>
                  <th className={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((o) => (
                  <tr key={o.id} className={tr}>
                    <td className={td}>
                      {canSeeOrders ? (
                        <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${o.id}`}>
                          {o.orderNumber}
                        </Link>
                      ) : (
                        o.orderNumber
                      )}
                    </td>
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
    </>
  );
}
