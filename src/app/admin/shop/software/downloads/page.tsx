import Link from "next/link";
import { listSoftwareDownloads, listSoftwareProductsAdmin } from "@/modules/shop/services/software";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, Field, inputClass, PageHeader, Panel } from "@/modules/shop/ui/admin/primitives";
import { firstParam, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { DownloadsTable } from "@/modules/shop/ui/admin/software/server";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SoftwareDownloadsPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("software:downloads-read", "/admin/shop/software/downloads");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/software/downloads" />;

  const sp = await searchParams;
  const products = await listSoftwareProductsAdmin();
  const rawProduct = firstParam(sp.product) ?? "";
  const product = products.find((p) => p.id === rawProduct);
  const page = pageParam(sp.page);
  const data = await listSoftwareDownloads({ productId: product?.id, page });

  return (
    <>
      <PageHeader
        title="Software downloads"
        description="Every installer download by a signed-in customer. A download only means the customer fetched the installer; it is not proof of a license."
        back={{ href: "/admin/shop/software", label: "Software" }}
      />

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[minmax(0,20rem)_auto] sm:items-end">
        <Field label="Product" htmlFor="dl-product">
          <select id="dl-product" name="product" defaultValue={product?.id ?? ""} className={inputClass}>
            <option value="">All products</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Filter</button>
          {product && <Link href="/admin/shop/software/downloads" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel title={`${data.total.toLocaleString("en-GB")} download${data.total === 1 ? "" : "s"}${product ? ` of ${product.name}` : ""}`} padded={false}>
        <DownloadsTable
          data={data}
          showProduct={!product}
          hrefFor={(n) => `/admin/shop/software/downloads${qs({ product: product?.id, page: n > 1 ? n : undefined })}`}
          emptyBody={product ? "Nobody has downloaded this product yet." : "Downloads appear here when signed-in customers download a published release."}
        />
      </Panel>
    </>
  );
}
