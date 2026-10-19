import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { ShopError } from "@/modules/shop/errors";
import { adminPlayerDetail } from "@/modules/shop/services/music-admin";
import { grantPickerOptions } from "@/modules/shop/services/music-admin-ui";
import { getMusicPolicy } from "@/modules/shop/services/music-policy";
import { licenseNumber } from "@/modules/shop/services/software-licensing";
import { OPEN_STATUSES, ticketNumber } from "@/modules/shop/services/support";
import { displayCustomer } from "@/modules/shop/ui/admin/crm/labels";
import { Metric, Timeline } from "@/modules/shop/ui/admin/crm/parts";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { GrantMusic } from "@/modules/shop/ui/admin/music/GrantMusic";
import { groupCode, label, LICENSE_SOURCE_LABEL } from "@/modules/shop/ui/admin/music/labels";
import { RenamePlayer, ReplacePlayer, RetirePlayer, TransferLibrary, TransferPlayerOwnership } from "@/modules/shop/ui/admin/music/PlayerActions";
import { PlayerLibrary } from "@/modules/shop/ui/admin/music/PlayerLibrary";
import { TransfersTable } from "@/modules/shop/ui/admin/music/TransfersTable";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { ActivationKey } from "@/modules/shop/ui/admin/players/CustomerPlayers";
import { PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { SoftwareBadge } from "@/modules/shop/ui/admin/software-activations/labels";
import { formatBytes, formatDate, formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Row({ label: l, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-neutral-500">{l}</dt>
      <dd className="mt-0.5 break-words text-neutral-900">{children}</dd>
    </div>
  );
}

const none = <span className="text-neutral-400">Not set</span>;

async function loadDetail(id: string) {
  try {
    return await adminPlayerDetail(id);
  } catch (e) {
    if (e instanceof ShopError && e.code === "NOT_FOUND") return null;
    throw e;
  }
}

export default async function AdminPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/admin/shop/players/${id}`;
  const guard = await guardStaffPage("players:read", path);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={path} />;
  if (!UUID.test(id)) notFound();

  const role = guard.ctx.staff.role;
  const can = {
    customers: roleHasPermission(role, "customers:read"),
    write: roleHasPermission(role, "players:write"),
    activationKey: roleHasPermission(role, "players:activation-key"),
    music: roleHasPermission(role, "music:read"),
    grant: roleHasPermission(role, "music:grant"),
    revoke: roleHasPermission(role, "music:revoke"),
    replace: roleHasPermission(role, "players:replace"),
    libraryTransfer: roleHasPermission(role, "players:library-transfer"),
    transfer: roleHasPermission(role, "players:transfer"),
    deliveries: roleHasPermission(role, "deliveries:read"),
    orders: roleHasPermission(role, "orders:read"),
    support: roleHasPermission(role, "support:read"),
    software: roleHasPermission(role, "software:read"),
    crm: roleHasPermission(role, "crm:write"),
  };

  const detail = await loadDetail(id);
  if (!detail) notFound();
  const { player, licenses, sources, transfers, deliveries, orders, tickets, activity, otherPlayers } = detail;
  const live = licenses.active + licenses.transferPending;
  const retired = player.status === "RETIRED";
  const supportsMusic = player.playerType.supportsMusicLibrary;

  const [policy, picker] = await Promise.all([
    getMusicPolicy(),
    can.grant && supportsMusic && !retired ? grantPickerOptions() : Promise.resolve(null),
  ]);

  const actionPlayer = { id: player.id, name: player.name, maskedRegistration: player.maskedRegistration, status: player.status, supportsMusicLibrary: supportsMusic, licenseCount: live };
  const candidates = otherPlayers.map((p) => ({ id: p.id, name: p.name, maskedRegistration: p.maskedRegistration, status: p.status, supportsMusicLibrary: p.supportsMusicLibrary }));

  const playerNames: Record<string, string> = { [player.id]: player.name };
  for (const p of otherPlayers) playerNames[p.id] = p.name;
  for (const t of transfers) {
    for (const p of [t.fromPlayer, t.toPlayer]) if (p) playerNames[p.id] ??= p.friendlyName?.trim() || `${p.playerType.name} ••••${p.registrationCode.slice(-4)}`;
  }

  const showActions = !retired && (can.replace || can.libraryTransfer || can.transfer || can.write);
  const customerName = displayCustomer(player.customer);

  return (
    <>
      <PageHeader
        back={can.customers ? { href: `/admin/shop/customers/${player.customer.id}?tab=players`, label: customerName } : { href: "/admin/shop/players", label: "Players" }}
        title={player.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={player.status} />
            <span>{player.playerType.name}</span>
            <span className="font-mono">{player.maskedRegistration}</span>
            {!supportsMusic && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">Cannot receive music</span>}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Music licenses" hint={licenses.transferPending ? `${licenses.transferPending} transfer pending` : "Live on this player"}>{live}</Metric>
        <Metric label="Retired licenses">{licenses.retired}</Metric>
        <Metric label="Revoked licenses">{licenses.revoked}</Metric>
        <Metric label="Open support">{tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length}</Metric>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Identity" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Row label="Customer">
              {can.customers ? (
                <Link href={`/admin/shop/customers/${player.customer.id}`} className="font-medium text-neutral-950 hover:underline">{customerName}</Link>
              ) : (
                customerName
              )}
              <span className="block text-xs text-neutral-500">{player.customer.email}</span>
            </Row>
            <Row label="Player type">{player.playerType.name}</Row>
            <Row label="Friendly name">
              <span className="flex flex-col items-start gap-1">
                {player.friendlyName ?? <span className="text-neutral-400">None, shown as type and registration</span>}
                {can.write && !retired && <RenamePlayer playerId={player.id} friendlyName={player.friendlyName} />}
              </span>
            </Row>
            <Row label="Staff label">{player.adminLabel ?? none}</Row>
            <Row label="Registration code">
              <span className="font-mono">{groupCode(player.registrationCode)}</span>
              <span className="block text-xs text-neutral-500">Customer sees {player.maskedRegistration}</span>
            </Row>
            <Row label="Registration identifier">
              <span className="font-mono">{groupCode(player.registrationIdentifier)}</span>
            </Row>
            <Row label="Serial number">{player.serialNumber ?? none}</Row>
            <Row label="Status"><StatusBadge status={player.status} /></Row>
            <Row label="Registered">{player.registeredAt ? formatDate(player.registeredAt) : none}</Row>
            <Row label="Activated">{player.activatedAt ? formatDate(player.activatedAt) : none}</Row>
            {player.suspendedAt && <Row label="Suspended">{formatDate(player.suspendedAt)}</Row>}
            {player.retiredAt && <Row label="Retired">{formatDate(player.retiredAt)}</Row>}
            <Row label="Purchased">{player.purchaseDate ? formatDate(player.purchaseDate) : none}</Row>
            <Row label="Warranty until">{player.warrantyUntil ? formatDate(player.warrantyUntil) : none}</Row>
            <Row label="Dealer">{player.dealerName ?? none}</Row>
            <Row label="Last updated">{formatDateTime(player.updatedAt)}</Row>
          </dl>
          {can.activationKey && (
            <div className="mt-6 border-t border-neutral-100 pt-4">
              <ActivationKey playerId={player.id} hasKey={player.hasActivationKey} canWrite={can.write} />
            </div>
          )}
        </Panel>

        <Panel title="Actions" description={showActions ? "Each action needs a reason and an explicit confirmation, and is audited." : undefined}>
          {retired ? (
            <p className="text-sm text-neutral-500">This player is retired. Its record and history are kept for reference.</p>
          ) : !showActions ? (
            <p className="text-sm text-neutral-500">Your role can view this player but not change it.</p>
          ) : (
            <div className="flex flex-col items-start gap-3">
              {can.replace && supportsMusic && <ReplacePlayer player={actionPlayer} candidates={candidates} customerId={player.customer.id} replacementPolicy={policy.replacementPolicy} />}
              {can.libraryTransfer && supportsMusic && live > 0 && <TransferLibrary player={actionPlayer} candidates={candidates} customerId={player.customer.id} canCopy={can.grant} />}
              {can.transfer && <TransferPlayerOwnership player={actionPlayer} fromCustomerId={player.customer.id} resalePolicy={policy.resalePolicy} />}
              {can.write && <RetirePlayer player={actionPlayer} customerId={player.customer.id} canNote={can.crm} />}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        className="mt-6"
        title="Software registration"
        description={player.playerType.softwareProduct ? `Runs ${player.playerType.softwareProduct.name}.` : "No software product is linked to this player type."}
        padded={false}
      >
        {player.softwareInstallations.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500 sm:p-6">No software installation is linked to this player.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {player.softwareInstallations.map((i) => (
              <li key={i.id} className="flex flex-col gap-1 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-neutral-950">{i.product.name}</span>
                  {i.label && <span className="text-neutral-500">{i.label}</span>}
                  <SoftwareBadge kind="installation" status={i.status} />
                </span>
                <span className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                  {i.license && (
                    <>
                      {can.software && can.customers ? (
                        <Link href={`/admin/shop/customers/${player.customer.id}?tab=software#license-${i.license.id}`} className="font-medium text-neutral-950 hover:underline">
                          {licenseNumber(i.license.number)}
                        </Link>
                      ) : (
                        <span className="font-medium text-neutral-950">{licenseNumber(i.license.number)}</span>
                      )}
                      <SoftwareBadge kind="license" status={i.license.status} />
                    </>
                  )}
                  {i.activatedAt && <span>activated {formatDate(i.activatedAt)}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {can.music && (
        <Panel
          className="mt-6"
          title="Music library"
          description={
            !supportsMusic
              ? `${player.playerType.name} players cannot receive music.`
              : sources.length
                ? `By source: ${sources.map((s) => `${s.count} ${label(LICENSE_SOURCE_LABEL, s.source).toLowerCase()}`).join(", ")}.`
                : "No live music on this player."
          }
        >
          {picker && (
            <div className="mb-5">
              <GrantMusic
                customerId={player.customer.id}
                fixedPlayerId={player.id}
                players={[{ id: player.id, name: player.name, maskedRegistration: player.maskedRegistration, status: player.status, supportsMusicLibrary: supportsMusic }]}
                arrangements={picker.arrangements}
                bundles={picker.bundles}
              />
            </div>
          )}
          <PlayerLibrary playerId={player.id} playerNames={playerNames} canRevoke={can.revoke} canSeeOrders={can.orders} />
        </Panel>
      )}

      {can.music && (
        <Panel className="mt-6" title="License history" description="Replacements, library moves and ownership transfers involving this player." padded={false}>
          <div className="px-5 pb-2 sm:px-6">
            <TransfersTable rows={transfers} linkPlayers linkCustomers={can.customers} />
          </div>
        </Panel>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {can.orders && (
          <Panel title="Orders for this player" padded={false}>
            {orders.length === 0 ? (
              <p className="p-5 text-sm text-neutral-500 sm:p-6">No order lines were bought for this player.</p>
            ) : (
              <div className="px-5 pb-2 sm:px-6">
                <Table>
                  <thead>
                    <tr>
                      <th className={th}>Order</th>
                      <th className={th}>Item</th>
                      <th className={`${th} text-right`}>Charged</th>
                      <th className={th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className={tr}>
                        <td className={td}>
                          <Link href={`/admin/shop/orders/${o.order.id}`} className="font-medium text-neutral-950 hover:underline">{o.orderNumber}</Link>
                          <span className="ml-2"><StatusBadge status={o.order.status} /></span>
                        </td>
                        <td className={`${td} max-w-[14rem] truncate`}>{o.titleSnapshot}</td>
                        <td className={`${td} text-right tabular-nums`}>{formatMoney(o.chargedCents, o.order.currency)}</td>
                        <td className={`${td} tabular-nums`}>{formatDate(o.order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Panel>
        )}

        {can.support && (
          <Panel title="Support" padded={false}>
            {tickets.length === 0 ? (
              <p className="p-5 text-sm text-neutral-500 sm:p-6">No tickets about this player.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {tickets.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-2 px-5 py-3 text-sm sm:px-6">
                    <Link href={`/admin/shop/support/${t.id}`} className="font-medium text-neutral-950 hover:underline">{ticketNumber(t.number)}</Link>
                    <span className="min-w-0 flex-1 truncate text-neutral-700">{t.subject}</span>
                    <StatusBadge status={t.status} />
                    <span className="text-xs tabular-nums text-neutral-500">{formatDate(t.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {can.deliveries && (
          <Panel title="Deliveries" description="Encoded files produced for this player. Metadata only; files are never downloadable here." padded={false}>
            {deliveries.length === 0 ? (
              <p className="p-5 text-sm text-neutral-500 sm:p-6">Nothing has been encoded for this player yet.</p>
            ) : (
              <div className="px-5 pb-2 sm:px-6">
                <Table>
                  <thead>
                    <tr>
                      <th className={th}>Arrangement</th>
                      <th className={th}>Encoder</th>
                      <th className={`${th} text-right`}>Size</th>
                      <th className={th}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d.id} className={tr}>
                        <td className={`${td} max-w-[14rem] truncate`}>{d.arrangement.displayTitle}</td>
                        <td className={td}>
                          {d.encoderVersion}
                          <span className="block text-xs text-neutral-500">Profile {d.protectionProfileVersion}</span>
                        </td>
                        <td className={`${td} text-right tabular-nums`}>{formatBytes(d.bytes)}</td>
                        <td className={`${td} tabular-nums`}>{formatDateTime(d.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Panel>
        )}

        <Panel title="Activity" description="Timeline entries about this player.">
          <Timeline entries={activity.map((a) => ({ ...a, staffName: null }))} />
        </Panel>
      </div>

      {otherPlayers.length > 0 && (
        <Panel className="mt-6" title="Other players of this customer" padded={false}>
          <ul className="divide-y divide-neutral-100">
            {otherPlayers.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2 px-5 py-3 text-sm sm:px-6">
                <Link href={`/admin/shop/players/${p.id}`} className="inline-flex items-center gap-1 font-medium text-neutral-950 hover:underline">
                  {p.name} <ArrowSquareOut size={12} aria-hidden />
                </Link>
                <span className="font-mono text-xs text-neutral-500">{p.maskedRegistration}</span>
                <StatusBadge status={p.status} />
                {!p.supportsMusicLibrary && <span className="text-xs text-neutral-500">Cannot receive music</span>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

    </>
  );
}
