import Link from "next/link";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { listTransfers } from "@/modules/shop/services/music-transfers";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { TransfersTable } from "@/modules/shop/ui/admin/music/TransfersTable";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, PageHeader, Panel } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

const LIMIT = 200;

export default async function AdminMusicTransfersPage() {
  const guard = await guardStaffPage("music:read", "/admin/shop/music/transfers");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/music/transfers" />;
  const role = guard.ctx.staff.role;

  const rows = await listTransfers({ take: LIMIT });

  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/music", label: "Music licenses" }}
        title="Transfers"
        description="Every replacement, library move, additional-license copy and player ownership transfer, as its own business record. Orders are never changed by a transfer."
        actions={<Link href="/admin/shop/settings/music-policy" className={btn.secondary}>Licensing policy</Link>}
      />
      <Panel
        title={`${rows.length} transfer${rows.length === 1 ? "" : "s"}`}
        description={rows.length >= LIMIT ? `Showing the latest ${LIMIT}. Open a player or customer to see its full history.` : undefined}
        padded={false}
      >
        <div className="px-5 pb-2 sm:px-6">
          <TransfersTable
            rows={rows}
            linkPlayers={roleHasPermission(role, "players:read")}
            linkCustomers={roleHasPermission(role, "customers:read")}
          />
        </div>
      </Panel>
    </>
  );
}
