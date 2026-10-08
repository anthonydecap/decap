import type { Metadata } from "next";
import { ALL_PERMISSIONS, roleHasPermission } from "@/modules/shop/auth/session";
import { AdminNav } from "@/modules/shop/ui/admin/AdminNav";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DMI Shop admin",
  robots: { index: false, follow: false },
};

export default async function AdminShopLayout({ children }: { children: React.ReactNode }) {
  const result = await guardStaffPage(undefined, "/admin/shop");
  if (!result.ok) {
    return (
      <div className="min-h-full w-full bg-neutral-50">
        <NoAccess reason={result.reason} />
      </div>
    );
  }
  const { staff, user } = result.ctx;
  const permissions = ALL_PERMISSIONS.filter((p) => roleHasPermission(staff.role, p));
  return (
    <div className="flex min-h-screen w-full flex-col bg-neutral-50 lg:flex-row">
      <AdminNav permissions={permissions} role={staff.role} staffLabel={staff.displayName ?? staff.email ?? user.email ?? "Staff"} />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
