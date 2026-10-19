import clsx from "clsx";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowSquareOut, Lock, Paperclip } from "@phosphor-icons/react/ssr";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { formatOrderNumber } from "@/modules/shop/services/checkout";
import { supportMusicContext } from "@/modules/shop/services/music-admin-ui";
import { activationNumber, licenseNumber } from "@/modules/shop/services/software-licensing";
import { listStaff } from "@/modules/shop/services/staff";
import { CATEGORY_LABEL, getStaffTicket, ticketNumber } from "@/modules/shop/services/support";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { groupCode, SoftwareBadge } from "@/modules/shop/ui/admin/software-activations/labels";
import { PageHeader, Panel, StatusBadge } from "@/modules/shop/ui/admin/primitives";
import { personName, PriorityBadge, requestTime, shortDuration, staffLabel, startOfToday, timeAgo } from "@/modules/shop/ui/admin/support/labels";
import { TicketComposer } from "@/modules/shop/ui/admin/support/TicketComposer";
import { TicketControls } from "@/modules/shop/ui/admin/support/TicketControls";
import { TicketTasks } from "@/modules/shop/ui/admin/support/TicketTasks";
import { label, LICENSE_SOURCE_LABEL } from "@/modules/shop/ui/admin/music/labels";
import { formatBytes, formatDate, formatDateTime } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Ticket = NonNullable<Awaited<ReturnType<typeof getStaffTicket>>>;
type Message = Ticket["messages"][number];

function Attachments({ items }: { items: Message["attachments"] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((a) => (
        <li key={a.id}>
          <a
            href={`/api/admin/shop/support/attachments/${a.id}`}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition hover:border-neutral-950 hover:text-neutral-950"
            title={`Download ${a.fileName}`}
          >
            <Paperclip size={14} aria-hidden />
            <span className="max-w-[14rem] truncate">{a.fileName}</span>
            <span className="text-neutral-400">{formatBytes(a.sizeBytes)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function ConversationItem({ m, customerLabel }: { m: Message; customerLabel: string }) {
  const when = <time dateTime={m.createdAt.toISOString()}>{formatDateTime(m.createdAt)}</time>;

  if (m.authorType === "SYSTEM") {
    return (
      <li className="flex justify-center px-2">
        <p className="max-w-lg text-center text-xs text-neutral-500">
          {m.body}
          <span className="mx-1.5" aria-hidden>·</span>
          {staffLabel(m.staff) ?? "System"}, {when}
        </p>
      </li>
    );
  }

  if (m.visibility === "INTERNAL") {
    return (
      <li>
        <article className="rounded-2xl border-2 border-dashed border-neutral-400 bg-neutral-100 p-4 sm:p-5" aria-label="Internal note">
          <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-950">
              <Lock size={14} weight="fill" aria-hidden />
              Internal note, not visible to the customer
            </p>
            <p className="text-xs text-neutral-500">
              {staffLabel(m.staff) ?? "Staff"}, {when}
            </p>
          </header>
          <p className="whitespace-pre-wrap break-words text-sm text-neutral-800">{m.body}</p>
          <Attachments items={m.attachments} />
        </article>
      </li>
    );
  }

  const fromCustomer = m.authorType === "CUSTOMER";
  return (
    <li className={clsx("flex", fromCustomer ? "justify-start" : "justify-end")}>
      <article
        className={clsx(
          "w-full max-w-[42rem] rounded-2xl p-4 sm:w-[90%] sm:p-5",
          fromCustomer ? "border border-neutral-200 bg-white" : "bg-neutral-950 text-white",
        )}
      >
        <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className={clsx("text-sm font-semibold", fromCustomer ? "text-neutral-950" : "text-white")}>
            {fromCustomer ? customerLabel : `${staffLabel(m.staff) ?? "Staff"}, reply to customer`}
          </p>
          <p className={clsx("text-xs", fromCustomer ? "text-neutral-500" : "text-neutral-300")}>{when}</p>
        </header>
        <p className={clsx("whitespace-pre-wrap break-words text-sm", fromCustomer ? "text-neutral-800" : "text-neutral-100")}>{m.body}</p>
        <Attachments items={m.attachments} />
      </article>
    </li>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-neutral-900">{children}</dd>
    </div>
  );
}

export default async function AdminSupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/admin/shop/support/${id}`;
  const guard = await guardStaffPage("support:read", path);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={path} />;
  if (!UUID.test(id)) notFound();

  const role = guard.ctx.staff.role;
  const canReply = roleHasPermission(role, "support:reply");
  const canAssign = canReply && roleHasPermission(role, "support:assign");
  const canSeeCustomer = roleHasPermission(role, "customers:read");
  const canSeeOrders = roleHasPermission(role, "orders:read");
  const canWriteTasks = roleHasPermission(role, "crm:write");
  const canSeeSoftware = canSeeCustomer && roleHasPermission(role, "software:read");
  const canSeeActivations = roleHasPermission(role, "software:activations-read");
  const canSeePlayers = roleHasPermission(role, "players:read");
  const canSeeMusic = roleHasPermission(role, "music:read");

  const [ticket, staff] = await Promise.all([getStaffTicket(id), canAssign || canWriteTasks ? listStaff() : Promise.resolve([])]);
  if (!ticket) notFound();
  // Section 63: player, registration, software and the arrangement's license state in one place.
  const context = canSeePlayers || canSeeMusic
    ? await supportMusicContext({ customerId: ticket.customer.id, playerId: ticket.player?.id ?? null, arrangementId: ticket.arrangement?.id ?? null })
    : null;
  const licenseOnPlayer = context?.arrangementLicenses.find((l) => l.onTicketPlayer && (l.status === "ACTIVE" || l.status === "TRANSFER_PENDING"))
    ?? context?.arrangementLicenses.find((l) => l.onTicketPlayer)
    ?? null;
  const licenseElsewhere = context?.arrangementLicenses.filter((l) => !l.onTicketPlayer) ?? [];

  const now = requestTime();
  const today = startOfToday(now);
  const number = ticketNumber(ticket.number);
  const c = ticket.customer;
  const name = personName(c);
  const customerLabel = name ?? c.companyName ?? c.email;
  const assignees = staff
    .filter((s) => s.status === "ACTIVE")
    .map((s) => ({ id: s.id, label: s.displayName ?? s.email ?? "Unnamed staff" }));
  const categories = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }));
  const firstResponse = ticket.firstResponseAt ? shortDuration(ticket.firstResponseAt.getTime() - ticket.createdAt.getTime()) : null;
  const internalCount = ticket.messages.filter((m) => m.visibility === "INTERNAL" && m.authorType !== "SYSTEM").length;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/support", label: "Support inbox" }}
        title={`${number}: ${ticket.subject}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span>{CATEGORY_LABEL[ticket.category]}</span>
          </span>
        }
      />

      <dl className="mb-6 grid grid-cols-2 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-4">
        <Row label="Created">
          <span className="tabular-nums">{formatDateTime(ticket.createdAt)}</span>
        </Row>
        <Row label="First response">
          {firstResponse ? (
            <span className="tabular-nums">after {firstResponse}</span>
          ) : (
            <span className="font-semibold text-neutral-950">Not answered yet ({shortDuration(now - ticket.createdAt.getTime())})</span>
          )}
        </Row>
        <Row label="Last customer reply">
          {ticket.lastCustomerReplyAt ? <span className="tabular-nums">{timeAgo(ticket.lastCustomerReplyAt, now)}</span> : <span className="text-neutral-400">None</span>}
        </Row>
        <Row label="Last staff reply">
          {ticket.lastStaffReplyAt ? <span className="tabular-nums">{timeAgo(ticket.lastStaffReplyAt, now)}</span> : <span className="text-neutral-400">None</span>}
        </Row>
      </dl>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="conversation-heading">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="conversation-heading" className="font-display text-lg font-bold text-neutral-950">Conversation</h2>
              <p className="text-xs text-neutral-500">
                {ticket.messages.length} entr{ticket.messages.length === 1 ? "y" : "ies"}
                {internalCount > 0 && `, ${internalCount} internal note${internalCount === 1 ? "" : "s"}`}
              </p>
            </div>
            {ticket.messages.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-500">No messages yet.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {ticket.messages.map((m) => (
                  <ConversationItem key={m.id} m={m} customerLabel={customerLabel} />
                ))}
              </ol>
            )}
          </section>

          {canReply ? (
            <TicketComposer ticketId={ticket.id} customerEmail={c.email} ticketClosed={ticket.status === "CLOSED"} />
          ) : (
            <p className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">Your role can read tickets but not reply to them.</p>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <Panel title="Ticket">
            <TicketControls
              ticketId={ticket.id}
              ticketLabel={number}
              status={ticket.status}
              priority={ticket.priority}
              category={ticket.category}
              categories={categories}
              canEdit={canReply}
              canAssign={canAssign}
              assignedStaffId={ticket.assignedStaffId}
              assignedLabel={staffLabel(ticket.assignedStaff)}
              assignees={assignees}
              currentStaffId={guard.ctx.staff.id}
            />
          </Panel>

          <Panel
            title="Customer"
            actions={
              canSeeCustomer ? (
                <Link href={`/admin/shop/customers/${c.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-neutral-950 hover:underline">
                  Open
                  <ArrowSquareOut size={14} aria-hidden />
                </Link>
              ) : undefined
            }
          >
            <dl className="flex flex-col gap-3">
              {name && <Row label="Name">{name}</Row>}
              {c.companyName && <Row label="Company">{c.companyName}</Row>}
              <Row label="Email">
                <a href={`mailto:${c.email}`} className="break-all hover:underline">{c.email}</a>
              </Row>
              <Row label="Phone">{c.phone ? <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a> : <span className="text-neutral-400">Not given</span>}</Row>
              {c.preferredLanguage && <Row label="Language">{c.preferredLanguage.toUpperCase()}</Row>}
            </dl>
          </Panel>

          {(ticket.softwareProduct || ticket.softwareLicense || ticket.softwareInstallation || ticket.softwareActivationRequest) && (
            <Panel
              title="Software"
              actions={
                canSeeSoftware ? (
                  <Link href={`/admin/shop/customers/${c.id}?tab=software`} className="inline-flex items-center gap-1 text-sm font-medium text-neutral-950 hover:underline">
                    Customer software
                    <ArrowSquareOut size={14} aria-hidden />
                  </Link>
                ) : undefined
              }
            >
              <dl className="flex flex-col gap-4">
                {ticket.softwareProduct && <Row label="Product">{ticket.softwareProduct.name}</Row>}
                {ticket.softwareLicense && (
                  <Row label="License">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-neutral-950">{licenseNumber(ticket.softwareLicense.number)}</span>
                      <SoftwareBadge kind="license" status={ticket.softwareLicense.status} />
                    </span>
                  </Row>
                )}
                {ticket.softwareInstallation && (
                  <Row label="Installation">
                    <span className="flex flex-col gap-1">
                      <span className="break-all font-mono text-xs">{groupCode(ticket.softwareInstallation.registrationCode)}</span>
                      <SoftwareBadge kind="installation" status={ticket.softwareInstallation.status} className="self-start" />
                    </span>
                  </Row>
                )}
                {ticket.softwareActivationRequest && (
                  <Row label="Activation request">
                    <span className="flex flex-wrap items-center gap-2">
                      {canSeeActivations ? (
                        <Link href={`/admin/shop/software/activations/${ticket.softwareActivationRequest.id}`} className="font-medium text-neutral-950 hover:underline">
                          {activationNumber(ticket.softwareActivationRequest.number)}
                        </Link>
                      ) : (
                        <span className="font-medium">{activationNumber(ticket.softwareActivationRequest.number)}</span>
                      )}
                      <SoftwareBadge kind="activation" status={ticket.softwareActivationRequest.status} />
                    </span>
                  </Row>
                )}
              </dl>
            </Panel>
          )}

          {(ticket.player || ticket.order || ticket.arrangement) && (
            <Panel title="Context" description="Player, registration, software and music for this case.">
              <dl className="flex flex-col gap-4">
                {ticket.player && (
                  <Row label="Player">
                    <span className="flex flex-col gap-1">
                      {context?.player && canSeePlayers ? (
                        <Link href={`/admin/shop/players/${ticket.player.id}`} className="inline-flex items-center gap-1 font-medium text-neutral-950 hover:underline">
                          {context.player.name}
                          <ArrowSquareOut size={12} aria-hidden />
                        </Link>
                      ) : (
                        <span className="font-medium text-neutral-950">{context?.player?.name ?? ticket.player.playerType.name}</span>
                      )}
                      <span className="text-xs text-neutral-600">
                        {ticket.player.playerType.name}, registration <span className="font-mono">{context?.player?.maskedRegistration ?? ticket.player.registrationCode.slice(-4)}</span>
                      </span>
                      <span className="break-all font-mono text-xs text-neutral-500">{groupCode(ticket.player.registrationCode)}</span>
                      {ticket.player.serialNumber && <span className="text-xs text-neutral-500">Serial {ticket.player.serialNumber}</span>}
                      <StatusBadge status={ticket.player.status} className="self-start" />
                      {context?.player && canSeeMusic && (
                        <span className="text-xs text-neutral-600">
                          {context.player.supportsMusicLibrary
                            ? `${context.player.licenseCount} music license${context.player.licenseCount === 1 ? "" : "s"} on this player`
                            : "This player type cannot receive music"}
                        </span>
                      )}
                      {context?.player && !context.player.ownedByCustomer && (
                        <span className="text-xs font-semibold text-neutral-950">Now registered to another customer</span>
                      )}
                    </span>
                  </Row>
                )}
                {context?.player && context.player.installations.length > 0 && (
                  <Row label="Software on this player">
                    <ul className="flex flex-col gap-1">
                      {context.player.installations.map((i) => (
                        <li key={i.id} className="flex flex-wrap items-center gap-2">
                          <span>{i.product.name}</span>
                          {i.license ? (
                            canSeeSoftware ? (
                              <Link href={`/admin/shop/customers/${c.id}?tab=software#license-${i.license.id}`} className="font-medium text-neutral-950 hover:underline">
                                {licenseNumber(i.license.number)}
                              </Link>
                            ) : (
                              <span className="font-medium">{licenseNumber(i.license.number)}</span>
                            )
                          ) : null}
                          <SoftwareBadge kind={i.license ? "license" : "installation"} status={i.license?.status ?? i.status} />
                        </li>
                      ))}
                    </ul>
                  </Row>
                )}
                {ticket.order && (
                  <Row label="Order">
                    <span className="flex flex-wrap items-center gap-2">
                      {canSeeOrders ? (
                        <Link href={`/admin/shop/orders/${ticket.order.id}`} className="font-medium text-neutral-950 hover:underline">
                          {formatOrderNumber(ticket.order.number)}
                        </Link>
                      ) : (
                        <span className="font-medium">{formatOrderNumber(ticket.order.number)}</span>
                      )}
                      <StatusBadge status={ticket.order.status} />
                    </span>
                  </Row>
                )}
                {ticket.arrangement && (
                  <Row label="Arrangement">
                    <span className="flex flex-col gap-1">
                      <span className="font-medium text-neutral-950">{ticket.arrangement.displayTitle}</span>
                      <span className="text-xs text-neutral-500">{ticket.arrangement.sku}</span>
                      {canSeeMusic && context && (
                        <>
                          {ticket.player && (
                            licenseOnPlayer ? (
                              <span className="flex flex-wrap items-center gap-2 text-xs">
                                <StatusBadge status={licenseOnPlayer.status} />
                                <span className="text-neutral-600">
                                  on this player, {label(LICENSE_SOURCE_LABEL, licenseOnPlayer.source).toLowerCase()}, {formatDate(licenseOnPlayer.createdAt)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-neutral-950">Not licensed on this player</span>
                            )
                          )}
                          {licenseElsewhere.length > 0 && (
                            <span className="text-xs text-neutral-600">
                              {ticket.player ? "Also: " : "Licenses: "}
                              {licenseElsewhere
                                .slice(0, 4)
                                .map((l) => `${l.player?.name ?? "not on a player"} (${l.status.replace(/_/g, " ").toLowerCase()})`)
                                .join(", ")}
                              {licenseElsewhere.length > 4 && `, and ${licenseElsewhere.length - 4} more`}
                            </span>
                          )}
                          {!ticket.player && licenseElsewhere.length === 0 && <span className="text-xs text-neutral-600">This customer has no license for it.</span>}
                        </>
                      )}
                    </span>
                  </Row>
                )}
              </dl>
            </Panel>
          )}

          <Panel title="Follow-up tasks">
            <TicketTasks
              ticketId={ticket.id}
              customerId={c.id}
              registeredPlayerId={ticket.player?.id ?? null}
              tasks={ticket.tasks.map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                dueAt: t.dueAt ? t.dueAt.toISOString() : null,
                overdue: Boolean(t.dueAt && t.dueAt.getTime() < today && t.status !== "DONE" && t.status !== "CANCELLED"),
                assignedLabel: staffLabel(t.assignedStaff),
              }))}
              canWrite={canWriteTasks}
              assignees={assignees}
              currentStaffId={guard.ctx.staff.id}
            />
          </Panel>
        </aside>
      </div>
    </>
  );
}
