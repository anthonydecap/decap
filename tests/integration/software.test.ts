import { beforeEach, describe, expect, it } from "vitest";
import { GET as downloadGET } from "@/app/api/shop/software/[slug]/download/route";
import { POST as submitPOST } from "@/app/api/shop/software/licenses/[id]/activation/route";
import { POST as revealPOST } from "@/app/api/shop/software/installations/[id]/key/route";
import { POST as processPOST } from "@/app/api/admin/shop/software/activations/[id]/route";
import { POST as releaseActionPOST } from "@/app/api/admin/shop/software/releases/[id]/action/route";
import { shopDb } from "@/modules/shop/db";
import { addToCart } from "@/modules/shop/services/cart";
import { prepareCheckout } from "@/modules/shop/services/checkout";
import { searchCrmCustomers } from "@/modules/shop/services/crm-admin";
import { listActivity } from "@/modules/shop/services/crm";
import { setEmailProvider, type EmailMessage } from "@/modules/shop/services/email";
import { fulfillPaymentIntent } from "@/modules/shop/services/fulfillment";
import { createRefund } from "@/modules/shop/services/refunds";
import { customerSoftwareDetail, customerSoftwareOverview, finalizeRelease, presignRelease, releaseAction } from "@/modules/shop/services/software";
import {
  adminCreateLicense, crmSoftware, customerRevealKey, processActivation, submitActivation,
} from "@/modules/shop/services/software-licensing";
import { createTicket } from "@/modules/shop/services/support";
import { fakeStripe, makeArrangement, makeCustomer, makeStaff, resetDb, signInAs, useMemoryStorage } from "../helpers/fixtures";
import { grantMusic } from "@/modules/shop/services/music-licenses";
import type { MemoryStorageService } from "@/modules/shop/storage/memory";

let storage: MemoryStorageService;
let stripeFake: ReturnType<typeof fakeStripe>;
let sent: EmailMessage[];
const KEY = "K7Q2-PLM4-9XWZ-88RT";
const ctx = <P,>(p: P) => ({ params: Promise.resolve(p) });
const json = (body: unknown) => new Request("http://localhost:3000/x", { method: "POST", body: JSON.stringify(body) });
const PE = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 3, 0, 0, 0, 4, 0, 0, 0]);

/** Product with a published, current STABLE release whose bytes are in memory storage. */
async function makeProduct(opts: { slug?: string; priceCents?: number | null } = {}) {
  const { staff } = await makeStaff("CATALOG_MANAGER");
  const s = { staffId: staff.id };
  const product = await shopDb().softwareProduct.create({
    data: {
      slug: opts.slug ?? "dmi-player", name: "DMI Player", trialAvailable: true, status: "DRAFT",
      defaultLicensePriceCents: opts.priceCents === undefined ? 4900 : opts.priceCents, defaultMaxActivations: 1,
    },
  });
  const { releaseId } = await presignRelease(s, product.id, { version: "4.2.1", platform: "WINDOWS", architecture: "X64", releaseChannel: "STABLE", filename: "DMIPlayerSetup.exe", bytes: PE.length, releaseNotes: null, minimumOsVersion: null });
  const rel = await shopDb().softwareRelease.findUniqueOrThrow({ where: { id: releaseId } });
  await storage.write({ store: "SOFTWARE", key: rel.storageKey }, PE, "application/octet-stream");
  await finalizeRelease(s, releaseId);
  await releaseAction(s, releaseId, "publish");
  await releaseAction(s, releaseId, "mark_current");
  await shopDb().softwareProduct.update({ where: { id: product.id }, data: { status: "ACTIVE" } });
  return { product: await shopDb().softwareProduct.findUniqueOrThrow({ where: { id: product.id } }), releaseId, catalogStaff: s };
}

/** Buys a license through the real cart → checkout → webhook path. */
async function buyLicense(customer: Awaited<ReturnType<typeof makeCustomer>>["customer"], productId: string) {
  await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "SOFTWARE_LICENSE", softwareProductId: productId });
  const prepared = await prepareCheckout(customer);
  return prepared;
}
async function pay(orderId: string) {
  const pi = [...stripeFake.intents.values()].find((p) => p.metadata.orderId === orderId)!;
  await fulfillPaymentIntent({ ...pi, amount_received: pi.amount, latest_charge: "ch_x", status: "succeeded" } as never);
}

beforeEach(async () => {
  await resetDb();
  storage = useMemoryStorage();
  stripeFake = fakeStripe();
  signInAs(null);
  sent = [];
  setEmailProvider({ send: async (m) => { sent.push(m); } });
});

describe("authenticated installer downloads", () => {
  it("sends signed-out visitors through sign-in and back to the software page", async () => {
    await makeProduct();
    const res = await downloadGET(new Request("http://localhost:3000/api/shop/software/dmi-player/download?lang=fr"), ctx({ slug: "dmi-player" }));
    expect(res.status).toBe(302);
    const loc = new URL(res.headers.get("location")!);
    expect(loc.pathname).toBe("/auth/login");
    expect(loc.searchParams.get("returnTo")).toBe("/fr/software/dmi-player?download=1");
    expect(await shopDb().softwareDownload.count()).toBe(0);
    expect(storage.issuedDownloads).toHaveLength(0);
  });

  it("records the download and redirects to a short-lived URL for the current stable release", async () => {
    const { product, releaseId } = await makeProduct();
    const { customer, session } = await makeCustomer();
    signInAs(session);
    const res = await downloadGET(new Request("http://localhost:3000/api/shop/software/dmi-player/download?source=account"), ctx({ slug: "dmi-player" }));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/^memory:\/\/download\/software%2Finstaller/);
    expect(storage.issuedDownloads.at(-1)).toMatchObject({ store: "SOFTWARE", expiresInSeconds: 300 });
    const dl = await shopDb().softwareDownload.findFirstOrThrow();
    expect(dl).toMatchObject({ customerId: customer.id, softwareProductId: product.id, softwareReleaseId: releaseId, source: "ACCOUNT" });
    expect((await listActivity(customer.id)).map((a) => a.type)).toContain("software.downloaded");
    // A download is not a license; the customer is in trial.
    const [entry] = await customerSoftwareOverview(customer.id);
    expect(entry).toMatchObject({ status: "TRIAL", licenses: [] });
    // Downloading never touches marketing consent.
    expect((await shopDb().customer.findUniqueOrThrow({ where: { id: customer.id } })).marketingConsent).toBe(false);
  });
});

describe("immutable releases", () => {
  it("never lets a draft, unverified or archived release become current", async () => {
    const { product, catalogStaff: s } = await makeProduct();
    const bad = await presignRelease(s, product.id, { version: "4.3.0", platform: "WINDOWS", architecture: "X64", releaseChannel: "STABLE", filename: "Setup.exe", bytes: 8, releaseNotes: null, minimumOsVersion: null });
    const badRow = await shopDb().softwareRelease.findUniqueOrThrow({ where: { id: bad.releaseId } });
    await storage.write({ store: "SOFTWARE", key: badRow.storageKey }, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), "application/octet-stream");
    const checked = await finalizeRelease(s, bad.releaseId);
    expect(checked.status).toBe("UPLOADING");
    expect(JSON.stringify(checked.validationErrors)).toContain("SIGNATURE_MISMATCH");
    await expect(releaseAction(s, bad.releaseId, "publish")).rejects.toMatchObject({ code: "INVALID_STATE" });
    await expect(releaseAction(s, bad.releaseId, "mark_current")).rejects.toMatchObject({ code: "INVALID_STATE" });

    // Same version again is refused: binaries are never replaced in place.
    await expect(presignRelease(s, product.id, { version: "4.2.1", platform: "WINDOWS", architecture: "X64", releaseChannel: "STABLE", filename: "x.exe", bytes: 2, releaseNotes: null, minimumOsVersion: null }))
      .rejects.toMatchObject({ code: "CONFLICT" });

    const current = await shopDb().softwareRelease.findFirstOrThrow({ where: { isCurrent: true } });
    await releaseAction(s, current.id, "archive");
    expect((await shopDb().softwareProduct.findUniqueOrThrow({ where: { id: product.id } })).currentVersion).toBeNull();
    await expect(releaseAction(s, current.id, "mark_current")).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("restricts publishing to staff with the publish permission", async () => {
    const { releaseId } = await makeProduct();
    signInAs((await makeStaff("SUPPORT")).session);
    expect((await releaseActionPOST(json({ action: "archive" }), ctx({ id: releaseId }))).status).toBe(403);
  });
});

describe("license purchase and activation", () => {
  it("creates a pending license only after the Stripe webhook, then guides activation to an encrypted key", async () => {
    const { product } = await makeProduct();
    const { customer, session } = await makeCustomer();
    const prepared = await buyLicense(customer, product.id);
    expect(prepared.pricing.totalCents).toBe(4900);
    expect(await shopDb().softwareLicense.count()).toBe(0); // browser success is not proof

    await pay(prepared.orderId);
    const lic = await shopDb().softwareLicense.findFirstOrThrow();
    expect(lic).toMatchObject({ customerId: customer.id, status: "PENDING_ACTIVATION", licenseSource: "PURCHASE", maxActivations: 1, orderId: prepared.orderId });
    expect(sent.at(-1)!.subject).toContain("one more step");
    const detail = (await customerSoftwareDetail(customer.id, "dmi-player"))!;
    expect(detail.status).toBe("REGISTRATION_CODE_NEEDED");

    // Customer submits the code shown by the software.
    signInAs(session);
    const res = await submitPOST(json({ registrationCode: "a8f2-73kd-91pl" }), ctx({ id: lic.id }));
    expect(res.status).toBe(201);
    const req = await shopDb().softwareActivationRequest.findFirstOrThrow();
    expect(req).toMatchObject({ registrationCode: "A8F273KD91PL", status: "SUBMITTED" });
    expect(await shopDb().customerTask.count({ where: { softwareActivationRequestId: req.id, status: "OPEN" } })).toBe(1);
    expect(sent.at(-1)!.subject).toContain("received");
    expect((await customerSoftwareDetail(customer.id, "dmi-player"))!.status).toBe("WAITING_FOR_DMI");
    expect((await submitPOST(json({ registrationCode: "A8F273KD91PL" }), ctx({ id: lic.id }))).status).toBe(409);

    // Staff without the processing permission cannot approve.
    for (const role of ["CATALOG_MANAGER", "FINANCE"] as const) {
      signInAs((await makeStaff(role)).session);
      expect((await processPOST(json({ action: "approve", activationKey: KEY }), ctx({ id: req.id }))).status).toBe(403);
    }
    // Support can.
    signInAs((await makeStaff("SUPPORT")).session);
    expect((await processPOST(json({ action: "approve", activationKey: KEY }), ctx({ id: req.id }))).status).toBe(200);

    const inst = await shopDb().softwareInstallation.findFirstOrThrow();
    expect(inst).toMatchObject({ status: "ACTIVE", registrationCode: "A8F273KD91PL", registrationIdentifier: "A8F273KD91PL", customerId: customer.id });
    expect(inst.activationKeyEncrypted).toBeTruthy();
    expect(inst.activationKeyEncrypted).not.toContain(KEY); // encrypted at rest
    expect((await shopDb().softwareLicense.findUniqueOrThrow({ where: { id: lic.id } })).status).toBe("ACTIVE");
    expect(await shopDb().customerTask.count({ where: { softwareActivationRequestId: req.id, status: "DONE" } })).toBe(1);
    expect(sent.at(-1)!.subject).toContain("is ready");

    // The key never leaks into email, audit, timeline, customer lists or CRM data.
    const everywhere = JSON.stringify([
      sent,
      await shopDb().auditLog.findMany(),
      await shopDb().customerActivity.findMany(),
      await customerSoftwareOverview(customer.id),
      await customerSoftwareDetail(customer.id, "dmi-player"),
      await crmSoftware(customer.id),
    ]);
    expect(everywhere).not.toContain(KEY);
    expect(everywhere).not.toContain(inst.activationKeyEncrypted!);
    expect((await customerSoftwareDetail(customer.id, "dmi-player"))!.status).toBe("LICENSED");

    // The owner reveals their key explicitly; the reveal is audited.
    signInAs(session);
    const reveal = await revealPOST(json({}), ctx({ id: inst.id }));
    expect(await reveal.json()).toEqual({ activationKey: KEY });
    expect(await shopDb().auditLog.count({ where: { action: "software_installation.key_revealed" } })).toBe(1);

    const types = (await listActivity(customer.id)).map((a) => a.type);
    expect(types).toEqual(expect.arrayContaining(["software.license_purchased", "software.activation_requested", "software.activation_approved"]));
  });

  it("isolates licenses, requests and keys between customers", async () => {
    const { product } = await makeProduct();
    const owner = await makeCustomer();
    const intruder = await makeCustomer();
    const { staff } = await makeStaff("ADMIN");
    const lic = await adminCreateLicense({ staffId: staff.id }, {
      customerId: owner.customer.id, softwareProductId: product.id, licenseSource: "LEGACY_IMPORT", notes: null, sourceReference: null,
      installation: { registrationCode: "LEGACY-1234-ABCD", activationKey: KEY, label: null },
    });
    expect(lic.status).toBe("ACTIVE");
    expect(await shopDb().order.count()).toBe(0); // no fake orders for legacy licenses
    const inst = await shopDb().softwareInstallation.findFirstOrThrow();

    signInAs(intruder.session);
    expect((await submitPOST(json({ registrationCode: "ZZZZ9999" }), ctx({ id: lic.id }))).status).toBe(404);
    expect((await revealPOST(json({}), ctx({ id: inst.id }))).status).toBe(404);
    await expect(customerRevealKey(intruder.customer, inst.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(await customerSoftwareOverview(intruder.customer.id)).toEqual([]);
    // Support tickets can only link the customer's own software.
    await expect(createTicket(intruder.customer, { subject: "License", category: "SOFTWARE_ACTIVATION", softwareLicenseId: lic.id, message: "Please help me." }))
      .rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    const ok = await createTicket(owner.customer, { subject: "License", category: "SOFTWARE_ACTIVATION", softwareLicenseId: lic.id, message: "Please help me." });
    expect(ok).toMatchObject({ softwareLicenseId: lic.id, softwareProductId: product.id });
  });

  it("never silently moves a registration code that is active for someone else", async () => {
    const { product } = await makeProduct();
    const first = await makeCustomer();
    const second = await makeCustomer();
    const admin = await makeStaff("ADMIN");
    await adminCreateLicense({ staffId: admin.staff.id }, {
      customerId: first.customer.id, softwareProductId: product.id, licenseSource: "LEGACY_IMPORT", notes: null, sourceReference: null,
      installation: { registrationCode: "SHARED-CODE-0001", activationKey: "OLD-KEY", label: null },
    });
    const lic2 = await adminCreateLicense({ staffId: admin.staff.id }, {
      customerId: second.customer.id, softwareProductId: product.id, licenseSource: "PROMOTION", notes: null, sourceReference: null, installation: null,
    });
    const req = await submitActivation(second.customer, lic2.id, { registrationCode: "SHARED-CODE-0001", message: null });
    expect(req.conflictInstallationId).toBeTruthy();
    expect((await customerSoftwareDetail(second.customer.id, "dmi-player"))!.licenses[0]!.requests[0]!.underReview).toBe(true);

    signInAs(admin.session);
    expect((await processPOST(json({ action: "approve", activationKey: KEY, resolveConflict: "RETIRE_EXISTING" }), ctx({ id: req.id }))).status).toBe(403);
    expect(await shopDb().softwareInstallation.count({ where: { status: "ACTIVE", customerId: first.customer.id } })).toBe(1);

    const root = await makeStaff("SUPER_ADMIN");
    await processActivation({ staffId: root.staff.id, canTransfer: true }, req.id, { action: "approve", activationKey: KEY, resolveConflict: "RETIRE_EXISTING" });
    const all = await shopDb().softwareInstallation.findMany({ orderBy: { createdAt: "asc" } });
    expect(all.map((i) => [i.customerId === first.customer.id ? "first" : "second", i.status])).toEqual([["first", "RETIRED"], ["second", "ACTIVE"]]);
  });

  it("replaces a computer without overwriting history, and refunds keep everything", async () => {
    const { product } = await makeProduct();
    const { customer } = await makeCustomer();
    const prepared = await buyLicense(customer, product.id);
    await pay(prepared.orderId);
    const lic = await shopDb().softwareLicense.findFirstOrThrow();
    const support = await makeStaff("SUPPORT");
    const s = { staffId: support.staff.id, canTransfer: false };

    const r1 = await submitActivation(customer, lic.id, { registrationCode: "PC-ONE-1111", message: null });
    await processActivation(s, r1.id, { action: "approve", activationKey: "KEY-ONE" });
    // All activations used: a second code must say which installation it replaces.
    await expect(submitActivation(customer, lic.id, { registrationCode: "PC-TWO-2222", message: null })).rejects.toMatchObject({ code: "CONFLICT" });
    const old = await shopDb().softwareInstallation.findFirstOrThrow();
    const r2 = await submitActivation(customer, lic.id, { registrationCode: "PC-TWO-2222", message: "New laptop", replacesInstallationId: old.id });
    await processActivation(s, r2.id, { action: "request_info", message: "Is the old PC still in use?" });
    expect((await customerSoftwareDetail(customer.id, "dmi-player"))!.status).toBe("ACTION_REQUIRED");
    await processActivation(s, r2.id, { action: "approve", activationKey: "KEY-TWO" });
    const installs = await shopDb().softwareInstallation.findMany({ orderBy: { createdAt: "asc" } });
    expect(installs.map((i) => i.status)).toEqual(["RETIRED", "ACTIVE"]);
    expect(installs[0]!.retiredReason).toContain("replaced");

    // Refund: license revoked, installations kept as history, order preserved, no new activations.
    await createRefund({ staffId: support.staff.id, orderId: prepared.orderId, reason: "Bought by mistake" });
    expect((await shopDb().softwareLicense.findUniqueOrThrow({ where: { id: lic.id } })).status).toBe("REVOKED");
    expect((await shopDb().softwareInstallation.findMany()).map((i) => i.status).sort()).toEqual(["DEACTIVATED", "RETIRED"]);
    expect(await shopDb().order.findUniqueOrThrow({ where: { id: prepared.orderId } })).toMatchObject({ status: "REFUNDED" });
    expect(await shopDb().softwareActivationRequest.count()).toBe(2);
    await expect(submitActivation(customer, lic.id, { registrationCode: "PC-THREE-3333", message: null })).rejects.toMatchObject({ code: "INVALID_STATE" });
    expect((await listActivity(customer.id)).map((a) => a.type)).toContain("software.license_revoked");
  });
});

describe("CRM search", () => {
  it("finds the customer from a license number, activation number or registration code", async () => {
    const { product } = await makeProduct();
    const me = await makeCustomer();
    await makeCustomer();
    const { staff } = await makeStaff("ADMIN");
    const lic = await adminCreateLicense({ staffId: staff.id }, {
      customerId: me.customer.id, softwareProductId: product.id, licenseSource: "PROMOTION", notes: null, sourceReference: null, installation: null,
    });
    const req = await submitActivation(me.customer, lic.id, { registrationCode: "Q1W2-E3R4-T5Y6", message: null });
    for (const q of [`LIC-${lic.number}`, `ACT-${req.number}`, "q1w2-e3r4-t5y6"]) {
      expect((await searchCrmCustomers({ q })).items.map((c) => c.id)).toEqual([me.customer.id]);
    }
  });

  it("an activated copy of player software is a player; a computer replacement takes its music along", async () => {
    const { product } = await makeProduct();
    const type = await shopDb().playerType.create({ data: { code: "DMI_PLAYER", name: "DMI Player", softwareProductId: product.id } });
    const { customer } = await makeCustomer();
    const prepared = await buyLicense(customer, product.id);
    await pay(prepared.orderId);
    const lic = await shopDb().softwareLicense.findFirstOrThrow();
    const admin = await makeStaff("ADMIN");
    const s = { staffId: admin.staff.id, canTransfer: false };

    const r1 = await submitActivation(customer, lic.id, { registrationCode: "PC-ONE-1111", message: null });
    await processActivation(s, r1.id, { action: "approve", activationKey: "KEY-ONE", label: "Living room PC" });
    const first = await shopDb().registeredPlayer.findFirstOrThrow({ where: { customerId: customer.id } });
    expect(first).toMatchObject({ playerTypeId: type.id, status: "ACTIVE", registrationCode: "PCONE1111", friendlyName: "Living room PC" });
    expect((await shopDb().softwareInstallation.findFirstOrThrow()).registeredPlayerId).toBe(first.id);

    const { arrangement } = await makeArrangement({ priceCents: 500 });
    await grantMusic({ staffId: admin.staff.id, customerId: customer.id, playerId: first.id, arrangementIds: [arrangement.id], source: "ADMIN_GRANT", reason: "seed" });

    const old = await shopDb().softwareInstallation.findFirstOrThrow();
    const r2 = await submitActivation(customer, lic.id, { registrationCode: "PC-TWO-2222", message: "New laptop", replacesInstallationId: old.id });
    await processActivation(s, r2.id, { action: "approve", activationKey: "KEY-TWO" });
    const second = await shopDb().registeredPlayer.findFirstOrThrow({ where: { customerId: customer.id, id: { not: first.id } } });
    expect((await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: first.id } })).status).toBe("RETIRED");
    expect(second).toMatchObject({ status: "ACTIVE", friendlyName: "Living room PC" });
    const live = await shopDb().musicLicense.findMany({ where: { licensedPlayerId: second.id, status: "ACTIVE" } });
    expect(live.map((l) => [l.arrangementId, l.licenseSource])).toEqual([[arrangement.id, "REPLACEMENT_TRANSFER"]]);
    expect(await shopDb().musicLicenseTransfer.count({ where: { type: "COMPUTER_REPLACEMENT" } })).toBe(1);

    // Refunding the software suspends the player (music kept, not deliverable); a tool product never becomes a player.
    await createRefund({ staffId: admin.staff.id, orderId: prepared.orderId, reason: "Bought by mistake" });
    expect((await shopDb().registeredPlayer.findUniqueOrThrow({ where: { id: second.id } })).status).toBe("SUSPENDED");
    expect(await shopDb().registeredPlayer.count()).toBe(2);
  });
});
