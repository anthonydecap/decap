import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, DownloadSimple } from "@phosphor-icons/react/ssr";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { shopDb } from "@/modules/shop/db";
import { getCustomerAdmin } from "@/modules/shop/services/admin-ops";
import { formatOrderNumber } from "@/modules/shop/services/checkout";
import { listActivity } from "@/modules/shop/services/crm";
import {
  customerOverview,
  listCommunications,
  listCustomerDocuments,
  listCustomerTags,
  listCustomerTasks,
  listNotes,
} from "@/modules/shop/services/crm-admin";
import type { MusicLicenseSource } from "@/generated/shop-prisma/client";
import { customerMusicMatrix, unassignedLicenses } from "@/modules/shop/services/music-admin";
import { customerPlayerSummaries, grantPickerOptions } from "@/modules/shop/services/music-admin-ui";
import { customerMusicPlayers, licenseCountsByPlayer } from "@/modules/shop/services/music-licenses";
import { listTransfers } from "@/modules/shop/services/music-transfers";
import { listCustomerPlayers, listPlayerTypes } from "@/modules/shop/services/players";
import { listSoftwareProductsAdmin } from "@/modules/shop/services/software";
import { activationNumber, crmSoftware } from "@/modules/shop/services/software-licensing";
import { listStaff } from "@/modules/shop/services/staff";
import { OPEN_STATUSES, ticketNumber, ticketsForCustomer } from "@/modules/shop/services/support";
import { CommunicationForm } from "@/modules/shop/ui/admin/crm/CommunicationForm";
import { ContactBillingForm, CrmStatusForm } from "@/modules/shop/ui/admin/crm/ContactBillingForm";
import { DocumentUpload } from "@/modules/shop/ui/admin/crm/DocumentUpload";
import { COMMUNICATION_TYPES, CRM_STATUSES, CUSTOMER_SOURCES, optionLabel, staffLabel, TASK_PRIORITIES } from "@/modules/shop/ui/admin/crm/labels";
import { AddNoteForm, NotesList } from "@/modules/shop/ui/admin/crm/Notes";
import { AlertBanner, Metric, SegmentedTabs, TagChips, Timeline } from "@/modules/shop/ui/admin/crm/parts";
import { TagEditor } from "@/modules/shop/ui/admin/crm/TagEditor";
import { TaskForm, TaskStatusButtons } from "@/modules/shop/ui/admin/crm/Tasks";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { CustomerPlayers } from "@/modules/shop/ui/admin/players/CustomerPlayers";
import { AssignUnassigned } from "@/modules/shop/ui/admin/music/AssignUnassigned";
import { GrantMusic } from "@/modules/shop/ui/admin/music/GrantMusic";
import { label, LICENSE_SOURCE_LABEL as MUSIC_SOURCE_LABEL, LICENSE_SOURCES } from "@/modules/shop/ui/admin/music/labels";
import { TransfersTable } from "@/modules/shop/ui/admin/music/TransfersTable";
import { btn, EmptyState, Field, inputClass, PageHeader, Panel, StatusBadge, Table, td, th, tr } from "@/modules/shop/ui/admin/primitives";
import { GrantForm } from "@/modules/shop/ui/admin/sales/GrantForm";
import { customerName, firstParam, humanize, sourceTypeLabel } from "@/modules/shop/ui/admin/sales/labels";
import { RevokeSourceButton } from "@/modules/shop/ui/admin/sales/RevokeSourceButton";
import { AddLicenseForm } from "@/modules/shop/ui/admin/software-activations/AddLicenseForm";
import { InstallationActions } from "@/modules/shop/ui/admin/software-activations/InstallationActions";
import { InstallationKey } from "@/modules/shop/ui/admin/software-activations/InstallationKey";
import { LICENSE_SOURCE_LABEL, SoftwareBadge } from "@/modules/shop/ui/admin/software-activations/labels";
import { LicenseActions } from "@/modules/shop/ui/admin/software-activations/LicenseActions";
import { formatBytes, formatDate, formatDateTime, formatMoney } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALL_TABS = [
  { key: "overview", label: "Overview" },
  { key: "players", label: "Players" },
  { key: "music", label: "Music" },
  { key: "software", label: "Software" },
  { key: "orders", label: "Orders" },
  { key: "support", label: "Support" },
  { key: "activity", label: "Notes & Activity" },
  { key: "tasks", label: "Tasks" },
  { key: "contact", label: "Contact & Billing" },
  { key: "library", label: "Entitlements" },
  { key: "documents", label: "Documents" },
] as const;
type TabKey = (typeof ALL_TABS)[number]["key"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="mt-0.5 break-words text-neutral-900">{children}</dd>
    </div>
  );
}

const notSet = <span className="text-neutral-400">Not set</span>;

/** Server-rendered per request, so "now" is the request time. */
function isPast(d: Date | null): boolean {
  return Boolean(d && d.getTime() < Date.now());
}

/** Registration codes are stored without separators; staff read them in groups of four. */
const groupCode = (code: string) => code.match(/.{1,4}/g)?.join("-") ?? code;

export default async function AdminCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const path = `/admin/shop/customers/${id}`;
  const guard = await guardStaffPage("customers:read", path);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={path} />;
  if (!UUID.test(id)) notFound();

  const role = guard.ctx.staff.role;
  const me = guard.ctx.staff.id;
  const can = {
    writeCustomer: roleHasPermission(role, "customers:write"),
    crm: roleHasPermission(role, "crm:write"),
    grant: roleHasPermission(role, "entitlements:grant"),
    orders: roleHasPermission(role, "orders:read"),
    readPlayers: roleHasPermission(role, "players:read"),
    writePlayers: roleHasPermission(role, "players:write"),
    activationKey: roleHasPermission(role, "players:activation-key"),
    support: roleHasPermission(role, "support:read"),
    transfer: roleHasPermission(role, "players:transfer"),
    software: roleHasPermission(role, "software:read"),
    licensesWrite: roleHasPermission(role, "software:licenses-write"),
    installationsWrite: roleHasPermission(role, "software:activations-process"),
    softwareKey: roleHasPermission(role, "software:activation-key"),
    activations: roleHasPermission(role, "software:activations-read"),
    music: roleHasPermission(role, "music:read"),
    musicGrant: roleHasPermission(role, "music:grant"),
    musicMigration: roleHasPermission(role, "music:migration"),
  };

  const tabs = ALL_TABS.filter(
    (t) => (t.key !== "players" || can.readPlayers) && (t.key !== "software" || can.software) && (t.key !== "music" || can.music),
  );
  const sp = await searchParams;
  const requested = firstParam(sp.tab) ?? "overview";
  const tab: TabKey = (tabs.find((t) => t.key === requested)?.key ?? "overview") as TabKey;

  const [overview, allTags, playerCards] = await Promise.all([
    customerOverview(id),
    can.crm ? listCustomerTags() : Promise.resolve([]),
    tab === "overview" && can.readPlayers ? customerPlayerSummaries(id) : Promise.resolve([]),
  ]);
  if (!overview) notFound();
  const { customer, metrics, consent, billing } = overview;
  const name = customerName(customer);
  const title = customer.accountType === "BUSINESS" && customer.companyName ? customer.companyName : (name ?? customer.email);
  const subtitle = [customer.accountType === "BUSINESS" && customer.companyName ? name : null, customer.email].filter(Boolean).join(", ");

  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/customers", label: "Customers" }}
        title={title}
        description={subtitle}
        actions={
          can.support ? (
            <Link className={btn.secondary} href={`/admin/shop/support?q=${encodeURIComponent(customer.email)}`}>
              Support inbox
            </Link>
          ) : undefined
        }
      />

      <AlertBanner alerts={overview.alerts} />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
            {customer.accountType === "BUSINESS" ? "Business" : "Individual"}
          </span>
          <StatusBadge status={customer.crmStatus} />
        </div>
        <div className="min-w-0 flex-1">
          <TagChips tags={overview.tags} />
        </div>
        {can.crm && (
          <TagEditor
            customerId={id}
            tags={allTags.map((t) => ({ id: t.id, name: t.name, description: t.description, isAlert: t.isAlert }))}
            assigned={overview.tags.map((t) => t.id)}
          />
        )}
      </div>

      <SegmentedTabs tabs={tabs} active={tab} hrefFor={(k) => (k === "overview" ? path : `${path}?tab=${k}`)} />

      {tab === "overview" && (
        <div className="flex flex-col gap-6">
          {can.music && (metrics.musicNeedsReview > 0 || metrics.unassignedMusic > 0) && (
            <div className="flex flex-col gap-2 rounded-2xl border border-neutral-950 bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-neutral-800">
                {metrics.musicNeedsReview > 0 ? (
                  <><span className="font-semibold">Music needs review:</span> {metrics.musicNeedsReview} license{metrics.musicNeedsReview === 1 ? "" : "s"} could not be placed on a player automatically.</>
                ) : (
                  <>{metrics.unassignedMusic} license{metrics.unassignedMusic === 1 ? " is" : "s are"} not on a player yet.</>
                )}
              </p>
              <Link href={`${path}?tab=music&mstatus=unassigned`} className={btn.secondary}>Review music</Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
            <Metric label="Active players" hint={`${metrics.totalPlayers} registered in total`}>
              {can.readPlayers ? <Link href={`${path}?tab=players`} className="hover:underline">{metrics.activePlayers}</Link> : metrics.activePlayers}
            </Metric>
            {can.music && (
              <Metric label="Music licenses" hint={`Active on players, ${metrics.ownedArrangements} arrangements owned`}>
                <Link href={`${path}?tab=music`} className="hover:underline">{metrics.activeMusicLicenses}</Link>
              </Metric>
            )}
            {can.software && (
              <>
                <Metric label="Software licenses" hint={`Active or waiting, ${metrics.softwareDownloads} downloads`}>
                  <Link href={`${path}?tab=software`} className="hover:underline">{metrics.softwareLicenses}</Link>
                </Metric>
                <Metric label="Pending activations">
                  {metrics.pendingActivations > 0 ? (
                    <Link href={`${path}?tab=software`} className="hover:underline">{metrics.pendingActivations}</Link>
                  ) : (
                    <span className="text-neutral-400">0</span>
                  )}
                </Metric>
              </>
            )}
            <Metric label="Open tickets">
              {metrics.openTickets > 0 ? <Link href={`${path}?tab=support`} className="hover:underline">{metrics.openTickets}</Link> : <span className="text-neutral-400">0</span>}
            </Metric>
            <Metric label="Lifetime spend" hint={`Paid orders net of refunds, ${metrics.orderCount} order${metrics.orderCount === 1 ? "" : "s"}`}>{formatMoney(metrics.lifetimeSpendCents)}</Metric>
            <Metric label="Last order">
              {metrics.lastPurchase ? (
                <span className="text-base">
                  {metrics.lastPurchase.at ? formatDate(metrics.lastPurchase.at) : metrics.lastPurchase.orderNumber}
                </span>
              ) : (
                <span className="text-base text-neutral-400">None</span>
              )}
            </Metric>
            <Metric label="Last activity" hint={metrics.lastActivity?.summary}>
              {metrics.lastActivity ? <span className="text-base">{formatDate(metrics.lastActivity.occurredAt)}</span> : <span className="text-base text-neutral-400">None</span>}
            </Metric>
            <Metric
              label="Next task"
              hint={
                metrics.nextTask
                  ? [metrics.nextTask.dueAt ? `Due ${formatDate(metrics.nextTask.dueAt)}` : "No due date", staffLabel(metrics.nextTask.assignedStaff)].filter(Boolean).join(", ")
                  : undefined
              }
            >
              {metrics.nextTask ? (
                <Link href={`${path}?tab=tasks`} className="text-base hover:underline">{metrics.nextTask.title}</Link>
              ) : (
                <span className="text-base text-neutral-400">None</span>
              )}
            </Metric>
          </div>

          {can.readPlayers && (
            <Panel
              title="Players"
              padded={false}
              actions={<Link className={btn.ghost} href={`${path}?tab=players`}>Manage players <ArrowRight size={14} aria-hidden /></Link>}
            >
              {playerCards.length === 0 ? (
                <p className="p-5 text-sm text-neutral-500 sm:p-6">No players registered yet.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-px bg-neutral-100 sm:grid-cols-2 lg:grid-cols-3">
                  {playerCards.map((p) => (
                    <li key={p.id} className="flex flex-col gap-2 bg-white px-5 py-4 sm:px-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/admin/shop/players/${p.id}`} className="block truncate font-display text-base font-bold text-neutral-950 hover:underline">{p.name}</Link>
                          <p className="text-xs text-neutral-500">
                            {p.typeName}, registration <span className="font-mono">{p.maskedRegistration}</span>
                          </p>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="tabular-nums text-neutral-700">
                          {!p.supportsMusicLibrary ? "Cannot receive music" : can.music ? `${p.licenseCount} music license${p.licenseCount === 1 ? "" : "s"}` : ""}
                        </span>
                        <Link href={`/admin/shop/players/${p.id}`} className={btn.ghost}>Open <ArrowRight size={14} aria-hidden /></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Panel title="Customer" className="lg:col-span-2">
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <Row label="Email">{customer.email}{customer.emailVerified ? "" : " (not verified)"}</Row>
                <Row label="Phone">{customer.phone ?? notSet}</Row>
                <Row label="Name">{name ?? notSet}</Row>
                <Row label="Company">{customer.companyName ?? notSet}</Row>
                <Row label="VAT number">{customer.vatNumber ?? notSet}</Row>
                <Row label="Country">{customer.countryCode ?? billing?.countryCode ?? notSet}</Row>
                <Row label="CRM status">{optionLabel(CRM_STATUSES, customer.crmStatus)}</Row>
                <Row label="Source">{customer.customerSource ? optionLabel(CUSTOMER_SOURCES, customer.customerSource) : notSet}</Row>
                <Row label="Customer since"><span className="tabular-nums">{formatDate(customer.createdAt)}</span></Row>
                <Row label="Onboarding">
                  {customer.onboardingCompletedAt ? <span className="tabular-nums">Completed {formatDate(customer.onboardingCompletedAt)}</span> : <span className="text-neutral-400">Not completed</span>}
                </Row>
                <Row label="Last purchase">
                  {metrics.lastPurchase ? (
                    can.orders ? (
                      <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${metrics.lastPurchase.id}`}>
                        {metrics.lastPurchase.orderNumber}
                      </Link>
                    ) : (
                      metrics.lastPurchase.orderNumber
                    )
                  ) : (
                    <span className="text-neutral-400">None</span>
                  )}
                </Row>
                <Row label="Stripe customer">
                  <span className="break-all font-mono text-xs">{customer.stripeCustomerId ?? "None"}</span>
                </Row>
              </dl>
            </Panel>

            <Panel title="Consent">
              <dl className="flex flex-col gap-3 text-sm">
                <Row label="Marketing">
                  {consent.marketingConsent ? `Given${consent.marketingConsentAt ? ` ${formatDate(consent.marketingConsentAt)}` : ""}` : "Not given"}
                </Row>
                <Row label="Terms">
                  {consent.termsAcceptedAt ? `Version ${consent.termsVersion}, ${formatDateTime(consent.termsAcceptedAt)}` : <span className="text-neutral-400">Not accepted</span>}
                </Row>
                <Row label="Privacy policy">
                  {consent.privacyAcceptedAt ? `Version ${consent.privacyVersion}, ${formatDateTime(consent.privacyAcceptedAt)}` : <span className="text-neutral-400">Not accepted</span>}
                </Row>
              </dl>
              {customer.legalAcceptances.length > 2 && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-neutral-600">All acceptances ({customer.legalAcceptances.length})</summary>
                  <ul className="mt-2 flex flex-col gap-2">
                    {customer.legalAcceptances.map((l) => (
                      <li key={l.id} className="text-xs text-neutral-600">
                        {humanize(l.documentType)} version {l.documentVersion}, {formatDateTime(l.acceptedAt)}, via {l.source.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Panel>
          </div>
        </div>
      )}

      {tab === "contact" && (
        <div className="flex flex-col gap-6">
          <Panel title="CRM status" description="Internal classification. The customer never sees it.">
            {can.writeCustomer ? (
              <CrmStatusForm customerId={id} crmStatus={customer.crmStatus} customerSource={customer.customerSource} />
            ) : (
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <Row label="CRM status">{optionLabel(CRM_STATUSES, customer.crmStatus)}</Row>
                <Row label="Source">{customer.customerSource ? optionLabel(CUSTOMER_SOURCES, customer.customerSource) : notSet}</Row>
              </dl>
            )}
          </Panel>
          <Panel title="Contact and billing" description="The same details the customer edits under their account profile. New orders copy the billing address at checkout.">
            {can.writeCustomer ? (
              <ContactBillingForm
                customerId={id}
                initial={{
                  email: customer.email,
                  accountType: customer.accountType,
                  firstName: customer.firstName ?? "",
                  lastName: customer.lastName ?? "",
                  phone: customer.phone ?? "",
                  companyName: customer.companyName ?? "",
                  companyRegistrationNumber: customer.companyRegistrationNumber ?? "",
                  vatNumber: customer.vatNumber ?? "",
                  vatCountryCode: customer.vatCountryCode ?? "",
                  preferredLanguage: customer.preferredLanguage ?? "",
                  marketingConsent: customer.marketingConsent,
                  billing: {
                    name: billing?.name ?? "",
                    companyName: billing?.companyName ?? "",
                    addressLine1: billing?.addressLine1 ?? "",
                    addressLine2: billing?.addressLine2 ?? "",
                    postalCode: billing?.postalCode ?? "",
                    city: billing?.city ?? "",
                    stateOrProvince: billing?.stateOrProvince ?? "",
                    countryCode: billing?.countryCode ?? customer.countryCode ?? "",
                  },
                }}
              />
            ) : (
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <Row label="Email">{customer.email}</Row>
                <Row label="Phone">{customer.phone ?? notSet}</Row>
                <Row label="Name">{name ?? notSet}</Row>
                <Row label="Company">{customer.companyName ?? notSet}</Row>
                <Row label="Company registration">{customer.companyRegistrationNumber ?? notSet}</Row>
                <Row label="VAT">{customer.vatNumber ? `${customer.vatCountryCode ?? ""} ${customer.vatNumber}`.trim() : notSet}</Row>
                <Row label="Billing address">
                  {billing ? (
                    <span className="whitespace-pre-line">
                      {[billing.name, billing.companyName, billing.addressLine1, billing.addressLine2, `${billing.postalCode} ${billing.city}`, billing.stateOrProvince, billing.countryCode]
                        .filter(Boolean)
                        .join("\n")}
                    </span>
                  ) : (
                    notSet
                  )}
                </Row>
              </dl>
            )}
          </Panel>
        </div>
      )}

      {tab === "players" && can.readPlayers && <PlayersTab customerId={id} can={can} />}
      {tab === "music" && can.music && <MusicTab customerId={id} path={path} sp={sp} can={can} />}
      {(tab === "orders" || tab === "library") && <SalesTab customerId={id} tab={tab} can={can} />}
      {tab === "software" && can.software && <SoftwareTab customerId={id} can={can} />}
      {tab === "support" && <SupportTab customerId={id} email={customer.email} canSupport={can.support} />}
      {tab === "activity" && <ActivityTab customerId={id} me={me} canWrite={can.crm} />}
      {tab === "tasks" && <TasksTab customerId={id} me={me} canWrite={can.crm} canSupport={can.support} canReadPlayers={can.readPlayers} />}
      {tab === "documents" && <DocumentsTab customerId={id} canWrite={can.crm} canReadPlayers={can.readPlayers} />}
    </>
  );
}

type Can = {
  writeCustomer: boolean;
  crm: boolean;
  grant: boolean;
  orders: boolean;
  readPlayers: boolean;
  writePlayers: boolean;
  activationKey: boolean;
  support: boolean;
  transfer: boolean;
  software: boolean;
  licensesWrite: boolean;
  installationsWrite: boolean;
  softwareKey: boolean;
  activations: boolean;
  music: boolean;
  musicGrant: boolean;
  musicMigration: boolean;
};

function DocumentLink({ doc }: { doc: { id: string; title: string; fileName: string; sizeBytes: number } }) {
  return (
    <a href={`/api/admin/shop/documents/${doc.id}`} className="inline-flex items-center gap-1.5 font-medium text-neutral-950 hover:underline" target="_blank" rel="noopener">
      <DownloadSimple size={14} aria-hidden />
      {doc.title}
      <span className="text-xs font-normal text-neutral-500">{doc.fileName}, {formatBytes(doc.sizeBytes)}</span>
    </a>
  );
}

async function PlayersTab({ customerId, can }: { customerId: string; can: Can }) {
  const [players, playerTypes, tickets, documents, counts] = await Promise.all([
    listCustomerPlayers(customerId),
    can.writePlayers ? listPlayerTypes({ activeOnly: true }) : Promise.resolve([]),
    ticketsForCustomer(customerId),
    listCustomerDocuments(customerId),
    can.music ? licenseCountsByPlayer(customerId) : Promise.resolve(null),
  ]);

  const extras: Record<string, React.ReactNode> = {};
  for (const p of players) {
    const pt = tickets.filter((t) => t.registeredPlayerId === p.id);
    const pd = documents.filter((d) => d.registeredPlayerId === p.id);
    extras[p.id] = (
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-neutral-500">Service history: tickets</p>
          {pt.length === 0 ? (
            <p className="mt-1 text-neutral-400">No tickets about this player.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-1">
              {pt.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-2">
                  {can.support ? (
                    <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/support/${t.id}`}>{ticketNumber(t.number)}</Link>
                  ) : (
                    <span className="font-medium text-neutral-950">{ticketNumber(t.number)}</span>
                  )}
                  <span className="min-w-0 truncate text-neutral-700">{t.subject}</span>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500">Documents</p>
          {pd.length === 0 ? (
            <p className="mt-1 text-neutral-400">No documents for this player.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-1">
              {pd.map((d) => (
                <li key={d.id}><DocumentLink doc={d} /></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <CustomerPlayers
      customerId={customerId}
      canWrite={can.writePlayers}
      canSeeActivationKey={can.activationKey}
      types={playerTypes.map((t) => ({ id: t.id, name: t.name }))}
      extras={extras}
      players={players.map((p) => ({
        id: p.id,
        name: p.friendlyName?.trim() || `${p.playerType.name} ••••${p.registrationCode.slice(-4)}`,
        maskedRegistration: `••••${p.registrationCode.slice(-4)}`,
        licenseCount: counts ? (counts.get(p.id) ?? 0) : null,
        supportsMusicLibrary: p.playerType.supportsMusicLibrary,
        typeName: p.playerType.name,
        registrationCode: p.registrationCode,
        registrationIdentifier: p.registrationIdentifier,
        serialNumber: p.serialNumber,
        adminLabel: p.adminLabel,
        dealerName: p.dealerName,
        status: p.status,
        purchaseDate: p.purchaseDate?.toISOString() ?? null,
        warrantyUntil: p.warrantyUntil?.toISOString() ?? null,
        registeredAt: p.registeredAt?.toISOString() ?? null,
        activatedAt: p.activatedAt?.toISOString() ?? null,
        hasActivationKey: p.hasActivationKey,
      }))}
    />
  );
}

async function SalesTab({ customerId, tab, can }: { customerId: string; tab: "orders" | "library"; can: Can }) {
  const customer = await getCustomerAdmin(customerId);
  if (!customer) notFound();

  if (tab === "orders") {
    return (
      <Panel title="Orders" padded={false}>
        {customer.orders.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500 sm:p-6">This customer has not placed an order.</p>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Total</th>
                  <th className={`${th} text-right`}>Refunded</th>
                  <th className={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((o) => (
                  <tr key={o.id} className={tr}>
                    <td className={td}>
                      {can.orders ? (
                        <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${o.id}`}>{o.orderNumber}</Link>
                      ) : (
                        o.orderNumber
                      )}
                    </td>
                    <td className={td}><StatusBadge status={o.status} /></td>
                    <td className={`${td} text-right tabular-nums`}>{formatMoney(o.totalCents, o.currency)}</td>
                    <td className={`${td} text-right tabular-nums`}>
                      {o.refundedCents > 0 ? formatMoney(o.refundedCents, o.currency) : <span className="text-neutral-400">0</span>}
                    </td>
                    <td className={`${td} tabular-nums`}>{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
    );
  }

  const db = shopDb();
  const sources = customer.entitlements.flatMap((e) => e.sources);
  const allocationIds = sources.map((s) => s.orderAllocationId).filter((v): v is string => Boolean(v));
  const staffIds = [...new Set(sources.flatMap((s) => [s.grantedByStaffId, s.revokedByStaffId]).filter((v): v is string => Boolean(v)))];
  const [allocations, staff, arrangements] = await Promise.all([
    allocationIds.length
      ? db.orderItemAllocation.findMany({ where: { id: { in: allocationIds } }, select: { id: true, orderId: true, order: { select: { number: true } } } })
      : Promise.resolve([]),
    staffIds.length ? db.staffAccount.findMany({ where: { id: { in: staffIds } }, select: { id: true, displayName: true, email: true } }) : Promise.resolve([]),
    can.grant
      ? db.arrangement.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, sku: true, displayTitle: true }, orderBy: { sku: "asc" } })
      : Promise.resolve([]),
  ]);
  const allocationOrder = new Map(allocations.map((a) => [a.id, { orderId: a.orderId, orderNumber: formatOrderNumber(a.order.number) }]));
  const staffName = new Map(staff.map((s) => [s.id, s.displayName ?? s.email ?? s.id]));
  const active = customer.entitlements.filter((e) => e.status === "ACTIVE");
  const revoked = customer.entitlements.filter((e) => e.status !== "ACTIVE");
  const ownedArrangementIds = active.map((e) => e.arrangementId);

  const renderEntitlements = (list: typeof customer.entitlements) => (
    <ul className="divide-y divide-neutral-100">
      {list.map((e) => {
        const unrevoked = e.sources.filter((s) => !s.revokedAt);
        return (
          <li key={e.id} className="px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="font-medium text-neutral-950">{e.arrangement.displayTitle}</p>
                <p className="text-xs text-neutral-500">
                  {e.arrangement.sku}, first granted {formatDate(e.firstGrantedAt)}
                  {e.revokedAt && `, revoked ${formatDate(e.revokedAt)}`}
                </p>
              </div>
              <StatusBadge status={e.status} className="self-start" />
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {e.sources.map((s) => {
                const ref = s.orderAllocationId ? allocationOrder.get(s.orderAllocationId) : undefined;
                return (
                  <li key={s.id} className="flex flex-col gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-neutral-900">{sourceTypeLabel(s.sourceType)}</span>
                        {s.revokedAt && <StatusBadge status="REVOKED" />}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-600">
                        Granted {formatDateTime(s.grantedAt)}
                        {s.grantedByStaffId && ` by ${staffName.get(s.grantedByStaffId) ?? s.grantedByStaffId}`}
                      </p>
                      {ref &&
                        (can.orders ? (
                          <p className="text-xs text-neutral-600">
                            Order{" "}
                            <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${ref.orderId}`}>{ref.orderNumber}</Link>
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-600">Order {ref.orderNumber}</p>
                        ))}
                      {s.grantReason && <p className="text-xs text-neutral-600">Reason: {s.grantReason}</p>}
                      {s.sourceReference && <p className="break-all text-xs text-neutral-600">Reference: {s.sourceReference}</p>}
                      {s.revokedAt && (
                        <p className="text-xs text-neutral-600">
                          Revoked {formatDateTime(s.revokedAt)}
                          {s.revokedByStaffId && ` by ${staffName.get(s.revokedByStaffId) ?? s.revokedByStaffId}`}
                          {s.revokeReason && `: ${s.revokeReason}`}
                        </p>
                      )}
                    </div>
                    {can.grant && !s.revokedAt && (
                      <RevokeSourceButton
                        customerId={customer.id}
                        sourceId={s.id}
                        sourceLabel={sourceTypeLabel(s.sourceType)}
                        arrangementTitle={e.arrangement.displayTitle}
                        otherActiveSources={unrevoked.length - 1}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Library access"
        description={`${active.length} active, ${revoked.length} revoked. Each arrangement can have several sources; it stays active while any source is unrevoked.`}
        padded={false}
      >
        {customer.entitlements.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No library items" body="Purchases and manual grants appear here." />
          </div>
        ) : (
          <>
            {active.length > 0 && renderEntitlements(active)}
            {revoked.length > 0 && (
              <>
                <h3 className="border-t border-neutral-200 px-5 pb-1 pt-5 font-display text-sm font-bold text-neutral-950 sm:px-6">Revoked</h3>
                {renderEntitlements(revoked)}
              </>
            )}
          </>
        )}
      </Panel>
      {can.grant && (
        <Panel title="Grant access">
          <GrantForm customerId={customer.id} arrangements={arrangements} ownedArrangementIds={ownedArrangementIds} />
        </Panel>
      )}
    </div>
  );
}

async function SoftwareTab({ customerId, can }: { customerId: string; can: Can }) {
  const [software, products] = await Promise.all([crmSoftware(customerId), can.licensesWrite ? listSoftwareProductsAdmin() : Promise.resolve([])]);
  const { downloads, licenses } = software;
  const latestByProduct = new Map<string, (typeof downloads)[number]>();
  for (const d of downloads) if (!latestByProduct.has(d.product.id)) latestByProduct.set(d.product.id, d);
  const activeProducts = products.filter((p) => p.status !== "ARCHIVED");

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Licenses"
        description={`${licenses.length} license${licenses.length === 1 ? "" : "s"}. A license is the right to use the software; each activated computer is an installation.`}
        padded={false}
      >
        {licenses.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No software licenses" body="Purchased licenses appear here automatically. Staff can add manual, promotion or legacy licenses below." />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {licenses.map((l) => {
              const active = l.installations.filter((i) => i.status === "ACTIVE").length;
              return (
                <li key={l.id} id={`license-${l.id}`} className="flex flex-col gap-4 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 text-sm">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-bold text-neutral-950">{l.licenseNumber}</span>
                        <span className="font-medium text-neutral-800">{l.product.name}</span>
                        <SoftwareBadge kind="license" status={l.status} />
                      </p>
                      <p className="mt-1 text-xs text-neutral-600">
                        {LICENSE_SOURCE_LABEL[l.licenseSource] ?? l.licenseSource}, since {formatDate(l.purchasedAt)}
                        {l.activatedAt && `, first activated ${formatDate(l.activatedAt)}`}, {active} of {l.maxActivations} activation
                        {l.maxActivations === 1 ? "" : "s"} in use
                      </p>
                      {l.order && (
                        <p className="text-xs text-neutral-600">
                          Order{" "}
                          {can.orders ? (
                            <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/orders/${l.order.id}`}>{formatOrderNumber(l.order.number)}</Link>
                          ) : (
                            formatOrderNumber(l.order.number)
                          )}
                        </p>
                      )}
                      {l.sourceReference && <p className="break-all text-xs text-neutral-600">Reference: {l.sourceReference}</p>}
                      {l.statusReason && <p className="text-xs text-neutral-600">Status reason: {l.statusReason.startsWith("refund:") ? "refunded" : l.statusReason}</p>}
                      {l.notes && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-neutral-600">{l.notes}</p>}
                    </div>
                    {can.licensesWrite && (
                      <LicenseActions licenseId={l.id} licenseLabel={l.licenseNumber} status={l.status} maxActivations={l.maxActivations} activeInstallations={active} />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-500">Installations</p>
                    {l.installations.length === 0 ? (
                      <p className="mt-1 text-sm text-neutral-400">No installations yet.</p>
                    ) : (
                      <ul className="mt-2 flex flex-col gap-2">
                        {l.installations.map((i) => (
                          <li key={i.id} className="flex flex-col gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-2">
                                  <span className="break-all font-mono font-semibold text-neutral-950">{groupCode(i.registrationCode)}</span>
                                  <SoftwareBadge kind="installation" status={i.status} />
                                  {i.label && <span className="text-neutral-600">{i.label}</span>}
                                </p>
                                <p className="mt-0.5 text-xs text-neutral-600">
                                  Identifier <span className="break-all font-mono">{groupCode(i.registrationIdentifier)}</span>
                                  {i.activatedAt && `, activated ${formatDate(i.activatedAt)}`}
                                  {i.retiredAt && `, retired ${formatDate(i.retiredAt)}`}
                                  {i.retiredReason && ` (${i.retiredReason})`}
                                  {i.registeredPlayerId && ", linked to a registered player"}
                                </p>
                              </div>
                              {can.installationsWrite && <InstallationActions installationId={i.id} status={i.status} label={groupCode(i.registrationCode)} />}
                            </div>
                            {can.softwareKey && i.status !== "RETIRED" && <InstallationKey installationId={i.id} hasKey={i.hasActivationKey} />}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Activation requests</p>
                      {l.activationRequests.length === 0 ? (
                        <p className="mt-1 text-sm text-neutral-400">No registration code submitted.</p>
                      ) : (
                        <ul className="mt-1 flex flex-col gap-1 text-sm">
                          {l.activationRequests.map((a) => (
                            <li key={a.id} className="flex flex-wrap items-center gap-2">
                              {can.activations ? (
                                <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/software/activations/${a.id}`}>{activationNumber(a.number)}</Link>
                              ) : (
                                <span className="font-medium text-neutral-950">{activationNumber(a.number)}</span>
                              )}
                              <span className="font-mono text-xs text-neutral-600">{groupCode(a.registrationCode)}</span>
                              <SoftwareBadge kind="activation" status={a.status} />
                              {a.conflictInstallationId && <span className="text-xs font-semibold text-neutral-950">Review needed</span>}
                              <span className="text-xs text-neutral-500">{formatDate(a.submittedAt)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Support tickets</p>
                      {l.supportTickets.length === 0 ? (
                        <p className="mt-1 text-sm text-neutral-400">No tickets about this license.</p>
                      ) : (
                        <ul className="mt-1 flex flex-col gap-1 text-sm">
                          {l.supportTickets.map((t) => (
                            <li key={t.id} className="flex flex-wrap items-center gap-2">
                              {can.support ? (
                                <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/support/${t.id}`}>{ticketNumber(t.number)}</Link>
                              ) : (
                                <span className="font-medium text-neutral-950">{ticketNumber(t.number)}</span>
                              )}
                              <span className="min-w-0 truncate text-neutral-700">{t.subject}</span>
                              <StatusBadge status={t.status} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {can.licensesWrite && (
        <Panel title="Add a license" description="Manual, promotion or legacy license. No order is created.">
          <AddLicenseForm
            customerId={customerId}
            products={activeProducts.map((p) => ({ id: p.id, name: p.name, defaultMaxActivations: p.defaultMaxActivations }))}
          />
        </Panel>
      )}

      <Panel
        title="Downloads"
        description={
          latestByProduct.size
            ? `Latest: ${[...latestByProduct.values()].map((d) => `${d.product.name} ${d.release.version}`).join(", ")}. A download is not a license.`
            : "A download is not a license."
        }
        padded={false}
      >
        {downloads.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500 sm:p-6">This customer has not downloaded any software.</p>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Software</th>
                  <th className={th}>Version</th>
                  <th className={th}>Platform</th>
                  <th className={th}>From</th>
                  <th className={th}>Downloaded</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((d) => (
                  <tr key={d.id} className={tr}>
                    <td className={td}>{d.product.name}</td>
                    <td className={`${td} tabular-nums`}>{d.release.version}</td>
                    <td className={td}>{[d.release.platform, d.release.architecture].filter(Boolean).map((v) => humanize(String(v))).join(", ")}</td>
                    <td className={td}>{humanize(d.source)}</td>
                    <td className={`${td} tabular-nums`}>{formatDateTime(d.downloadedAt)}</td>
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

async function SupportTab({ customerId, email, canSupport }: { customerId: string; email: string; canSupport: boolean }) {
  const tickets = await ticketsForCustomer(customerId);
  const open = tickets.filter((t) => OPEN_STATUSES.includes(t.status));
  return (
    <Panel
      title="Support history"
      description={`${tickets.length} ticket${tickets.length === 1 ? "" : "s"}, ${open.length} open.`}
      padded={false}
      actions={
        canSupport ? (
          <Link className={btn.ghost} href={`/admin/shop/support?q=${encodeURIComponent(email)}`}>
            Open in support inbox <ArrowRight size={14} aria-hidden />
          </Link>
        ) : undefined
      }
    >
      {tickets.length === 0 ? (
        <div className="p-5 sm:p-6">
          <EmptyState title="No support tickets" body="Tickets the customer opens from their account appear here." />
        </div>
      ) : (
        <div className="px-5 pb-2 sm:px-6">
          <Table>
            <thead>
              <tr>
                <th className={th}>Ticket</th>
                <th className={th}>Subject</th>
                <th className={th}>Status</th>
                <th className={th}>Priority</th>
                <th className={th}>Assigned</th>
                <th className={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className={tr}>
                  <td className={td}>
                    {canSupport ? (
                      <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/support/${t.id}`}>{ticketNumber(t.number)}</Link>
                    ) : (
                      ticketNumber(t.number)
                    )}
                  </td>
                  <td className={`${td} max-w-[20rem] truncate`}>{t.subject}</td>
                  <td className={td}><StatusBadge status={t.status} /></td>
                  <td className={td}>{humanize(t.priority)}</td>
                  <td className={td}>{staffLabel(t.assignedStaff) ?? <span className="text-neutral-400">Unassigned</span>}</td>
                  <td className={`${td} tabular-nums`}>{formatDateTime(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Panel>
  );
}

async function ActivityTab({ customerId, me, canWrite }: { customerId: string; me: string; canWrite: boolean }) {
  const [notes, communications, activity] = await Promise.all([listNotes(customerId), listCommunications(customerId), listActivity(customerId, 100)]);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-3">
        <Panel title="Internal notes" description="Staff only. Never shown to the customer.">
          <div className="flex flex-col gap-6">
            {canWrite && <AddNoteForm customerId={customerId} />}
            <NotesList
              canWrite={canWrite}
              notes={notes.map((n) => ({
                id: n.id,
                body: n.body,
                createdAt: n.createdAt.toISOString(),
                updatedAt: n.updatedAt.toISOString(),
                authorName: staffLabel(n.createdByStaff) ?? "Former staff",
                isMine: n.createdByStaffId === me,
              }))}
            />
          </div>
        </Panel>
        {canWrite && (
          <Panel title="Log a communication" description="For contact outside the ticket system: calls, visits, WhatsApp. Not a replacement for ticket replies.">
            <CommunicationForm customerId={customerId} />
          </Panel>
        )}
        <Panel title="Communication log" padded={false}>
          {communications.length === 0 ? (
            <p className="p-5 text-sm text-neutral-500 sm:p-6">No communications logged.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {communications.map((c) => (
                <li key={c.id} className="px-5 py-3 text-sm sm:px-6">
                  <p className="font-medium text-neutral-950">
                    {c.direction === "INBOUND" ? "Inbound" : "Outbound"} {optionLabel(COMMUNICATION_TYPES, c.type).toLowerCase()}
                    {c.subject && `: ${c.subject}`}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDateTime(c.occurredAt)}
                    {staffLabel(c.staff) && `, by ${staffLabel(c.staff)}`}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-neutral-800">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Panel title="Timeline" description="Everything that happened with this customer, newest first." className="lg:col-span-2">
        <Timeline entries={activity} />
      </Panel>
    </div>
  );
}

async function TasksTab({
  customerId,
  me,
  canWrite,
  canSupport,
  canReadPlayers,
}: {
  customerId: string;
  me: string;
  canWrite: boolean;
  canSupport: boolean;
  canReadPlayers: boolean;
}) {
  const [tasks, staff, players, tickets] = await Promise.all([
    listCustomerTasks(customerId),
    canWrite ? listStaff() : Promise.resolve([]),
    canWrite && canReadPlayers ? listCustomerPlayers(customerId) : Promise.resolve([]),
    canWrite ? ticketsForCustomer(customerId) : Promise.resolve([]),
  ]);
  const activeStaff = staff.filter((s) => s.status === "ACTIVE");
  return (
    <div className="flex flex-col gap-6">
      {canWrite && (
        <Panel title="New task" description="Follow-ups for staff. Internal only.">
          <TaskForm
            customerId={customerId}
            currentStaffId={me}
            staff={activeStaff.map((s) => ({ id: s.id, label: s.displayName ?? s.email ?? "Unnamed" }))}
            players={players.map((p) => ({ id: p.id, label: `${p.playerType.name} ${groupCode(p.registrationCode)}` }))}
            tickets={tickets.map((t) => ({ id: t.id, label: `${ticketNumber(t.number)} ${t.subject}` }))}
          />
        </Panel>
      )}
      <Panel title="Tasks" padded={false}>
        {tasks.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No tasks" body="Create a task to remember a call back, a delivery or a configuration check." />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {tasks.map((t) => {
              const openTask = t.status === "OPEN" || t.status === "IN_PROGRESS";
              const overdue = openTask && isPast(t.dueAt);
              return (
                <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                  <div className="min-w-0 text-sm">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className={openTask ? "font-medium text-neutral-950" : "font-medium text-neutral-500 line-through"}>{t.title}</span>
                      <StatusBadge status={t.status} />
                      {t.priority !== "NORMAL" && (
                        <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700">{optionLabel(TASK_PRIORITIES, t.priority)} priority</span>
                      )}
                      {overdue && <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-xs font-semibold text-white">Overdue</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {t.dueAt ? `Due ${formatDateTime(t.dueAt)}` : "No due date"}, {staffLabel(t.assignedStaff) ?? "unassigned"}
                      {t.completedAt && `, completed ${formatDate(t.completedAt)}`}
                    </p>
                    {(t.player || t.ticket) && (
                      <p className="mt-0.5 text-xs text-neutral-600">
                        {t.player && <>Player {t.player.playerType.name} <span className="font-mono">{groupCode(t.player.registrationCode)}</span></>}
                        {t.player && t.ticket && ", "}
                        {t.ticket &&
                          (canSupport ? (
                            <Link className="font-medium text-neutral-950 hover:underline" href={`/admin/shop/support/${t.ticket.id}`}>{ticketNumber(t.ticket.number)}</Link>
                          ) : (
                            ticketNumber(t.ticket.number)
                          ))}
                      </p>
                    )}
                    {t.description && <p className="mt-1 whitespace-pre-wrap break-words text-neutral-700">{t.description}</p>}
                  </div>
                  {canWrite && <TaskStatusButtons taskId={t.id} status={t.status} />}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

async function DocumentsTab({ customerId, canWrite, canReadPlayers }: { customerId: string; canWrite: boolean; canReadPlayers: boolean }) {
  const [documents, players] = await Promise.all([
    listCustomerDocuments(customerId),
    canReadPlayers ? listCustomerPlayers(customerId) : Promise.resolve([]),
  ]);
  const playerLabel = new Map(players.map((p) => [p.id, `${p.playerType.name} ${groupCode(p.registrationCode)}`]));
  return (
    <div className="flex flex-col gap-6">
      {canWrite && (
        <Panel title="Upload a document" description="Service paperwork, registration forms, invoice copies, machine photos. Stored privately; customers cannot see them.">
          <DocumentUpload customerId={customerId} players={[...playerLabel].map(([id, label]) => ({ id, label }))} />
        </Panel>
      )}
      <Panel title="Documents" padded={false}>
        {documents.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No documents" body="Internal documents for this customer and their players appear here." />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {documents.map((d) => (
              <li key={d.id} className="flex flex-col gap-1 px-5 py-3 text-sm sm:px-6">
                <DocumentLink doc={d} />
                <p className="text-xs text-neutral-500">
                  {d.registeredPlayerId ? `Player ${playerLabel.get(d.registeredPlayerId) ?? ""}` : "Customer document"}, uploaded {formatDateTime(d.createdAt)}
                  {staffLabel(d.uploadedBy) && ` by ${staffLabel(d.uploadedBy)}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

const MUSIC_STATUSES = [
  { value: "live", label: "Live licenses" },
  { value: "ended", label: "Retired or revoked" },
  { value: "unassigned", label: "Not on a player" },
  { value: "all", label: "All" },
] as const;

/** Sections 59 and 85: arrangement → players for this customer, plus music waiting for a player. */
async function MusicTab({
  customerId,
  path,
  sp,
  can,
}: {
  customerId: string;
  path: string;
  sp: Record<string, string | string[] | undefined>;
  can: Can;
}) {
  const rawStatus = firstParam(sp.mstatus) ?? "live";
  const status = MUSIC_STATUSES.find((s) => s.value === rawStatus)?.value ?? "live";
  const rawPlayer = firstParam(sp.mplayer) ?? "";
  const rawSource = firstParam(sp.msource) ?? "";
  const source = LICENSE_SOURCES.includes(rawSource) ? (rawSource as MusicLicenseSource) : undefined;
  const q = firstParam(sp.mq)?.trim() ?? "";

  const players = await customerPlayerSummaries(customerId);
  const playerId = players.some((p) => p.id === rawPlayer) ? rawPlayer : undefined;
  const [matrix, unassigned, transfers, picker, targets] = await Promise.all([
    customerMusicMatrix(customerId, { playerId, status, source, q: q || undefined }),
    unassignedLicenses(customerId),
    listTransfers({ customerId, take: 50 }),
    can.musicGrant ? grantPickerOptions() : Promise.resolve(null),
    can.musicMigration ? customerMusicPlayers(customerId) : Promise.resolve([]),
  ]);
  const filtered = Boolean(playerId || status !== "live" || source || q);
  const licenseTotal = matrix.reduce((n, row) => n + row.licenses.length, 0);
  const needsReview = unassigned.filter((l) => l.needsReview).length;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Music"
        description={`${matrix.length} arrangement${matrix.length === 1 ? "" : "s"}, ${licenseTotal} license${licenseTotal === 1 ? "" : "s"}${filtered ? " matching the filters" : ""}. One license is one arrangement on one player.`}
        padded={false}
      >
        {picker && (
          <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
            <GrantMusic
              customerId={customerId}
              players={players.map((p) => ({ id: p.id, name: p.name, maskedRegistration: p.maskedRegistration, status: p.status, supportsMusicLibrary: p.supportsMusicLibrary }))}
              arrangements={picker.arrangements}
              bundles={picker.bundles}
            />
          </div>
        )}
        <form method="get" action={path} className="grid grid-cols-1 gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6 md:grid-cols-[1fr_12rem_12rem_12rem_auto] md:items-end">
          <input type="hidden" name="tab" value="music" />
          <Field label="Arrangement" htmlFor="music-mq">
            <input id="music-mq" name="mq" type="search" defaultValue={q} className={inputClass} autoComplete="off" />
          </Field>
          <Field label="Player" htmlFor="music-mplayer">
            <select id="music-mplayer" name="mplayer" defaultValue={playerId ?? ""} className={inputClass}>
              <option value="">All players</option>
              {players.filter((p) => p.supportsMusicLibrary).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="music-mstatus">
            <select id="music-mstatus" name="mstatus" defaultValue={status} className={inputClass}>
              {MUSIC_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Source" htmlFor="music-msource">
            <select id="music-msource" name="msource" defaultValue={source ?? ""} className={inputClass}>
              <option value="">All sources</option>
              {LICENSE_SOURCES.map((s) => <option key={s} value={s}>{MUSIC_SOURCE_LABEL[s]}</option>)}
            </select>
          </Field>
          <div className="flex gap-2">
            <button type="submit" className={btn.primary}>Filter</button>
            {filtered && <Link href={`${path}?tab=music`} className={btn.ghost}>Clear</Link>}
          </div>
        </form>
        {matrix.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              title={filtered ? "No music matches" : "No music yet"}
              body={filtered ? "Try other filters." : "Purchases, grants and starter collections for this customer's players appear here."}
            />
          </div>
        ) : (
          <div className="px-5 pb-2 sm:px-6">
            <Table>
              <thead>
                <tr>
                  <th className={th}>Arrangement</th>
                  <th className={th}>Players</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.arrangement.id} className={tr}>
                    <td className={`${td} max-w-[18rem] align-top`}>
                      <p className="truncate font-medium text-neutral-950">{row.arrangement.displayTitle}</p>
                      <p className="text-xs text-neutral-500">{row.arrangement.sku}</p>
                    </td>
                    <td className={`${td} whitespace-normal`}>
                      <ul className="flex flex-wrap gap-1.5">
                        {row.licenses.map((l) => (
                          <li
                            key={l.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-xs"
                            title={[label(MUSIC_SOURCE_LABEL, l.source), formatDate(l.createdAt), l.statusReason].filter(Boolean).join(", ")}
                          >
                            {l.player ? (
                              can.readPlayers ? (
                                <Link href={`/admin/shop/players/${l.player.id}`} className="font-medium text-neutral-950 hover:underline">{l.player.name}</Link>
                              ) : (
                                <span className="font-medium text-neutral-950">{l.player.name}</span>
                              )
                            ) : (
                              <span className="text-neutral-600">Not on a player</span>
                            )}
                            {l.status !== "ACTIVE" && <span className="text-neutral-500">{l.needsReview ? "needs review" : l.status.replace(/_/g, " ").toLowerCase()}</span>}
                            <span className="text-neutral-400">{label(MUSIC_SOURCE_LABEL, l.source)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {matrix.length >= 2000 && <p className="py-3 text-xs text-neutral-500">Showing the first 2000 licenses. Narrow the filters to see the rest.</p>}
          </div>
        )}
      </Panel>

      <Panel
        title="Not on a player yet"
        description={
          unassigned.length
            ? `${unassigned.length} license${unassigned.length === 1 ? "" : "s"}${needsReview ? `, ${needsReview} flagged for staff review` : ""}. Legacy purchases and music bought before a player was chosen.`
            : "All of this customer's music is on a player."
        }
      >
        {unassigned.length === 0 ? (
          <p className="text-sm text-neutral-500">Nothing waiting.</p>
        ) : can.musicMigration ? (
          <AssignUnassigned
            licenses={unassigned.map((l) => ({
              id: l.id,
              title: l.arrangement.displayTitle,
              sku: l.arrangement.sku,
              needsReview: l.needsReview,
              statusReason: l.statusReason,
              source: l.licenseSource,
              createdAt: l.createdAt.toISOString(),
            }))}
            players={targets.filter((p) => p.eligible && p.supportsMusicLibrary).map((p) => ({ id: p.id, name: p.name, maskedRegistration: p.maskedRegistration }))}
          />
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {unassigned.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-neutral-950">{l.arrangement.displayTitle}</span>
                <StatusBadge status={l.needsReview ? "NEEDS_REVIEW" : "UNASSIGNED"} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Transfers" description="Replacements, library moves and ownership transfers involving this customer." padded={false}>
        <div className="px-5 pb-2 sm:px-6">
          <TransfersTable rows={transfers} linkPlayers={can.readPlayers} linkCustomers showCustomers={transfers.some((t) => t.newCustomer)} />
        </div>
      </Panel>
    </div>
  );
}
