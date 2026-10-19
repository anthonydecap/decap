import clsx from "clsx";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { listSoftwareProductsAdmin } from "@/modules/shop/services/software";
import { ACTIVATION_FILTERS, activationNumber, activationQueue, licenseNumber, type ActivationFilter } from "@/modules/shop/services/software-licensing";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { firstParam, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { Flag, groupCode, LICENSE_SOURCE_LABEL, SoftwareBadge, staffName } from "@/modules/shop/ui/admin/software-activations/labels";
import { personName, requestTime, timeAgo } from "@/modules/shop/ui/admin/support/labels";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PATH = "/admin/shop/software/activations";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPTY_COPY: Partial<Record<ActivationFilter, string>> = {
  needs_action: "No registration code is waiting for staff. Nice work.",
  new: "No new activation requests.",
  waiting_customer: "No request is waiting for a customer answer.",
  conflicts: "No registration code conflicts to review.",
  mine: "No open activation requests are assigned to you.",
};

export default async function AdminActivationQueuePage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("software:activations-read", PATH);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={PATH} />;

  const sp = await searchParams;
  const rawFilter = firstParam(sp.filter) ?? "";
  const filter: ActivationFilter = rawFilter in ACTIVATION_FILTERS ? (rawFilter as ActivationFilter) : "needs_action";
  const q = firstParam(sp.q)?.trim() ?? "";
  const rawProduct = firstParam(sp.product) ?? "";
  const productId = UUID.test(rawProduct) ? rawProduct : "";
  const page = pageParam(sp.page);

  const [result, products] = await Promise.all([
    activationQueue({ filter, productId: productId || undefined, q: q || undefined, page, staffId: guard.ctx.staff.id }),
    listSoftwareProductsAdmin(),
  ]);
  const now = requestTime();
  const keep = { q: q || undefined, product: productId || undefined };
  const filterParam = result.filter === "needs_action" ? undefined : result.filter;
  const productName = products.find((p) => p.id === productId)?.name;

  return (
    <>
      <PageHeader
        title="Software activations"
        description="Registration codes waiting for an activation key. Oldest first, so nobody waits longer than needed. Search by ACT number, registration code or customer."
      />

      <nav aria-label="Activation filters" className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {(Object.keys(ACTIVATION_FILTERS) as ActivationFilter[]).map((f) => {
            const active = f === result.filter;
            const count = result.counts[f];
            return (
              <li key={f}>
                <Link
                  href={`${PATH}${qs({ filter: f === "needs_action" ? undefined : f, ...keep })}`}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                    active ? "bg-neutral-950 text-white" : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950 hover:text-neutral-950",
                  )}
                >
                  {ACTIVATION_FILTERS[f]}
                  {count !== undefined && (
                    <span className={clsx("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600")}>
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_14rem_auto] sm:items-end">
        {filterParam && <input type="hidden" name="filter" value={filterParam} />}
        <Field label="Search" htmlFor="act-q">
          <input id="act-q" name="q" type="search" defaultValue={q} className={inputClass} autoComplete="off" placeholder="ACT-1042, registration code, email or company" />
        </Field>
        <Field label="Software" htmlFor="act-product">
          <select id="act-product" name="product" defaultValue={productId} className={inputClass}>
            <option value="">All software</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>
            <MagnifyingGlass size={16} weight="bold" aria-hidden />
            Search
          </button>
          {(q || productId) && (
            <Link href={`${PATH}${qs({ filter: filterParam })}`} className={btn.ghost}>Clear</Link>
          )}
        </div>
      </form>

      <Panel
        title={`${ACTIVATION_FILTERS[result.filter]}: ${result.total.toLocaleString("en-GB")} request${result.total === 1 ? "" : "s"}`}
        description={[q ? `Matching "${q}"` : null, productName ? `Software: ${productName}` : null].filter(Boolean).join(", ") || undefined}
        padded={false}
      >
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={q || productId ? "No requests match" : "No requests here"}
              body={q || productId ? "Try another search, or switch to All." : (EMPTY_COPY[result.filter] ?? "No activation requests in this view right now.")}
              action={result.filter !== "all" || q || productId ? <Link className={btn.secondary} href={`${PATH}?filter=all`}>Show all requests</Link> : undefined}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Request</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Software</th>
                  <th className={th}>License</th>
                  <th className={th}>Registration</th>
                  <th className={th}>Status</th>
                  <th className={th}>Flags</th>
                  <th className={th}>Assigned</th>
                  <th className={th}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((r) => {
                  const href = `${PATH}/${r.id}`;
                  const name = personName(r.customer);
                  return (
                    <tr key={r.id} className={tr}>
                      <td className={td}>
                        <Link href={href} className="font-semibold text-neutral-950 tabular-nums hover:underline">{activationNumber(r.number)}</Link>
                      </td>
                      <td className={`${td} max-w-[15rem]`}>
                        <p className="truncate font-medium text-neutral-950">{r.customer.companyName ?? name ?? r.customer.email}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {r.customer.companyName && name ? `${name}, ` : ""}
                          {r.customer.email}
                        </p>
                      </td>
                      <td className={td}>{r.product.name}</td>
                      <td className={td}>
                        <p className="tabular-nums">{licenseNumber(r.license.number)}</p>
                        <p className="text-xs text-neutral-500">{LICENSE_SOURCE_LABEL[r.license.licenseSource] ?? r.license.licenseSource}</p>
                      </td>
                      <td className={td}>
                        <Link href={href} className="font-mono text-sm text-neutral-950 hover:underline">{groupCode(r.registrationCode)}</Link>
                      </td>
                      <td className={td}><SoftwareBadge kind="activation" status={r.status} /></td>
                      <td className={td}>
                        <span className="flex flex-wrap gap-1">
                          {r.conflictInstallationId && <Flag strong>Review needed</Flag>}
                          {r.replacesInstallationId && <Flag>Replacement</Flag>}
                          {!r.conflictInstallationId && !r.replacesInstallationId && <span className="text-neutral-400">None</span>}
                        </span>
                      </td>
                      <td className={td}>{staffName(r.assignedStaff) ?? <span className="text-neutral-400">Unassigned</span>}</td>
                      <td className={`${td} tabular-nums`} title={r.submittedAt.toISOString()}>{timeAgo(r.submittedAt, now)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>

      <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => `${PATH}${qs({ filter: filterParam, ...keep, page: p })}`} />
    </>
  );
}
