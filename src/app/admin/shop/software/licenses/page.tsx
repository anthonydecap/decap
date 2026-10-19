import Link from "next/link";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { listSoftwareProductsAdmin } from "@/modules/shop/services/software";
import { listLicensesAdmin } from "@/modules/shop/services/software-licensing";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel } from "@/modules/shop/ui/admin/primitives";
import { firstParam, humanize, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { AddLicenseForm } from "@/modules/shop/ui/admin/software/AddLicenseForm";
import { LICENSE_STATUSES } from "@/modules/shop/ui/admin/software/labels";
import { LicensesTable } from "@/modules/shop/ui/admin/software/LicensesTable";
import { toLicenseRow } from "@/modules/shop/ui/admin/software/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SoftwareLicensesPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("software:licenses-read", "/admin/shop/software/licenses");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/software/licenses" />;

  const canWrite = roleHasPermission(guard.ctx.staff.role, "software:licenses-write");
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim().slice(0, 100) ?? "";
  const rawStatus = firstParam(sp.status) ?? "";
  const status = (LICENSE_STATUSES as readonly string[]).includes(rawStatus) ? rawStatus : "";
  const products = await listSoftwareProductsAdmin();
  const rawProduct = firstParam(sp.product) ?? "";
  const product = products.find((p) => p.id === rawProduct);
  const page = pageParam(sp.page);
  const result = await listLicensesAdmin({ q: q || undefined, status: status || undefined, productId: product?.id, page });
  const rows = result.items.map(toLicenseRow);
  const filtered = Boolean(q || status || product);

  return (
    <>
      <PageHeader
        title="Software licenses"
        description="Licenses come from purchases or are added by staff. A license is the right to activate; installations are the activated computers."
        back={{ href: "/admin/shop/software", label: "Software" }}
      />

      {canWrite && (
        <div className="mb-6">
          <AddLicenseForm
            products={products.map((p) => ({ id: p.id, name: p.name, defaultMaxActivations: p.defaultMaxActivations }))}
            defaultProductId={product?.id}
          />
        </div>
      )}

      <form
        method="get"
        className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_12rem_14rem_auto] lg:items-end"
      >
        <Field label="Search" htmlFor="lic-q" help="LIC number, customer email, last name or company, or registration code.">
          <input id="lic-q" name="q" type="search" defaultValue={q} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Status" htmlFor="lic-status">
          <select id="lic-status" name="status" defaultValue={status} className={inputClass}>
            <option value="">All statuses</option>
            {LICENSE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
        </Field>
        <Field label="Product" htmlFor="lic-product">
          <select id="lic-product" name="product" defaultValue={product?.id ?? ""} className={inputClass}>
            <option value="">All products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Search</button>
          {filtered && <Link href="/admin/shop/software/licenses" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel title={`${result.total.toLocaleString("en-GB")} license${result.total === 1 ? "" : "s"}`} padded={false}>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={filtered ? "No licenses match" : "No licenses yet"}
              body={filtered ? "Try a different search, status or product." : "Licenses appear here after a purchase, or when staff add one above."}
            />
          </div>
        ) : (
          <div className="px-5 pb-4 sm:px-6">
            <LicensesTable licenses={rows} canWrite={canWrite} />
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefFor={(n) => `/admin/shop/software/licenses${qs({ q, status, product: product?.id, page: n > 1 ? n : undefined })}`}
            />
          </div>
        )}
      </Panel>
    </>
  );
}
