import { beforeEach, describe, expect, it } from "vitest";
import { POST as presignPOST } from "@/app/api/admin/shop/arrangements/[id]/assets/route";
import { POST as finalizePOST } from "@/app/api/admin/shop/asset-versions/[id]/finalize/route";
import { POST as downloadPOST } from "@/app/api/admin/shop/asset-versions/[id]/download/route";
import { POST as activatePOST } from "@/app/api/admin/shop/asset-versions/[id]/activate/route";
import { shopDb } from "@/modules/shop/db";
import { getArrangementDetail, getBundleDetail, searchCatalog } from "@/modules/shop/services/catalog";
import { customerLibrary } from "@/modules/shop/services/entitlements";
import { verifyTicket } from "@/modules/shop/storage/tickets";
import { buildMidi } from "../helpers/midi";
import { makeArrangement, makeBundle, makeCustomer, makeStaff, resetDb, signInAs, useMemoryStorage } from "../helpers/fixtures";
import type { MemoryStorageService } from "@/modules/shop/storage/memory";

let storage: MemoryStorageService;
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (body: unknown) => new Request("http://localhost:3000/x", { method: "POST", body: JSON.stringify(body) });

beforeEach(async () => {
  await resetDb();
  storage = useMemoryStorage();
  signInAs(null);
});

describe("admin upload URLs", () => {
  it("only staff with upload permission can create them", async () => {
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    const body = { kind: "SOURCE_MIDI", filename: "take2.mid", bytes: 100, contentType: "audio/midi" };

    expect((await presignPOST(post(body), ctx(arrangement.id))).status).toBe(401);
    signInAs((await makeCustomer()).session);
    expect((await presignPOST(post(body), ctx(arrangement.id))).status).toBe(403);
    signInAs((await makeStaff("FINANCE")).session);
    expect((await presignPOST(post(body), ctx(arrangement.id))).status).toBe(403);
    expect(storage.issuedUploads).toHaveLength(0);
  });

  it("are short-lived, single-path, size/type constrained, and create an UPLOADING version", async () => {
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    const { session, staff } = await makeStaff("CATALOG_MANAGER");
    signInAs(session);

    const before = Date.now();
    const res = await presignPOST(post({ kind: "SOURCE_MIDI", filename: "Client Name - secret.mid", bytes: 123, contentType: "audio/midi" }), ctx(arrangement.id));
    expect(res.status).toBe(201);
    const body = await res.json();
    const issued = storage.issuedUploads.at(-1)!;

    expect(issued.store).toBe("MASTERS");
    expect(issued.maxBytes).toBe(123);
    expect(issued.contentType).toBe("audio/midi");
    expect(issued.expiresInSeconds).toBeGreaterThanOrEqual(300);
    expect(issued.expiresInSeconds).toBeLessThanOrEqual(900);
    expect(issued.key).toMatch(/^masters\/source-midi\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.mid$/);
    expect(issued.key).not.toMatch(/client|secret/i); // original filename never leaks into keys

    const ticket = verifyTicket(issued.ticket, "test-upload-ticket-secret")!;
    expect(ticket).toMatchObject({ key: issued.key, staffId: staff.id, maxBytes: 123, purpose: `asset-version:${body.assetVersionId}` });
    expect(ticket.exp - before).toBeLessThanOrEqual(900_000 + 1000);

    const v = await shopDb().assetVersion.findUniqueOrThrow({ where: { id: body.assetVersionId } });
    expect(v).toMatchObject({ status: "UPLOADING", versionNumber: 2, originalFilename: "Client Name - secret.mid" });
  });

  it("rejects disallowed types and oversized files before issuing anything", async () => {
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    signInAs((await makeStaff()).session);
    const exe = await presignPOST(post({ kind: "SOURCE_MIDI", filename: "tool.exe", bytes: 10 }), ctx(arrangement.id));
    expect(exe.status).toBe(422);
    const huge = await presignPOST(post({ kind: "COVER_IMAGE", filename: "c.jpg", bytes: 500 * 1024 * 1024 }), ctx(arrangement.id));
    expect(huge.status).toBe(422);
  });
});

describe("finalize, immutable versions and activation", () => {
  it("validates real content, never overwrites, and needs explicit activation for replacements", async () => {
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    signInAs((await makeStaff()).session);
    const midi = buildMidi({ bpm: 90 });

    const good = await (await presignPOST(post({ kind: "SOURCE_MIDI", filename: "v2.mid", bytes: midi.length }), ctx(arrangement.id))).json();
    await storage.write({ store: "MASTERS", key: storage.issuedUploads.at(-1)!.key }, midi, "audio/midi");
    const fin = await (await finalizePOST(post({}), ctx(good.assetVersionId))).json();
    expect(fin.status).toBe("VALID");
    expect(fin.technicalMetadata.midi).toMatchObject({ format: 1, ppq: 480, trackCount: 2 });

    // Not auto-activated: the slot already had an active v1.
    const asset = await shopDb().asset.findFirstOrThrow({ where: { arrangementId: arrangement.id, kind: "SOURCE_MIDI" }, include: { versions: true } });
    expect(asset.activeVersionId).not.toBe(good.assetVersionId);
    expect(asset.versions).toHaveLength(2);
    await activatePOST(post({}), ctx(good.assetVersionId));
    const after = await shopDb().asset.findUniqueOrThrow({ where: { id: asset.id }, include: { versions: true } });
    expect(after.activeVersionId).toBe(good.assetVersionId);
    expect(after.versions.find((v) => v.versionNumber === 1)!.supersededAt).not.toBeNull();

    // A renamed binary is caught by its signature.
    const fake = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 1, 2, 3, 4]);
    const bad = await (await presignPOST(post({ kind: "SOURCE_MIDI", filename: "evil.mid", bytes: fake.length }), ctx(arrangement.id))).json();
    await storage.write({ store: "MASTERS", key: storage.issuedUploads.at(-1)!.key }, fake, "audio/midi");
    const badFin = await (await finalizePOST(post({}), ctx(bad.assetVersionId))).json();
    expect(badFin.status).toBe("INVALID");
    expect(badFin.errors.map((e: { code: string }) => e.code)).toContain("UNKNOWN_SIGNATURE");
    expect((await activatePOST(post({}), ctx(bad.assetVersionId))).status).toBe(409);
  });

  it("detects a size or checksum mismatch", async () => {
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    signInAs((await makeStaff()).session);
    const midi = buildMidi();
    const res = await (await presignPOST(post({ kind: "SOURCE_MIDI", filename: "x.mid", bytes: midi.length, sha256: "0".repeat(64) }), ctx(arrangement.id))).json();
    await storage.write({ store: "MASTERS", key: storage.issuedUploads.at(-1)!.key }, midi, "audio/midi");
    const fin = await (await finalizePOST(post({}), ctx(res.assetVersionId))).json();
    expect(fin.errors.map((e: { code: string }) => e.code)).toContain("CHECKSUM_MISMATCH");
  });

  it("admin re-download is ADMIN-only, short-lived and audited", async () => {
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    const v = await shopDb().assetVersion.findFirstOrThrow({ where: { asset: { arrangementId: arrangement.id, kind: "SOURCE_MIDI" } } });

    signInAs((await makeStaff("CATALOG_MANAGER")).session);
    expect((await downloadPOST(post({}), ctx(v.id))).status).toBe(403);

    signInAs((await makeStaff("ADMIN")).session);
    const ok = await downloadPOST(post({}), ctx(v.id));
    expect(ok.status).toBe(200);
    expect(storage.issuedDownloads.at(-1)).toMatchObject({ store: "MASTERS", expiresInSeconds: 120 });
    expect(await shopDb().auditLog.count({ where: { action: "asset.master_download", entityId: v.id } })).toBe(1);
  });
});

describe("customers can never obtain a master", () => {
  it("storefront, bundle and library payloads contain no master keys, filenames or URLs", async () => {
    const { customer } = await makeCustomer();
    const { staff } = await makeStaff();
    const a = await makeArrangement({ priceCents: 999, storage });
    const b = await makeArrangement({ priceCents: 999, storage });
    const bundle = await makeBundle({ priceCents: 1500, arrangementIds: [a.arrangement.id, b.arrangement.id] });
    await shopDb().entitlement.create({ data: { customerId: customer.id, arrangementId: a.arrangement.id } });
    void staff;

    const masters = await shopDb().assetVersion.findMany({ where: { storageStore: "MASTERS" } });
    const forbidden = masters.flatMap((m) => [m.storageKey, m.originalFilename, "masters/"]);

    const payloads = JSON.stringify([
      await searchCatalog({}, customer.id),
      await getArrangementDetail(a.arrangement.slug, customer.id),
      await getBundleDetail(bundle.slug, customer.id),
      await customerLibrary(customer.id),
    ]);
    for (const f of forbidden) expect(payloads).not.toContain(f);
    expect(payloads).not.toMatch(/sha256|storageKey|internalNotes/);
    // Previews do resolve, and only from the PREVIEWS store.
    expect(payloads).toContain("memory://public/previews/");
    expect(storage.issuedDownloads.filter((d) => d.store === "MASTERS")).toHaveLength(0);
  });
});
