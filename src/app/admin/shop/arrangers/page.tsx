import { ArrangersManager } from "@/modules/shop/ui/admin/catalog/ArrangersManager";
import { listArrangersAdmin } from "@/modules/shop/ui/admin/catalog/queries";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function ArrangersPage() {
  const guard = await guardStaffPage("catalog:write", "/admin/shop/arrangers");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const arrangers = await listArrangersAdmin();

  return (
    <>
      <PageHeader
        title="Arrangers"
        description="Arrangers and their default royalty terms. Individual arrangements can override the default."
      />
      <ArrangersManager
        arrangers={arrangers.map((a) => ({
          id: a.id, name: a.name, slug: a.slug, bio: a.bio, contactEmail: a.contactEmail,
          defaultRoyaltyBasis: a.defaultRoyaltyBasis, defaultRoyaltyRateBps: a.defaultRoyaltyRateBps,
          defaultRoyaltyFixedCents: a.defaultRoyaltyFixedCents, active: a.active, arrangementCount: a._count.arrangements,
        }))}
      />
    </>
  );
}
