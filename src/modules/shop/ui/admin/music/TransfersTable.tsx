import Link from "next/link";
import { formatDateTime } from "../../format";
import { displayCustomer } from "../crm/labels";
import { EmptyState, Table, td, th, tr } from "../primitives";
import { label, playerLabel, RESALE_POLICY_LABEL, TRANSFER_MODE_LABEL, TRANSFER_TYPE_LABEL } from "./labels";

type PlayerRef = { id: string; friendlyName: string | null; registrationCode: string; playerType: { name: string } } | null;
type CustomerRef = { id: string; email: string; firstName: string | null; lastName: string | null } | null;

export type TransferRow = {
  id: string;
  reference: string;
  type: string;
  mode: string;
  status: string;
  reason: string;
  notes: string | null;
  libraryPolicy: string | null;
  licenseCount: number;
  createdAt: Date;
  fromPlayer: PlayerRef;
  toPlayer: PlayerRef;
  customer: CustomerRef;
  newCustomer: CustomerRef;
  createdBy: { displayName: string | null; email: string | null } | null;
};

function PlayerLink({ p, linkPlayers }: { p: PlayerRef; linkPlayers: boolean }) {
  if (!p) return <span className="text-neutral-400">Removed</span>;
  return linkPlayers ? (
    <Link href={`/admin/shop/players/${p.id}`} className="font-medium text-neutral-950 hover:underline">{playerLabel(p)}</Link>
  ) : (
    <span className="font-medium text-neutral-950">{playerLabel(p)}</span>
  );
}

function CustomerLink({ c, linkCustomers }: { c: CustomerRef; linkCustomers: boolean }) {
  if (!c) return null;
  const name = displayCustomer(c);
  return linkCustomers ? <Link href={`/admin/shop/customers/${c.id}`} className="hover:underline">{name}</Link> : <span>{name}</span>;
}

/** MusicLicenseTransfer business records (section 42), newest first. */
export function TransfersTable({
  rows,
  linkPlayers,
  linkCustomers,
  showCustomers = true,
}: {
  rows: TransferRow[];
  linkPlayers: boolean;
  linkCustomers: boolean;
  showCustomers?: boolean;
}) {
  if (!rows.length) {
    return <EmptyState title="No transfers" body="Replacements, library moves and ownership transfers are recorded here with a TRF number." />;
  }
  return (
    <Table>
      <thead>
        <tr>
          <th className={th}>Transfer</th>
          <th className={th}>Type</th>
          <th className={th}>From → to</th>
          {showCustomers && <th className={th}>Customer</th>}
          <th className={`${th} text-right`}>Licenses</th>
          <th className={th}>Reason</th>
          <th className={th}>Staff</th>
          <th className={th}>Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id} className={tr}>
            <td className={`${td} font-medium text-neutral-950`}>{t.reference}</td>
            <td className={td}>
              <p>{label(TRANSFER_TYPE_LABEL, t.type)}</p>
              <p className="text-xs text-neutral-500">
                {label(TRANSFER_MODE_LABEL, t.mode)}
                {t.libraryPolicy && `, ${label(RESALE_POLICY_LABEL, t.libraryPolicy).toLowerCase()}`}
                {t.status !== "COMPLETED" && `, ${t.status.toLowerCase()}`}
              </p>
            </td>
            <td className={td}>
              {t.mode === "PLAYER_OWNERSHIP" ? (
                <PlayerLink p={t.fromPlayer} linkPlayers={linkPlayers} />
              ) : (
                <span className="flex flex-wrap items-center gap-1">
                  <PlayerLink p={t.fromPlayer} linkPlayers={linkPlayers} />
                  <span className="text-neutral-400" aria-label="to">→</span>
                  <PlayerLink p={t.toPlayer} linkPlayers={linkPlayers} />
                </span>
              )}
            </td>
            {showCustomers && (
              <td className={`${td} max-w-[16rem]`}>
                <span className="flex flex-wrap items-center gap-1 truncate">
                  <CustomerLink c={t.customer} linkCustomers={linkCustomers} />
                  {t.newCustomer && (
                    <>
                      <span className="text-neutral-400" aria-label="to">→</span>
                      <CustomerLink c={t.newCustomer} linkCustomers={linkCustomers} />
                    </>
                  )}
                </span>
              </td>
            )}
            <td className={`${td} text-right tabular-nums`}>{t.licenseCount}</td>
            <td className={`${td} max-w-[16rem]`}>
              <p className="truncate" title={t.reason}>{t.reason}</p>
              {t.notes && <p className="truncate text-xs text-neutral-500" title={t.notes}>{t.notes}</p>}
            </td>
            <td className={td}>{t.createdBy ? (t.createdBy.displayName ?? t.createdBy.email) : <span className="text-neutral-400">System</span>}</td>
            <td className={`${td} tabular-nums`}>{formatDateTime(t.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
