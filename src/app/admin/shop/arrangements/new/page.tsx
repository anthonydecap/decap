import { catalogLookups } from "@/modules/shop/services/admin-catalog";
import { ArrangementForm } from "@/modules/shop/ui/admin/catalog/ArrangementForm";
import { SegmentedLinks } from "@/modules/shop/ui/admin/catalog/ui";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function NewArrangementPage() {
  const guard = await guardStaffPage("catalog:write", "/admin/shop/arrangements/new");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const lookups = await catalogLookups();

  return (
    <>
      <PageHeader
        title="New arrangement"
        description="Create the arrangement as a draft. Files and publishing become available once it is saved."
        back={{ href: "/admin/shop/arrangements", label: "Arrangements" }}
      />
      <SegmentedLinks
        label="Arrangement sections"
        current="details"
        items={[
          { key: "details", label: "Details", href: "/admin/shop/arrangements/new" },
          { key: "files", label: "Files", href: "#", disabled: true },
          { key: "publishing", label: "Publishing", href: "#", disabled: true },
        ]}
      />
      <ArrangementForm initial={null} lookups={lookups} />
    </>
  );
}
