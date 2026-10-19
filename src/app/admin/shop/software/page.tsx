import Link from "next/link";
import { Plus } from "@phosphor-icons/react/ssr";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { listSoftwareProductsAdmin } from "@/modules/shop/services/software";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

export default async function SoftwareProductsPage() {
  const guard = await guardStaffPage("software:read", "/admin/shop/software");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/software" />;

  const role = guard.ctx.staff.role;
  const canWrite = roleHasPermission(role, "software:write");
  const canDownloads = roleHasPermission(role, "software:downloads-read");
  const canLicenses = roleHasPermission(role, "software:licenses-read");
  const products = await listSoftwareProductsAdmin();

  return (
    <>
      <PageHeader
        title="Software"
        description="Software products, their installer releases, downloads and licenses. Installers are stored privately and only signed-in customers can download them."
        actions={
          <>
            {canDownloads && <Link href="/admin/shop/software/downloads" className={btn.secondary}>Downloads</Link>}
            {canLicenses && <Link href="/admin/shop/software/licenses" className={btn.secondary}>Licenses</Link>}
            {canWrite && (
              <Link href="/admin/shop/software/new" className={btn.primary}>
                <Plus size={16} aria-hidden /> New product
              </Link>
            )}
          </>
        }
      />

      <Panel title={`${products.length} product${products.length === 1 ? "" : "s"}`} padded={products.length === 0}>
        {products.length === 0 ? (
          <EmptyState
            title="No software products yet"
            body="Create a product, upload its installer as a release, publish it and mark it current. Then make the product active."
            action={canWrite ? <Link href="/admin/shop/software/new" className={btn.primary}>New product</Link> : undefined}
          />
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Status</th>
                  <th className={th}>Current version</th>
                  <th className={`${th} text-right`}>License price</th>
                  <th className={`${th} text-right`}>Releases</th>
                  <th className={`${th} text-right`}>Downloads</th>
                  <th className={`${th} text-right`}>Licenses</th>
                  <th className={`${th} text-right`}>Pending activations</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={tr}>
                    <td className={td}>
                      <Link href={`/admin/shop/software/${p.id}`} className="font-medium text-neutral-950 hover:underline">{p.name}</Link>
                      <p className="font-mono text-xs text-neutral-500">{p.slug}</p>
                    </td>
                    <td className={td}><StatusBadge status={p.status} /></td>
                    <td className={td}>{p.currentVersion ? <span className="font-mono">{p.currentVersion}</span> : <span className="text-neutral-400">None</span>}</td>
                    <td className={`${td} text-right tabular-nums`}>
                      {p.defaultLicensePriceCents != null ? formatMoney(p.defaultLicensePriceCents, p.currency) : <span className="text-neutral-400">Not for sale</span>}
                    </td>
                    <td className={`${td} text-right tabular-nums`}>{p._count.releases}</td>
                    <td className={`${td} text-right tabular-nums`}>{p._count.downloads.toLocaleString("en-GB")}</td>
                    <td className={`${td} text-right tabular-nums`}>{p._count.licenses.toLocaleString("en-GB")}</td>
                    <td className={`${td} text-right tabular-nums`}>
                      {p.pendingActivations > 0 ? (
                        <Link href={`/admin/shop/software/activations?product=${p.id}`} className="font-semibold text-neutral-950 hover:underline">
                          {p.pendingActivations}
                        </Link>
                      ) : (
                        <span className="text-neutral-400">0</span>
                      )}
                    </td>
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
