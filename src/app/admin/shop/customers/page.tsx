import clsx from "clsx";
import Link from "next/link";
import { ArrowRight, Warning } from "@phosphor-icons/react/ssr";
import { CUSTOMER_VIEWS, searchCrmCustomers, type CustomerView } from "@/modules/shop/services/crm-admin";
import { CRM_STATUSES, displayCustomer, optionLabel } from "@/modules/shop/ui/admin/crm/labels";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { customerName, firstParam, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { formatDate } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * A query that looks like a reference rather than a name: a SUP- / DMI- number, or a
 * code with digits and no spaces or @ (registration code, identifier, serial).
 */
function looksLikeReference(q: string): boolean {
  if (/^(SUP|DMI)-?\d+$/i.test(q)) return true;
  const compact = q.replace(/[\s-]/g, "");
  return !q.includes("@") && compact.length >= 5 && /\d/.test(compact) && /^[A-Za-z0-9./-]+$/.test(compact);
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("customers:read", "/admin/shop/customers");
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo="/admin/shop/customers" />;

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? "";
  const rawView = firstParam(sp.view) ?? "all";
  const view: CustomerView = rawView in CUSTOMER_VIEWS ? (rawView as CustomerView) : "all";
  const page = pageParam(sp.page);
  const result = await searchCrmCustomers({ q: q || undefined, view, page });
  const single = q && looksLikeReference(q) && result.total === 1 ? result.items[0] : null;

  return (
    <>
      <PageHeader title="Customers" description="The CRM. Find a customer by anything you have in hand, including the code on their player." />

      <form method="get" className="mb-4 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-end">
        {view !== "all" && <input type="hidden" name="view" value={view} />}
        <Field
          label="Search"
          htmlFor="customers-q"
          help="Name, email, company, VAT, phone, registration code, serial number, or a DMI- order or SUP- ticket number."
        >
          <input id="customers-q" name="q" type="search" defaultValue={q} className={inputClass} autoComplete="off" />
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>Search</button>
          {q && <Link href={`/admin/shop/customers${qs({ view: view === "all" ? undefined : view })}`} className={btn.ghost}>Clear</Link>}
        </div>
      </form>

      <nav aria-label="Saved views" className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 sm:flex-wrap">
          {(Object.entries(CUSTOMER_VIEWS) as [CustomerView, string][]).map(([key, label]) => (
            <li key={key}>
              <Link
                href={`/admin/shop/customers${qs({ q, view: key === "all" ? undefined : key })}`}
                aria-current={key === view ? "page" : undefined}
                className={clsx(
                  "block whitespace-nowrap rounded-full border px-3 py-1 text-sm transition",
                  key === view ? "border-neutral-950 bg-neutral-950 font-semibold text-white" : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950",
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {single && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-neutral-950 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm">
            <p className="text-neutral-500">
              <span className="font-mono text-neutral-950">{q}</span> belongs to
            </p>
            <p className="font-display text-lg font-bold text-neutral-950">{displayCustomer(single)}</p>
            <p className="truncate text-neutral-600">{single.email}</p>
          </div>
          <Link href={`/admin/shop/customers/${single.id}`} className={btn.primary}>
            Open customer <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      )}

      <Panel title={`${result.total.toLocaleString("en-GB")} customer${result.total === 1 ? "" : "s"}`} description={view !== "all" ? CUSTOMER_VIEWS[view] : undefined} padded={false}>
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={q || view !== "all" ? "No customers match" : "No customers yet"}
              body={q || view !== "all" ? "Try a different search or view." : "Customers appear after their first sign-in to the shop."}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Customer</th>
                  <th className={th}>Email</th>
                  <th className={th}>CRM status</th>
                  <th className={th}>Tags</th>
                  <th className={`${th} text-right`}>Active players</th>
                  <th className={`${th} text-right`}>Orders</th>
                  <th className={`${th} text-right`}>Open tickets</th>
                  <th className={th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((c) => {
                  const name = customerName(c);
                  const tags = c.tags.map((t) => t.tag).sort((a, b) => Number(b.isAlert) - Number(a.isAlert));
                  return (
                    <tr key={c.id} className={tr}>
                      <td className={`${td} max-w-[16rem]`}>
                        <Link className="block truncate font-medium text-neutral-950 hover:underline" href={`/admin/shop/customers/${c.id}`}>
                          {c.companyName ?? name ?? c.email}
                        </Link>
                        <p className="truncate text-xs text-neutral-500">
                          {c.accountType === "BUSINESS" ? "Business" : "Individual"}
                          {c.companyName && name ? `, ${name}` : ""}
                        </p>
                      </td>
                      <td className={`${td} max-w-[16rem] truncate`}>{c.email}</td>
                      <td className={td}>{optionLabel(CRM_STATUSES, c.crmStatus)}</td>
                      <td className={td}>
                        {tags.length === 0 ? (
                          <span className="text-neutral-400">None</span>
                        ) : (
                          <span className="flex max-w-[16rem] flex-wrap gap-1">
                            {tags.slice(0, 3).map((t) => (
                              <span
                                key={t.name}
                                className={clsx(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                                  t.isAlert ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-700",
                                )}
                              >
                                {t.isAlert && <Warning size={12} weight="bold" aria-label="Alert" />}
                                {t.name}
                              </span>
                            ))}
                            {tags.length > 3 && <span className="text-xs text-neutral-500">+{tags.length - 3}</span>}
                          </span>
                        )}
                      </td>
                      <td className={`${td} text-right tabular-nums`}>{c._count.players}</td>
                      <td className={`${td} text-right tabular-nums`}>{c._count.orders}</td>
                      <td className={`${td} text-right tabular-nums`}>{c._count.supportTickets}</td>
                      <td className={`${td} tabular-nums`}>{formatDate(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefFor={(p) => `/admin/shop/customers${qs({ q, view: view === "all" ? undefined : view, page: p })}`}
      />
    </>
  );
}
