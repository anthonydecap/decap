import { listCustomerTags } from "@/modules/shop/services/crm-admin";
import { CustomerTagsManager } from "@/modules/shop/ui/admin/crm/CustomerTagsManager";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader } from "@/modules/shop/ui/admin/primitives";

export const dynamic = "force-dynamic";

export default async function AdminCustomerTagsPage() {
  const guard = await guardStaffPage("crm:write", "/admin/shop/customer-tags");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/customer-tags" />;

  const tags = await listCustomerTags();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/customers", label: "Customers" }}
        title="Customer tags"
        description="Labels for grouping customers, and alert tags for warnings every member of staff must see on the customer page."
      />
      <CustomerTagsManager
        tags={tags.map((t) => ({ id: t.id, name: t.name, description: t.description, isAlert: t.isAlert, customerCount: t._count.assignments }))}
      />
    </>
  );
}
