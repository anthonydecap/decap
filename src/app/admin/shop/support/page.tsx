import clsx from "clsx";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { INBOX_FILTERS, supportInbox, ticketNumber, type InboxFilter } from "@/modules/shop/services/support";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { btn, EmptyState, Field, inputClass, PageHeader, Pagination, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { firstParam, pageParam, qs } from "@/modules/shop/ui/admin/sales/labels";
import { personName, PriorityBadge, requestTime, shortDuration, staffLabel, timeAgo } from "@/modules/shop/ui/admin/support/labels";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PATH = "/admin/shop/support";

const EMPTY_COPY: Partial<Record<InboxFilter, string>> = {
  needs_reply: "Nothing is waiting for a staff reply. Nice work.",
  unassigned: "Every open ticket has an owner.",
  mine: "No open tickets are assigned to you.",
  high: "No open tickets with high or urgent priority.",
};

export default async function AdminSupportInboxPage({ searchParams }: { searchParams: SearchParams }) {
  const guard = await guardStaffPage("support:read", PATH);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={PATH} />;

  const sp = await searchParams;
  const rawFilter = firstParam(sp.filter) ?? "";
  const filter: InboxFilter = rawFilter in INBOX_FILTERS ? (rawFilter as InboxFilter) : "needs_reply";
  const q = firstParam(sp.q)?.trim() ?? "";
  const page = pageParam(sp.page);

  const result = await supportInbox({ filter, q: q || undefined, page, staffId: guard.ctx.staff.id });
  const now = requestTime();

  return (
    <>
      <PageHeader
        title="Support"
        description="Customer requests, highest priority and longest waiting first. Search by ticket number (SUP-1042), subject, customer email, company, last name or player registration code."
      />

      <nav aria-label="Inbox filters" className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {(Object.keys(INBOX_FILTERS) as InboxFilter[]).map((f) => {
            const active = f === result.filter;
            const count = result.counts[f];
            return (
              <li key={f}>
                <Link
                  href={`${PATH}${qs({ filter: f === "needs_reply" ? undefined : f, q })}`}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                    active ? "bg-neutral-950 text-white" : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950 hover:text-neutral-950",
                  )}
                >
                  {INBOX_FILTERS[f]}
                  {count !== undefined && (
                    <span
                      className={clsx(
                        "rounded-full px-1.5 text-xs tabular-nums",
                        active ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form method="get" className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-end">
        {filter !== "needs_reply" && <input type="hidden" name="filter" value={filter} />}
        <Field label="Search tickets" htmlFor="support-q">
          <input
            id="support-q"
            name="q"
            type="search"
            defaultValue={q}
            className={inputClass}
            autoComplete="off"
            placeholder="SUP-1042, subject, email, company or registration code"
          />
        </Field>
        <div className="flex gap-2">
          <button type="submit" className={btn.primary}>
            <MagnifyingGlass size={16} weight="bold" aria-hidden />
            Search
          </button>
          {q && (
            <Link href={`${PATH}${qs({ filter: filter === "needs_reply" ? undefined : filter })}`} className={btn.ghost}>
              Clear
            </Link>
          )}
        </div>
      </form>

      <Panel
        title={`${INBOX_FILTERS[result.filter]}: ${result.total.toLocaleString("en-GB")} ticket${result.total === 1 ? "" : "s"}`}
        description={q ? `Matching "${q}"` : undefined}
        padded={false}
      >
        {result.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={q ? "No tickets match" : "No tickets here"}
              body={q ? "Try another search, or switch to All." : (EMPTY_COPY[result.filter] ?? "No tickets in this view right now.")}
              action={
                q || result.filter !== "all" ? (
                  <Link className={btn.secondary} href={`${PATH}?filter=all`}>Show all tickets</Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Ticket</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Subject</th>
                  <th className={th}>Player</th>
                  <th className={th}>Status</th>
                  <th className={th}>Priority</th>
                  <th className={th}>Assigned to</th>
                  <th className={th}>Last activity</th>
                  <th className={th}>Age</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((t) => {
                  const href = `${PATH}/${t.id}`;
                  const name = personName(t.customer);
                  const emphasised = t.priority === "HIGH" || t.priority === "URGENT";
                  return (
                    <tr key={t.id} className={tr}>
                      <td className={td}>
                        <Link href={href} className="font-semibold text-neutral-950 tabular-nums hover:underline">
                          {ticketNumber(t.number)}
                        </Link>
                      </td>
                      <td className={`${td} max-w-[15rem]`}>
                        <p className="truncate font-medium text-neutral-950">{t.customer.companyName ?? name ?? t.customer.email}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {t.customer.companyName && name ? `${name}, ` : ""}
                          {t.customer.email}
                        </p>
                      </td>
                      <td className={`${td} max-w-[20rem]`}>
                        <Link href={href} className={clsx("block truncate hover:underline", emphasised ? "font-semibold text-neutral-950" : "text-neutral-800")}>
                          {t.subject}
                        </Link>
                      </td>
                      <td className={td}>
                        {t.player ? (
                          <span>
                            {t.player.playerType.name}
                            <span className="ml-1 font-mono text-xs text-neutral-500">...{t.player.registrationCode.slice(-4)}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400">None</span>
                        )}
                      </td>
                      <td className={td}>
                        <StatusBadge status={t.status} />
                      </td>
                      <td className={td}><PriorityBadge priority={t.priority} /></td>
                      <td className={td}>
                        {staffLabel(t.assignedStaff) ?? <span className="text-neutral-400">Unassigned</span>}
                      </td>
                      <td className={`${td} tabular-nums`} title={t.updatedAt.toISOString()}>{timeAgo(t.updatedAt, now)}</td>
                      <td className={`${td} tabular-nums`} title={t.createdAt.toISOString()}>{shortDuration(now - t.createdAt.getTime())}</td>
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
        hrefFor={(p) => `${PATH}${qs({ filter: result.filter === "needs_reply" ? undefined : result.filter, q, page: p })}`}
      />
    </>
  );
}
