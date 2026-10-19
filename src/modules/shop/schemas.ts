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
  /** targetPlayerId: the player this music is for; checked against the session, never trusted. */
  z.object({ type: z.literal("ARRANGEMENT"), arrangementId: uuid, targetPlayerId: uuid.nullable().optional() }),
  z.object({ type: z.literal("BUNDLE"), bundleId: uuid, targetPlayerId: uuid.nullable().optional() }),
  z.object({ type: z.literal("SOFTWARE_LICENSE"), softwareProductId: uuid }),
]);

export const cartRemoveSchema = z.object({ cartItemId: uuid });

export const cartTargetSchema = z.object({ cartItemId: uuid, playerId: uuid });

/** Remembered "Buying music for" player. Null forgets the choice. */
export const playerContextSchema = z.object({ playerId: uuid.nullable() });

export const playerRenameSchema = z.object({ friendlyName: z.string().trim().max(60).nullable() });

export const assignMusicSchema = z.object({ licenseIds: z.array(uuid).min(1).max(5000), playerId: uuid, reason: z.string().trim().max(500).optional() });

const country = z.string().trim().toUpperCase().length(2).regex(/^[A-Z]{2}$/);

export const billingAddressSchema = z.object({
  name: optionalText(160),
  companyName: optionalText(200),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: optionalText(200),
  postalCode: z.string().trim().min(1).max(20),
  city: z.string().trim().min(1).max(120),
  stateOrProvince: optionalText(120),
  countryCode: country,
});

/** Customer profile (individual or business) + billing address. Edited at /account/profile. */
export const profileSchema = z
  .object({
    accountType: z.enum(["INDIVIDUAL", "BUSINESS"]),
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    phone: z.string().trim().max(40).regex(/^[+0-9 ()./-]*$/, "digits, spaces and + ( ) - . / only").optional().nullable()
      .transform((v) => (v ? v : null)),
    companyName: optionalText(200),
    companyRegistrationNumber: optionalText(60),
    vatNumber: z.string().trim().max(20).regex(/^[A-Za-z0-9 .-]*$/).optional().nullable()
      .transform((v) => (v ? v.replace(/[\s.-]/g, "").toUpperCase() : null)),
    vatCountryCode: country.optional().nullable().or(z.literal("").transform(() => null)),
    preferredLanguage: z.enum(["en", "fr"]).optional().nullable(),
    marketingConsent: z.boolean(),
    billingAddress: billingAddressSchema,
  })
  .superRefine((v, ctx) => {
    if (v.accountType === "BUSINESS" && !v.companyName) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Company name is required for a business account" });
    }
  });

export const onboardingSchema = profileSchema.and(
  z.object({
    acceptTerms: z.literal(true),
    acceptPrivacy: z.literal(true),
    termsVersion: z.string().min(1).max(40),
    privacyVersion: z.string().min(1).max(40),
  }),
);

// ─── Support (customer side) ─────────────────────────────────────────────────

export const supportCategory = z.enum([
  "SOFTWARE_ACTIVATION", "SOFTWARE_PROBLEM",
  "PLAYER_REGISTRATION", "PLAYER_PROBLEM", "MUSIC_DOWNLOAD", "MUSIC_PLAYBACK", "ORDER_PAYMENT",
  "ARRANGEMENT_QUESTION", "ACCOUNT", "BILLING", "REFUND_REQUEST", "OTHER",
]);

export const newTicketSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  category: supportCategory,
  registeredPlayerId: uuid.optional().nullable(),
  orderId: uuid.optional().nullable(),
  arrangementId: uuid.optional().nullable(),
  softwareProductId: uuid.optional().nullable(),
  softwareLicenseId: uuid.optional().nullable(),
  softwareInstallationId: uuid.optional().nullable(),
  softwareActivationRequestId: uuid.optional().nullable(),
  message: z.string().trim().min(5).max(10_000),
});

export const ticketReplySchema = z.object({ message: z.string().trim().min(1).max(10_000) });

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
  /** Non-music lines (software licenses). Omit both arrays for a full refund. */
  orderItemIds: z.array(uuid).max(100).optional(),
  reason: z.string().trim().min(3).max(500),
});

export const grantSchema = z.object({
  arrangementId: uuid,
  /** The player to license it to; omitted = kept unassigned for the customer to place. */
  playerId: uuid.nullable().optional(),
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
  supportsMusicLibrary: z.boolean().optional(),
  softwareProductId: uuid.nullable().optional(),
  starterBundleId: uuid.nullable().optional(),
  systemProfileIds: z.array(uuid).max(100).optional(),
});

export const playerCreateSchema = z.object({
  playerTypeId: uuid,
  registrationCode,
  registrationIdentifier: z.string().trim().min(4).max(64).optional(),
  serialNumber: optionalText(80),
  adminLabel: optionalText(120),
  friendlyName: optionalText(60),
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
  /** Required only while the resale policy is ADMIN_DECIDES. */
  libraryPolicy: z.enum(["PLAYER_AND_LIBRARY", "PLAYER_ONLY"]).optional(),
  type: z.enum(["PLAYER_RESALE", "CUSTOMER_PLAYER_TRANSFER", "ADMIN_CORRECTION"]).optional(),
});

const staffReason = z.string().trim().min(3).max(500);

export const playerReplaceSchema = z.object({
  newPlayerId: uuid,
  type: z.enum(["HARDWARE_REPLACEMENT", "WARRANTY_REPLACEMENT", "COMPUTER_REPLACEMENT", "UPGRADE", "OTHER"]),
  reason: staffReason,
  notes: optionalText(2000),
});

export const libraryTransferSchema = z.object({
  toPlayerId: uuid,
  mode: z.enum(["MOVE", "COPY"]),
  type: z.enum(["HARDWARE_REPLACEMENT", "WARRANTY_REPLACEMENT", "COMPUTER_REPLACEMENT", "UPGRADE", "CUSTOMER_PLAYER_TRANSFER", "PLAYER_RESALE", "ADMIN_CORRECTION", "OTHER"]),
  reason: staffReason,
  notes: optionalText(2000),
  arrangementIds: z.array(uuid).max(10000).optional(),
});

export const musicGrantSchema = z.object({
  customerId: uuid,
  playerId: uuid.nullable(),
  arrangementIds: z.array(uuid).max(1000).optional(),
  bundleId: uuid.nullable().optional(),
  source: z.enum(["ADMIN_GRANT", "PROMOTION", "CUSTOMER_SERVICE", "LEGACY_IMPORT"]),
  reason: staffReason,
  reference: z.string().trim().max(200).optional(),
}).refine((v) => (v.arrangementIds?.length ?? 0) > 0 || !!v.bundleId, "Choose arrangements or a collection");

export const musicRevokeSchema = z.object({ reason: staffReason });

export const musicMigrationRunSchema = z.object({ dryRun: z.boolean().default(true), customerId: uuid.optional() });

export const musicPolicySchema = z.object({
  additionalPlayer: z.object({
    strategy: z.enum(["NO_DISCOUNT", "ADDITIONAL_PERCENTAGE", "ADDITIONAL_FIXED_PRICE"]),
    percentageBps: z.number().int().min(0).max(10000),
    fixedPriceCents: z.number().int().min(0).max(1_000_000),
  }),
  allowAssignLater: z.boolean(),
  requireActiveSoftwareLicenseForMusic: z.boolean(),
  resalePolicy: z.enum(["PLAYER_AND_LIBRARY", "PLAYER_ONLY", "ADMIN_DECIDES"]),
  replacementPolicy: z.enum(["FREE_ADMIN_APPROVED", "PAID_TRANSFER", "MANUAL_DECISION"]),
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

// ─── CRM (admin) ─────────────────────────────────────────────────────────────

export const crmCustomerSchema = z.object({
  crmStatus: z.enum(["PROSPECT", "CUSTOMER", "ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  customerSource: z.enum(["WEBSITE", "DIRECT_SALE", "DEALER", "REFERRAL", "TRADE_SHOW", "LEGACY_IMPORT", "OTHER"]).nullable().optional(),
  profile: profileSchema.optional(),
});

export const customerTagSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: optionalText(300),
  isAlert: z.boolean().default(false),
});

export const setCustomerTagsSchema = z.object({ tagIds: z.array(uuid).max(50) });

export const noteSchema = z.object({ body: z.string().trim().min(1).max(10_000) });

export const taskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalText(5000),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]).default("OPEN"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  assignedStaffId: uuid.nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  registeredPlayerId: uuid.nullable().optional(),
  supportTicketId: uuid.nullable().optional(),
});

/** No defaults here: a PATCH must only touch the fields it sends. */
export const taskPatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assignedStaffId: uuid.nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  registeredPlayerId: uuid.nullable().optional(),
  supportTicketId: uuid.nullable().optional(),
}).transform((v) => Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined)) as Partial<typeof v>);

export const communicationSchema = z.object({
  type: z.enum(["PHONE_CALL", "EMAIL", "WHATSAPP", "IN_PERSON", "OTHER"]),
  direction: z.enum(["INBOUND", "OUTBOUND"]).default("OUTBOUND"),
  subject: optionalText(200),
  body: z.string().trim().min(1).max(10_000),
  occurredAt: z.coerce.date().optional(),
});

// ─── Support (staff side) ────────────────────────────────────────────────────

export const staffTicketMessageSchema = z.object({
  message: z.string().trim().min(1).max(10_000),
  visibility: z.enum(["PUBLIC", "INTERNAL"]),
  /** For a public reply: what the ticket should become afterwards. */
  nextStatus: z.enum(["IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED"]).optional(),
});

export const ticketPatchSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_SUPPORT", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  category: supportCategory.optional(),
  assignedStaffId: uuid.nullable().optional(),
});

// ─── Staff invitations ───────────────────────────────────────────────────────

export const staffInviteSchema = z.object({
  email: z.email().transform((e) => e.trim().toLowerCase()),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SUPPORT", "CATALOG_MANAGER", "FINANCE"]),
});

// ─── Software (Phase 3) ──────────────────────────────────────────────────────

export const softwareProductSchema = z.object({
  slug,
  name: z.string().trim().min(1).max(120),
  shortDescription: optionalText(300),
  description: optionalText(20_000),
  systemRequirements: optionalText(500),
  activationInstructions: optionalText(2000),
  trialAvailable: z.boolean(),
  licenseRequiredForFullUse: z.boolean(),
  defaultLicensePriceCents: cents.nullable(),
  currency,
  defaultMaxActivations: z.number().int().min(1).max(50),
  sortOrder: z.number().int().min(-1000).max(1000).default(0),
});

export const softwareProductStatusSchema = z.object({ status: z.enum(["DRAFT", "ACTIVE", "DISCONTINUED", "ARCHIVED"]) });

const version = z.string().trim().min(1).max(40).regex(/^[0-9A-Za-z][0-9A-Za-z.+_-]*$/, "e.g. 4.2.1");
export const softwarePlatform = z.enum(["WINDOWS", "MACOS", "LINUX"]);
export const softwareArchitecture = z.enum(["X64", "X86", "ARM64", "UNIVERSAL"]);
export const softwareChannel = z.enum(["STABLE", "BETA", "LEGACY"]);

export const releasePresignSchema = z.object({
  version,
  platform: softwarePlatform.default("WINDOWS"),
  architecture: softwareArchitecture.default("X64"),
  releaseChannel: softwareChannel.default("STABLE"),
  releaseNotes: optionalText(20_000),
  minimumOsVersion: optionalText(80),
  filename: z.string().trim().min(1).max(255),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/i).optional().nullable(),
});

export const releasePatchSchema = z.object({
  releaseNotes: z.string().trim().max(20_000).nullable().optional(),
  minimumOsVersion: z.string().trim().max(80).nullable().optional(),
  isDownloadable: z.boolean().optional(),
});

export const releaseActionSchema = z.object({ action: z.enum(["publish", "mark_current", "archive"]) });

export const adminLicenseSchema = z.object({
  customerId: uuid,
  softwareProductId: uuid,
  licenseSource: z.enum(["ADMIN", "LEGACY_IMPORT", "PROMOTION"]),
  maxActivations: z.number().int().min(1).max(50).optional(),
  notes: optionalText(2000),
  sourceReference: optionalText(200),
  /** Legacy customers: record their existing activated installation as well. */
  installation: z.object({
    registrationCode: z.string().trim().min(4).max(80),
    registrationIdentifier: z.string().trim().min(4).max(80).optional().nullable(),
    activationKey: z.string().trim().min(1).max(500).optional().nullable(),
    label: optionalText(120),
  }).optional().nullable(),
});

export const licenseStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]),
  reason: z.string().trim().min(3).max(500),
});

export const licensePatchSchema = z.object({
  maxActivations: z.number().int().min(1).max(50).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const activationSubmitSchema = z.object({
  registrationCode: z.string().trim().min(4).max(80),
  message: optionalText(2000),
  /** "I replaced my computer": the customer's own installation this one replaces. */
  replacesInstallationId: uuid.optional().nullable(),
});

export const activationRespondSchema = z.object({
  registrationCode: z.string().trim().min(4).max(80).optional(),
  message: z.string().trim().min(1).max(2000),
});

export const activationStaffSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start_review") }),
  z.object({ action: z.literal("assign"), assignedStaffId: uuid.nullable() }),
  z.object({ action: z.literal("request_info"), message: z.string().trim().min(3).max(2000) }),
  z.object({ action: z.literal("update_code"), registrationCode: z.string().trim().min(4).max(80), reason: z.string().trim().min(3).max(300) }),
  z.object({ action: z.literal("note"), adminNotes: z.string().trim().max(5000) }),
  z.object({
    action: z.literal("approve"),
    activationKey: z.string().trim().min(1).max(500),
    registrationIdentifier: z.string().trim().min(4).max(80).optional().nullable(),
    label: optionalText(120),
    registeredPlayerId: uuid.optional().nullable(),
    /** Required when the code is active on another customer's installation (privileged). */
    resolveConflict: z.literal("RETIRE_EXISTING").optional(),
  }),
  z.object({ action: z.literal("reject"), reason: z.string().trim().min(3).max(1000) }),
]);

export const installationActionSchema = z.object({
  action: z.enum(["retire", "suspend", "reactivate"]),
  reason: z.string().trim().min(3).max(500),
});
