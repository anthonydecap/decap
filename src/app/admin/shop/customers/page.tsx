import Link from "next/link";
import { searchCustomers } from "@/modules/shop/services/admin-ops";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { customerName, firstParam, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { formatDate } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("customers:read", "/admin/shop/customers");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/customers" />;

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? "";
  const page = pageParam(sp.page);
  const result = await searchCustomers({ q: q || undefined, page });

  return (
    <>
      <PageHeader title="Customers" description="Search by email, first name or last name." />

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Search" htmlFor="customers-q">
          <input id="customers-q" name="q" type="search" defaultValue={q} className={inputClass} autoComplete="off" />
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Search</button>
          {q && <Link href="/admin/shop/customers" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel title={`${result.total.toLocaleString("en-GB")} customer${result.total === 1 ? "" : "s"}`} padded={false}>
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={q ? "No customers match" : "No customers yet"}
              body={q ? "Try a different search." : "Customers appear after their first sign-in to the shop."}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Email</th>
                  <th className={th}>Name</th>
                  <th className={th}>Verified</th>
                  <th className={th}>Country</th>
                  <th className={`${th} text-right`}>Orders</th>
                  <th className={`${th} text-right`}>Active items</th>
                  <th className={th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((c) => (
                  <tr key={c.id} className={tr}>
                    <td className={`${td} max-w-[18rem] truncate`}>
                      <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/customers/${c.id}`}>{c.email}</Link>
                    </td>
                    <td className={td}>{customerName(c) ?? <span className="text-neutral-400">Not set</span>}</td>
                    <td className={td}>{c.emailVerified ? "Yes" : <span className="text-neutral-500">No</span>}</td>
                    <td className={td}>{c.countryCode ?? <span className="text-neutral-400">Not set</span>}</td>
                    <td className={`${td} text-right tabular-nums`}>{c._count.orders}</td>
                    <td className={`${td} text-right tabular-nums`}>{c._count.entitlements}</td>
                    <td className={`${td} tabular-nums`}>{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>

      <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => `/admin/shop/customers${qs({ q, page: p })}`} />
    </>
  );
}
