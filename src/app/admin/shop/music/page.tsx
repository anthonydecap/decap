import Link from "next/link";
import type { MusicLicenseSource, MusicLicenseStatus } from "@/generated/shop-prisma/client";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { searchMusicLicenses } from "@/modules/shop/services/music-admin";
import { displayCustomer } from "@/modules/shop/ui/admin/crm/labels";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { label, LICENSE_SOURCE_LABEL, LICENSE_SOURCES, LICENSE_STATUS_LABEL } from "@/modules/shop/ui/admin/music/labels";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { firstParam, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { formatDate } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "UNASSIGNED", "ACTIVE", "TRANSFER_PENDING", "RETIRED", "REVOKED"] as const;

export default async function AdminMusicLicensesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const guard = await guardStaffPage("music:read", "/admin/shop/music");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/music" />;
  const role = guard.ctx.staff.role;
  const canCustomers = roleHasPermission(role, "customers:read");
  const canPlayers = roleHasPermission(role, "players:read");

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? "";
  const rawStatus = firstParam(sp.status) ?? "all";
  const status = (STATUSES as readonly string[]).includes(rawStatus) ? (rawStatus as (typeof STATUSES)[number]) : "all";
  const rawSource = firstParam(sp.source) ?? "";
  const source = LICENSE_SOURCES.includes(rawSource) ? (rawSource as MusicLicenseSource) : undefined;
  const page = pageParam(sp.page);

  const result = await searchMusicLicenses({ q: q || undefined, status: status as MusicLicenseStatus | "all", source, page });
  const filters = { q, status: status === "all" ? undefined : status, source };
  const filtered = Boolean(q || status !== "all" || source);

  return (
    <>
      <PageHeader
        title="Music licenses"
        description="Every player-bound music license. A license is one arrangement on one player; the customer-level purchase history stays on the order."
        actions={<Link href="/admin/shop/music/transfers" className={btn.secondary}>Transfers</Link>}
      />

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_12rem_14rem_auto] md:items-end">
        <Field label="Search" htmlFor="music-q" help="Arrangement title or SKU, customer email, player name or registration code.">
          <input id="music-q" name="q" type="search" defaultValue={q} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Status" htmlFor="music-status">
          <select id="music-status" name="status" defaultValue={status} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All statuses" : label(LICENSE_STATUS_LABEL, s)}</option>
            ))}
          </select>
        </Field>
        <Field label="Source" htmlFor="music-source">
          <select id="music-source" name="source" defaultValue={source ?? ""} className={inputClass}>
            <option value="">All sources</option>
            {LICENSE_SOURCES.map((s) => (
              <option key={s} value={s}>{LICENSE_SOURCE_LABEL[s]}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Search</button>
          {filtered && <Link href="/admin/shop/music" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel title={`${result.total.toLocaleString("en-GB")} license${result.total === 1 ? "" : "s"}`} padded={false}>
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={filtered ? "No licenses match" : "No music licenses yet"}
              body={filtered ? "Try a different search or filter." : "Licenses are created by purchases, grants, starter collections and the legacy migration."}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Arrangement</th>
                  <th className={th}>Player</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Status</th>
                  <th className={th}>Source</th>
                  <th className={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((l) => (
                  <tr key={l.id} className={tr}>
                    <td className={`${td} max-w-[16rem]`}>
                      <p className="truncate font-medium text-neutral-950">{l.arrangement.displayTitle}</p>
                      <p className="text-xs text-neutral-500">{l.arrangement.sku}</p>
                    </td>
                    <td className={`${td} max-w-[14rem]`}>
                      {l.licensedPlayer && l.playerName ? (
                        canPlayers ? (
                          <Link href={`/admin/shop/players/${l.licensedPlayer.id}`} className="block truncate font-medium text-neutral-950 hover:underline">{l.playerName}</Link>
                        ) : (
                          <span className="block truncate">{l.playerName}</span>
                        )
                      ) : (
                        <span className="text-neutral-400">Not on a player</span>
                      )}
                      {l.licensedPlayer && <p className="text-xs text-neutral-500">{l.licensedPlayer.playerType.name}</p>}
                    </td>
                    <td className={`${td} max-w-[16rem]`}>
                      {canCustomers ? (
                        <Link href={`/admin/shop/customers/${l.customer.id}?tab=music`} className="block truncate hover:underline">{displayCustomer(l.customer)}</Link>
                      ) : (
                        <span className="block truncate">{displayCustomer(l.customer)}</span>
                      )}
                    </td>
                    <td className={td}>
                      <StatusBadge status={l.needsReview ? "NEEDS_REVIEW" : l.status} />
                    </td>
                    <td className={td}>{label(LICENSE_SOURCE_LABEL, l.licenseSource)}</td>
                    <td className={`${td} tabular-nums`}>{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
      <Pagination page={result.page} pageCount={result.pages} hrefFor={(n) => `/admin/shop/music${qs({ ...filters, page: n })}`} />
    </>
  );
}
