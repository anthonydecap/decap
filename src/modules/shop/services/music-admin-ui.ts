import "server-only";
import { shopDb } from "../db";
import { LIVE_LICENSE_STATUSES, licenseCountsByPlayer, maskRegistration, playerDisplayName } from "./music-licenses";

/**
 * Read-only helpers for the admin music / player screens. No mutations here: every write
 * goes through the audited API routes and services.
 */

/** Options for the "Add music" dialog: arrangements and collections that can be granted. */
export async function grantPickerOptions() {
  const db = shopDb();
  const [arrangements, bundles] = await Promise.all([
    db.arrangement.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, sku: true, displayTitle: true },
      orderBy: { displayTitle: "asc" },
    }),
    db.bundle.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, sku: true, title: true, _count: { select: { items: true } } },
      orderBy: { title: "asc" },
    }),
  ]);
  return {
    arrangements,
    bundles: bundles.map((b) => ({ id: b.id, sku: b.sku, title: b.title, itemCount: b._count.items })),
  };
}

/** Choices for the player type settings: software, starter collection, system profiles. */
export async function playerTypeSettingsOptions() {
  const db = shopDb();
  const [softwareProducts, bundles, systemProfiles] = await Promise.all([
    db.softwareProduct.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.bundle.findMany({ where: { status: { not: "ARCHIVED" } }, select: { id: true, sku: true, title: true }, orderBy: { title: "asc" } }),
    db.systemProfile.findMany({ select: { id: true, name: true, manufacturer: true, isGeneric: true, active: true }, orderBy: { name: "asc" } }),
  ]);
  return { softwareProducts, bundles, systemProfiles };
}

/** A customer's players with friendly name, masked registration and live license count. */
export async function customerPlayerSummaries(customerId: string) {
  const db = shopDb();
  const [players, counts] = await Promise.all([
    db.registeredPlayer.findMany({
      where: { customerId },
      select: {
        id: true, friendlyName: true, adminLabel: true, registrationCode: true, status: true, createdAt: true,
        playerType: { select: { name: true, supportsMusicLibrary: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    }),
    licenseCountsByPlayer(customerId),
  ]);
  return players.map((p) => ({
    id: p.id,
    name: playerDisplayName(p),
    friendlyName: p.friendlyName,
    adminLabel: p.adminLabel,
    typeName: p.playerType.name,
    supportsMusicLibrary: p.playerType.supportsMusicLibrary,
    maskedRegistration: maskRegistration(p.registrationCode),
    status: p.status,
    licenseCount: counts.get(p.id) ?? 0,
  }));
}

/** Dashboard: legacy music staff still have to place on a player. */
export async function musicReviewSummary() {
  const db = shopDb();
  const [needsReview, customers] = await Promise.all([
    db.musicLicense.count({ where: { status: "UNASSIGNED", needsReview: true } }),
    db.musicLicense.groupBy({ by: ["customerId"], where: { status: "UNASSIGNED", needsReview: true } }),
  ]);
  return { needsReview, customers: customers.length };
}

/** Order detail: which target players still exist, and what they are called now. */
export async function existingPlayers(ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length) return new Map<string, { id: string; name: string }>();
  const rows = await shopDb().registeredPlayer.findMany({
    where: { id: { in: unique } },
    select: { id: true, friendlyName: true, registrationCode: true, playerType: { select: { name: true } } },
  });
  return new Map(rows.map((r) => [r.id, { id: r.id, name: playerDisplayName(r) }]));
}

/**
 * Support context (section 63): the ticket's player with its music state, and the license
 * status of the ticket's arrangement on that player and the customer's other players.
 * Never includes an activation key.
 */
export async function supportMusicContext(input: { customerId: string; playerId: string | null; arrangementId: string | null }) {
  const db = shopDb();
  const [player, licenseCount, arrangementLicenses] = await Promise.all([
    input.playerId
      ? db.registeredPlayer.findUnique({
          where: { id: input.playerId },
          select: {
            id: true, friendlyName: true, registrationCode: true, status: true, customerId: true,
            playerType: { select: { name: true, supportsMusicLibrary: true } },
            softwareInstallations: {
              orderBy: { createdAt: "desc" },
              take: 3,
              select: { id: true, status: true, product: { select: { name: true } }, license: { select: { id: true, number: true, status: true } } },
            },
          },
        })
      : Promise.resolve(null),
    input.playerId ? db.musicLicense.count({ where: { licensedPlayerId: input.playerId, status: { in: LIVE_LICENSE_STATUSES } } }) : Promise.resolve(0),
    input.arrangementId
      ? db.musicLicense.findMany({
          where: { customerId: input.customerId, arrangementId: input.arrangementId },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true, status: true, licenseSource: true, createdAt: true, licensedPlayerId: true,
            licensedPlayer: { select: { id: true, friendlyName: true, registrationCode: true, playerType: { select: { name: true } } } },
          },
        })
      : Promise.resolve([]),
  ]);
  return {
    player: player
      ? {
          id: player.id,
          name: playerDisplayName(player),
          typeName: player.playerType.name,
          supportsMusicLibrary: player.playerType.supportsMusicLibrary,
          maskedRegistration: maskRegistration(player.registrationCode),
          status: player.status,
          licenseCount,
          ownedByCustomer: player.customerId === input.customerId,
          installations: player.softwareInstallations,
        }
      : null,
    arrangementLicenses: arrangementLicenses.map((l) => ({
      id: l.id,
      status: l.status,
      source: l.licenseSource,
      createdAt: l.createdAt,
      onTicketPlayer: !!input.playerId && l.licensedPlayerId === input.playerId,
      player: l.licensedPlayer ? { id: l.licensedPlayer.id, name: playerDisplayName(l.licensedPlayer) } : null,
    })),
  };
}
