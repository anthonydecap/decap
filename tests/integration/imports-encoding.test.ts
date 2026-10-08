import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { shopDb } from "@/modules/shop/db";
import {
  applyImport, confirmImport, createImportBatch, dryRunImport, finalizeImportItem, patchImportItem, presignImportItems,
} from "@/modules/shop/services/imports";
import { enqueueEncodingJob, runEncodingJob, type EncoderAdapter } from "@/modules/shop/services/encoding";
import type { UploadTarget } from "@/modules/shop/storage/types";
import type { MemoryStorageService } from "@/modules/shop/storage/memory";
import { buildMidi } from "../helpers/midi";
import { makeArrangement, makeCustomer, makeStaff, resetDb, signInAs, useMemoryStorage } from "../helpers/fixtures";

let storage: MemoryStorageService;
beforeEach(async () => {
  await resetDb();
  storage = useMemoryStorage();
  signInAs(null);
});

const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");

describe("bulk import", () => {
  it("dry-runs, uploads per item, survives partial failure, retries only failures and creates DRAFTs", async () => {
    const { staff } = await makeStaff("CATALOG_MANAGER");
    const s = { staffId: staff.id };
    const existing = await makeArrangement({ priceCents: 900, storage });

    const midi1 = buildMidi({ bpm: 72 });
    const midi2 = buildMidi({ bpm: 140 });
    const csv = [
      "sku,title,workTitle,originalArtist,arranger,price,currency,genre,compatibility,sourceMidiFilename",
      "IMP-001,Nocturne in E-flat,Nocturne Op. 9 No. 2,Frédéric Chopin,Lotte Brandt,11.50,EUR,Romantic,GENERIC,IMP-001.mid",
      `${existing.arrangement.sku},,,,,,,,,${existing.arrangement.sku}-replacement.mid`,
    ].join("\n");

    const { batch } = await createImportBatch(s, { label: "Autumn catalog", manifestCsv: csv });
    const plan = await dryRunImport(s, batch.id, [
      { clientId: "f1", filename: "IMP-001.mid", bytes: midi1.length, sha256: sha(midi1) },
      { clientId: "f2", filename: `${existing.arrangement.sku}-replacement.mid`, bytes: midi2.length, sha256: sha(midi2) },
      { clientId: "f3", filename: "IMP-001_cover.jpg", bytes: 4 },
    ]);
    expect(plan.summary).toMatchObject({ newDrafts: 1, matchedExisting: 1, files: 3 });
    // Dry run touched staging rows only.
    expect(await shopDb().arrangement.count()).toBe(1);

    await confirmImport(s, batch.id);
    const id = (clientId: string) => plan.idMap.find((m) => m.clientId === clientId)!.itemId;
    const targets = await presignImportItems(s, batch.id, [id("f1"), id("f2"), id("f3")]);
    expect(targets.every((t) => t.target)).toBe(true);
    const keyFor = (itemId: string) => {
      const t = targets.find((x) => x.itemId === itemId)!.target as UploadTarget;
      return decodeURIComponent((t as { url: string }).url.replace("memory://upload/", ""));
    };

    // f1 + f2 upload fine; f3 is not really a JPEG.
    await storage.write({ store: "MASTERS", key: keyFor(id("f1")) }, midi1, "audio/midi");
    await storage.write({ store: "MASTERS", key: keyFor(id("f2")) }, midi2, "audio/midi");
    await storage.write({ store: "PREVIEWS", key: keyFor(id("f3")) }, new Uint8Array([1, 2, 3, 4]), "image/jpeg");

    expect((await finalizeImportItem(s, batch.id, id("f1"))).status).toBe("READY");
    expect((await finalizeImportItem(s, batch.id, id("f2"))).status).toBe("READY");
    expect((await finalizeImportItem(s, batch.id, id("f3"))).status).toBe("FAILED");

    // The failure did not roll back the good items, and apply is blocked until it is resolved.
    expect(await shopDb().importBatchItem.count({ where: { importBatchId: batch.id, status: "READY" } })).toBe(2);
    await expect(applyImport(s, batch.id)).rejects.toMatchObject({ code: "INVALID_STATE" });

    // Retry only the failed file, this time with a real JPEG header.
    await patchImportItem(s, batch.id, id("f3"), { action: "retry" });
    const retry = await presignImportItems(s, batch.id, [id("f3")]);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const retryKey = decodeURIComponent(((retry[0]!.target as { url: string }).url).replace("memory://upload/", ""));
    await storage.write({ store: "PREVIEWS", key: retryKey }, jpeg, "image/jpeg");
    expect((await finalizeImportItem(s, batch.id, id("f3"))).status).toBe("READY");
    expect(storage.issuedUploads.filter((u) => u.key === keyFor(id("f1")))).toHaveLength(1); // f1 never re-uploaded

    const result = await applyImport(s, batch.id);
    expect(result).toMatchObject({ createdArrangements: 1, attachedVersions: 3 });

    const created = await shopDb().arrangement.findUniqueOrThrow({
      where: { sku: "IMP-001" },
      include: { arranger: true, work: true, genres: true, compatibilities: true, assets: { include: { versions: true } } },
    });
    expect(created.status).toBe("DRAFT"); // never auto-published
    expect(created).toMatchObject({ priceCents: 1150, arranger: { name: "Lotte Brandt" }, work: { originalArtist: "Frédéric Chopin" } });
    expect(created.genres.map((g) => g.name)).toEqual(["Romantic"]);
    expect(created.assets.map((a) => a.kind).sort()).toEqual(["COVER_IMAGE", "SOURCE_MIDI"]);

    // Replacement for the existing SKU is a new immutable version, not activated automatically.
    const slot = await shopDb().asset.findFirstOrThrow({
      where: { arrangementId: existing.arrangement.id, kind: "SOURCE_MIDI" },
      include: { versions: { orderBy: { versionNumber: "asc" } } },
    });
    expect(slot.versions).toHaveLength(2);
    expect(slot.activeVersionId).toBe(slot.versions[0]!.id);

    const finalBatch = await shopDb().importBatch.findUniqueOrThrow({ where: { id: batch.id } });
    expect(finalBatch.status).toBe("COMPLETED");
    expect(await shopDb().auditLog.count({ where: { action: "import.applied" } })).toBe(1);
  });

  it("lets the admin remap an unmatched file and skip another", async () => {
    const { staff } = await makeStaff();
    const s = { staffId: staff.id };
    const { arrangement } = await makeArrangement({ priceCents: 900, storage });
    const { batch } = await createImportBatch(s, {});
    const plan = await dryRunImport(s, batch.id, [
      { clientId: "x", filename: "mystery.mid", bytes: 10 },
      { clientId: "y", filename: "notes.txt", bytes: 10 },
    ]);
    const x = plan.idMap.find((m) => m.clientId === "x")!.itemId;
    const y = plan.idMap.find((m) => m.clientId === "y")!.itemId;
    expect(plan.items.find((i) => i.clientId === "y")!.status).toBe("NEEDS_REVIEW");

    const remapped = await patchImportItem(s, batch.id, x, { action: "remap", targetSku: arrangement.sku.toLowerCase() });
    expect(remapped.targetSku).toBe(arrangement.sku);
    await expect(patchImportItem(s, batch.id, x, { action: "remap", targetSku: "NOPE-404" })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    expect((await patchImportItem(s, batch.id, y, { action: "skip" })).status).toBe("SKIPPED");
  });
});

describe("device-bound encoding pipeline", () => {
  const adapter: EncoderAdapter = {
    encoderVersion: "legacy-exe-3.2",
    encode: async ({ source, deviceBinding }) => new Uint8Array([...new TextEncoder().encode(`DMI:${deviceBinding}:`), ...source.subarray(0, 4)]),
  };

  it("requires an ACTIVE entitlement and writes output only as a private DeliveryArtifact", async () => {
    const { customer } = await makeCustomer();
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    await shopDb().protectionProfile.create({ data: { name: "dmi-protect", version: "p1", secretRef: "kms://dmi/p1" } });
    const input = { customerId: customer.id, arrangementId: arrangement.id, deviceRegistrationRef: "dev-reg-7", encoderVersion: "legacy-exe-3.2", protectionProfileVersion: "p1" };

    await expect(enqueueEncodingJob(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await shopDb().entitlement.create({ data: { customerId: customer.id, arrangementId: arrangement.id } });

    const { job } = await enqueueEncodingJob(input);
    const mastersBefore = await shopDb().assetVersion.count();
    const done = await runEncodingJob(job!.id, adapter);
    expect(done.status).toBe("SUCCEEDED");

    const artifact = await shopDb().deliveryArtifact.findUniqueOrThrow({ where: { id: done.deliveryArtifactId! } });
    expect(artifact.outputObjectKey).toMatch(/^deliveries\/dmi\//);
    expect(await storage.head({ store: "DELIVERIES", key: artifact.outputObjectKey })).not.toBeNull();
    expect(await shopDb().assetVersion.count()).toBe(mastersBefore); // no new "master" was created

    // Cached for the same tuple.
    const cached = await enqueueEncodingJob(input);
    expect(cached.job).toBeNull();
    expect(cached.artifact!.id).toBe(artifact.id);
  });

  it("records sanitized failures and can retry", async () => {
    const { customer } = await makeCustomer();
    const { arrangement } = await makeArrangement({ priceCents: 999, storage });
    await shopDb().protectionProfile.create({ data: { name: "dmi-protect", version: "p1", secretRef: "kms://dmi/p1" } });
    await shopDb().entitlement.create({ data: { customerId: customer.id, arrangementId: arrangement.id } });
    const { job } = await enqueueEncodingJob({ customerId: customer.id, arrangementId: arrangement.id, deviceRegistrationRef: "d", encoderVersion: "legacy-exe-3.2", protectionProfileVersion: "p1" });

    const failing: EncoderAdapter = { encoderVersion: "legacy-exe-3.2", encode: async () => { throw new Error("C:\\encoder\\run.exe crashed key=abc123"); } };
    const failed = await runEncodingJob(job!.id, failing);
    expect(failed).toMatchObject({ status: "FAILED", errorCode: "ENCODER_FAILED", attemptCount: 1 });
    expect(failed.errorMessage).not.toMatch(/abc123|run\.exe/);

    const retried = await runEncodingJob(job!.id, adapter);
    expect(retried).toMatchObject({ status: "SUCCEEDED", attemptCount: 2 });
  });
});
