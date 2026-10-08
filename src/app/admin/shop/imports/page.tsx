import { DownloadSimple, Plus } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { listImportBatches } from "@/modules/shop/services/imports";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatDateTime } from "@/modules/shop/ui/format";

const TEMPLATE_URL = "/api/admin/shop/imports/template";

export const dynamic = "force-dynamic";

export default async function ImportHistoryPage() {
  const guard = await guardStaffPage("imports:manage", "/admin/shop/imports");
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  const batches = await listImportBatches();

  return (
    <>
      <PageHeader
        title="Bulk import"
        description="Upload many masters, previews and covers at once, optionally with a metadata CSV. Imports create drafts only; nothing is published automatically."
        actions={
          <>
            <a className={btn.secondary} href={TEMPLATE_URL} download>
              <DownloadSimple size={16} /> Download CSV template
            </a>
            <Link className={btn.primary} href="/admin/shop/imports/new">
              <Plus size={16} /> New import
            </Link>
          </>
        }
      />

      <Panel title="Import history" description="The 100 most recent batches." padded={false}>
        {batches.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No imports yet"
              body="Start a bulk import to upload a folder of files and map them to arrangements."
              action={<Link className={btn.primary} href="/admin/shop/imports/new">New import</Link>}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Batch</th>
                  <th className={th}>Created by</th>
                  <th className={th}>Created</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Ready</th>
                  <th className={`${th} text-right`}>Failed</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className={tr}>
                    <td className={`${td} max-w-[18rem]`}>
                      <Link className="block truncate font-medium text-neutral-950 hover:underline" href={`/admin/shop/imports/${b.id}`}>
                        {b.label || "Untitled import"}
                      </Link>
                      {b.manifestFilename && <p className="truncate text-xs text-neutral-500">{b.manifestFilename}</p>}
                    </td>
                    <td className={`${td} max-w-[14rem] truncate`}>{b.createdBy.displayName ?? b.createdBy.email ?? "Staff"}</td>
                    <td className={td}>{formatDateTime(b.createdAt)}</td>
                    <td className={td}><StatusBadge status={b.status} /></td>
                    <td className={`${td} text-right tabular-nums`}>{b.validItems}</td>
                    <td className={`${td} text-right tabular-nums`}>{b.failedItems}</td>
                    <td className={`${td} text-right tabular-nums`}>{b.totalItems}</td>
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
