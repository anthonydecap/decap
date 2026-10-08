import { beforeEach, describe, expect, it } from "vitest";
import { shopDb } from "@/modules/shop/db";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { activationKeyMatches, decryptActivationKey, encryptActivationKey } from "@/modules/shop/services/activation-key";
import {
  createPlayer,
  createPlayerType,
  findPlayersByReference,
  listCustomerPlayers,
  revealActivationKey,
  transferPlayer,
  updatePlayer,
} from "@/modules/shop/services/players";
import { makeCustomer, makeStaff, resetDb, signInAs } from "../helpers/fixtures";

beforeEach(async () => {
  await resetDb();
  signInAs(null);
});

async function setup() {
  const { staff } = await makeStaff("ADMIN");
  const { customer } = await makeCustomer();
  const type = await createPlayerType({ actorStaffId: staff.id, code: "dmi classic", name: "DMI Classic" });
  return { staff, customer, type };
}

describe("Activation keys at rest", () => {
  it("round-trips and authenticates the ciphertext", () => {
    const stored = encryptActivationKey("ABCD-1234-EFGH-5678");
    expect(stored.startsWith("v1.")).toBe(true);
    expect(stored).not.toContain("ABCD");
    expect(decryptActivationKey(stored)).toBe("ABCD-1234-EFGH-5678");
    expect(activationKeyMatches(stored, "ABCD-1234-EFGH-5678")).toBe(true);
    expect(activationKeyMatches(stored, "ABCD-1234-EFGH-0000")).toBe(false);
  });

  it("produces a different ciphertext every time", () => {
    expect(encryptActivationKey("SAME-KEY")).not.toBe(encryptActivationKey("SAME-KEY"));
  });

  it("refuses a tampered value instead of returning something plausible", () => {
    const stored = encryptActivationKey("ABCD-1234");
    const parts = stored.split(".");
    const flipped = Buffer.from(parts[3]!, "base64url");
    flipped[0] = flipped[0]! ^ 0xff;
    const tampered = [parts[0], parts[1], parts[2], flipped.toString("base64url")].join(".");
    expect(() => decryptActivationKey(tampered)).toThrowError();
  });
});

describe("Registering a player", () => {
  it("stores the code normalised and keeps the key out of the row that lists players", async () => {
    const { staff, customer, type } = await setup();
    await createPlayer({
      actorStaffId: staff.id,
      customerId: customer.id,
      playerTypeId: type.id,
      registrationCode: " a8f2 73kd 91pl ",
      activationKey: "KEY-1111-2222",
    });

    const players = await listCustomerPlayers(customer.id);
    expect(players).toHaveLength(1);
    expect(players[0]).toMatchObject({
      registrationCode: "A8F273KD91PL",
      registrationIdentifier: "A8F273KD91PL",
      status: "ACTIVE",
      hasActivationKey: true,
    });
    // The list view carries a flag, never the secret.
    expect(JSON.stringify(players[0])).not.toContain("KEY-1111-2222");
  });

  it("stays PENDING when there is no activation key yet", async () => {
    const { staff, customer, type } = await setup();
    const player = await createPlayer({
      actorStaffId: staff.id,
      customerId: customer.id,
      playerTypeId: type.id,
      registrationCode: "FF23-AB91-XD82",
    });
    expect(player.status).toBe("PENDING");
    expect(player.activatedAt).toBeNull();
  });

  it("refuses a registration that already exists on another player", async () => {
    const { staff, customer, type } = await setup();
    const { customer: other } = await makeCustomer();
    await createPlayer({ actorStaffId: staff.id, customerId: customer.id, playerTypeId: type.id, registrationCode: "DUP-0001" });
    await expect(
      createPlayer({ actorStaffId: staff.id, customerId: other.id, playerTypeId: type.id, registrationCode: "dup 0001" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("refuses a deactivated player type", async () => {
    const { staff, customer, type } = await setup();
    await shopDb().playerType.update({ where: { id: type.id }, data: { active: false } });
    await expect(
      createPlayer({ actorStaffId: staff.id, customerId: customer.id, playerTypeId: type.id, registrationCode: "NEW-0001" }),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("writes the registration to the customer timeline", async () => {
    const { staff, customer, type } = await setup();
    await createPlayer({ actorStaffId: staff.id, customerId: customer.id, playerTypeId: type.id, registrationCode: "TL-0001" });
    const activity = await shopDb().customerActivity.findMany({ where: { customerId: customer.id } });
    expect(activity).toHaveLength(1);
    expect(activity[0]).toMatchObject({ type: "player.created", staffId: staff.id });
  });
});

describe("Revealing an activation key", () => {
  it("returns the key and records who looked, without logging the key", async () => {
    const { staff, customer, type } = await setup();
    const player = await createPlayer({
      actorStaffId: staff.id,
      customerId: customer.id,
      playerTypeId: type.id,
      registrationCode: "REV-0001",
      activationKey: "SECRET-9999",
    });

    expect(await revealActivationKey({ actorStaffId: staff.id, playerId: player.id })).toBe("SECRET-9999");

    const entry = await shopDb().auditLog.findFirstOrThrow({ where: { action: "player.activation_key_revealed" } });
    expect(entry).toMatchObject({ actorStaffId: staff.id, entityId: player.id });
    expect(JSON.stringify(entry.metadata)).not.toContain("SECRET-9999");
  });

  it("says so plainly when no key is stored yet", async () => {
    const { staff, customer, type } = await setup();
    const player = await createPlayer({ actorStaffId: staff.id, customerId: customer.id, playerTypeId: type.id, registrationCode: "NOKEY-1" });
    await expect(revealActivationKey({ actorStaffId: staff.id, playerId: player.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("is a capability catalog and finance never have", () => {
    expect(roleHasPermission("CATALOG_MANAGER", "players:activation-key")).toBe(false);
    expect(roleHasPermission("FINANCE", "players:activation-key")).toBe(false);
  });
});

describe("Player lifecycle and history", () => {
  it("stamps the moment of each status change and never deletes the record", async () => {
    const { staff, customer, type } = await setup();
    const player = await createPlayer({
      actorStaffId: staff.id,
      customerId: customer.id,
      playerTypeId: type.id,
      registrationCode: "LIFE-0001",
      activationKey: "K-1",
    });
    await updatePlayer({ actorStaffId: staff.id, playerId: player.id, patch: { status: "SUSPENDED" } });
    await updatePlayer({ actorStaffId: staff.id, playerId: player.id, patch: { status: "RETIRED" } });

    const row = await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: player.id } });
    expect(row.activatedAt).not.toBeNull();
    expect(row.suspendedAt).not.toBeNull();
    expect(row.retiredAt).not.toBeNull();
    expect(row.status).toBe("RETIRED");
    expect(await shopDb().registeredPlayer.count()).toBe(1);
  });

  it("finds a player from a code read over the phone", async () => {
    const { staff, customer, type } = await setup();
    await createPlayer({
      actorStaffId: staff.id,
      customerId: customer.id,
      playerTypeId: type.id,
      registrationCode: "A8F2-73KD-91PL",
      serialNumber: "SN-55",
    });
    expect((await findPlayersByReference("73kd")).map((p) => p.customerId)).toEqual([customer.id]);
    expect((await findPlayersByReference(" a8f2 73kd ")).map((p) => p.customerId)).toEqual([customer.id]);
    expect((await findPlayersByReference("sn-55")).map((p) => p.customerId)).toEqual([customer.id]);
    expect(await findPlayersByReference("zz")).toEqual([]);
  });
});

describe("Transferring a player", () => {
  it("moves it with a reason and lands on both timelines", async () => {
    const { staff, customer, type } = await setup();
    const { customer: other } = await makeCustomer();
    const player = await createPlayer({ actorStaffId: staff.id, customerId: customer.id, playerTypeId: type.id, registrationCode: "MOVE-1" });

    await transferPlayer({ actorStaffId: staff.id, playerId: player.id, toCustomerId: other.id, reason: "Sold on" });

    const row = await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: player.id } });
    expect(row.customerId).toBe(other.id);
    const out = await shopDb().customerActivity.findFirst({ where: { customerId: customer.id, type: "player.transferred_out" } });
    const inn = await shopDb().customerActivity.findFirst({ where: { customerId: other.id, type: "player.transferred_in" } });
    expect(out).not.toBeNull();
    expect(inn).not.toBeNull();
  });

  it("is reserved for super admins", () => {
    expect(roleHasPermission("SUPER_ADMIN", "players:transfer")).toBe(true);
    expect(roleHasPermission("ADMIN", "players:transfer")).toBe(false);
    expect(roleHasPermission("SUPPORT", "players:transfer")).toBe(false);
  });
});
