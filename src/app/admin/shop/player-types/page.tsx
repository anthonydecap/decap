import { roleHasPermission } from "@/modules/shop/auth/session";
import { playerTypeSettingsOptions } from "@/modules/shop/services/music-admin-ui";
import { listPlayerTypes } from "@/modules/shop/services/players";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PlayerTypesManager } from "@/modules/shop/ui/admin/players/PlayerTypesManager";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function AdminPlayerTypesPage() {
  const guard = await guardStaffPage("players:read", "/admin/shop/player-types");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/player-types" />;

  const canWrite = roleHasPermission(guard.ctx.staff.role, "players:write");
  const [rows, options] = await Promise.all([
    listPlayerTypes(),
    canWrite ? playerTypeSettingsOptions() : Promise.resolve({ softwareProducts: [], bundles: [], systemProfiles: [] }),
  ]);
  return (
    <>
      <PageHeader
        title="Player types"
        description="The kinds of DMI player a customer can own, and what each can do with music: whether it has a library, the software that runs it, its starter collection and compatible system profiles."
      />
      <PlayerTypesManager
        canWrite={canWrite}
        options={options}
        rows={rows.map((t) => ({
          id: t.id,
          code: t.code,
          name: t.name,
          description: t.description,
          active: t.active,
          playerCount: t.playerCount,
          supportsMusicLibrary: t.supportsMusicLibrary,
          softwareProduct: t.softwareProduct,
          starterBundle: t.starterBundle,
          systemProfiles: t.systemProfiles,
        }))}
      />
    </>
  );
}
