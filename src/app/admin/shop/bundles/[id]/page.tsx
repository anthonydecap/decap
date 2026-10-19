import { notFound } from "next/navigation";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { bundlePublishIssues } from "@/modules/shop/services/admin-catalog";
import { AssetKindPanel } from "@/modules/shop/ui/admin/catalog/AssetFiles";
import { BundleForm } from "@/modules/shop/ui/admin/catalog/BundleForm";
import { PublishControls } from "@/modules/shop/ui/admin/catalog/PublishControls";
import { arrangementPickerOptions, getBundleAdmin, listBundleCoverVersions } from "@/modules/shop/ui/admin/catalog/queries";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { PageHeader, StatusBadge } from "@/modules/shop/ui/admin/primitives";
import { formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function BundleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await guardStaffPage("catalog:write", `/admin/shop/bundles/${id}`);
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  if (!UUID.test(id)) notFound();

  const bundle = await getBundleAdmin(id);
  if (!bundle) notFound();
  const arrangementIds = bundle.items.map((i) => i.arrangementId);
  const [options, issues, covers] = await Promise.all([
    arrangementPickerOptions(arrangementIds),
    bundlePublishIssues(id),
    listBundleCoverVersions(id),
  ]);
  const role = guard.ctx.staff.role;

  return (
    <>
      <PageHeader
        title={bundle.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{bundle.sku}</span>
            <span>{arrangementIds.length} arrangement{arrangementIds.length === 1 ? "" : "s"}</span>
            <span className="tabular-nums">{formatMoney(bundle.priceCents, bundle.currency)}</span>
          </span>
        }
        back={{ href: "/admin/shop/bundles", label: "Collections" }}
        actions={<StatusBadge status={bundle.status} />}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BundleForm
            initial={{
              id: bundle.id,
              sku: bundle.sku,
              slug: bundle.slug,
              title: bundle.title,
              subtitle: bundle.subtitle,
              description: bundle.description,
              priceCents: bundle.priceCents,
              featured: bundle.featured,
              status: bundle.status,
              arrangementIds,
            }}
            options={options}
          />
        </div>
        <div className="flex flex-col gap-6">
          <PublishControls
            key={`${bundle.status}-${bundle.updatedAt.toISOString()}-${issues.map((i) => i.code).join(",")}`}
            noun="collection"
            status={bundle.status}
            statusUrl={`/api/admin/shop/bundles/${bundle.id}/status`}
            initialIssues={issues}
          />
          <AssetKindPanel
            kind="COVER_IMAGE"
            title="Cover image"
            description="Public artwork shown on the storefront."
            versions={covers.flatMap((a) => a.versions)}
            presignUrl={`/api/admin/shop/bundles/${bundle.id}/assets`}
            canUpload={roleHasPermission(role, "assets:upload")}
            canDownload={roleHasPermission(role, "assets:download-master")}
          />
        </div>
      </div>
    </>
  );
}
