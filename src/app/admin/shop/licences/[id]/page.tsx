import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopError } from "@/modules/shop/errors";
import { decaplicCommand, getPlayerLicenseOrder, syncPlayerLicenseOrder } from "@/modules/shop/services/player-licenses";
import { displayCustomer } from "@/modules/shop/ui/admin/crm/labels";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { LicenceOrderActions } from "@/modules/shop/ui/admin/licences/LicenceOrderActions";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, Notice, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatDateTime } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="mt-1 text-neutral-950">{children}</dd>
    </div>
  );
}

export default async function AdminLicenceOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await guardStaffPage("licences:issue", `/admin/shop/licences/${id}`);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={`/admin/shop/licences/${id}`} />;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  let order;
  try {
    order = await getPlayerLicenseOrder(id);
    if (order.status === "WAITING") {
      await syncPlayerLicenseOrder(order.playerId); // bring its song list up to date
      order = await getPlayerLicenseOrder(id);
    }
  } catch (e) {
    if (e instanceof ShopError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  const waiting = order.status === "WAITING";
  const playerId = order.player.licensePlayerId ?? "";

  return (
    <>
      <PageHeader
        title={order.player.friendlyName ?? "Decap Player"}
        description={`Licence order, ${order.reason.toLowerCase()}. Opened ${formatDateTime(order.createdAt)}.`}
        actions={<Link href="/admin/shop/licences" className={btn.ghost}>All licence orders</Link>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="For" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Row label="Status"><StatusBadge status={order.status} /></Row>
            <Row label="Customer">
              <Link href={`/admin/shop/customers/${order.customer.id}`} className="hover:underline">{displayCustomer(order.customer)}</Link>
              <span className="block text-xs text-neutral-500">{order.customer.email}</span>
              <span className="block font-mono text-xs">{order.customerNumberText}</span>
            </Row>
            <Row label="Player ID"><span className="break-all font-mono text-xs">{playerId}</span></Row>
            <Row label="Player public key"><span className="break-all font-mono text-xs">{order.player.licensePublicKey}</span></Row>
            <Row label="Player record">
              <Link href={`/admin/shop/players/${order.player.id}`} className="hover:underline">Open player</Link>
            </Row>
            {order.status === "DONE" && (
              <>
                <Row label="Licence ID"><span className="break-all font-mono text-xs">{order.licenseId}</span></Row>
                <Row label="Issued">{order.issued} (signed with {order.signerKeyId})</Row>
                <Row label="File sha256"><span className="break-all font-mono text-xs">{order.fileSha256}</span></Row>
                <Row label="Uploaded">{order.processedAt ? formatDateTime(order.processedAt) : ""} by {order.processedBy?.displayName ?? order.processedBy?.email ?? "staff"}</Row>
              </>
            )}
            {order.status === "REFUSED" && <Row label="Refused">{order.refusedReason}</Row>}
          </dl>
        </Panel>

        <Panel title="Licence settings">
          <LicenceOrderActions
            orderId={order.id}
            waiting={waiting}
            settings={{ edition: order.edition as "standard" | "pro", midiOut: order.midiOut, validUntil: order.validUntil, dmiUserId: order.dmiUserId }}
          />
        </Panel>
      </div>

      {waiting && (
        <div className="mt-6">
          <Panel title="Make the licence (offline)">
            <ol className="list-decimal space-y-3 pl-5 text-sm text-neutral-700">
              <li>
                Download the two files:{" "}
                <a href={`/api/admin/shop/licences/${order.id}/request`} className="font-medium text-neutral-950 underline">{playerId}.decapreq</a>
                {order.songs.length > 0 && (
                  <>
                    {" and "}
                    <a href={`/api/admin/shop/licences/${order.id}/songs`} className="font-medium text-neutral-950 underline">{playerId}_songs.txt</a>
                  </>
                )}
                .
              </li>
              <li>
                On the vault PC run (the signing key and nummers.txt never leave it):
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-neutral-100 p-3 font-mono text-xs text-neutral-950">{decaplicCommand(order)}</pre>
              </li>
              <li>Upload the .decaplic it writes, under Licence settings. The customer gets an email.</li>
            </ol>
          </Panel>
        </div>
      )}

      {order.withoutSongId.length > 0 && (
        <div className="mt-6">
          <Notice tone="error">
            {order.withoutSongId.length} arrangement(s) the player has bought have no song ID (.dvo) yet and cannot be in a licence:{" "}
            {order.withoutSongId.slice(0, 10).map((a) => a.title).join(", ")}
            {order.withoutSongId.length > 10 ? ", ..." : ""}. They join a new order as soon as they get one.
          </Notice>
        </div>
      )}

      <div className="mt-6">
        <Panel title={`Songs (${order.songs.length})`} padded={false}>
          {order.songs.length === 0 ? (
            <p className="p-6 text-sm text-neutral-600">No songs: the licence registers the player only (decaplic --geen).</p>
          ) : (
            <div className="px-5 pb-2 sm:px-6">
              <Table>
                <thead>
                  <tr>
                    <th className={th}>Song ID</th>
                    <th className={th}>Arrangement</th>
                    {order.status === "DONE" && <th className={th}>In licence</th>}
                  </tr>
                </thead>
                <tbody>
                  {order.songs.map((s) => (
                    <tr key={s.songId} className={tr}>
                      <td className={`${td} font-mono text-xs`}>{s.songId}</td>
                      <td className={td}><Link href={`/admin/shop/arrangements/${s.arrangement.id}`} className="hover:underline">{s.arrangement.displayTitle}</Link></td>
                      {order.status === "DONE" && <td className={td}>{order.issuedSongIds.includes(s.songId) ? "yes" : "no"}</td>}
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
