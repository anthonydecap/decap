import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as licenceGET } from "@/app/api/shop/account/players/[id]/licence/route";
import { POST as uploadPOST } from "@/app/api/admin/shop/licences/[id]/upload/route";
import { shopDb } from "@/modules/shop/db";
import { setSignerKeysForTests } from "@/modules/shop/services/decap-license-file";
import { grantMusic } from "@/modules/shop/services/music-licenses";
import {
  customerPlayerLicenseState,
  decaplicCommand,
  getPlayerLicenseOrder,
  licenseRequestFile,
  licenseSongsFile,
  refuseLicenseOrder,
  syncAllPlayerLicenseOrders,
  syncPlayerLicenseOrder,
  uploadIssuedLicense,
} from "@/modules/shop/services/player-licenses";
import { parseDecapRequest } from "@/modules/shop/services/decap-request";
import { registerPlayerFromRequest } from "@/modules/shop/services/players";
import { makeArrangement, makeCustomer, makeStaff, resetDb, signInAs, useMemoryStorage } from "../helpers/fixtures";
import { makeTestSigner } from "../helpers/licence";

const A = { id: "f7928d1fc97c177a6ee3e7694b7652ef", publicKey: "3f65fb0ffd39ac6284ca94f41950c3cd95b15ecfa4658d9b4a859a5f7aff5110" };
const request = (p: { id: string; publicKey: string }) =>
  JSON.stringify({ format: "decap-request", formatVersion: 1, player: p, app: "DecapPlayer", created: "2026-11-07" });

beforeEach(async () => {
  await resetDb();
  signInAs(null);
  useMemoryStorage();
});
afterEach(() => setSignerKeysForTests(null));

async function setup() {
  const signer = makeTestSigner();
  const { staff, session: staffSession } = await makeStaff("ADMIN");
  const me = await makeCustomer();
  const { player } = await registerPlayerFromRequest({ customerId: me.customer.id, requestText: request(A), friendlyName: "Organ" });
  const order = await shopDb().playerLicenseOrder.findFirstOrThrow({ where: { playerId: player.id } });
  return { signer, staff, staffSession, me, player, order };
}

async function songFor(playerId: string, customerId: string, staffId: string, songId: string | null) {
  const { arrangement } = await makeArrangement({ priceCents: 500 });
  if (songId) await shopDb().arrangement.update({ where: { id: arrangement.id }, data: { songId } });
  await grantMusic({ staffId, customerId, playerId, arrangementIds: [arrangement.id], source: "ADMIN_GRANT", reason: "test" });
  return arrangement;
}

describe("Licence queue (licence v1)", () => {
  it("a newly registered player waits for its first licence, with no songs yet", async () => {
    const { order, me } = await setup();
    expect(order).toMatchObject({ status: "WAITING", reason: "New player", edition: "standard", midiOut: true, customerId: me.customer.id });
    const detail = await getPlayerLicenseOrder(order.id);
    expect(detail.songs).toHaveLength(0);
    expect(decaplicCommand(detail)).toContain("--geen");
    expect(decaplicCommand(detail)).toContain(" K1001 ");
    // The rebuilt request is a valid .decapreq for the same player (decaplic reads it).
    expect(parseDecapRequest(licenseRequestFile(detail).text)).toMatchObject({ playerId: A.id, publicKey: A.publicKey });
  });

  it("the first licence makes the player ACTIVE; new music then opens the next order", async () => {
    const { signer, staff, me, player, order } = await setup();
    const licence = signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K1001" });
    const done = await uploadIssuedLicense({ staffId: staff.id, orderId: order.id, fileText: licence });
    expect(done).toMatchObject({ status: "DONE", signerKeyId: signer.keyId, issuedSongIds: [] });
    expect(done.fileSha256).toMatch(/^[0-9a-f]{64}$/);
    expect((await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: player.id } })).status).toBe("ACTIVE");
    expect(await syncPlayerLicenseOrder(player.id)).toBeNull();

    await songFor(player.id, me.customer.id, staff.id, "song-1");
    const noId = await songFor(player.id, me.customer.id, staff.id, null);
    const next = await syncPlayerLicenseOrder(player.id);
    expect(next).toMatchObject({ status: "WAITING", reason: "New music for the player" });
    const detail = await getPlayerLicenseOrder(next!.id);
    expect(detail.songs.map((s) => s.songId)).toEqual(["song-1"]);
    expect(detail.withoutSongId.map((a) => a.arrangementId)).toEqual([noId.id]);
    expect(licenseSongsFile(detail).text).toBe("song-1\n");
    expect(decaplicCommand(detail)).toContain(`--nummers ${A.id}_songs.txt`);

    // A second song while it waits: the same order, refreshed.
    await songFor(player.id, me.customer.id, staff.id, "song-2");
    await syncAllPlayerLicenseOrders();
    expect(await shopDb().playerLicenseOrder.count({ where: { playerId: player.id, status: "WAITING" } })).toBe(1);
    expect((await getPlayerLicenseOrder(next!.id)).songs.map((s) => s.songId)).toEqual(["song-1", "song-2"]);
  });

  it("refuses a licence that is not exactly right, and keeps waiting", async () => {
    const { signer, staff, me, player, order } = await setup();
    await shopDb().registeredPlayer.update({ where: { id: player.id }, data: { status: "ACTIVE" } });
    await songFor(player.id, me.customer.id, staff.id, "song-1");
    await syncPlayerLicenseOrder(player.id);
    const up = (text: string) => uploadIssuedLicense({ staffId: staff.id, orderId: order.id, fileText: text });

    await expect(up(signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K1001" }))).rejects.toThrowError(/missing 1 song/);
    await expect(up(signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K0001", songIds: ["song-1"] }))).rejects.toThrowError(/customer K0001/);
    const other = { id: "21f85357a19e7bc8375e75bc3ec4f094", publicKey: "57f395898132672be4fa580660d4da6bb5e2c5f61899c252496afccdce5bcf30" };
    await expect(up(signer.signLicence({ ...{ playerId: other.id, publicKey: other.publicKey }, customer: "K1001", songIds: ["song-1"] }))).rejects.toThrowError(/another player/);
    const good = signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K1001", songIds: ["song-1"] });
    await expect(up(good.replace('"K1001"', '"K1002"'))).rejects.toThrowError(/altered/);
    expect((await shopDb().playerLicenseOrder.findUniqueOrThrow({ where: { id: order.id } })).status).toBe("WAITING");

    // A licence signed by a key the shop does not trust (the TEST key is not in the release list).
    setSignerKeysForTests(null);
    await expect(up(good)).rejects.toThrowError(/unknown key/);
  });

  it("the customer downloads only their own licence, through the API", async () => {
    const { signer, staffSession, me, player, order } = await setup();
    signInAs(staffSession);
    const licence = signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K1001", licenseId: "c0ffee00c0ffee00c0ffee00c0ffee00" });
    const res = await uploadPOST(new Request("http://localhost:3000/api/admin/shop/licences/x/upload", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ licence }),
    }), { params: Promise.resolve({ id: order.id }) });
    expect(res.status).toBe(200);

    const get = (id: string) => licenceGET(new Request(`http://localhost:3000/api/shop/account/players/${id}/licence`), { params: Promise.resolve({ id }) });
    signInAs(me.session);
    const dl = await get(player.id);
    expect(dl.status).toBe(200);
    expect(dl.headers.get("content-disposition")).toContain(`${A.id}.decaplic`);
    expect(await dl.text()).toBe(licence);
    expect(await customerPlayerLicenseState(me.customer.id, player.id)).toMatchObject({ ready: { songs: 0 }, waitingSince: null });

    const thief = await makeCustomer();
    signInAs(thief.session);
    expect((await get(player.id)).status).toBe(404);
    signInAs(null);
    expect((await get(player.id)).status).toBe(401);
  });

  it("only staff with licences:issue may upload", async () => {
    const { signer, order } = await setup();
    const { session } = await makeStaff("SUPPORT");
    signInAs(session);
    const licence = signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K1001" });
    const res = await uploadPOST(new Request("http://localhost:3000/api/admin/shop/licences/x/upload", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ licence }),
    }), { params: Promise.resolve({ id: order.id }) });
    expect(res.status).toBe(403);
  });

  it("a refusal sticks until the player's songs change", async () => {
    const { staff, me, player, order } = await setup();
    await refuseLicenseOrder({ staffId: staff.id, orderId: order.id, reason: "Unknown customer, call first" });
    expect(await syncPlayerLicenseOrder(player.id)).toBeNull();
    await shopDb().registeredPlayer.update({ where: { id: player.id }, data: { status: "ACTIVE" } });
    await songFor(player.id, me.customer.id, staff.id, "song-9");
    expect(await syncPlayerLicenseOrder(player.id)).toMatchObject({ status: "WAITING" });
  });

  it("the same licence cannot be uploaded twice, and the database keeps one waiting order per player", async () => {
    const { signer, staff, player, order } = await setup();
    const licence = signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K1001", licenseId: "aa".repeat(16) });
    await uploadIssuedLicense({ staffId: staff.id, orderId: order.id, fileText: licence });
    const again = await shopDb().playerLicenseOrder.create({ data: { playerId: player.id, customerId: order.customerId, reason: "test" } });
    await expect(uploadIssuedLicense({ staffId: staff.id, orderId: again.id, fileText: licence })).rejects.toThrowError(/uploaded before/);
    await expect(shopDb().playerLicenseOrder.create({ data: { playerId: player.id, customerId: order.customerId, reason: "dup" } })).rejects.toThrowError();
  });
});
