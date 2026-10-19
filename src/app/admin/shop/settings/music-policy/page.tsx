import { roleHasPermission } from "@/modules/shop/auth/session";
import { shopDb } from "@/modules/shop/db";
import { getMusicPolicy } from "@/modules/shop/services/music-policy";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { MusicPolicyForm } from "@/modules/shop/ui/admin/music/MusicPolicyForm";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { Notice, PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

/** The most common published arrangement price, so the example reads like the real shop. */
async function typicalPriceCents(): Promise<number> {
  const rows = await shopDb().arrangement.groupBy({
    by: ["priceCents"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
    orderBy: { _count: { priceCents: "desc" } },
    take: 1,
  });
  return rows[0]?.priceCents ?? 895;
}

export default async function AdminMusicPolicyPage() {
  const guard = await guardStaffPage("music:read", "/admin/shop/settings/music-policy");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/settings/music-policy" />;
  const canWrite = roleHasPermission(guard.ctx.staff.role, "settings:write");

  const [policy, example] = await Promise.all([getMusicPolicy(), typicalPriceCents()]);

  return (
    <>
      <PageHeader
        title="Licensing policy"
        description="Music is licensed per player. These rules are central: the cart, checkout, grants and staff transfers all read them from here, so a change applies everywhere at once."
      />
      <div className="mb-6">
        <Notice>Changes apply from now on. Orders, licenses and transfers already made keep the terms they were made under. Every change is audited.</Notice>
      </div>
      <MusicPolicyForm initial={policy} canWrite={canWrite} exampleRetailCents={example} />
    </>
  );
}
