import Link from "next/link";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { shopDb } from "@/modules/shop/db";
import { migrationQueue, unassignedLicenses } from "@/modules/shop/services/music-admin";
import { customerMusicPlayers } from "@/modules/shop/services/music-licenses";
import { displayCustomer } from "@/modules/shop/ui/admin/crm/labels";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { AssignUnassigned } from "@/modules/shop/ui/admin/music/AssignUnassigned";
import { label, MIGRATION_STATUS_LABEL } from "@/modules/shop/ui/admin/music/labels";
import { MigrationRunner } from "@/modules/shop/ui/admin/music/MigrationRunner";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { EmptyState, PageHeader, Panel, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { firstParam } from "@/modules/shop/ui/admin/sales/labels";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Status chip without the solid "good" tone: none of these states is finished. */
function QueueStatus({ status }: { status: string }) {
  return (
    <span
      className={
        status === "NEEDS_REVIEW"
          ? "inline-flex rounded-full border border-neutral-950 bg-white px-2.5 py-0.5 text-xs font-semibold text-neutral-950"
          : "inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600"
      }
    >
      {label(MIGRATION_STATUS_LABEL, status)}
    </span>
  );
}

export default async function AdminMusicMigrationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const guard = await guardStaffPage("music:migration", "/admin/shop/music/migration");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/music/migration" />;
  const role = guard.ctx.staff.role;
  const canApplyAll = roleHasPermission(role, "music:grant");
  const canCustomers = roleHasPermission(role, "customers:read");

  const sp = await searchParams;
  const rawCustomer = firstParam(sp.customer) ?? "";
  const customerId = UUID.test(rawCustomer) ? rawCustomer : null;

  const [queue, review] = await Promise.all([
    migrationQueue(),
    customerId
      ? Promise.all([
          shopDb().customer.findUnique({ where: { id: customerId }, select: { id: true, email: true, firstName: true, lastName: true, companyName: true } }),
          unassignedLicenses(customerId),
          customerMusicPlayers(customerId),
        ])
      : Promise.resolve(null),
  ]);

  const totals = queue.reduce((a, q) => ({ review: a.review + q.needsReview, waiting: a.waiting + q.waiting }), { review: 0, waiting: 0 });

  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/music", label: "Music licenses" }}
        title="Music migration"
        description="Legacy account-level purchases become player licenses. One eligible player: assigned automatically. Several: staff choose here. None: the music waits for the customer's first player."
      />

      {review && (
        <Panel
          className="mb-6"
          title={review[0] ? `Review: ${displayCustomer(review[0])}` : "Customer not found"}
          description={review[0] ? `${review[1].length} license${review[1].length === 1 ? "" : "s"} not on a player yet.` : undefined}
          actions={
            <div className="flex gap-3 text-sm">
              {review[0] && canCustomers && (
                <Link href={`/admin/shop/customers/${review[0].id}?tab=music`} className="font-medium text-neutral-950 hover:underline">Open customer</Link>
              )}
              <Link href="/admin/shop/music/migration" className="text-neutral-500 hover:text-neutral-950">Close</Link>
            </div>
          }
        >
          {review[0] && (
            <div className="flex flex-col gap-6">
              <AssignUnassigned
                licenses={review[1].map((l) => ({
                  id: l.id,
                  title: l.arrangement.displayTitle,
                  sku: l.arrangement.sku,
                  needsReview: l.needsReview,
                  statusReason: l.statusReason,
                  source: l.licenseSource,
                  createdAt: l.createdAt.toISOString(),
                }))}
                players={review[2].filter((p) => p.eligible && p.supportsMusicLibrary).map((p) => ({ id: p.id, name: p.name, maskedRegistration: p.maskedRegistration }))}
              />
              <div className="border-t border-neutral-100 pt-4">
                <p className="mb-3 text-sm text-neutral-600">Re-run the automatic rules for this customer only (for example after registering their player).</p>
                <MigrationRunner customerId={review[0].id} canApply />
              </div>
            </div>
          )}
        </Panel>
      )}

      <Panel className="mb-6" title="Run the migration" description="Always start with a dry run. Applying is safe to repeat: work already done is skipped.">
        <MigrationRunner canApply={canApplyAll} />
      </Panel>

      <Panel
        title="Queue"
        description={queue.length ? `${queue.length} customer${queue.length === 1 ? "" : "s"}, ${totals.review} license${totals.review === 1 ? "" : "s"} need review, ${totals.waiting} waiting.` : undefined}
        padded={false}
      >
        {queue.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Nothing in the queue" body="Every migrated purchase is on a player." />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Customer</th>
                  <th className={`${th} text-right`}>Needs review</th>
                  <th className={`${th} text-right`}>Waiting</th>
                  <th className={`${th} text-right`}>Eligible players</th>
                  <th className={`${th} text-right`}>Active licenses</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((row) => (
                  <tr key={row.customer.id} className={tr}>
                    <td className={`${td} max-w-[18rem]`}>
                      <Link href={`/admin/shop/music/migration?customer=${row.customer.id}`} className="block truncate font-medium text-neutral-950 hover:underline">
                        {displayCustomer(row.customer)}
                      </Link>
                      <p className="truncate text-xs text-neutral-500">{row.customer.email}</p>
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{row.needsReview || <span className="text-neutral-400">0</span>}</td>
                    <td className={`${td} text-right tabular-nums`}>{row.waiting || <span className="text-neutral-400">0</span>}</td>
                    <td className={`${td} text-right tabular-nums`}>{row.players}</td>
                    <td className={`${td} text-right tabular-nums`}>{row.activeLicenses}</td>
                    <td className={td}><QueueStatus status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
    </>
  );
}
