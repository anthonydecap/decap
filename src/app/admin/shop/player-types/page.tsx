import { roleHasPermission } from "@/modules/shop/auth/session";
import { listPlayerTypes } from "@/modules/shop/services/players";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PlayerTypesManager } from "@/modules/shop/ui/admin/players/PlayerTypesManager";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function AdminPlayerTypesPage() {
  const guard = await guardStaffPage("players:read", "/admin/shop/player-types");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/player-types" />;

  const rows = await listPlayerTypes();
  return (
    <>
      <PageHeader
        title="Player types"
        description="The kinds of DMI player a customer can own. Managed here rather than in code, because the range keeps growing."
      />
      <PlayerTypesManager
        canWrite={roleHasPermission(guard.ctx.staff.role, "players:write")}
        rows={rows.map((t) => ({
          id: t.id,
          code: t.code,
          name: t.name,
          description: t.description,
          active: t.active,
          playerCount: t.playerCount,
        }))}
      />
    </>
  );
}
