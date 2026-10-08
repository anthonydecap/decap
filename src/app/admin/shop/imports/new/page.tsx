import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { ImportWizard } from "@/modules/shop/ui/admin/imports/ImportWizard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function NewImportPage() {
  const guard = await guardStaffPage("imports:manage", "/admin/shop/imports/new");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  return (
    <>
      <PageHeader
        title="New import"
        back={{ href: "/admin/shop/imports", label: "Imports" }}
        description="Select files and an optional metadata CSV, review the dry run, then confirm to upload. The catalog only changes when you apply the batch."
      />
      <ImportWizard />
    </>
  );
}
