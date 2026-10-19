import "server-only";
import Link from "next/link";
import { formatOrderNumber } from "../../../services/checkout";
import type { listSoftwareDownloads } from "../../../services/software";
import { licenseNumber, type listLicensesAdmin } from "../../../services/software-licensing";
import { formatDateTime } from "../../format";
import { EmptyState, Pagination, Table, td, th, tr } from "../primitives";
import { archLabel, channelLabel, customerLabel, downloadSourceLabel, platformLabel } from "./labels";
import type { LicenseRow } from "./LicensesTable";

/** Server-only helpers shared by the software admin pages. Activation keys never pass here. */

type LicenseItem = Awaited<ReturnType<typeof listLicensesAdmin>>["items"][number];

export function toLicenseRow(l: LicenseItem): LicenseRow {
  return {
    id: l.id,
    number: licenseNumber(l.number),
    status: l.status,
    licenseSource: l.licenseSource,
    purchasedAt: l.purchasedAt.toISOString(),
    maxActivations: l.maxActivations,
    activeInstallations: l._count.installations,
    customer: { id: l.customer.id, label: customerLabel(l.customer), email: l.customer.email },
    product: { id: l.product.id, name: l.product.name },
    order: l.order ? { id: l.order.id, number: formatOrderNumber(l.order.number) } : null,
  };
}

type Downloads = Awaited<ReturnType<typeof listSoftwareDownloads>>;

export function DownloadsTable({
  data,
  showProduct,
  hrefFor,
  emptyBody,
}: {
  data: Downloads;
  showProduct: boolean;
  hrefFor: (page: number) => string;
  emptyBody: string;
}) {
  if (data.items.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="No downloads yet" body={emptyBody} />
      </div>
    );
  }
  return (
    <div className="px-5 pb-4 sm:px-6">
      <Table>
        <thead>
          <tr>
            <th className={th}>Date</th>
            <th className={th}>Customer</th>
            {showProduct && <th className={th}>Product</th>}
            <th className={th}>Version</th>
            <th className={th}>Platform</th>
            <th className={th}>Source</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((d) => (
            <tr key={d.id} className={tr}>
              <td className={`${td} tabular-nums`}>{formatDateTime(d.downloadedAt)}</td>
              <td className={`${td} max-w-[16rem]`}>
                <Link href={`/admin/shop/customers/${d.customer.id}`} className="block truncate font-medium text-neutral-950 hover:underline">
                  {customerLabel(d.customer)}
                </Link>
                <p className="truncate text-xs text-neutral-500">{d.customer.email}</p>
              </td>
              {showProduct && (
                <td className={td}>
                  <Link href={`/admin/shop/software/${d.product.id}`} className="hover:text-neutral-950 hover:underline">{d.product.name}</Link>
                </td>
              )}
              <td className={td}>
                <span className="font-mono">{d.release.version}</span>
                {d.release.releaseChannel !== "STABLE" && <span className="ml-2 text-xs text-neutral-500">{channelLabel(d.release.releaseChannel)}</span>}
              </td>
              <td className={td}>{platformLabel(d.release.platform)} <span className="text-neutral-500">{archLabel(d.release.architecture)}</span></td>
              <td className={td}>{downloadSourceLabel(d.source)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={data.page} pageCount={data.pageCount} hrefFor={hrefFor} />
    </div>
  );
}
