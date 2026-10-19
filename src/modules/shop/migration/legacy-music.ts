/**
 * Phase 4 legacy migration: account-level Entitlements → player-bound MusicLicenses.
 *
 * Plain module (no "server-only") so the CLI (`npm run shop:migrate-music`) and the admin
 * migration queue share exactly one implementation. Rules (spec §83–86), per customer and
 * per ACTIVE entitlement that has no music license yet:
 *
 *   exactly one eligible ACTIVE player   → ACTIVE license on it (LEGACY_MIGRATION)
 *   several eligible players             → a trustworthy player-bound DeliveryArtifact for
 *                                          that arrangement on exactly one of them decides;
 *                                          otherwise UNASSIGNED + needsReview (never guessed)
 *   no eligible player                   → UNASSIGNED (assigned automatically when the
 *                                          customer's first player is activated)
 *   arrangement incompatible with player → UNASSIGNED + needsReview
 *
 * Idempotent: an arrangement that already has any non-revoked license for the customer is
 * skipped, so the migration can be re-run safely. Entitlements, sources, orders and
 * allocations are only read, never changed. `dryRun` computes the same report and writes
 * nothing.
 */
import type { PrismaClient } from "@/generated/shop-prisma/client";

type Db = Pick<PrismaClient, "customer" | "entitlement" | "registeredPlayer" | "musicLicense" | "musicLicenseEvent" | "deliveryArtifact" | "arrangementCompatibility" | "playerType" | "$transaction">;

export type MigrationOutcome = "AUTO_ASSIGNED" | "EVIDENCE_ASSIGNED" | "NEEDS_REVIEW" | "WAITING_FOR_PLAYER" | "INCOMPATIBLE_REVIEW";

export type CustomerMigrationReport = {
  customerId: string;
  email: string | null;
  name: string;
  entitlements: number;
  alreadyLicensed: number;
  eligiblePlayers: number;
  outcomes: Record<MigrationOutcome, number>;
  status: "AUTO_ASSIGNED" | "NEEDS_REVIEW" | "WAITING_FOR_PLAYER" | "UP_TO_DATE" | "MIXED";
};

export type MigrationReport = {
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  customers: CustomerMigrationReport[];
  totals: Record<MigrationOutcome, number> & { customers: number; entitlements: number; alreadyLicensed: number; licensesCreated: number };
};

const emptyOutcomes = (): Record<MigrationOutcome, number> => ({
  AUTO_ASSIGNED: 0, EVIDENCE_ASSIGNED: 0, NEEDS_REVIEW: 0, WAITING_FOR_PLAYER: 0, INCOMPATIBLE_REVIEW: 0,
});

async function compatibleWith(db: Db, playerTypeId: string, arrangementIds: string[]): Promise<Set<string> | null> {
  const type = await db.playerType.findUnique({ where: { id: playerTypeId }, select: { systemProfiles: { select: { id: true } } } });
  if (!type || type.systemProfiles.length === 0 || arrangementIds.length === 0) return null;
  const typeProfiles = new Set(type.systemProfiles.map((p) => p.id));
  const rows = await db.arrangementCompatibility.findMany({
    where: { arrangementId: { in: arrangementIds } },
    select: { arrangementId: true, systemProfileId: true, systemProfile: { select: { isGeneric: true } } },
  });
  const by = new Map<string, typeof rows>();
  for (const r of rows) by.set(r.arrangementId, [...(by.get(r.arrangementId) ?? []), r]);
  return new Set(arrangementIds.filter((id) => {
    const c = by.get(id);
    return !c || c.some((x) => x.systemProfile.isGeneric || typeProfiles.has(x.systemProfileId));
  }));
}

export async function migrateCustomerLegacyMusic(db: Db, customerId: string, opts: { dryRun: boolean }): Promise<CustomerMigrationReport & { created: number }> {
  const customer = await db.customer.findUniqueOrThrow({ where: { id: customerId }, select: { id: true, email: true, firstName: true, lastName: true } });
  const entitlements = await db.entitlement.findMany({
    where: { customerId, status: "ACTIVE" },
    select: { id: true, arrangementId: true, sources: { where: { revokedAt: null }, orderBy: { grantedAt: "asc" }, take: 1, select: { id: true } } },
  });
  const licensed = new Set((await db.musicLicense.findMany({
    where: { customerId, status: { not: "REVOKED" } },
    select: { arrangementId: true },
  })).map((l) => l.arrangementId));
  const players = await db.registeredPlayer.findMany({
    where: { customerId, status: "ACTIVE", playerType: { supportsMusicLibrary: true } },
    select: { id: true, playerTypeId: true, registrationIdentifier: true },
    orderBy: { createdAt: "asc" },
  });
  const pending = entitlements.filter((e) => !licensed.has(e.arrangementId));
  const outcomes = emptyOutcomes();

  // Decide every arrangement first (pure reads), then write in one transaction.
  const plan: { entitlementId: string; entitlementSourceId: string | null; arrangementId: string; playerId: string | null; needsReview: boolean; outcome: MigrationOutcome; reason: string }[] = [];
  const compat = new Map<string, Set<string> | null>();
  for (const p of players) compat.set(p.id, await compatibleWith(db, p.playerTypeId, pending.map((e) => e.arrangementId)));
  const evidence = players.length > 1 && pending.length
    ? await db.deliveryArtifact.findMany({
        where: {
          customerId,
          arrangementId: { in: pending.map((e) => e.arrangementId) },
          OR: [
            { registeredPlayerId: { in: players.map((p) => p.id) } },
            { deviceRegistrationRef: { in: players.map((p) => p.registrationIdentifier) } },
          ],
        },
        select: { arrangementId: true, registeredPlayerId: true, deviceRegistrationRef: true },
      })
    : [];

  for (const e of pending) {
    const base = { entitlementId: e.id, entitlementSourceId: e.sources[0]?.id ?? null, arrangementId: e.arrangementId };
    const fits = (playerId: string) => { const c = compat.get(playerId); return !c || c.has(e.arrangementId); };
    if (players.length === 0) {
      plan.push({ ...base, playerId: null, needsReview: false, outcome: "WAITING_FOR_PLAYER", reason: "Legacy purchase: no registered player yet" });
    } else if (players.length === 1) {
      const only = players[0]!;
      plan.push(fits(only.id)
        ? { ...base, playerId: only.id, needsReview: false, outcome: "AUTO_ASSIGNED", reason: "Legacy purchase: customer's only player" }
        : { ...base, playerId: null, needsReview: true, outcome: "INCOMPATIBLE_REVIEW", reason: "Legacy purchase: not compatible with the customer's player" });
    } else {
      const hits = new Set(
        evidence
          .filter((d) => d.arrangementId === e.arrangementId)
          .map((d) => d.registeredPlayerId ?? players.find((p) => p.registrationIdentifier === d.deviceRegistrationRef)?.id)
          .filter(Boolean) as string[],
      );
      const one = hits.size === 1 ? [...hits][0]! : null;
      plan.push(one && fits(one)
        ? { ...base, playerId: one, needsReview: false, outcome: "EVIDENCE_ASSIGNED", reason: "Legacy purchase: previously delivered to this player" }
        : { ...base, playerId: null, needsReview: true, outcome: "NEEDS_REVIEW", reason: `Legacy purchase: customer has ${players.length} players` });
    }
  }
  for (const p of plan) outcomes[p.outcome]++;

  let created = 0;
  if (!opts.dryRun && plan.length) {
    await db.$transaction(async (tx) => {
      for (const p of plan) {
        // Re-check inside the transaction: idempotent under concurrent runs.
        const exists = await tx.musicLicense.findFirst({ where: { customerId, arrangementId: p.arrangementId, status: { not: "REVOKED" } }, select: { id: true } });
        if (exists) continue;
        const now = new Date();
        const license = await tx.musicLicense.create({
          data: {
            customerId, arrangementId: p.arrangementId, entitlementId: p.entitlementId, entitlementSourceId: p.entitlementSourceId,
            licensedPlayerId: p.playerId, status: p.playerId ? "ACTIVE" : "UNASSIGNED", licenseSource: "LEGACY_MIGRATION",
            needsReview: p.needsReview, statusReason: p.playerId ? null : p.reason, reason: p.reason,
            assignedAt: p.playerId ? now : null, activatedAt: p.playerId ? now : null,
          },
        });
        await tx.musicLicenseEvent.create({ data: { musicLicenseId: license.id, type: "CREATED", toPlayerId: p.playerId, reason: p.reason } });
        created++;
      }
    }, { timeout: 120_000 });
  }

  const review = outcomes.NEEDS_REVIEW + outcomes.INCOMPATIBLE_REVIEW;
  const assigned = outcomes.AUTO_ASSIGNED + outcomes.EVIDENCE_ASSIGNED;
  const status: CustomerMigrationReport["status"] =
    plan.length === 0 ? "UP_TO_DATE"
    : review > 0 ? "NEEDS_REVIEW"
    : outcomes.WAITING_FOR_PLAYER > 0 && assigned === 0 ? "WAITING_FOR_PLAYER"
    : outcomes.WAITING_FOR_PLAYER === 0 ? "AUTO_ASSIGNED"
    : "MIXED";
  return {
    customerId,
    email: customer.email,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email || customerId,
    entitlements: entitlements.length,
    alreadyLicensed: entitlements.length - pending.length,
    eligiblePlayers: players.length,
    outcomes,
    status,
    created,
  };
}

export async function runLegacyMusicMigration(db: Db, opts: { dryRun: boolean; customerIds?: string[] }): Promise<MigrationReport> {
  const startedAt = new Date().toISOString();
  const customers = opts.customerIds ?? (await db.entitlement.findMany({
    where: { status: "ACTIVE" }, distinct: ["customerId"], select: { customerId: true },
  })).map((r) => r.customerId);
  const reports: CustomerMigrationReport[] = [];
  const totals = { ...emptyOutcomes(), customers: 0, entitlements: 0, alreadyLicensed: 0, licensesCreated: 0 };
  for (const id of customers) {
    const { created, ...r } = await migrateCustomerLegacyMusic(db, id, opts);
    reports.push(r);
    totals.customers++;
    totals.entitlements += r.entitlements;
    totals.alreadyLicensed += r.alreadyLicensed;
    totals.licensesCreated += created;
    for (const k of Object.keys(r.outcomes) as MigrationOutcome[]) totals[k] += r.outcomes[k];
  }
  return { dryRun: opts.dryRun, startedAt, finishedAt: new Date().toISOString(), customers: reports, totals };
}
