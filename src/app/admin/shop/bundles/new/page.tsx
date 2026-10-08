import { BundleForm } from "@/modules/shop/ui/admin/catalog/BundleForm";
import { arrangementPickerOptions } from "@/modules/shop/ui/admin/catalog/queries";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function NewBundlePage() {
  const guard = await guardStaffPage("catalog:write", "/admin/shop/bundles/new");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const options = await arrangementPickerOptions();

  return (
    <>
      <PageHeader
        title="New collection"
        description="Create the collection as a draft. Cover image and publishing become available once it is saved."
        back={{ href: "/admin/shop/bundles", label: "Collections" }}
      />
      <BundleForm initial={null} options={options} />
    </>
  );
}
