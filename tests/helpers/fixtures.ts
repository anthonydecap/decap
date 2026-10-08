import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { shopDb } from "@/modules/shop/db";
import { setSessionResolverForTests } from "@/modules/shop/auth/session";
import type { SessionUser } from "@/modules/shop/auth/auth0";
import { setStorageForTests } from "@/modules/shop/storage";
import { MemoryStorageService } from "@/modules/shop/storage/memory";
import { setStripeForTests, type StripeLike } from "@/modules/shop/services/stripe";
import { shopConfig } from "@/modules/shop/config";
import { buildMidi } from "./midi";

/** Wipes every shop table. Only ever pointed at the *_test database (see global setup). */
export async function resetDb() {
  const db = shopDb();
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length) {
    await db.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`);
  }
}

export function useMemoryStorage() {
  const s = new MemoryStorageService();
  setStorageForTests(s);
  return s;
}

let currentUser: SessionUser | null = null;
export function signInAs(user: SessionUser | null) {
  currentUser = user;
  setSessionResolverForTests(async () => currentUser);
}

export async function makeCustomer(opts: { verified?: boolean; onboarded?: boolean; email?: string } = {}) {
  const sub = `auth0|${randomUUID()}`;
  const email = opts.email ?? `${sub.slice(6, 14)}@example.test`;
  const customer = await shopDb().customer.create({
    data: {
      authSubject: sub,
      email,
      emailVerified: opts.verified ?? true,
      firstName: "Maren",
      lastName: "Holtz",
      countryCode: "BE",
      onboardingCompletedAt: opts.onboarded === false ? null : new Date(),
    },
  });
  if (opts.onboarded !== false) {
    const v = shopConfig.legalVersions;
    await shopDb().legalAcceptance.createMany({
      data: [
        { customerId: customer.id, documentType: "TERMS", documentVersion: v.TERMS, source: "test" },
        { customerId: customer.id, documentType: "PRIVACY", documentVersion: v.PRIVACY, source: "test" },
      ],
    });
  }
  const session: SessionUser = { sub, email, email_verified: opts.verified ?? true };
  return { customer, session };
}

export async function makeStaff(role: "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "CATALOG_MANAGER" | "FINANCE" = "ADMIN") {
  const sub = `auth0|staff-${randomUUID()}`;
  const staff = await shopDb().staffAccount.create({ data: { authSubject: sub, role, email: `${role.toLowerCase()}@dmi.test` } });
  return { staff, session: { sub, email: staff.email!, email_verified: true, amr: ["mfa"] } as SessionUser };
}

let skuCounter = 0;

/** A fully publishable arrangement: work, arranger, compatibility, VALID MIDI master + preview. */
export async function makeArrangement(opts: {
  priceCents: number;
  title?: string;
  status?: "DRAFT" | "PUBLISHED";
  arrangerId?: string;
  royaltyRateBps?: number;
  storage?: MemoryStorageService;
}) {
  const db = shopDb();
  skuCounter++;
  const sku = `T-${String(skuCounter).padStart(4, "0")}-${randomUUID().slice(0, 4)}`;
  const arranger = opts.arrangerId
    ? await db.arranger.findUniqueOrThrow({ where: { id: opts.arrangerId } })
    : await db.arranger.create({
        data: { name: `Arranger ${sku}`, slug: `arr-${sku.toLowerCase()}`, defaultRoyaltyBasis: "PERCENT_OF_NET", defaultRoyaltyRateBps: opts.royaltyRateBps ?? 2500 },
      });
  const work = await db.work.create({ data: { title: opts.title ?? `Work ${sku}`, originalArtist: "Erik Satie", year: 1888 } });
  // Atomic under concurrent fixture creation (Prisma upsert is not).
  await db.$executeRaw`INSERT INTO "SystemProfile" ("id","code","name","isGeneric","active","createdAt","updatedAt")
    VALUES (gen_random_uuid(), 'GENERIC', 'Any DMI player', true, true, now(), now()) ON CONFLICT ("code") DO NOTHING`;
  const profile = await db.systemProfile.findUniqueOrThrow({ where: { code: "GENERIC" } });

  const arrangement = await db.arrangement.create({
    data: {
      sku,
      slug: sku.toLowerCase(),
      workId: work.id,
      arrangerId: arranger.id,
      displayTitle: opts.title ?? `Arrangement ${sku}`,
      priceCents: opts.priceCents,
      rightsStatus: "CLEARED",
      status: opts.status ?? "PUBLISHED",
      publishedAt: opts.status === "DRAFT" ? null : new Date(),
      compatibilities: { create: [{ systemProfileId: profile.id }] },
    },
  });

  // Masters + preview as VALID active versions (content goes into memory storage if provided).
  for (const [kind, store, ext] of [
    ["SOURCE_MIDI", "MASTERS", "mid"],
    ["PREVIEW_AUDIO", "PREVIEWS", "mp3"],
  ] as const) {
    const key = `${store.toLowerCase()}/${kind.toLowerCase().replace("_", "-")}/2026/10/${randomUUID()}.${ext}`;
    const body = kind === "SOURCE_MIDI" ? buildMidi() : new Uint8Array([0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 0]);
    await opts.storage?.write({ store, key }, body, kind === "SOURCE_MIDI" ? "audio/midi" : "audio/mpeg");
    const asset = await db.asset.create({ data: { kind, arrangementId: arrangement.id } });
    const version = await db.assetVersion.create({
      data: {
        assetId: asset.id, versionNumber: 1, originalFilename: `secret-master-${sku}.${ext}`,
        storageProvider: "memory", storageStore: store, storageKey: key,
        declaredMimeType: kind === "SOURCE_MIDI" ? "audio/midi" : "audio/mpeg", declaredBytes: BigInt(body.length),
        bytes: BigInt(body.length), sha256: "a".repeat(64), status: "VALID",
      },
    });
    await db.asset.update({ where: { id: asset.id }, data: { activeVersionId: version.id } });
  }
  return { arrangement, arranger, work };
}

export async function makeBundle(opts: { priceCents: number; arrangementIds: string[]; status?: "DRAFT" | "PUBLISHED" }) {
  skuCounter++;
  const sku = `B-${skuCounter}-${randomUUID().slice(0, 4)}`;
  return shopDb().bundle.create({
    data: {
      sku,
      slug: sku.toLowerCase(),
      title: `Collection ${sku}`,
      priceCents: opts.priceCents,
      status: opts.status ?? "PUBLISHED",
      publishedAt: new Date(),
      items: { create: opts.arrangementIds.map((arrangementId, position) => ({ arrangementId, position })) },
    },
  });
}

/** In-process Stripe double. Records calls; intents succeed when the test says so. */
export function fakeStripe() {
  const intents = new Map<string, { id: string; amount: number; currency: string; status: string; client_secret: string; metadata: Record<string, string> }>();
  const calls: { method: string; args: unknown[] }[] = [];
  let seq = 0;
  const realWebhooks = new Stripe("sk_test_dummy_for_tests").webhooks;
  const s: StripeLike = {
    paymentIntents: {
      create: (async (params: { amount: number; currency: string; metadata: Record<string, string> }, opts?: { idempotencyKey?: string }) => {
        calls.push({ method: "paymentIntents.create", args: [params, opts] });
        const id = `pi_test_${++seq}`;
        const pi = { id, amount: params.amount, currency: params.currency, status: "requires_payment_method", client_secret: `${id}_secret_x`, metadata: params.metadata };
        intents.set(id, pi);
        return pi;
      }) as never,
      retrieve: (async (id: string) => {
        calls.push({ method: "paymentIntents.retrieve", args: [id] });
        const pi = intents.get(id);
        if (!pi) throw new Error("No such payment_intent");
        return pi;
      }) as never,
      cancel: (async (id: string) => {
        calls.push({ method: "paymentIntents.cancel", args: [id] });
        const pi = intents.get(id);
        if (pi) pi.status = "canceled";
        return pi;
      }) as never,
    },
    refunds: {
      create: (async (params: { payment_intent: string; amount: number; metadata: Record<string, string> }) => {
        calls.push({ method: "refunds.create", args: [params] });
        return { id: `re_test_${++seq}`, status: "succeeded", amount: params.amount, metadata: params.metadata };
      }) as never,
    },
    customers: {
      create: (async () => {
        calls.push({ method: "customers.create", args: [] });
        return { id: `cus_test_${++seq}` };
      }) as never,
    },
    webhooks: realWebhooks,
  };
  setStripeForTests(s);
  return { stripe: s, intents, calls };
}

/** A payment_intent.succeeded event body for the given intent. */
export function succeededEvent(pi: { id: string; amount: number; currency: string; metadata: Record<string, string> }, eventId = `evt_${randomUUID()}`) {
  return {
    id: eventId,
    object: "event",
    type: "payment_intent.succeeded",
    livemode: false,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: pi.id, object: "payment_intent", amount: pi.amount, amount_received: pi.amount,
        currency: pi.currency, status: "succeeded", metadata: pi.metadata, latest_charge: `ch_${pi.id}`,
      },
    },
  };
}
