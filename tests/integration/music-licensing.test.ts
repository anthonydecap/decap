import { beforeEach, describe, expect, it } from "vitest";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { shopDb } from "@/modules/shop/db";
import { runLegacyMusicMigration } from "@/modules/shop/migration/legacy-music";
import { addToCart, getPricedCart, setCartItemTarget } from "@/modules/shop/services/cart";
import { prepareCheckout } from "@/modules/shop/services/checkout";
import { enqueueEncodingJob } from "@/modules/shop/services/encoding";
import { fulfillPaymentIntent } from "@/modules/shop/services/fulfillment";
import { assignLicenses, customerMusic, grantMusic, playerLibrary, revokeMusicLicense } from "@/modules/shop/services/music-licenses";
import { updateMusicPolicy } from "@/modules/shop/services/music-policy";
import { replacePlayer, transferLibrary, transferPlayerOwnership } from "@/modules/shop/services/music-transfers";
import { updatePlayer } from "@/modules/shop/services/players";
import { createRefund } from "@/modules/shop/services/refunds";
import { DEFAULT_MUSIC_POLICY } from "@/modules/shop/domain/music-policy";
import {
  fakeStripe, makeArrangement, makeBundle, makeCustomer, makePlayer, makePlayerType, makeStaff, resetDb, signInAs, useMemoryStorage,
} from "../helpers/fixtures";

let stripeFake: ReturnType<typeof fakeStripe>;

beforeEach(async () => {
  await resetDb();
  useMemoryStorage();
  stripeFake = fakeStripe();
  signInAs(null);
});

const me = (customerId: string) => ({ customerId, anonymousToken: null });

async function pay(customer: Awaited<ReturnType<typeof makeCustomer>>["customer"]) {
  const prepared = await prepareCheckout(customer);
  const pi = [...stripeFake.intents.values()].at(-1)!;
  await fulfillPaymentIntent({ ...pi, amount_received: pi.amount, latest_charge: "ch_1", status: "succeeded" } as never);
  return { prepared, pi };
}

const liveOn = (playerId: string) =>
  shopDb().musicLicense.findMany({ where: { licensedPlayerId: playerId, status: "ACTIVE" }, orderBy: { createdAt: "asc" } });

describe("buying music for a player", () => {
  it("one-player customers buy without choosing; the license is bound to that player", async () => {
    const { customer } = await makeCustomer();
    const player = await makePlayer({ customerId: customer.id, friendlyName: "Living Room Piano" });
    const { arrangement } = await makeArrangement({ priceCents: 895 });

    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id });
    const cart = await getPricedCart(me(customer.id));
    expect(cart.pricing.lines[0]).toMatchObject({ targetPlayerId: player.id, chargedCents: 895 });

    const { prepared } = await pay(customer);
    const item = await shopDb().orderItem.findFirstOrThrow({ where: { orderId: prepared.orderId } });
    expect(item).toMatchObject({ targetPlayerId: player.id, targetPlayerNameSnapshot: "Living Room Piano" });
    expect(item.targetRegistrationMaskedSnapshot).toMatch(/^••••.{4}$/);

    const licenses = await liveOn(player.id);
    expect(licenses).toHaveLength(1);
    expect(licenses[0]).toMatchObject({ arrangementId: arrangement.id, licenseSource: "PURCHASE", pricePaidCents: 895, customerId: customer.id });
    expect((await playerLibrary(player.id)).total).toBe(1);
  });

  it("multi-player customers must choose, and can only choose their own eligible players", async () => {
    const { customer } = await makeCustomer();
    const { customer: stranger } = await makeCustomer();
    await makePlayer({ customerId: customer.id });
    const second = await makePlayer({ customerId: customer.id });
    const theirs = await makePlayer({ customerId: stranger.id });
    const midi = await makePlayer({ customerId: customer.id, playerTypeId: (await makePlayerType({ supportsMusicLibrary: false })).id });
    const retired = await makePlayer({ customerId: customer.id, status: "RETIRED" });
    const { arrangement } = await makeArrangement({ priceCents: 500 });

    await expect(addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id })).rejects.toMatchObject({ code: "PLAYER_REQUIRED" });
    await expect(addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: theirs.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: midi.id })).rejects.toMatchObject({ code: "PLAYER_REQUIRED" });
    await expect(addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: retired.id })).rejects.toMatchObject({ code: "PLAYER_REQUIRED" });

    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: second.id });
    const cart = await getPricedCart(me(customer.id));
    expect(cart.players).toHaveLength(2);
    expect(cart.pricing.lines[0]!.targetPlayerId).toBe(second.id);
    // Retargeting a line to someone else's player is refused too.
    await expect(setCartItemTarget(me(customer.id), cart.pricing.lines[0]!.cartItemId, theirs.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    // A forged target written straight into the cart is dropped, never priced.
    const c = await shopDb().cart.findUniqueOrThrow({ where: { customerId: customer.id } });
    await shopDb().cartItem.updateMany({ where: { cartId: c.id }, data: { targetPlayerId: theirs.id } });
    const after = await getPricedCart(me(customer.id));
    expect(after.pricing.lines).toHaveLength(0);
    expect(after.pricing.excluded[0]!.reason).toBe("PLAYER_UNAVAILABLE");
  });

  it("prevents a duplicate on the same player but allows the second player, at the additional-player price", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("SUPER_ADMIN");
    const living = await makePlayer({ customerId: customer.id, friendlyName: "Living Room Piano" });
    const studio = await makePlayer({ customerId: customer.id, friendlyName: "Studio Organ" });
    const { arrangement } = await makeArrangement({ priceCents: 895 });
    await grantMusic({ staffId: staff.id, customerId: customer.id, playerId: living.id, arrangementIds: [arrangement.id], source: "ADMIN_GRANT", reason: "seed" });

    await expect(addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: living.id }))
      .rejects.toMatchObject({ code: "ALREADY_OWNED", message: "Already licensed for Living Room Piano" });

    await updateMusicPolicy(staff.id, { ...DEFAULT_MUSIC_POLICY, additionalPlayer: { strategy: "ADDITIONAL_FIXED_PRICE", percentageBps: 5000, fixedPriceCents: 395 } });
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: studio.id });
    // The browser's remembered price is irrelevant: the server decides.
    await shopDb().cartItem.updateMany({ data: { lastSeenPriceCents: 1 } });
    const cart = await getPricedCart(me(customer.id));
    expect(cart.pricing.totalCents).toBe(395);
    expect(cart.pricing.lines[0]!.allocations[0]).toMatchObject({ additionalPlayer: true, allocatedCents: 395 });

    const { prepared } = await pay(customer);
    const alloc = await shopDb().orderItemAllocation.findFirstOrThrow({ where: { orderId: prepared.orderId } });
    expect(alloc).toMatchObject({ additionalPlayer: true, allocatedCents: 395 });
    const studioLicenses = await liveOn(studio.id);
    expect(studioLicenses[0]).toMatchObject({ licenseSource: "ADDITIONAL_PLAYER_PURCHASE", pricePaidCents: 395 });
    expect(await liveOn(living.id)).toHaveLength(1);

    const music = await customerMusic(customer.id);
    expect(music[0]!.playerIds.sort()).toEqual([living.id, studio.id].sort());
  });

  it("prices the same arrangement for two players in one cart: full price once, then the additional-player price", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("SUPER_ADMIN");
    await updateMusicPolicy(staff.id, { ...DEFAULT_MUSIC_POLICY, additionalPlayer: { strategy: "ADDITIONAL_PERCENTAGE", percentageBps: 5000, fixedPriceCents: 0 } });
    const a = await makePlayer({ customerId: customer.id });
    const b = await makePlayer({ customerId: customer.id });
    const { arrangement } = await makeArrangement({ priceCents: 1000 });
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: a.id });
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: b.id });
    const cart = await getPricedCart(me(customer.id));
    expect(cart.pricing.lines.map((l) => [l.targetPlayerId, l.chargedCents])).toEqual([[a.id, 1000], [b.id, 500]]);
  });

  it("rejects arrangements that are not compatible with the player type", async () => {
    const { customer } = await makeCustomer();
    const profile = await shopDb().systemProfile.create({ data: { code: "STUDIO_ORGAN", name: "Studio organ" } });
    const type = await makePlayerType({ systemProfileIds: [profile.id] });
    const player = await makePlayer({ customerId: customer.id, playerTypeId: type.id, friendlyName: "Studio Organ" });
    const { arrangement } = await makeArrangement({ priceCents: 500 });
    // Only for a different, specific profile.
    const other = await shopDb().systemProfile.create({ data: { code: "THEATRE", name: "Theatre organ" } });
    await shopDb().arrangementCompatibility.deleteMany({ where: { arrangementId: arrangement.id } });
    await shopDb().arrangementCompatibility.create({ data: { arrangementId: arrangement.id, systemProfileId: other.id } });

    await expect(addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id, targetPlayerId: player.id }))
      .rejects.toMatchObject({ code: "UNAVAILABLE", message: "This arrangement is not available for Studio Organ" });
  });
});

describe("bundles per player", () => {
  it("completes a collection per player and creates one license per arrangement", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("SUPER_ADMIN");
    const living = await makePlayer({ customerId: customer.id });
    const studio = await makePlayer({ customerId: customer.id });
    const items = await Promise.all([1000, 1500, 2500].map((p) => makeArrangement({ priceCents: p })));
    const ids = items.map((i) => i.arrangement.id);
    const bundle = await makeBundle({ priceCents: 3000, arrangementIds: ids });
    await grantMusic({ staffId: staff.id, customerId: customer.id, playerId: living.id, arrangementIds: [ids[2]!], source: "PROMOTION", reason: "had it" });

    await addToCart(me(customer.id), { type: "BUNDLE", bundleId: bundle.id, targetPlayerId: living.id });
    await addToCart(me(customer.id), { type: "BUNDLE", bundleId: bundle.id, targetPlayerId: studio.id });
    const cart = await getPricedCart(me(customer.id));
    const forLiving = cart.pricing.lines.find((l) => l.targetPlayerId === living.id)!;
    const forStudio = cart.pricing.lines.find((l) => l.targetPlayerId === studio.id)!;
    expect(forLiving.chargedCents).toBe(1500); // only the two missing items: 600 + 900
    expect(forLiving.bundle!.ownedCount).toBe(1);
    expect(forStudio.allocations).toHaveLength(3);

    await pay(customer);
    expect((await liveOn(living.id)).map((l) => l.arrangementId).sort()).toEqual([...ids].sort());
    const studioLicenses = await liveOn(studio.id);
    expect(studioLicenses).toHaveLength(3);
    expect(new Set(studioLicenses.map((l) => l.orderAllocationId)).size).toBe(3);
  });
});

describe("fulfillment, refunds and free music", () => {
  it("is idempotent: replays create no extra licenses", async () => {
    const { customer } = await makeCustomer();
    const player = await makePlayer({ customerId: customer.id });
    const { arrangement } = await makeArrangement({ priceCents: 700 });
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id });
    const { pi } = await pay(customer);
    await fulfillPaymentIntent({ ...pi, amount_received: pi.amount, latest_charge: "ch_1", status: "succeeded" } as never);
    expect(await shopDb().musicLicense.count()).toBe(1);
    expect((await liveOn(player.id))).toHaveLength(1);
  });

  it("refunding an allocation ends the license it created; order history stays", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("FINANCE");
    const player = await makePlayer({ customerId: customer.id });
    const { arrangement } = await makeArrangement({ priceCents: 700 });
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id });
    const { prepared } = await pay(customer);
    await createRefund({ staffId: staff.id, orderId: prepared.orderId, reason: "Changed mind" });
    expect(await liveOn(player.id)).toHaveLength(0);
    const license = await shopDb().musicLicense.findFirstOrThrow();
    expect(license).toMatchObject({ status: "REVOKED" });
    expect(await shopDb().orderItem.count({ where: { orderId: prepared.orderId } })).toBe(1);
  });

  it("free arrangements still create a license for the chosen player, without Stripe", async () => {
    const { customer } = await makeCustomer();
    const player = await makePlayer({ customerId: customer.id });
    const { arrangement } = await makeArrangement({ priceCents: 0 });
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id });
    const prepared = await prepareCheckout(customer);
    expect(prepared).toMatchObject({ free: true, clientSecret: "" });
    expect(stripeFake.intents.size).toBe(0);
    expect(await liveOn(player.id)).toHaveLength(1);
    expect((await shopDb().order.findUniqueOrThrow({ where: { id: prepared.orderId } })).status).toBe("FULFILLED");
  });

  it("music needs a player by default; with assign-later enabled it is placed once, then locked", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("SUPER_ADMIN");
    const { arrangement: first } = await makeArrangement({ priceCents: 600 });
    await expect(addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: first.id })).rejects.toMatchObject({ code: "PLAYER_REQUIRED" });
    await expect(addToCart({ customerId: null, anonymousToken: "anon-token-1" }, { type: "ARRANGEMENT", arrangementId: first.id })).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    await updateMusicPolicy(staff.id, { ...DEFAULT_MUSIC_POLICY, allowAssignLater: true });
    const { arrangement } = await makeArrangement({ priceCents: 600 });
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: arrangement.id });
    await pay(customer);
    const license = await shopDb().musicLicense.findFirstOrThrow();
    expect(license).toMatchObject({ status: "UNASSIGNED", licensedPlayerId: null, needsReview: false });

    const a = await makePlayer({ customerId: customer.id });
    const b = await makePlayer({ customerId: customer.id });
    await assignLicenses({ actor: { type: "CUSTOMER", customerId: customer.id }, licenseIds: [license.id], playerId: a.id });
    expect(await liveOn(a.id)).toHaveLength(1);
    // No self-service reassignment afterwards.
    await expect(assignLicenses({ actor: { type: "CUSTOMER", customerId: customer.id }, licenseIds: [license.id], playerId: b.id }))
      .rejects.toMatchObject({ code: "INVALID_STATE" });
  });
});

describe("delivery authorization", () => {
  it("an ACTIVE license authorizes only its own player", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("SUPER_ADMIN");
    const a = await makePlayer({ customerId: customer.id });
    const b = await makePlayer({ customerId: customer.id });
    const { arrangement } = await makeArrangement({ priceCents: 500 });
    await shopDb().protectionProfile.create({ data: { name: "dmi-protect", version: "p1", secretRef: "kms://dmi/p1" } });
    await grantMusic({ staffId: staff.id, customerId: customer.id, playerId: a.id, arrangementIds: [arrangement.id], source: "ADMIN_GRANT", reason: "test" });
    const base = { customerId: customer.id, arrangementId: arrangement.id, encoderVersion: "x", protectionProfileVersion: "p1" };
    await expect(enqueueEncodingJob({ ...base, playerId: a.id })).resolves.toBeTruthy();
    await expect(enqueueEncodingJob({ ...base, playerId: b.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    // Revoked: no future delivery.
    const l = (await liveOn(a.id))[0]!;
    await revokeMusicLicense({ staffId: staff.id, licenseId: l.id, reason: "chargeback" });
    await expect(enqueueEncodingJob({ ...base, playerId: a.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("staff transfers and replacement", () => {
  async function libraryOf3() {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("ADMIN");
    const old = await makePlayer({ customerId: customer.id, friendlyName: "Old Piano" });
    const ids = (await Promise.all([1, 2, 3].map(() => makeArrangement({ priceCents: 500 })))).map((x) => x.arrangement.id);
    await addToCart(me(customer.id), { type: "ARRANGEMENT", arrangementId: ids[0]! });
    const { prepared } = await pay(customer);
    await grantMusic({ staffId: staff.id, customerId: customer.id, playerId: old.id, arrangementIds: ids.slice(1), source: "ADMIN_GRANT", reason: "seed" });
    return { customer, staff, old, ids, orderId: prepared.orderId };
  }

  it("staff-only: customers have no transfer capability, admins do", () => {
    expect(roleHasPermission("ADMIN", "players:library-transfer")).toBe(true);
    expect(roleHasPermission("ADMIN", "players:replace")).toBe(true);
    expect(roleHasPermission("SUPPORT", "music:transfer")).toBe(false);
    expect(roleHasPermission("SUPPORT", "players:replace")).toBe(false);
    expect(roleHasPermission("FINANCE", "music:grant")).toBe(false);
  });

  it("replaces a player: old RETIRED, new ACTIVE, licenses moved with history, order snapshot unchanged", async () => {
    const { customer, staff, old, ids, orderId } = await libraryOf3();
    const replacement = await makePlayer({ customerId: customer.id, status: "PENDING" });
    const result = await replacePlayer({ staffId: staff.id, oldPlayerId: old.id, newPlayerId: replacement.id, type: "HARDWARE_REPLACEMENT", reason: "Mainboard failure" });
    expect(result.moved).toBe(3);
    expect(result.number).toMatch(/^TRF-\d+$/);

    expect((await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: old.id } })).status).toBe("RETIRED");
    expect((await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: replacement.id } })).status).toBe("ACTIVE");
    expect(await liveOn(old.id)).toHaveLength(0);
    const moved = await liveOn(replacement.id);
    expect(moved.map((l) => l.arrangementId).sort()).toEqual([...ids].sort());
    expect(moved.every((l) => l.licenseSource === "REPLACEMENT_TRANSFER" && l.originalMusicLicenseId)).toBe(true);
    expect(await shopDb().musicLicense.count({ where: { licensedPlayerId: old.id, status: "RETIRED" } })).toBe(3);
    expect(await shopDb().musicLicenseEvent.count({ where: { type: "TRANSFERRED_OUT" } })).toBe(3);
    expect(await shopDb().musicLicenseTransfer.count()).toBe(1);

    const item = await shopDb().orderItem.findFirstOrThrow({ where: { orderId } });
    expect(item).toMatchObject({ targetPlayerId: old.id, targetPlayerNameSnapshot: "Old Piano" });

    // A refund of the original purchase still finds the moved license.
    const { staff: finance } = await makeStaff("FINANCE");
    await createRefund({ staffId: finance.id, orderId, reason: "refund after move" });
    expect((await liveOn(replacement.id)).map((l) => l.arrangementId)).not.toContain(ids[0]);
  });

  it("copies a library only as explicit, attributed additional licenses", async () => {
    const { customer, staff, old } = await libraryOf3();
    const second = await makePlayer({ customerId: customer.id });
    const r = await transferLibrary({ staffId: staff.id, fromPlayerId: old.id, toPlayerId: second.id, mode: "COPY", type: "ADMIN_CORRECTION", reason: "Dealer demo unit" });
    expect(r.moved).toBe(3);
    expect(await liveOn(old.id)).toHaveLength(3);
    const copies = await liveOn(second.id);
    expect(copies.every((l) => l.licenseSource === "CUSTOMER_SERVICE" && l.grantedByStaffId === staff.id && l.reason === "Dealer demo unit")).toBe(true);
    await expect(transferLibrary({ staffId: staff.id, fromPlayerId: old.id, toPlayerId: second.id, mode: "COPY", type: "OTHER", reason: " " }))
      .rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("transfers a player with its library to a new owner per the resale policy", async () => {
    const { customer, staff, old } = await libraryOf3();
    const { customer: buyer } = await makeCustomer();
    const r = await transferPlayerOwnership({ staffId: staff.id, playerId: old.id, toCustomerId: buyer.id, reason: "Sold", libraryPolicy: "PLAYER_AND_LIBRARY" });
    expect(r.count).toBe(3);
    const now = await liveOn(old.id);
    expect(now).toHaveLength(3);
    expect(now.every((l) => l.customerId === buyer.id && l.licenseSource === "TRANSFER")).toBe(true);
    // The seller keeps purchase history but no live license, so nothing to regenerate elsewhere.
    expect(await shopDb().musicLicense.count({ where: { customerId: customer.id, status: "ACTIVE" } })).toBe(0);
    expect(await shopDb().entitlement.count({ where: { customerId: customer.id, status: "ACTIVE" } })).toBe(3);

    // A fixed resale policy cannot be overridden per case.
    await updateMusicPolicy(staff.id, { ...DEFAULT_MUSIC_POLICY, resalePolicy: "PLAYER_ONLY" });
    await expect(transferPlayerOwnership({ staffId: staff.id, playerId: old.id, toCustomerId: customer.id, reason: "back", libraryPolicy: "PLAYER_AND_LIBRARY" }))
      .rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });
});

describe("starter music and activation", () => {
  it("activating a player grants its type's starter collection once, as PLAYER_STARTER_PACK", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff("SUPPORT");
    const ids = (await Promise.all([1, 2].map(() => makeArrangement({ priceCents: 500 })))).map((x) => x.arrangement.id);
    const bundle = await makeBundle({ priceCents: 800, arrangementIds: ids });
    const type = await makePlayerType({ starterBundleId: bundle.id });
    const player = await makePlayer({ customerId: customer.id, playerTypeId: type.id, status: "PENDING" });
    await updatePlayer({ actorStaffId: staff.id, playerId: player.id, patch: { status: "ACTIVE" } });
    const licenses = await liveOn(player.id);
    expect(licenses).toHaveLength(2);
    expect(licenses.every((l) => l.licenseSource === "PLAYER_STARTER_PACK" && !l.orderId)).toBe(true);
    expect(await shopDb().order.count()).toBe(0);
    await updatePlayer({ actorStaffId: staff.id, playerId: player.id, patch: { status: "SUSPENDED" } });
    await updatePlayer({ actorStaffId: staff.id, playerId: player.id, patch: { status: "ACTIVE" } });
    expect(await liveOn(player.id)).toHaveLength(2);
  });
});

describe("legacy migration", () => {
  async function legacy(customerId: string, n: number) {
    const ids = (await Promise.all(Array.from({ length: n }, () => makeArrangement({ priceCents: 500 })))).map((x) => x.arrangement.id);
    for (const arrangementId of ids) {
      const e = await shopDb().entitlement.create({ data: { customerId, arrangementId } });
      await shopDb().entitlementSource.create({ data: { entitlementId: e.id, sourceType: "LEGACY_IMPORT", sourceReference: "wp" } });
    }
    return ids;
  }

  it("assigns deterministically for one player, never guesses for several, waits when there is none", async () => {
    const one = (await makeCustomer()).customer;
    const many = (await makeCustomer()).customer;
    const none = (await makeCustomer()).customer;
    const onlyPlayer = await makePlayer({ customerId: one.id });
    const m1 = await makePlayer({ customerId: many.id });
    await makePlayer({ customerId: many.id });
    await legacy(one.id, 3);
    const manyIds = await legacy(many.id, 2);
    await legacy(none.id, 2);
    // Trustworthy evidence: a player-bound artifact for one of the arrangements.
    const sourceVersion = await shopDb().assetVersion.findFirstOrThrow({ where: { asset: { arrangementId: manyIds[0] } } });
    await shopDb().deliveryArtifact.create({
      data: { arrangementId: manyIds[0]!, sourceAssetVersionId: sourceVersion.id, customerId: many.id, registeredPlayerId: m1.id, deviceRegistrationRef: m1.registrationIdentifier, encoderVersion: "x", protectionProfileVersion: "p", storageProvider: "memory", outputObjectKey: "deliveries/dmi/x", bytes: BigInt(1), sha256: "b".repeat(64) },
    });

    const dry = await runLegacyMusicMigration(shopDb(), { dryRun: true });
    expect(await shopDb().musicLicense.count()).toBe(0);
    expect(dry.totals).toMatchObject({ AUTO_ASSIGNED: 3, EVIDENCE_ASSIGNED: 1, NEEDS_REVIEW: 1, WAITING_FOR_PLAYER: 2 });

    const applied = await runLegacyMusicMigration(shopDb(), { dryRun: false });
    expect(applied.totals.licensesCreated).toBe(7);
    expect(await liveOn(onlyPlayer.id)).toHaveLength(3);
    expect(await liveOn(m1.id)).toHaveLength(1);
    expect(await shopDb().musicLicense.count({ where: { customerId: many.id, status: "UNASSIGNED", needsReview: true } })).toBe(1);
    expect(await shopDb().musicLicense.count({ where: { customerId: none.id, status: "UNASSIGNED", needsReview: false } })).toBe(2);
    expect((await liveOn(onlyPlayer.id)).every((l) => l.licenseSource === "LEGACY_MIGRATION" && l.entitlementSourceId)).toBe(true);

    // Idempotent.
    const again = await runLegacyMusicMigration(shopDb(), { dryRun: false });
    expect(again.totals.licensesCreated).toBe(0);

    // The customer may not self-assign a review item; staff can.
    const review = await shopDb().musicLicense.findFirstOrThrow({ where: { customerId: many.id, needsReview: true } });
    await expect(assignLicenses({ actor: { type: "CUSTOMER", customerId: many.id }, licenseIds: [review.id], playerId: m1.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const { staff } = await makeStaff("SUPPORT");
    await assignLicenses({ actor: { type: "STAFF", staffId: staff.id }, licenseIds: [review.id], playerId: m1.id, reason: "Customer confirmed by phone" });
    expect(await liveOn(m1.id)).toHaveLength(2);

    // The no-player customer's music lands on their first player when it is activated.
    const first = await makePlayer({ customerId: none.id, status: "PENDING" });
    await updatePlayer({ actorStaffId: staff.id, playerId: first.id, patch: { status: "ACTIVE" } });
    expect(await liveOn(first.id)).toHaveLength(2);
  });
});

describe("software stays separate", () => {
  it("a software license purchase creates no music license", async () => {
    const { customer } = await makeCustomer();
    await makePlayer({ customerId: customer.id });
    const product = await shopDb().softwareProduct.create({
      data: { slug: "dmi-player", name: "DMI Player", status: "ACTIVE", defaultLicensePriceCents: 4900 },
    });
    await addToCart(me(customer.id), { type: "SOFTWARE_LICENSE", softwareProductId: product.id });
    await pay(customer);
    expect(await shopDb().softwareLicense.count()).toBe(1);
    expect(await shopDb().musicLicense.count()).toBe(0);
  });
});
