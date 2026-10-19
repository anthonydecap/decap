import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowSquareOut, CheckCircle, Warning } from "@phosphor-icons/react/ssr";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { formatOrderNumber } from "@/modules/shop/services/checkout";
import { listCustomerPlayers } from "@/modules/shop/services/players";
import { activationNumber, getActivationRequest, licenseNumber } from "@/modules/shop/services/software-licensing";
import { listStaff } from "@/modules/shop/services/staff";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";
import { Notice, PageHeader, Panel, StatusBadge } from "@/modules/shop/ui/admin/primitives";
import { ActivationActions, AdminNotes, ApproveForm } from "@/modules/shop/ui/admin/software-activations/ActivationProcess";
import { CopyButton } from "@/modules/shop/ui/admin/software-activations/CopyButton";
import { InstallationActions } from "@/modules/shop/ui/admin/software-activations/InstallationActions";
import { InstallationKey } from "@/modules/shop/ui/admin/software-activations/InstallationKey";
import {
  customerLabel,
  groupCode,
  LICENSE_SOURCE_LABEL,
  OPEN_ACTIVATION,
  SoftwareBadge,
  staffName,
} from "@/modules/shop/ui/admin/software-activations/labels";
import { personName, requestTime, timeAgo } from "@/modules/shop/ui/admin/support/labels";
import { formatDate, formatDateTime } from "@/modules/shop/ui/format";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-neutral-900">{children}</dd>
    </div>
  );
}

const linkClass = "font-medium text-neutral-950 hover:underline";

export default async function AdminActivationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/admin/shop/software/activations/${id}`;
  const guard = await guardStaffPage("software:activations-read", path);
  if (!guard.ok) return <NoAccess reason={guard.reason} returnTo={path} />;
  if (!UUID.test(id)) notFound();

  const role = guard.ctx.staff.role;
  const can = {
    process: roleHasPermission(role, "software:activations-process"),
    transfer: roleHasPermission(role, "players:transfer"),
    revealKey: roleHasPermission(role, "software:activation-key"),
    licensesWrite: roleHasPermission(role, "software:licenses-write"),
    installationsWrite: roleHasPermission(role, "software:activations-process"),
    customers: roleHasPermission(role, "customers:read"),
    orders: roleHasPermission(role, "orders:read"),
    players: roleHasPermission(role, "players:read"),
  };

  const r = await getActivationRequest(id);
  if (!r) notFound();
  const isOpen = OPEN_ACTIVATION.includes(r.status);

  const [staff, players] = await Promise.all([
    can.process && isOpen ? listStaff() : Promise.resolve([]),
    can.process && isOpen && can.players ? listCustomerPlayers(r.customerId) : Promise.resolve([]),
  ]);

  const now = requestTime();
  const label = activationNumber(r.number);
  const lic = r.license;
  const licLabel = licenseNumber(lic.number);
  const c = r.customer;
  const name = personName(c);
  const crmHref = `/admin/shop/customers/${c.id}`;
  const assignees = staff.filter((s) => s.status === "ACTIVE").map((s) => ({ id: s.id, label: s.displayName ?? s.email ?? "Unnamed staff" }));
  const replaced = r.replacesInstallationId ? lic.installations.find((i) => i.id === r.replacesInstallationId) : null;
  const conflict = r.conflict;
  const conflictOwner = conflict ? (conflict.sameCustomer ? "this customer" : customerLabel({ ...conflict.customer, companyName: null })) : "";
  const retiring = [r.replacesInstallationId, conflict?.id].filter(Boolean);
  const activeAfterRetire = lic.installations.filter((i) => i.status === "ACTIVE" && !retiring.includes(i.id)).length;
  const slotsFull = activeAfterRetire >= lic.maxActivations;
  const licenseBlocked = lic.status === "SUSPENDED" || lic.status === "REVOKED";
  const installation = r.softwareInstallationId ? lic.installations.find((i) => i.id === r.softwareInstallationId) : null;
  const display = groupCode(r.registrationCode);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/shop/software/activations", label: "Activation queue" }}
        title={`${label}: ${r.product.name}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <SoftwareBadge kind="activation" status={r.status} />
            <span>Submitted {formatDateTime(r.submittedAt)} ({timeAgo(r.submittedAt, now)})</span>
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="code-heading">
            <p id="code-heading" className="text-xs font-medium text-neutral-500">Registration code</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all font-mono text-2xl font-bold tracking-wider text-neutral-950 sm:text-3xl">{display}</p>
              <CopyButton value={r.registrationCode} label="Copy registration code" />
            </div>
            <p className="mt-2 text-xs text-neutral-500">Shown in groups of four for reading. Copy gives the exact code without dashes.</p>
          </section>

          <dl className="grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <Row label="Customer">
              <span className="flex flex-col">
                {can.customers ? (
                  <Link href={`${crmHref}?tab=software`} className={linkClass}>{name ?? c.companyName ?? c.email}</Link>
                ) : (
                  <span className="font-medium">{name ?? c.companyName ?? c.email}</span>
                )}
                {c.companyName && name && <span className="text-neutral-600">{c.companyName}</span>}
                <a href={`mailto:${c.email}`} className="break-all text-neutral-600 hover:underline">{c.email}</a>
                {c.phone && <a href={`tel:${c.phone}`} className="text-neutral-600 hover:underline">{c.phone}</a>}
              </span>
            </Row>
            <Row label="Software">{r.product.name}</Row>
            <Row label="License">
              <span className="flex flex-wrap items-center gap-2">
                {can.customers ? <Link href={`${crmHref}?tab=software`} className={linkClass}>{licLabel}</Link> : <span className="font-medium">{licLabel}</span>}
                <SoftwareBadge kind="license" status={lic.status} />
              </span>
              <span className="block text-xs text-neutral-500">
                {LICENSE_SOURCE_LABEL[lic.licenseSource] ?? lic.licenseSource}, since {formatDate(lic.purchasedAt)},{" "}
                {lic.installations.filter((i) => i.status === "ACTIVE").length} of {lic.maxActivations} activation{lic.maxActivations === 1 ? "" : "s"} in use
              </span>
            </Row>
            <Row label="Order">
              {lic.order ? (
                can.orders ? (
                  <Link href={`/admin/shop/orders/${lic.order.id}`} className={linkClass}>{formatOrderNumber(lic.order.number)}</Link>
                ) : (
                  formatOrderNumber(lic.order.number)
                )
              ) : (
                <span className="text-neutral-400">No order ({(LICENSE_SOURCE_LABEL[lic.licenseSource] ?? lic.licenseSource).toLowerCase()} license)</span>
              )}
            </Row>
          </dl>

          {r.customerMessage && (
            <Panel title="Message from the customer">
              <p className="whitespace-pre-wrap break-words text-sm text-neutral-800">{r.customerMessage}</p>
            </Panel>
          )}

          {r.status === "WAITING_FOR_CUSTOMER" && r.infoRequest && (
            <Notice>
              <span className="font-semibold">Waiting for the customer.</span> We asked: <span className="whitespace-pre-wrap">{r.infoRequest}</span>
            </Notice>
          )}

          {conflict && (
            <section className="rounded-2xl border-2 border-neutral-950 bg-white p-5 sm:p-6" aria-labelledby="conflict-heading">
              <h2 id="conflict-heading" className="flex items-center gap-2 font-display text-base font-bold text-neutral-950">
                <Warning size={18} weight="bold" aria-hidden />
                Review needed: registration code already active
              </h2>
              {conflict.sameCustomer ? (
                <p className="mt-2 text-sm text-neutral-700">
                  This code is already active on another installation of <span className="font-semibold">this customer</span>. Approving retires that
                  installation (kept as history) and activates this one. Usually a reinstall on the same computer.
                </p>
              ) : (
                <div className="mt-2 flex flex-col gap-2 text-sm text-neutral-700">
                  <p>
                    This code is active on an installation that belongs to{" "}
                    {can.customers ? (
                      <Link href={`/admin/shop/customers/${conflict.customerId}?tab=software`} className={linkClass}>{conflictOwner}</Link>
                    ) : (
                      <span className="font-semibold">{conflictOwner}</span>
                    )}{" "}
                    ({conflict.customer.email}). It is never moved automatically.
                  </p>
                  <p>
                    {can.transfer
                      ? "As a super admin you can retire that installation and approve below, once you have confirmed the computer changed hands."
                      : "Only a super admin can retire that installation and approve. Ask the customer for details or hand this request to a super admin."}
                  </p>
                </div>
              )}
            </section>
          )}

          {r.replacesInstallationId && (
            <Panel title="Replacement" description="The customer replaced a computer or reinstalled.">
              {replaced ? (
                <p className="text-sm text-neutral-700">
                  Approving retires installation <span className="font-mono font-semibold text-neutral-950">{groupCode(replaced.registrationCode)}</span>
                  {replaced.label && ` (${replaced.label})`}, activated {replaced.activatedAt ? formatDate(replaced.activatedAt) : "on an unknown date"}. Its
                  history is kept and its activation slot is reused.
                  {replaced.status !== "ACTIVE" && " It is no longer active, so nothing will change for it."}
                </p>
              ) : (
                <p className="text-sm text-neutral-500">The installation being replaced is no longer on this license.</p>
              )}
            </Panel>
          )}

          <Panel title="Process">
            {r.status === "APPROVED" ? (
              <div className="flex flex-col gap-4">
                <Notice tone="success">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle size={18} weight="fill" aria-hidden />
                    Approved{r.reviewedAt && ` ${formatDateTime(r.reviewedAt)}`}
                    {staffName(r.reviewedBy) && ` by ${staffName(r.reviewedBy)}`}. The customer can copy the key from their account.
                  </span>
                </Notice>
                {installation ? (
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Row label="Installation">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-mono">{groupCode(installation.registrationCode)}</span>
                        <SoftwareBadge kind="installation" status={installation.status} />
                      </span>
                      {installation.label && <span className="block text-xs text-neutral-500">{installation.label}</span>}
                    </Row>
                    <Row label="Activated">{installation.activatedAt ? formatDateTime(installation.activatedAt) : "Not recorded"}</Row>
                    {can.revealKey && (
                      <Row label="Activation key">
                        <InstallationKey installationId={installation.id} hasKey={installation.hasActivationKey} />
                      </Row>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-neutral-500">The installation created by this approval is no longer linked.</p>
                )}
              </div>
            ) : r.status === "REJECTED" ? (
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-neutral-800">
                  Rejected{r.reviewedAt && ` ${formatDateTime(r.reviewedAt)}`}
                  {staffName(r.reviewedBy) && ` by ${staffName(r.reviewedBy)}`}.
                </p>
                {r.rejectionReason && <p className="whitespace-pre-wrap text-neutral-600">Reason given to the customer: {r.rejectionReason}</p>}
              </div>
            ) : r.status === "CANCELLED" ? (
              <p className="text-sm text-neutral-600">This request was cancelled by the customer, or because the license was revoked.</p>
            ) : !can.process ? (
              <p className="text-sm text-neutral-600">Your role can view activation requests but not process them.</p>
            ) : licenseBlocked ? (
              <Notice tone="error">
                License {licLabel} is {lic.status.toLowerCase()}, so it cannot be activated. Reinstate the license from the customer&apos;s Software tab
                first, or reject this request.
              </Notice>
            ) : (
              <ApproveForm
                requestId={r.id}
                requestLabel={label}
                registrationCode={r.registrationCode}
                registrationDisplay={display}
                conflict={conflict ? { sameCustomer: conflict.sameCustomer, ownerLabel: conflictOwner } : null}
                canTransfer={can.transfer}
                slotsFull={slotsFull}
                players={players
                  .filter((p) => p.status !== "RETIRED")
                  .map((p) => ({ id: p.id, label: `${p.playerType.name} ${groupCode(p.registrationCode)}${p.adminLabel ? ` (${p.adminLabel})` : ""}` }))}
              />
            )}
          </Panel>

          <Panel
            title={`Installations on ${licLabel}`}
            description={`${lic.installations.filter((i) => i.status === "ACTIVE").length} of ${lic.maxActivations} activation${lic.maxActivations === 1 ? "" : "s"} in use. History is never deleted.`}
            padded={false}
          >
            {lic.installations.length === 0 ? (
              <p className="p-5 text-sm text-neutral-500 sm:p-6">No installations yet. Approving this request creates the first one.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {lic.installations.map((i) => (
                  <li key={i.id} className="flex flex-col gap-3 px-5 py-4 text-sm sm:px-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="break-all font-mono font-semibold text-neutral-950">{groupCode(i.registrationCode)}</span>
                          <SoftwareBadge kind="installation" status={i.status} />
                          {i.id === r.replacesInstallationId && <span className="text-xs text-neutral-500">Being replaced</span>}
                          {i.id === r.softwareInstallationId && <span className="text-xs text-neutral-500">Created by {label}</span>}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {i.label ? `${i.label}, ` : ""}
                          {i.activatedAt ? `activated ${formatDate(i.activatedAt)}` : "not activated"}
                          {i.retiredAt && `, retired ${formatDate(i.retiredAt)}`}
                        </p>
                      </div>
                      {can.installationsWrite && <InstallationActions installationId={i.id} status={i.status} label={groupCode(i.registrationCode)} />}
                    </div>
                    {can.revealKey && i.status !== "RETIRED" && <InstallationKey installationId={i.id} hasKey={i.hasActivationKey} />}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <Panel title="Request">
            {isOpen && can.process ? (
              <ActivationActions
                requestId={r.id}
                requestLabel={label}
                status={r.status}
                registrationCode={r.registrationCode}
                assignedStaffId={r.assignedStaffId}
                assignedLabel={staffName(r.assignedStaff)}
                assignees={assignees}
                currentStaffId={guard.ctx.staff.id}
              />
            ) : (
              <dl className="flex flex-col gap-3">
                <Row label="Status"><SoftwareBadge kind="activation" status={r.status} /></Row>
                <Row label="Assigned to">{staffName(r.assignedStaff) ?? <span className="text-neutral-400">Unassigned</span>}</Row>
                {r.reviewedAt && <Row label="Closed">{formatDateTime(r.reviewedAt)}{staffName(r.reviewedBy) && `, ${staffName(r.reviewedBy)}`}</Row>}
              </dl>
            )}
          </Panel>

          <Panel title="Internal notes">
            <AdminNotes requestId={r.id} initial={r.adminNotes ?? ""} canWrite={can.process} />
          </Panel>

          <Panel
            title="Related tasks"
            actions={
              can.customers ? (
                <Link href={`${crmHref}?tab=tasks`} className="inline-flex items-center gap-1 text-sm font-medium text-neutral-950 hover:underline">
                  All tasks
                  <ArrowSquareOut size={14} aria-hidden />
                </Link>
              ) : undefined
            }
          >
            {r.tasks.length === 0 ? (
              <p className="text-sm text-neutral-500">No CRM task is linked to this request.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {r.tasks.map((t) => (
                  <li key={t.id} className="flex flex-col gap-1 text-sm">
                    <span className="break-words text-neutral-900">{t.title}</span>
                    <span className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <StatusBadge status={t.status} />
                      {staffName(t.assignedStaff) ?? "Unassigned"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </>
  );
}
