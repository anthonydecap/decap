/**
 * Safe development seed for the DMI shop: genres, compatibility profiles, arrangers, works,
 * arrangements with tiny *generated* MIDI masters (no copyrighted material), and bundles.
 *
 *   npm run shop:seed                      # uses SHOP_DATABASE_URL + SHOP_STORAGE_DRIVER
 *   SHOP_SEED_ADMIN_SUB="auth0|…" npm run shop:seed   # also creates an ADMIN StaffAccount
 *
 * Seed arrangements are published directly (dev data only); they have no audio previews, so
 * a real publish through the admin would require one when SHOP_REQUIRE_PREVIEW_TO_PUBLISH=true.
 */
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { del, put } from "@vercel/blob";
import { PrismaClient } from "../src/generated/shop-prisma/client";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const url = process.env.SHOP_DATABASE_URL;
if (!url) throw new Error("SHOP_DATABASE_URL is not set");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const driver = process.env.SHOP_STORAGE_DRIVER ?? "vercel-blob";

/** Generates a short original melody as a format-1 MIDI file. */
function generateMidi(seed: number, bpm: number): Uint8Array {
  const ppq = 480;
  const us = Math.round(60_000_000 / bpm);
  const conductor = [0x00, 0xff, 0x51, 0x03, (us >> 16) & 0xff, (us >> 8) & 0xff, us & 0xff, 0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08, 0x00, 0xff, 0x2f, 0x00];
  const scale = [60, 62, 64, 65, 67, 69, 71, 72];
  const notes: number[] = [0x00, 0xc0, 0x00];
  let x = seed;
  for (let i = 0; i < 32; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    const n = scale[x % scale.length]!;
    notes.push(0x00, 0x90, n, 0x50, 0x83, 0x60, 0x80, n, 0x00);
  }
  notes.push(0x00, 0xff, 0x2f, 0x00);
  const chunk = (b: number[]) => [0x4d, 0x54, 0x72, 0x6b, (b.length >>> 24) & 0xff, (b.length >> 16) & 0xff, (b.length >> 8) & 0xff, b.length & 0xff, ...b];
  return new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 2, (ppq >> 8) & 0xff, ppq & 0xff, ...chunk(conductor), ...chunk(notes)]);
}

const blobToken = process.env.BLOB_MASTERS_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;

/** Stores a generated master where the app will look for it (private Blob or local disk). */
async function storeMaster(key: string, body: Uint8Array) {
  if (driver === "vercel-blob") {
    if (!blobToken) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
    await put(`masters/${key}`, Buffer.from(body), {
      access: "private", token: blobToken, contentType: "audio/midi", addRandomSuffix: false, allowOverwrite: false,
    });
    return;
  }
  if (driver !== "local") return;
  const p = path.resolve(".shop-storage", "masters", "masters", key);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, body);
  await writeFile(`${p}.type`, "audio/midi");
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SEED_NOTE = "Seed data for development.";
const CATALOG = [
  { title: "Gymnopédie No. 1", subtitle: "Slow and grave, for solo piano", work: "Gymnopédie No. 1", artist: "Erik Satie", year: 1888, era: "Late Romantic", arranger: "Ines Varela", price: 990, genres: ["Classical", "Impressionist"], bpm: 66, featured: true },
  { title: "Clair de Lune", subtitle: "From Suite bergamasque", work: "Suite bergamasque, III", artist: "Claude Debussy", year: 1905, era: "Impressionist", arranger: "Ines Varela", price: 1290, genres: ["Classical", "Impressionist"], bpm: 60, featured: true },
  { title: "The Entertainer", subtitle: "Ragtime two-step, full stride left hand", work: "The Entertainer", artist: "Scott Joplin", year: 1902, era: "Ragtime", arranger: "Teodor Lind", price: 890, genres: ["Ragtime"], bpm: 80, featured: true },
  { title: "Maple Leaf Rag", subtitle: "Concert tempo", work: "Maple Leaf Rag", artist: "Scott Joplin", year: 1899, era: "Ragtime", arranger: "Teodor Lind", price: 890, genres: ["Ragtime"], bpm: 92, featured: false },
  { title: "Nocturne in E-flat", subtitle: "Op. 9 No. 2", work: "Nocturne Op. 9 No. 2", artist: "Frédéric Chopin", year: 1832, era: "Romantic", arranger: "Lotte Brandt", price: 1190, genres: ["Classical", "Romantic"], bpm: 63, featured: true },
  { title: "Prelude in C", subtitle: "Well-Tempered Clavier, Book I", work: "Prelude in C major, BWV 846", artist: "Johann Sebastian Bach", year: 1722, era: "Baroque", arranger: "Lotte Brandt", price: 790, genres: ["Classical", "Baroque"], bpm: 72, featured: false },
  { title: "Für Elise", subtitle: "Bagatelle No. 25 in A minor", work: "Für Elise", artist: "Ludwig van Beethoven", year: 1810, era: "Classical", arranger: "Ines Varela", price: 790, genres: ["Classical"], bpm: 70, featured: false },
  { title: "Solace", subtitle: "A Mexican serenade", work: "Solace", artist: "Scott Joplin", year: 1909, era: "Ragtime", arranger: "Teodor Lind", price: 990, genres: ["Ragtime"], bpm: 68, featured: false },
];

/** `npm run shop:seed -- --remove`: deletes seed content (only if nobody bought it). */
async function removeSeed() {
  const arrangements = await db.arrangement.findMany({
    where: { description: { contains: SEED_NOTE } },
    include: { assets: { include: { versions: true } } },
  });
  const ids = arrangements.map((a) => a.id);
  const sold = await db.orderItemAllocation.count({ where: { arrangementId: { in: ids } } });
  const owned = await db.entitlement.count({ where: { arrangementId: { in: ids } } });
  if (sold || owned) throw new Error(`Seed arrangements have ${sold} order allocations / ${owned} entitlements; refusing to delete.`);
  const keys = arrangements.flatMap((a) => a.assets.flatMap((x) => x.versions.map((v) => v.storageKey)));
  await db.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { OR: [{ arrangementId: { in: ids } }, { bundle: { sku: { in: ["COL-RAG", "COL-QUIET"] } } }] } });
    await tx.bundle.deleteMany({ where: { sku: { in: ["COL-RAG", "COL-QUIET"] } } });
    const assetIds = arrangements.flatMap((a) => a.assets.map((x) => x.id));
    await tx.asset.updateMany({ where: { id: { in: assetIds } }, data: { activeVersionId: null } });
    await tx.assetVersion.deleteMany({ where: { assetId: { in: assetIds } } });
    await tx.asset.deleteMany({ where: { id: { in: assetIds } } });
    const workIds = arrangements.map((a) => a.workId);
    await tx.arrangement.deleteMany({ where: { id: { in: ids } } });
    await tx.work.deleteMany({ where: { id: { in: workIds }, arrangements: { none: {} } } });
    await tx.arranger.deleteMany({ where: { slug: { in: ["ines-varela", "teodor-lind", "lotte-brandt"] }, arrangements: { none: {} } } });
  });
  if (driver === "vercel-blob" && keys.length) await del(keys, { token: blobToken });
  console.log(`Removed ${ids.length} seed arrangements, 2 collections and ${keys.length} stored masters.`);
}

async function main() {
  if (process.argv.includes("--remove")) return removeSeed();
  const genres = new Map<string, string>();
  for (const name of [...new Set(CATALOG.flatMap((c) => c.genres))]) {
    const g = await db.genre.upsert({ where: { slug: slugify(name) }, create: { name, slug: slugify(name) }, update: {} });
    genres.set(name, g.id);
  }
  const generic = await db.systemProfile.upsert({
    where: { code: "GENERIC" }, create: { code: "GENERIC", name: "Any DMI-compatible player", isGeneric: true }, update: {},
  });
  await db.systemProfile.upsert({
    where: { code: "DMI-GRAND-88" }, create: { code: "DMI-GRAND-88", name: "DMI Grand, 88 keys", manufacturer: "DMI" }, update: {},
  });
  await db.protectionProfile.upsert({
    where: { name_version: { name: "dmi-device-binding", version: "v1" } },
    create: { name: "dmi-device-binding", version: "v1", secretRef: "env:DMI_ENCODER_PROFILE_V1" },
    update: {},
  });

  const arrangers = new Map<string, string>();
  for (const [name, rate] of [["Ines Varela", 3000], ["Teodor Lind", 2500], ["Lotte Brandt", 2750]] as const) {
    const a = await db.arranger.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name), defaultRoyaltyBasis: "PERCENT_OF_NET", defaultRoyaltyRateBps: rate },
      update: {},
    });
    arrangers.set(name, a.id);
  }

  const created: { id: string; genres: string[] }[] = [];
  for (const [i, c] of CATALOG.entries()) {
    const sku = `DMI-${String(i + 1).padStart(4, "0")}`;
    const existing = await db.arrangement.findUnique({ where: { sku } });
    if (existing) {
      created.push({ id: existing.id, genres: c.genres });
      continue;
    }
    const work = await db.work.create({ data: { title: c.work, originalArtist: c.artist, composer: c.artist, year: c.year, era: c.era } });
    const midi = generateMidi(i + 7, c.bpm);
    const key = `source-midi/2026/10/${randomUUID()}.mid`;
    await storeMaster(key, midi);
    const a = await db.arrangement.create({
      data: {
        sku, slug: slugify(`${c.title} ${sku}`), workId: work.id, arrangerId: arrangers.get(c.arranger)!,
        displayTitle: c.title, subtitle: c.subtitle, priceCents: c.price, status: "PUBLISHED", publishedAt: new Date(Date.now() - i * 86400000),
        featured: c.featured, tempoBpm: c.bpm, timeSignature: "4/4", durationSeconds: Math.round((32 * 60) / c.bpm), difficulty: 2 + (i % 3),
        containsMidi: true, rightsStatus: "PUBLIC_DOMAIN", rightsNotes: "Seed data: composition in the public domain; arrangement generated for testing.",
        description: `${c.title} arranged for self-playing piano by ${c.arranger}. ${SEED_NOTE}`,
        searchKeywords: [c.artist.split(" ").pop()!.toLowerCase(), c.era.toLowerCase()],
        genres: { connect: c.genres.map((g) => ({ id: genres.get(g)! })) },
        compatibilities: { create: [{ systemProfileId: generic.id }] },
      },
    });
    const asset = await db.asset.create({ data: { kind: "SOURCE_MIDI", arrangementId: a.id } });
    const v = await db.assetVersion.create({
      data: {
        assetId: asset.id, versionNumber: 1, originalFilename: `${sku}.mid`, storageProvider: driver,
        storageStore: "MASTERS", storageKey: `masters/${key}`, declaredMimeType: "audio/midi", mimeType: "audio/midi",
        declaredBytes: BigInt(midi.length), bytes: BigInt(midi.length), sha256: createHash("sha256").update(midi).digest("hex"),
        status: "VALID", validatedAt: new Date(),
      },
    });
    await db.asset.update({ where: { id: asset.id }, data: { activeVersionId: v.id } });
    created.push({ id: a.id, genres: c.genres });
  }

  const bundles = [
    { sku: "COL-RAG", title: "Ragtime Parlour", subtitle: "Four Joplin favourites in one collection", price: 2490, pick: (g: string[]) => g.includes("Ragtime") },
    { sku: "COL-QUIET", title: "Quiet Evening", subtitle: "Slow, lyrical pieces for the end of the day", price: 2990, pick: (g: string[]) => g.includes("Impressionist") || g.includes("Romantic") || g.includes("Baroque") },
  ];
  for (const b of bundles) {
    if (await db.bundle.findUnique({ where: { sku: b.sku } })) continue;
    const ids = created.filter((c) => b.pick(c.genres)).map((c) => c.id);
    await db.bundle.create({
      data: {
        sku: b.sku, slug: slugify(b.title), title: b.title, subtitle: b.subtitle, priceCents: b.price, status: "PUBLISHED",
        publishedAt: new Date(), featured: true,
        items: { create: ids.map((arrangementId, position) => ({ arrangementId, position })) },
      },
    });
  }

  const adminSub = process.env.SHOP_SEED_ADMIN_SUB;
  if (adminSub) {
    await db.staffAccount.upsert({
      where: { authSubject: adminSub },
      create: { authSubject: adminSub, role: "ADMIN", displayName: "Seed admin" },
      update: { role: "ADMIN", status: "ACTIVE" },
    });
  }
  console.log(`Seeded ${created.length} arrangements, ${bundles.length} collections${adminSub ? ", 1 admin" : ""}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
