import Link from "next/link";
import type { Prisma } from "@/modules/shop/db";
import { listAuditLog } from "@/modules/shop/services/admin-ops";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel } from "@/modules/shop/ui/admin/primitives";
import { firstParam, humanize, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { formatDateTime } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Metadata is sanitized server-side; this is a second line of defence for anything key-shaped. */
const SENSITIVE_KEY = /secret|token|password|passwd|signature|signed.?url|credential|authorization|api.?key|private/i;
const MAX_VALUE = 140;

function renderValue(v: Prisma.JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "string") return v.length > MAX_VALUE ? `${v.slice(0, MAX_VALUE)}...` : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  const s = JSON.stringify(v);
  return s.length > MAX_VALUE ? `${s.slice(0, MAX_VALUE)}...` : s;
}

function metadataPairs(meta: Prisma.JsonValue | null): [string, string][] {
  if (meta === null || meta === undefined) return [];
  if (typeof meta !== "object" || Array.isArray(meta)) return [["value", renderValue(meta)]];
  return Object.entries(meta).map(([k, v]) => [k, SENSITIVE_KEY.test(k) ? "hidden" : renderValue(v ?? null)]);
}

const ENTITY_LINKS: Record<string, string> = {
  Order: "/admin/shop/orders/",
  Customer: "/admin/shop/customers/",
};

export default async function AdminAuditPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("audit:read", "/admin/shop/audit");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/audit" />;

  const sp = await searchParams;
  const action = firstParam(sp.action)?.trim() ?? "";
  const entityType = firstParam(sp.entityType)?.trim() ?? "";
  const entityId = firstParam(sp.entityId)?.trim() ?? "";
  const page = pageParam(sp.page);
  const result = await listAuditLog({
    action: action || undefined,
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    page,
  });
  const filtered = Boolean(action || entityType || entityId);

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every staff action, payment event and system change, newest first. Metadata is sanitized before it is stored."
      />

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <Field label="Action starts with" htmlFor="audit-action" help="For example refund or entitlement.grant">
          <input id="audit-action" name="action" defaultValue={action} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Entity type" htmlFor="audit-type" help="Exact match, for example Order">
          <input id="audit-type" name="entityType" defaultValue={entityType} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Entity id" htmlFor="audit-id">
          <input id="audit-id" name="entityId" defaultValue={entityId} className={inputClass} autoComplete="off" />
        </Field>
        <div className="flex gap-2 lg:mb-5">
          <button type="submit" className={btn.primary}>Filter</button>
          {filtered && <Link href="/admin/shop/audit" className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <Panel title={`${result.total.toLocaleString("en-GB")} entr${result.total === 1 ? "y" : "ies"}`} padded={false}>
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={filtered ? "No entries match" : "Nothing recorded yet"}
              body={filtered ? "Try a shorter action prefix or clear the filters." : undefined}
            />
          </div>
        ) : (
          <ol className="divide-y divide-neutral-100">
            {result.items.map((a) => {
              const actorId = a.actorStaffId ?? a.actorCustomerId;
              const pairs = metadataPairs(a.metadata);
              const entityHref = a.entityId && ENTITY_LINKS[a.entityType] ? `${ENTITY_LINKS[a.entityType]}${a.entityId}` : null;
              return (
                <li key={a.id} className="grid grid-cols-1 gap-2 px-5 py-4 text-sm sm:px-6 md:grid-cols-[11rem_1fr]">
                  <div className="text-xs text-neutral-500">
                    <p className="tabular-nums">{formatDateTime(a.createdAt)}</p>
                    <p className="mt-0.5">
                      {humanize(a.actorType)}
                      {actorId && <span className="block break-all font-mono">{actorId}</span>}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium text-neutral-950">{a.action}</p>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      <Link className="hover:underline" href={`/admin/shop/audit${qs({ entityType: a.entityType })}`}>
                        {a.entityType}
                      </Link>
                      {a.entityId && (
                        <>
                          {" "}
                          {entityHref ? (
                            <Link className="break-all font-mono hover:underline" href={entityHref}>{a.entityId}</Link>
                          ) : (
                            <Link
                              className="break-all font-mono hover:underline"
                              href={`/admin/shop/audit${qs({ entityType: a.entityType, entityId: a.entityId })}`}
                            >
                              {a.entityId}
                            </Link>
                          )}
                        </>
                      )}
                    </p>
                    {pairs.length > 0 && (
                      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {pairs.map(([k, v]) => (
                          <div key={k} className="flex min-w-0 max-w-full gap-1">
                            <dt className="shrink-0 text-neutral-500">{k}</dt>
                            <dd className="min-w-0 break-all text-neutral-800">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(p) => `/admin/shop/audit${qs({ action, entityType, entityId, page: p })}`}
      />
    </>
  );
}
