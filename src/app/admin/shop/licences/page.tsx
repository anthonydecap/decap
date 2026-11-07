import Link from "next/link";
import { formatCustomerNumber } from "@/modules/shop/services/decap-request";
import { listPlayerLicenseOrders, syncAllPlayerLicenseOrders } from "@/modules/shop/services/player-licenses";
import { displayCustomer } from "@/modules/shop/ui/admin/crm/labels";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { EmptyState, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatDate, formatDateTime } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

/**
 * The licence queue (licence v1, contract C7 §5). Opening the page first brings the queue up to
 * date (every Decap Player against its music), so nothing depends on a hook that may have been
 * missed. Licences are made offline with `decaplic`; this page only lists and receives them.
 */
export default async function AdminLicencesPage() {
  const guard = await guardStaffPage("licences:issue", "/admin/shop/licences");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/licences" />;

  await syncAllPlayerLicenseOrders();
  const [waiting, recent] = await Promise.all([
    listPlayerLicenseOrders({ status: "WAITING", take: 200 }),
    listPlayerLicenseOrders({ take: 30 }),
  ]);
  const history = recent.filter((o) => o.status !== "WAITING");

  const rows = (orders: typeof waiting, when: "created" | "processed") =>
    orders.map((o) => (
      <tr key={o.id} className={tr}>
        <td className={`${td} max-w-[16rem]`}>
          <Link href={`/admin/shop/licences/${o.id}`} className="block truncate font-medium text-neutral-950 hover:underline">
            {o.player.friendlyName ?? "Decap Player"}
          </Link>
          <p className="truncate font-mono text-xs text-neutral-500">{o.player.licensePlayerId}</p>
        </td>
        <td className={`${td} max-w-[16rem]`}>
          <span className="block truncate">{displayCustomer(o.customer)}</span>
          <p className="truncate font-mono text-xs text-neutral-500">{formatCustomerNumber(o.customer.customerNumber)}</p>
        </td>
        <td className={td}>{o.reason}</td>
        <td className={`${td} text-right tabular-nums`}>{o._count.songs}</td>
        <td className={td}><StatusBadge status={o.status} /></td>
        <td className={`${td} tabular-nums`}>{when === "created" ? formatDateTime(o.createdAt) : o.processedAt ? formatDate(o.processedAt) : ""}</td>
      </tr>
    ));

  const head = (when: string) => (
    <thead>
      <tr>
        <th className={th}>Player</th>
        <th className={th}>Customer</th>
        <th className={th}>Why</th>
        <th className={`${th} text-right`}>Songs</th>
        <th className={th}>Status</th>
        <th className={th}>{when}</th>
      </tr>
    </thead>
  );

  return (
    <>
      <PageHeader
        title="Player licences"
        description="Decap Players that need a (new) licence. Make it offline with decaplic issue, then upload the .decaplic on the order. The shop checks the signature, the player, the customer and the songs before the customer can download it."
      />
      <Panel title={`${waiting.length} waiting`} padded={false}>
        {waiting.length === 0 ? (
          <div className="p-6"><EmptyState title="Nothing waiting" body="Every registered Decap Player has a licence with all its music." /></div>
        ) : (
          <div className="px-5 pb-2 sm:px-6"><Table>{head("Waiting since")}<tbody>{rows(waiting, "created")}</tbody></Table></div>
        )}
      </Panel>
      {history.length > 0 && (
        <div className="mt-6">
          <Panel title="Recently handled" padded={false}>
            <div className="px-5 pb-2 sm:px-6"><Table>{head("Handled")}<tbody>{rows(history, "processed")}</tbody></Table></div>
          </Panel>
        </div>
      )}
    </>
  );
}
