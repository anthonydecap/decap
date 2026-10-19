import Link from "next/link";
import { notFound } from "next/navigation";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { arrangementPublishIssues, catalogLookups, getArrangementAdmin } from "@/modules/shop/services/admin-catalog";
import { listArrangementAssets } from "@/modules/shop/services/assets";
import { ArrangementForm, type ArrangementInitial } from "@/modules/shop/ui/admin/catalog/ArrangementForm";
import { ArrangementFiles } from "@/modules/shop/ui/admin/catalog/AssetFiles";
import { PublishControls } from "@/modules/shop/ui/admin/catalog/PublishControls";
import { SegmentedLinks } from "@/modules/shop/ui/admin/catalog/ui";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { EmptyState, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const TABS = ["details", "files", "publishing"] as const;
type Tab = (typeof TABS)[number];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ArrangementEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const guard = await guardStaffPage("catalog:write", `/admin/shop/arrangements/${id}`);
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  if (!UUID.test(id)) notFound();

  const sp = await searchParams;
  const rawTab = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "details";

  const a = await getArrangementAdmin(id);
  if (!a) notFound();

  const role = guard.ctx.staff.role;
  const base = `/admin/shop/arrangements/${id}`;

  return (
    <>
      <PageHeader
        title={a.displayTitle}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{a.sku}</span>
            <span>{a.work.title}, arranged by {a.arranger.name}</span>
            <span className="tabular-nums">{formatMoney(a.priceCents, a.currency)}</span>
          </span>
        }
        back={{ href: "/admin/shop/arrangements", label: "Arrangements" }}
        actions={<StatusBadge status={a.status} />}
      />
      <SegmentedLinks
        label="Arrangement sections"
        current={tab}
        items={[
          { key: "details", label: "Details", href: `${base}?tab=details` },
          { key: "files", label: "Files", href: `${base}?tab=files` },
          { key: "publishing", label: "Publishing", href: `${base}?tab=publishing` },
        ]}
      />

      {tab === "details" && <DetailsTab a={a} />}
      {tab === "files" && (
        <FilesTab
          id={id}
          canUpload={roleHasPermission(role, "assets:upload")}
          canDownload={roleHasPermission(role, "assets:download-master")}
        />
      )}
      {tab === "publishing" && <PublishingTab a={a} />}
    </>
  );
}

type Loaded = NonNullable<Awaited<ReturnType<typeof getArrangementAdmin>>>;

async function DetailsTab({ a }: { a: Loaded }) {
  const lookups = await catalogLookups();
  const initial: ArrangementInitial = {
    id: a.id,
    sku: a.sku,
    slug: a.slug,
    workId: a.workId,
    arrangerId: a.arrangerId,
    displayTitle: a.displayTitle,
    subtitle: a.subtitle,
    description: a.description,
    priceCents: a.priceCents,
    durationSeconds: a.durationSeconds,
    tempoBpm: a.tempoBpm,
    musicalKey: a.musicalKey,
    timeSignature: a.timeSignature,
    difficulty: a.difficulty,
    releaseDate: a.releaseDate,
    featured: a.featured,
    searchKeywords: a.searchKeywords,
    compatibilityNotes: a.compatibilityNotes,
    containsMidi: a.containsMidi,
    containsAudio: a.containsAudio,
    containsVideo: a.containsVideo,
    dmiFormatVersion: a.dmiFormatVersion,
    internalNotes: a.internalNotes,
    royaltyBasis: a.royaltyBasis,
    royaltyRateBps: a.royaltyRateBps,
    royaltyFixedCents: a.royaltyFixedCents,
    genreIds: a.genres.map((g) => g.id),
    tagIds: a.tags.map((t) => t.id),
    compatibility: a.compatibilities.map((c) => ({ systemProfileId: c.systemProfileId, notes: c.notes })),
    rightsStatus: a.rightsStatus,
    rightsTerritory: a.rightsTerritory,
    licenseReference: a.licenseReference,
    licenseStartsAt: a.licenseStartsAt,
    licenseEndsAt: a.licenseEndsAt,
    rightsNotes: a.rightsNotes,
  };
  return <ArrangementForm initial={initial} lookups={lookups} status={a.status} />;
}

async function FilesTab({ id, canUpload, canDownload }: { id: string; canUpload: boolean; canDownload: boolean }) {
  const assets = await listArrangementAssets(id);
  return <ArrangementFiles arrangementId={id} assets={assets} canUpload={canUpload} canDownload={canDownload} />;
}

async function PublishingTab({ a }: { a: Loaded }) {
  const issues = await arrangementPublishIssues(a.id);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <PublishControls
          key={`${a.status}-${a.updatedAt.toISOString()}-${issues.map((i) => i.code).join(",")}`}
          noun="arrangement"
          status={a.status}
          statusUrl={`/api/admin/shop/arrangements/${a.id}/status`}
          checkUrl={`/api/admin/shop/arrangements/${a.id}/publish-check`}
          initialIssues={issues}
        />
      </div>
      <Panel title="In collections" className="lg:col-span-2" padded={a.bundleItems.length === 0}>
        {a.bundleItems.length === 0 ? (
          <EmptyState title="Not in any collection" body="Add it to a collection from the collection editor." />
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Collection</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {a.bundleItems.map((bi) => (
                  <tr key={bi.bundle.id} className={tr}>
                    <td className={td}>
                      <Link href={`/admin/shop/bundles/${bi.bundle.id}`} className="font-medium text-neutral-950 hover:underline">{bi.bundle.title}</Link>
                      <p className="font-mono text-xs text-neutral-500">{bi.bundle.sku}</p>
                    </td>
                    <td className={td}><StatusBadge status={bi.bundle.status} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
    </div>
  );
}
