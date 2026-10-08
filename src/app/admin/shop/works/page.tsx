import { listWorksAdmin } from "@/modules/shop/ui/admin/catalog/queries";
import { WorksManager } from "@/modules/shop/ui/admin/catalog/WorksManager";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const guard = await guardStaffPage("catalog:write", "/admin/shop/works");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const works = await listWorksAdmin();

  return (
    <>
      <PageHeader
        title="Works"
        description="The underlying songs and compositions. Each arrangement links to one work. Works in use cannot be deleted."
      />
      <WorksManager
        works={works.map((w) => ({
          id: w.id, title: w.title, originalArtist: w.originalArtist, composer: w.composer, year: w.year, era: w.era,
          notes: w.notes, arrangementCount: w._count.arrangements,
        }))}
      />
    </>
  );
}
