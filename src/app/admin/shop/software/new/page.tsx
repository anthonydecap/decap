import { SegmentedLinks } from "@/modules/shop/ui/admin/catalog/ui";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";
import { SoftwareProductForm } from "@/modules/shop/ui/admin/software/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewSoftwareProductPage() {
  const guard = await guardStaffPage("software:write", "/admin/shop/software/new");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/software" />;

  return (
    <>
      <PageHeader
        title="New software product"
        description="Start with the product details. Images, releases, downloads and licenses become available once the product is created."
        back={{ href: "/admin/shop/software", label: "Software" }}
      />
      <SegmentedLinks
        label="Software product sections"
        current="product"
        items={[
          { key: "product", label: "Product", href: "/admin/shop/software/new" },
          { key: "releases", label: "Releases", href: "#", disabled: true },
          { key: "downloads", label: "Downloads", href: "#", disabled: true },
          { key: "licenses", label: "Licenses", href: "#", disabled: true },
        ]}
      />
      <div className="max-w-3xl">
        <SoftwareProductForm initial={null} canWrite />
      </div>
    </>
  );
}
