import { z } from "zod";

/** Zod schemas for every shop mutation. Route handlers parse with these before any work. */

const uuid = z.uuid();
const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase letters, digits and dashes only");
const sku = z.string().trim().min(1).max(64).regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "letters, digits, dot, dash, underscore");
const cents = z.number().int().min(0).max(100_000_00);
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));
const currency = z.literal("EUR");
const bps = z.number().int().min(0).max(10_000);
const royaltyBasis = z.enum(["PERCENT_OF_NET", "FIXED_PER_UNIT", "NONE"]);

export const assetKind = z.enum([
  "SOURCE_MIDI", "SOURCE_DMI", "SOURCE_AUDIO", "SOURCE_VIDEO", "PREVIEW_AUDIO", "PREVIEW_VIDEO", "COVER_IMAGE", "DOCUMENT",
]);

// ─── Storefront ───────────────────────────────────────────────────────────────

export const cartAddSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ARRANGEMENT"), arrangementId: uuid }),
  z.object({ type: z.literal("BUNDLE"), bundleId: uuid }),
]);

export const cartRemoveSchema = z.object({ cartItemId: uuid });

export const onboardingSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  countryCode: z.string().trim().length(2).regex(/^[A-Z]{2}$/),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  termsVersion: z.string().min(1).max(40),
  privacyVersion: z.string().min(1).max(40),
});

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  genre: z.string().max(120).optional(),
  arranger: z.string().max(120).optional(),
  work: uuid.optional(),
  compatibility: z.string().max(64).optional(),
  minPrice: z.coerce.number().min(0).max(100000).optional(),
  maxPrice: z.coerce.number().min(0).max(100000).optional(),
  era: z.string().max(60).optional(),
  yearFrom: z.coerce.number().int().min(1000).max(3000).optional(),
  yearTo: z.coerce.number().int().min(1000).max(3000).optional(),
  midi: z.enum(["1"]).optional(),
  audio: z.enum(["1"]).optional(),
  video: z.enum(["1"]).optional(),
  sort: z.enum(["featured", "newest", "price_asc", "price_desc", "title"]).optional(),
  page: z.coerce.number().int().min(1).max(10_000).optional(),
});

// ─── Admin catalog ────────────────────────────────────────────────────────────

export const workSchema = z.object({
  title: z.string().trim().min(1).max(200),
  originalArtist: optionalText(200),
  composer: optionalText(200),
  year: z.number().int().min(1000).max(3000).optional().nullable(),
  era: optionalText(60),
  notes: optionalText(4000),
});

export const arrangerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug,
  bio: optionalText(4000),
  contactEmail: z.email().optional().nullable().or(z.literal("").transform(() => null)),
  defaultRoyaltyBasis: royaltyBasis,
  defaultRoyaltyRateBps: bps,
  defaultRoyaltyFixedCents: cents.optional().nullable(),
  active: z.boolean(),
});

export const systemProfileSchema = z.object({
  code: z.string().trim().min(1).max(64).regex(/^[A-Z0-9_-]+$/, "UPPERCASE letters, digits, _ and -"),
  name: z.string().trim().min(1).max(200),
  manufacturer: optionalText(200),
  description: optionalText(2000),
  isGeneric: z.boolean(),
  active: z.boolean(),
});

export const taxonomySchema = z.object({ name: z.string().trim().min(1).max(80), slug });

export const arrangementSchema = z.object({
  sku,
  slug,
  workId: uuid,
  arrangerId: uuid,
  displayTitle: z.string().trim().min(1).max(200),
  subtitle: optionalText(200),
  description: optionalText(10_000),
  currency,
  priceCents: cents,
  durationSeconds: z.number().int().min(0).max(24 * 3600).optional().nullable(),
  tempoBpm: z.number().int().min(1).max(400).optional().nullable(),
  musicalKey: optionalText(40),
  timeSignature: optionalText(20),
  difficulty: z.number().int().min(1).max(5).optional().nullable(),
  releaseDate: z.coerce.date().optional().nullable(),
  featured: z.boolean(),
  searchKeywords: z.array(z.string().trim().min(1).max(60)).max(50),
  compatibilityNotes: optionalText(2000),
  containsMidi: z.boolean(),
  containsAudio: z.boolean(),
  containsVideo: z.boolean(),
  dmiFormatVersion: optionalText(40),
  internalNotes: optionalText(10_000),
  royaltyBasis: royaltyBasis.optional().nullable(),
  royaltyRateBps: bps.optional().nullable(),
  royaltyFixedCents: cents.optional().nullable(),
  genreIds: z.array(uuid).max(20),
  tagIds: z.array(uuid).max(50),
  compatibility: z.array(z.object({ systemProfileId: uuid, notes: optionalText(500) })).max(50),
  rightsStatus: z.enum(["NOT_REVIEWED", "PENDING_REVIEW", "CLEARED", "PUBLIC_DOMAIN", "RESTRICTED", "REJECTED"]),
  rightsTerritory: optionalText(200),
  licenseReference: optionalText(200),
  licenseStartsAt: z.coerce.date().optional().nullable(),
  licenseEndsAt: z.coerce.date().optional().nullable(),
  rightsNotes: optionalText(4000),
});

export const bundleSchema = z.object({
  sku,
  slug,
  title: z.string().trim().min(1).max(200),
  subtitle: optionalText(200),
  description: optionalText(10_000),
  currency,
  priceCents: cents,
  featured: z.boolean(),
  arrangementIds: z.array(uuid).max(500).refine((ids) => new Set(ids).size === ids.length, "Duplicate arrangements"),
});

export const statusChangeSchema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]) });

// ─── Assets / uploads ────────────────────────────────────────────────────────

const sha256 = z.string().regex(/^[0-9a-f]{64}$/i).optional().nullable();

export const presignAssetSchema = z.object({
  kind: assetKind,
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().max(120).optional(),
  bytes: z.number().int().positive(),
  sha256,
  label: optionalText(120),
});

// ─── Orders / customers ──────────────────────────────────────────────────────

export const refundSchema = z.object({
  allocationIds: z.array(uuid).max(500).optional(),
  reason: z.string().trim().min(3).max(500),
});

export const grantSchema = z.object({
  arrangementId: uuid,
  reason: z.string().trim().min(3).max(500),
  sourceType: z.enum(["ADMIN_GRANT", "PROMOTION", "LEGACY_IMPORT"]).default("ADMIN_GRANT"),
  reference: z.string().trim().max(200).optional(),
});

export const revokeSourceSchema = z.object({
  sourceId: uuid,
  reason: z.string().trim().min(3).max(500),
});

// ─── Staff administration ─────────────────────────────────────────────────────

const staffRole = z.enum(["SUPER_ADMIN", "ADMIN", "SUPPORT", "CATALOG_MANAGER", "FINANCE"]);

/**
 * Promotion takes the Auth0 subject, never a typed-in e-mail: the subject is the only
 * stable identity, and an address can be re-used by a different person later.
 */
export const staffPromoteSchema = z.object({
  authSubject: z.string().trim().min(3).max(255),
  role: staffRole,
  displayName: optionalText(120),
});

export const staffRoleSchema = z.object({ role: staffRole });

export const staffStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]),
  reason: optionalText(500),
});

// ─── Registered players ───────────────────────────────────────────────────────

const playerStatus = z.enum(["PENDING", "ACTIVE", "SUSPENDED", "RETIRED"]);
/** Codes are read aloud and retyped, so spacing and case are not part of the value. */
const registrationCode = z.string().trim().min(4).max(64);
const isoDate = z.iso.date().transform((v) => new Date(`${v}T00:00:00.000Z`));

export const playerTypeCreateSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9 _-]+$/, "letters, digits, space, dash, underscore"),
  name: z.string().trim().min(2).max(120),
  description: optionalText(500),
});

export const playerTypeUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: optionalText(500),
  active: z.boolean().optional(),
});

export const playerCreateSchema = z.object({
  playerTypeId: uuid,
  registrationCode,
  registrationIdentifier: z.string().trim().min(4).max(64).optional(),
  serialNumber: optionalText(80),
  adminLabel: optionalText(120),
  dealerName: optionalText(120),
  purchaseDate: isoDate.optional(),
  warrantyUntil: isoDate.optional(),
  status: playerStatus.optional(),
  /** Only ever sent by staff with players:activation-key; stored encrypted, never logged. */
  activationKey: z.string().trim().min(4).max(128).optional(),
});

export const playerUpdateSchema = playerCreateSchema.partial().extend({
  /** Explicit null clears the stored key; omitting the field leaves it alone. */
  activationKey: z.string().trim().min(4).max(128).nullable().optional(),
});

export const playerTransferSchema = z.object({
  toCustomerId: uuid,
  reason: z.string().trim().min(3).max(500),
});

// ─── Bulk import ─────────────────────────────────────────────────────────────

export const importCreateSchema = z.object({
  label: z.string().trim().max(120).optional(),
  manifestFilename: z.string().trim().max(255).optional(),
  /** Raw CSV text (≤ 5 MB enforced by the route). */
  manifestCsv: z.string().max(5 * 1024 * 1024).optional(),
});

export const importFileSchema = z.object({
  clientId: z.string().min(1).max(100),
  filename: z.string().trim().min(1).max(255),
  relativePath: z.string().trim().max(1024).optional().nullable(),
  // 0 is accepted here so the plan can reject empty files per item (EMPTY_FILE).
  bytes: z.number().int().min(0),
  contentType: z.string().max(120).optional(),
  sha256,
});

export const importDryRunSchema = z.object({
  // May be empty: a CSV-only batch creates DRAFT arrangements without files.
  files: z.array(importFileSchema).max(5000),
});

export const importPresignSchema = z.object({ itemIds: z.array(uuid).min(1).max(50) });

export const importItemPatchSchema = z.object({
  action: z.enum(["remap", "skip", "unskip", "retry"]),
  targetSku: z.string().trim().max(64).optional().nullable(),
  assetKind: assetKind.optional(),
});
