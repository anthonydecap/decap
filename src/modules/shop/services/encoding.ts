import "server-only";
import { createHash } from "node:crypto";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import { storage } from "../storage";
import { generateObjectKey } from "../storage/keys";
import { audit } from "./audit";

/**
 * Device-bound DMI delivery pipeline (model + job runner). The player API that will call
 * this is deliberately NOT implemented yet.
 *
 *   canonical SOURCE_DMI / SOURCE_MIDI AssetVersion
 *     + ACTIVE MusicLicense for exactly this arrangement on exactly this ACTIVE player of the
 *       customer (an account-level Entitlement alone never authorizes delivery)
 *     + the player's registration identifier as the device binding
 *     + encoder version + protection profile
 *         → trusted encoder worker → private DeliveryArtifact (DELIVERIES store)
 *
 * The proprietary encoder (legacy EXE) sits behind `EncoderAdapter`; it runs server/worker
 * side only. Secrets are referenced by `ProtectionProfile.secretRef` and resolved by the
 * adapter from a secret manager — never stored in the database or passed to the browser.
 * Customer id / order id / Auth0 sub are never used as key material.
 */

export interface EncoderAdapter {
  readonly encoderVersion: string;
  /**
   * Produces the protected, device-bound output. Implementations must use an ephemeral
   * workspace and remove temporary files on success *and* failure.
   */
  encode(input: {
    source: Uint8Array;
    sourceKind: "SOURCE_DMI" | "SOURCE_MIDI";
    deviceBinding: string;
    protectionProfile: { name: string; version: string; secretRef: string };
  }): Promise<Uint8Array>;
}

export class EncoderError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

const sanitize = (msg: string) =>
  msg.replace(/[A-Za-z]:\\[^\s]+|\/[^\s]+/g, "[path]").replace(/(key|secret|token)=\S+/gi, "$1=[redacted]").slice(0, 300);

/**
 * Delivery authorization (phase 4). Every check is server-side and every one must pass:
 * player belongs to the customer, player is ACTIVE and music-capable, and an ACTIVE
 * MusicLicense exists for this arrangement on this player. Returns the license and the
 * device binding to use.
 */
export async function authorizeDelivery(input: { customerId: string; playerId: string; arrangementId: string }) {
  const db = shopDb();
  const player = await db.registeredPlayer.findFirst({
    where: { id: input.playerId, customerId: input.customerId },
    select: { id: true, status: true, registrationIdentifier: true, playerType: { select: { supportsMusicLibrary: true } } },
  });
  if (!player) throw new ShopError("FORBIDDEN", "Player not found for this customer");
  if (player.status !== "ACTIVE" || !player.playerType.supportsMusicLibrary) throw new ShopError("FORBIDDEN", "Player is not active");
  const license = await db.musicLicense.findFirst({
    where: { licensedPlayerId: player.id, arrangementId: input.arrangementId, customerId: input.customerId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!license) throw new ShopError("FORBIDDEN", "This arrangement is not licensed for this player");
  return { musicLicenseId: license.id, playerId: player.id, deviceRegistrationRef: player.registrationIdentifier };
}

export async function enqueueEncodingJob(input: {
  customerId: string;
  playerId: string;
  arrangementId: string;
  encoderVersion: string;
  protectionProfileVersion: string;
}) {
  const db = shopDb();
  const auth = await authorizeDelivery(input);
  const source = await selectSourceVersion(input.arrangementId);

  // Reuse an artifact only for the same (source version, player + binding, encoder, profile):
  // a device-bound artifact is never served to another player.
  const cached = await db.deliveryArtifact.findFirst({
    where: {
      customerId: input.customerId,
      arrangementId: input.arrangementId,
      sourceAssetVersionId: source.id,
      registeredPlayerId: auth.playerId,
      deviceRegistrationRef: auth.deviceRegistrationRef,
      encoderVersion: input.encoderVersion,
      protectionProfileVersion: input.protectionProfileVersion,
    },
    orderBy: { createdAt: "desc" },
  });
  if (cached) return { job: null, artifact: cached };

  const job = await db.encodingJob.create({
    data: {
      arrangementId: input.arrangementId,
      sourceAssetVersionId: source.id,
      customerId: input.customerId,
      registeredPlayerId: auth.playerId,
      musicLicenseId: auth.musicLicenseId,
      deviceRegistrationRef: auth.deviceRegistrationRef,
      encoderVersion: input.encoderVersion,
      protectionProfileVersion: input.protectionProfileVersion,
    },
  });
  return { job, artifact: null };
}

/** Prefers an active VALID SOURCE_DMI master, falls back to SOURCE_MIDI. */
export async function selectSourceVersion(arrangementId: string) {
  const assets = await shopDb().asset.findMany({
    where: { arrangementId, kind: { in: ["SOURCE_DMI", "SOURCE_MIDI"] } },
    include: { activeVersion: true },
  });
  const pick = (k: string) => assets.find((a) => a.kind === k && a.activeVersion?.status === "VALID")?.activeVersion;
  const v = pick("SOURCE_DMI") ?? pick("SOURCE_MIDI");
  if (!v) throw new ShopError("UNAVAILABLE", "No valid playable master for this arrangement");
  return v;
}

/** Runs one job. Safe to call again for FAILED jobs (retry); a SUCCEEDED job is a no-op. */
export async function runEncodingJob(jobId: string, adapter: EncoderAdapter) {
  const db = shopDb();
  const claimed = await db.encodingJob.updateMany({
    where: { id: jobId, status: { in: ["QUEUED", "FAILED"] } },
    data: { status: "RUNNING", startedAt: new Date(), attemptCount: { increment: 1 }, errorCode: null, errorMessage: null },
  });
  if (claimed.count === 0) return db.encodingJob.findUniqueOrThrow({ where: { id: jobId } });

  const job = await db.encodingJob.findUniqueOrThrow({
    where: { id: jobId },
    include: { sourceAssetVersion: { include: { asset: true } } },
  });
  try {
    if (job.encoderVersion !== adapter.encoderVersion) {
      throw new EncoderError("ENCODER_VERSION_MISMATCH", "Worker encoder version differs from the job");
    }
    const profile = await db.protectionProfile.findFirst({
      where: { version: job.protectionProfileVersion, active: true },
    });
    if (!profile) throw new EncoderError("PROFILE_NOT_FOUND", "Protection profile is not active");
    if (!job.deviceRegistrationRef) throw new EncoderError("DEVICE_MISSING", "Job has no device registration");

    const src = job.sourceAssetVersion;
    if (src.storageStore !== "MASTERS" || src.status !== "VALID") {
      throw new EncoderError("SOURCE_INVALID", "Source must be a VALID master");
    }
    // Trusted back-end read of the master. Never exposed outside this process.
    const stream = await storage().openRead({ store: "MASTERS", key: src.storageKey });
    const source = new Uint8Array(await new Response(stream).arrayBuffer());

    const output = await adapter.encode({
      source,
      sourceKind: src.asset.kind as "SOURCE_DMI" | "SOURCE_MIDI",
      deviceBinding: job.deviceRegistrationRef,
      protectionProfile: { name: profile.name, version: profile.version, secretRef: profile.secretRef },
    });
    if (!output.length) throw new EncoderError("EMPTY_OUTPUT", "Encoder produced no output");

    const sha256 = createHash("sha256").update(output).digest("hex");
    const key = generateObjectKey("DELIVERIES", "dmi", "dmi");
    await storage().write({ store: "DELIVERIES", key }, output, "application/octet-stream");
    const head = await storage().head({ store: "DELIVERIES", key });
    if (!head || head.bytes !== output.length) throw new EncoderError("UPLOAD_VERIFY_FAILED", "Delivery upload could not be verified");

    return await db.$transaction(async (tx) => {
      const artifact = await tx.deliveryArtifact.create({
        data: {
          arrangementId: job.arrangementId,
          sourceAssetVersionId: job.sourceAssetVersionId,
          customerId: job.customerId,
          registeredPlayerId: job.registeredPlayerId,
          musicLicenseId: job.musicLicenseId,
          deviceRegistrationRef: job.deviceRegistrationRef,
          encoderVersion: job.encoderVersion,
          protectionProfileVersion: job.protectionProfileVersion,
          storageProvider: storage().provider,
          outputObjectKey: key,
          bytes: BigInt(output.length),
          sha256,
        },
      });
      const done = await tx.encodingJob.update({
        where: { id: job.id },
        data: { status: "SUCCEEDED", finishedAt: new Date(), deliveryArtifactId: artifact.id },
      });
      await audit({ type: "SYSTEM" }, "encoding.succeeded", { type: "EncodingJob", id: job.id }, {
        artifactId: artifact.id, encoderVersion: job.encoderVersion,
      }, tx);
      return done;
    });
  } catch (e) {
    const code = e instanceof EncoderError ? e.code : "ENCODER_FAILED";
    const message = sanitize(e instanceof Error ? e.message : "Encoder failed");
    await audit({ type: "SYSTEM" }, "encoding.failed", { type: "EncodingJob", id: job.id }, { code });
    return db.encodingJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), errorCode: code, errorMessage: message },
    });
  }
}
