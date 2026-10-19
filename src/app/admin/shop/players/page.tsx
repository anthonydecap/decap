import Link from "next/link";
import { redirect } from "next/navigation";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { listPlayersAdmin } from "@/modules/shop/services/music-admin";
import { listPlayerTypes } from "@/modules/shop/services/players";
import { displayCustomer } from "@/modules/shop/ui/admin/crm/labels";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { firstParam, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { formatDate } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "PENDING", "ACTIVE", "SUSPENDED", "RETIRED"] as const;
type Status = (typeof STATUSES)[number];

export default async function AdminPlayersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const guard = await guardStaffPage("players:read", "/admin/shop/players");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/players" />;
  const canCustomers = roleHasPermission(guard.ctx.staff.role, "customers:read");
  const canMusic = roleHasPermission(guard.ctx.staff.role, "music:read");

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? "";
  const rawStatus = firstParam(sp.status) ?? "all";
  const status: Status = (STATUSES as readonly string[]).includes(rawStatus) ? (rawStatus as Status) : "all";
  const typeId = firstParam(sp.type) ?? "";
  const page = pageParam(sp.page);

  const [result, types] = await Promise.all([
    listPlayersAdmin({ q: q || undefined, status, typeId: /^[0-9a-f-]{36}$/i.test(typeId) ? typeId : undefined, page }),
    listPlayerTypes(),
  ]);

  // A registration code read over the phone should land on the exact player.
  const compact = q.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (q && page === 1 && result.total === 1 && compact.length >= 6 && result.items[0]!.registrationCode === compact) {
    redirect(`/admin/shop/players/${result.items[0]!.id}`);
  }

  const filters = { q, status: status === "all" ? undefined : status, type: typeId || undefined };

  return (
    <>
      <PageHeader title="Players" description="Every registered DMI player across all customers. Search by friendly name, registration code, serial number or customer." />

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_12rem_12rem_auto] md:items-end">
        <Field label="Search" htmlFor="players-q" help="An exact registration code opens the player directly.">
          <input id="players-q" name="q" type="search" defaultValue={q} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Status" htmlFor="players-status">
          <select id="players-status" name="status" defaultValue={status} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </Field>
        <Field label="Type" htmlFor="players-type">
          <select id="players-type" name="type" defaultValue={typeId} className={inputClass}>
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Search</button>
          {(q || status !== "all" || typeId) && <Link href="/admin/shop/players" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel title={`${result.total.toLocaleString("en-GB")} player${result.total === 1 ? "" : "s"}`} padded={false}>
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={q || status !== "all" || typeId ? "No players match" : "No players registered yet"}
              body={q || status !== "all" || typeId ? "Try a different search or filter." : "Players are registered from the customer page."}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Player</th>
                  <th className={th}>Registration</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Status</th>
                  {canMusic && <th className={`${th} text-right`}>Music licenses</th>}
                  <th className={th}>Added</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((p) => (
                  <tr key={p.id} className={tr}>
                    <td className={`${td} max-w-[16rem]`}>
                      <Link href={`/admin/shop/players/${p.id}`} className="block truncate font-medium text-neutral-950 hover:underline">{p.name}</Link>
                      <p className="truncate text-xs text-neutral-500">
                        {p.playerType.name}
                        {!p.playerType.supportsMusicLibrary && ", cannot receive music"}
                        {p.adminLabel && `, ${p.adminLabel}`}
                      </p>
                    </td>
                    <td className={td}>
                      <span className="font-mono text-xs">{p.registrationCode.match(/.{1,4}/g)?.join("-")}</span>
                      {p.serialNumber && <p className="text-xs text-neutral-500">Serial {p.serialNumber}</p>}
                    </td>
                    <td className={`${td} max-w-[16rem]`}>
                      {canCustomers ? (
                        <Link href={`/admin/shop/customers/${p.customer.id}`} className="block truncate hover:underline">{displayCustomer(p.customer)}</Link>
                      ) : (
                        <span className="block truncate">{displayCustomer(p.customer)}</span>
                      )}
                      <p className="truncate text-xs text-neutral-500">{p.customer.email}</p>
                    </td>
                    <td className={td}><StatusBadge status={p.status} /></td>
                    {canMusic && <td className={`${td} text-right tabular-nums`}>{p.playerType.supportsMusicLibrary ? p.licenseCount : <span className="text-neutral-400">n/a</span>}</td>}
                    <td className={`${td} tabular-nums`}>{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
      <Pagination page={result.page} pageCount={result.pages} hrefFor={(n) => `/admin/shop/players${qs({ ...filters, page: n })}`} />
    </>
  );
}
