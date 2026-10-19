import { ProfilesManager, TaxonomyPanel } from "@/modules/shop/ui/admin/catalog/ProfilesManager";
import { listProfilesAndTaxonomy } from "@/modules/shop/ui/admin/catalog/queries";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const guard = await guardStaffPage("catalog:write", "/admin/shop/profiles");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const { profiles, genres, tags } = await listProfilesAndTaxonomy();

  return (
    <>
      <PageHeader
        title="Compatibility and taxonomy"
        description="System profiles used for compatibility, plus the genres and tags shown on the storefront."
      />
      <div className="flex flex-col gap-6">
        <ProfilesManager
          profiles={profiles.map((p) => ({
            id: p.id, code: p.code, name: p.name, manufacturer: p.manufacturer, description: p.description,
            isGeneric: p.isGeneric, active: p.active, usageCount: p._count.compatibilities,
          }))}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TaxonomyPanel kind="genre" items={genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug, usageCount: g._count.arrangements }))} />
          <TaxonomyPanel kind="tag" items={tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, usageCount: t._count.arrangements }))} />
        </div>
      </div>
    </>
  );
}
