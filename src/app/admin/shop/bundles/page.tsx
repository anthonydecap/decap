import Link from "next/link";
import { listBundlesAdmin } from "@/modules/shop/ui/admin/catalog/queries";
import { selectClass } from "@/modules/shop/ui/admin/catalog/ui";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, inputClass, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function BundlesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const guard = await guardStaffPage("catalog:write", "/admin/shop/bundles");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;

  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const status = one(sp.status);
  const bundles = await listBundlesAdmin({ q: q || undefined, status: status || undefined });
  const filtered = Boolean(q || status);

  return (
    <>
      <PageHeader
        title="Collections"
        description="Bundles of arrangements sold together at one price."
        actions={<Link className={btn.primary} href="/admin/shop/bundles/new">New collection</Link>}
      />

      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-medium text-neutral-800">Search</label>
          <input id="q" name="q" defaultValue={q} className={inputClass} type="search" placeholder="Title or SKU" />
        </div>
        <div className="flex flex-col gap-1.5 sm:w-48">
          <label htmlFor="status" className="text-sm font-medium text-neutral-800">Status</label>
          <select id="status" name="status" defaultValue={status} className={selectClass}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Apply</button>
          {filtered && <Link href="/admin/shop/bundles" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel padded={false}>
        {bundles.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={filtered ? "No collections match" : "No collections yet"}
              body={filtered ? "Try a different search or status." : "Group arrangements into a collection with a single price."}
              action={!filtered ? <Link className={btn.primary} href="/admin/shop/bundles/new">New collection</Link> : undefined}
            />
          </div>
        ) : (
          <div className="px-5 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>SKU</th>
                  <th className={th}>Title</th>
                  <th className={`${th} text-right`}>Items</th>
                  <th className={`${th} text-right`}>Retail total</th>
                  <th className={`${th} text-right`}>Price</th>
                  <th className={th}>Status</th>
                  <th className={th}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map((b) => {
                  const total = b.items.reduce((s, i) => s + i.arrangement.priceCents, 0);
                  return (
                    <tr key={b.id} className={tr}>
                      <td className={`${td} font-mono text-xs`}>{b.sku}</td>
                      <td className={`${td} max-w-[20rem]`}>
                        <Link href={`/admin/shop/bundles/${b.id}`} className="block truncate font-medium text-neutral-950 hover:underline">{b.title}</Link>
                        {b.featured && <p className="text-xs text-neutral-500">Featured</p>}
                      </td>
                      <td className={`${td} text-right tabular-nums`}>{b.items.length}</td>
                      <td className={`${td} text-right tabular-nums text-neutral-500`}>{formatMoney(total, b.currency)}</td>
                      <td className={`${td} text-right tabular-nums`}>{formatMoney(b.priceCents, b.currency)}</td>
                      <td className={td}><StatusBadge status={b.status} /></td>
                      <td className={`${td} text-xs text-neutral-500`}>{formatDateTime(b.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
      {bundles.length >= 200 && <p className="mt-3 text-xs text-neutral-500">Showing the 200 most recently updated collections. Use search to narrow down.</p>}
    </>
  );
}
