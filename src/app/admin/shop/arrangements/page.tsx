import Link from "next/link";
import { listArrangementsAdmin } from "@/modules/shop/services/admin-catalog";
import { selectClass } from "@/modules/shop/ui/admin/catalog/ui";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import {
  btn, EmptyState, inputClass, PageHeader, Pagination, Panel, StatusBadge, Table, td, th, tr,
} from "@/modules/shop/ui/admin/primitives";
import { formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ArrangementsPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("catalog:write", "/admin/shop/arrangements");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;

  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const status = one(sp.status);
  const page = Math.max(Number.parseInt(one(sp.page), 10) || 1, 1);
  const data = await listArrangementsAdmin({ q: q || undefined, status: status || undefined, page });

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/shop/arrangements${s ? `?${s}` : ""}`;
  };
  const filtered = Boolean(q || status);

  return (
    <>
      <PageHeader
        title="Arrangements"
        description="Every licensed arrangement in the shop, its price, rights workflow state and publishing status."
        actions={
          <>
            <Link className={btn.secondary} href="/admin/shop/imports/new">Bulk import</Link>
            <Link className={btn.primary} href="/admin/shop/arrangements/new">New arrangement</Link>
          </>
        }
      />

      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-medium text-neutral-800">Search</label>
          <input id="q" name="q" defaultValue={q} className={inputClass} type="search" placeholder="Title, SKU, work or arranger" />
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
          {filtered && <Link href="/admin/shop/arrangements" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel padded={false}>
        {data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={filtered ? "No arrangements match" : "No arrangements yet"}
              body={filtered ? "Try a different search or status." : "Create your first arrangement, or import a batch from a spreadsheet."}
              action={!filtered ? <Link className={btn.primary} href="/admin/shop/arrangements/new">New arrangement</Link> : undefined}
            />
          </div>
        ) : (
          <div className="px-5 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>SKU</th>
                  <th className={th}>Title</th>
                  <th className={th}>Arranger</th>
                  <th className={`${th} text-right`}>Price</th>
                  <th className={th}>Rights</th>
                  <th className={th}>Status</th>
                  <th className={th}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((a) => (
                  <tr key={a.id} className={tr}>
                    <td className={`${td} font-mono text-xs`}>{a.sku}</td>
                    <td className={`${td} max-w-[20rem]`}>
                      <Link href={`/admin/shop/arrangements/${a.id}`} className="block truncate font-medium text-neutral-950 hover:underline">
                        {a.displayTitle}
                      </Link>
                      <p className="truncate text-xs text-neutral-500">{a.work.title}{a.featured ? ", featured" : ""}</p>
                    </td>
                    <td className={td}>{a.arranger.name}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatMoney(a.priceCents, a.currency)}</td>
                    <td className={td}><StatusBadge status={a.rightsStatus} /></td>
                    <td className={td}><StatusBadge status={a.status} /></td>
                    <td className={`${td} text-xs text-neutral-500`}>{formatDateTime(a.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
      <p className="mt-3 text-xs text-neutral-500">{data.total} arrangement{data.total === 1 ? "" : "s"}</p>
      <Pagination page={data.page} pageCount={data.pageCount} hrefFor={hrefFor} />
    </>
  );
}
