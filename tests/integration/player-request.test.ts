import { beforeEach, describe, expect, it } from "vitest";
import { POST as registerPOST } from "@/app/api/shop/account/players/route";
import { shopDb } from "@/modules/shop/db";
import { createPlayer, createPlayerType, DECAP_PLAYER_TYPE_CODE, registerPlayerFromRequest } from "@/modules/shop/services/players";
import { makeCustomer, makeStaff, resetDb, signInAs } from "../helpers/fixtures";

// Real test players of the licence tool (DecapPlayer test/license/spelerA + spelerB). Public data only.
const A = { id: "f7928d1fc97c177a6ee3e7694b7652ef", publicKey: "3f65fb0ffd39ac6284ca94f41950c3cd95b15ecfa4658d9b4a859a5f7aff5110" };
const B = { id: "02a85f4fdfe902eebfa7a405541fc719", publicKey: "" };
const request = (p: { id: string; publicKey: string }) =>
  JSON.stringify({ format: "decap-request", formatVersion: 1, player: p, app: "DecapPlayer", created: "2026-11-07" }, null, 2);

const post = (body: unknown, headers: Record<string, string> = {}) =>
  registerPOST(new Request("http://localhost:3000/api/shop/account/players", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }), { params: Promise.resolve({}) });

beforeEach(async () => {
  await resetDb();
  signInAs(null);
});

describe("Registering a Decap Player with its .decapreq (licence v1)", () => {
  it("stores only the public data, PENDING, under the signed-in customer, and gives a K-number", async () => {
    const me = await makeCustomer();
    signInAs(me.session);
    const res = await post({ request: request(A), friendlyName: "  Living room  " });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ created: true, customerNumber: "K1001" });

    const row = await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: body.playerId }, include: { playerType: true } });
    expect(row).toMatchObject({
      customerId: me.customer.id,
      licensePlayerId: A.id,
      licensePublicKey: A.publicKey,
      registrationCode: A.id.toUpperCase(),
      status: "PENDING",
      friendlyName: "Living room",
      activationKeyEncrypted: null,
    });
    expect(row.playerType.code).toBe(DECAP_PLAYER_TYPE_CODE);

    const log = await shopDb().auditLog.findMany({ where: { entityId: row.id } });
    expect(log.map((l) => l.action)).toEqual(["player.registered_by_request"]);
    expect(log[0]).toMatchObject({ actorType: "CUSTOMER", actorCustomerId: me.customer.id });
  });

  it("is harmless to upload twice", async () => {
    const me = await makeCustomer();
    const first = await registerPlayerFromRequest({ customerId: me.customer.id, requestText: request(A) });
    const again = await registerPlayerFromRequest({ customerId: me.customer.id, requestText: request(A) });
    expect(again.created).toBe(false);
    expect(again.player.id).toBe(first.player.id);
    expect(await shopDb().registeredPlayer.count()).toBe(1);
  });

  it("refuses a player that belongs to another customer, without saying whose", async () => {
    const owner = await makeCustomer({ email: "owner@example.test" });
    await registerPlayerFromRequest({ customerId: owner.customer.id, requestText: request(A) });
    const thief = await makeCustomer();
    signInAs(thief.session);
    const res = await post({ request: request(A) });
    expect(res.status).toBe(409);
    expect(JSON.stringify(await res.json())).not.toContain("owner@example.test");
    const row = await shopDb().registeredPlayer.findFirstOrThrow({ where: { licensePlayerId: A.id } });
    expect(row.customerId).toBe(owner.customer.id);
    expect(await shopDb().auditLog.count({ where: { action: "player.request_refused", actorCustomerId: thief.customer.id } })).toBe(1);
  });

  it("refuses a forged request: ID and key do not belong together", async () => {
    const me = await makeCustomer();
    signInAs(me.session);
    const res = await post({ request: request({ id: B.id, publicKey: A.publicKey }) });
    expect(res.status).toBe(422);
    expect(await shopDb().registeredPlayer.count()).toBe(0);
  });

  it("needs a signed-in customer with a verified email", async () => {
    expect((await post({ request: request(A) })).status).toBe(401);
    const unverified = await makeCustomer({ verified: false });
    signInAs(unverified.session);
    expect((await post({ request: request(A) })).status).toBe(403);
    expect(await shopDb().registeredPlayer.count()).toBe(0);
  });

  it("rejects a cross-origin post", async () => {
    const me = await makeCustomer();
    signInAs(me.session);
    expect((await post({ request: request(A) }, { origin: "https://evil.example" })).status).toBe(403);
  });

  it("will not take over a player registered the old way with the same code", async () => {
    const { staff } = await makeStaff("ADMIN");
    const owner = await makeCustomer();
    const type = await createPlayerType({ actorStaffId: staff.id, code: "dmi classic", name: "DMI Classic" });
    await createPlayer({ actorStaffId: staff.id, customerId: owner.customer.id, playerTypeId: type.id, registrationCode: A.id });
    const other = await makeCustomer();
    await expect(registerPlayerFromRequest({ customerId: other.customer.id, requestText: request(A) })).rejects.toThrowError(/another account/);
  });

  it("the database itself refuses a malformed key or an ID without its key", async () => {
    const me = await makeCustomer();
    const { player } = await registerPlayerFromRequest({ customerId: me.customer.id, requestText: request(A) });
    await expect(shopDb().registeredPlayer.update({ where: { id: player.id }, data: { licensePublicKey: "XYZ" } })).rejects.toThrowError();
    await expect(shopDb().registeredPlayer.update({ where: { id: player.id }, data: { licensePublicKey: null } })).rejects.toThrowError();
  });

  it("numbers customers from K1001 and never twice", async () => {
    const one = await makeCustomer();
    const two = await makeCustomer();
    expect([one.customer.customerNumber, two.customer.customerNumber]).toEqual([1001, 1002]);
  });
});
