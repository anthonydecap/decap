import Link from "next/link";
import { notFound } from "next/navigation";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { getSoftwareProductAdmin, listSoftwareDownloads } from "@/modules/shop/services/software";
import { listLicensesAdmin } from "@/modules/shop/services/software-licensing";
import { SegmentedLinks } from "@/modules/shop/ui/admin/catalog/ui";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Notice, PageHeader, Panel, Stat, StatusBadge } from "@/modules/shop/ui/admin/primitives";
import { firstParam, humanize, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { LICENSE_STATUSES } from "@/modules/shop/ui/admin/software/labels";
import { LicensesTable } from "@/modules/shop/ui/admin/software/LicensesTable";
import { SoftwareProductForm } from "@/modules/shop/ui/admin/software/ProductForm";
import { SoftwareProductImages } from "@/modules/shop/ui/admin/software/ProductImages";
import { SoftwareProductStatus } from "@/modules/shop/ui/admin/software/ProductStatus";
import { ReleasesTable, type ReleaseRow } from "@/modules/shop/ui/admin/software/ReleasesTable";
import { ReleaseUpload } from "@/modules/shop/ui/admin/software/ReleaseUpload";
import { DownloadsTable, toLicenseRow } from "@/modules/shop/ui/admin/software/server";
import { formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const TABS = ["product", "releases", "downloads", "licenses"] as const;
type Tab = (typeof TABS)[number];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Loaded = NonNullable<Awaited<ReturnType<typeof getSoftwareProductAdmin>>>;

export default async function SoftwareProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const guard = await guardStaffPage("software:read", `/admin/shop/software/${id}`);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/software" />;
  if (!UUID.test(id)) notFound();

  const sp = await searchParams;
  const rawTab = firstParam(sp.tab);
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "product";

  const data = await getSoftwareProductAdmin(id);
  if (!data) notFound();
  const { product: p } = data;

  const role = guard.ctx.staff.role;
  const can = {
    write: roleHasPermission(role, "software:write"),
    releaseWrite: roleHasPermission(role, "software:release-write"),
    publish: roleHasPermission(role, "software:release-publish"),
    downloads: roleHasPermission(role, "software:downloads-read"),
    licenses: roleHasPermission(role, "software:licenses-read"),
    licensesWrite: roleHasPermission(role, "software:licenses-write"),
  };
  const base = `/admin/shop/software/${id}`;

  return (
    <>
      <PageHeader
        title={p.name}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-xs">{p.slug}</span>
            <span>{p.currentVersion ? `Current version ${p.currentVersion}` : "No current version"}</span>
            <span className="tabular-nums">{p.defaultLicensePriceCents != null ? formatMoney(p.defaultLicensePriceCents, p.currency) : "Not for sale"}</span>
          </span>
        }
        back={{ href: "/admin/shop/software", label: "Software" }}
        actions={<StatusBadge status={p.status} />}
      />
      <SegmentedLinks
        label="Software product sections"
        current={tab}
        items={[
          { key: "product", label: "Product", href: `${base}?tab=product` },
          { key: "releases", label: `Releases (${data.releases.length})`, href: `${base}?tab=releases` },
          { key: "downloads", label: "Downloads", href: `${base}?tab=downloads`, disabled: !can.downloads },
          { key: "licenses", label: "Licenses", href: `${base}?tab=licenses`, disabled: !can.licenses },
        ]}
      />

      {tab === "product" && <ProductTab data={data} canWrite={can.write} canPublish={can.publish} />}
      {tab === "releases" && <ReleasesTab data={data} canUpload={can.releaseWrite} canPublish={can.publish} />}
      {tab === "downloads" &&
        (can.downloads ? <DownloadsTab productId={id} page={pageParam(sp.page)} total={data.downloadCount} /> : <NoTabAccess />)}
      {tab === "licenses" && (can.licenses ? <LicensesTab data={data} canWrite={can.licensesWrite} /> : <NoTabAccess />)}
    </>
  );
}

function NoTabAccess() {
  return <Notice tone="error">Your role cannot open this section.</Notice>;
}

function ProductTab({ data, canWrite, canPublish }: { data: Loaded; canWrite: boolean; canPublish: boolean }) {
  const p = data.product;
  const hasCurrentStable = data.releases.some((r) => r.status === "PUBLISHED" && r.isCurrent && r.releaseChannel === "STABLE");
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <SoftwareProductForm
          canWrite={canWrite}
          initial={{
            id: p.id,
            slug: p.slug,
            name: p.name,
            shortDescription: p.shortDescription,
            description: p.description,
            systemRequirements: p.systemRequirements,
            activationInstructions: p.activationInstructions,
            trialAvailable: p.trialAvailable,
            licenseRequiredForFullUse: p.licenseRequiredForFullUse,
            defaultLicensePriceCents: p.defaultLicensePriceCents,
            defaultMaxActivations: p.defaultMaxActivations,
            sortOrder: p.sortOrder,
          }}
        />
      </div>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <SoftwareProductStatus productId={p.id} slug={p.slug} status={p.status} hasCurrentStable={hasCurrentStable} canPublish={canPublish} />
        <SoftwareProductImages productId={p.id} coverUrl={data.coverUrl} iconUrl={data.iconUrl} canWrite={canWrite} />
      </div>
    </div>
  );
}

function toReleaseRow(r: Loaded["releases"][number]): ReleaseRow {
  const errors = Array.isArray(r.validationErrors)
    ? (r.validationErrors as unknown[]).filter((e): e is { code: string; message: string } =>
        typeof e === "object" && e !== null && typeof (e as { message?: unknown }).message === "string")
    : [];
  return {
    id: r.id,
    version: r.version,
    platform: r.platform,
    architecture: r.architecture,
    releaseChannel: r.releaseChannel,
    status: r.status,
    isCurrent: r.isCurrent,
    isDownloadable: r.isDownloadable,
    bytes: r.fileSizeBytes,
    sha256: r.sha256,
    originalFilename: r.originalFilename,
    uploadedBy: r.createdBy ? r.createdBy.displayName || r.createdBy.email : null,
    uploadedAt: r.uploadedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    downloadCount: r.downloadCount,
    releaseNotes: r.releaseNotes,
    minimumOsVersion: r.minimumOsVersion,
    validationErrors: errors.map((e) => ({ code: String(e.code ?? "ERROR"), message: e.message })),
  };
}

function ReleasesTab({ data, canUpload, canPublish }: { data: Loaded; canUpload: boolean; canPublish: boolean }) {
  const rows = data.releases.map(toReleaseRow);
  return (
    <div className="flex flex-col gap-6">
      <Notice>
        Releases are immutable: an uploaded installer is never replaced. A new build is a new release. Uploading creates a draft that
        customers cannot see. Publish it, then mark it current: customers download the current release for their platform, and the
        product needs a current Stable release before it can be made active.
      </Notice>
      {canUpload ? <ReleaseUpload productId={data.product.id} /> : <Notice>Your role cannot upload releases.</Notice>}
      <Panel title="Releases" description="Staff downloads are recorded in the audit log." padded={false}>
        <div className={rows.length === 0 ? "p-6" : "px-5 pb-2 sm:px-6"}>
          <ReleasesTable releases={rows} canPublish={canPublish} canEdit={canUpload} />
        </div>
      </Panel>
    </div>
  );
}

async function DownloadsTab({ productId, page, total }: { productId: string; page: number; total: number }) {
  const downloads = await listSoftwareDownloads({ productId, page });
  return (
    <Panel
      title={`${total.toLocaleString("en-GB")} download${total === 1 ? "" : "s"}`}
      description="A download only means the customer fetched the installer. It is not proof of a license."
      actions={<Link href={`/admin/shop/software/downloads?product=${productId}`} className={btn.ghost}>All downloads</Link>}
      padded={false}
    >
      <DownloadsTable
        data={downloads}
        showProduct={false}
        hrefFor={(n) => `/admin/shop/software/${productId}${qs({ tab: "downloads", page: n > 1 ? n : undefined })}`}
        emptyBody="Downloads appear here when signed-in customers download a published release."
      />
    </Panel>
  );
}

async function LicensesTab({ data, canWrite }: { data: Loaded; canWrite: boolean }) {
  const productId = data.product.id;
  const recent = await listLicensesAdmin({ productId });
  const rows = recent.items.slice(0, 10).map(toLicenseRow);
  const href = `/admin/shop/software/licenses?product=${productId}`;
  const counts = data.licenseCounts as Record<string, number | undefined>;
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Total" value={recent.total.toLocaleString("en-GB")} />
        {LICENSE_STATUSES.map((s) => (
          <Stat key={s} label={humanize(s)} value={(counts[s] ?? 0).toLocaleString("en-GB")} />
        ))}
      </div>
      <Panel
        title="Most recent licenses"
        actions={<Link href={href} className={btn.secondary}>Manage licenses</Link>}
        padded={rows.length === 0}
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No licenses yet"
            body="Licenses are created when a customer buys one, or by staff for manual grants, promotions and legacy customers."
            action={canWrite ? <Link href={href} className={btn.primary}>Add license</Link> : undefined}
          />
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <LicensesTable licenses={rows} canWrite={canWrite} />
          </div>
        )}
      </Panel>
    </div>
  );
}
