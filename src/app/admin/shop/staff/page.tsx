import { roleHasPermission } from "@/modules/shop/auth/session";
import { StaffInvites } from "@/modules/shop/ui/admin/crm/StaffInvites";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader, Panel } from "@/modules/shop/ui/admin/primitives";
import { StaffManager } from "@/modules/shop/ui/admin/staff/StaffManager";
import { listStaff, listStaffInvites } from "@/modules/shop/services/staff";

export const dynamic = "force-dynamic";

/**
 * Staff administration. Reading the list needs `staff:read` (ADMIN and SUPER_ADMIN);
 * changing anything needs `staff:manage`, which only SUPER_ADMIN has — so an ADMIN sees
 * who has access without being able to grant it.
 */
export default async function AdminStaffPage() {
  const guard = await guardStaffPage("staff:read", "/admin/shop/staff");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/staff" />;

  const canManage = roleHasPermission(guard.ctx.staff.role, "staff:manage");
  const [rows, invites] = await Promise.all([listStaff(), canManage ? listStaffInvites() : Promise.resolve([])]);

  return (
    <>
      <PageHeader
        title="Staff"
        description="Who can sign in to this admin, and what they may do. Authentication stays with Auth0; access is granted here."
      />
      {canManage ? (
        <div className="flex flex-col gap-6">
          <StaffManager
            currentStaffId={guard.ctx.staff.id}
            rows={rows.map((r) => ({
              id: r.id,
              authSubject: r.authSubject,
              email: r.email,
              displayName: r.displayName,
              role: r.role,
              status: r.status,
              createdAt: r.createdAt.toISOString(),
              createdByName: r.createdByName,
            }))}
          />
          <StaffInvites
            invites={invites.map((i) => ({
              id: i.id,
              email: i.email,
              role: i.role,
              createdAt: i.createdAt.toISOString(),
              expiresAt: i.expiresAt.toISOString(),
              invitedByName: i.invitedBy?.displayName ?? i.invitedBy?.email ?? null,
            }))}
          />
        </div>
      ) : (
        <Panel
          title="Employees"
          description="Only a super admin can change roles or revoke access."
          padded={false}
        >
          <ul className="divide-y divide-neutral-200">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
                <span className="text-sm font-medium text-neutral-950">{r.displayName ?? r.email ?? "Unnamed"}</span>
                <span className="text-sm text-neutral-500">
                  {r.role.replace(/_/g, " ").toLowerCase()} · {r.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
