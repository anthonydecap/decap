import "server-only";
import type { EntitlementSourceType } from "@/generated/shop-prisma/client";
import { shopDb, type ShopTx } from "../db";
import { ShopError } from "../errors";
import { audit } from "./audit";

/**
 * Entitlement = "may this customer use this arrangement?"  (one row per customer+arrangement)
 * EntitlementSource = "why" (purchase, bundle, grant, promotion, legacy import), many per row.
 *
 * An entitlement is ACTIVE while at least one unrevoked source remains; revoking a source
 * never touches the others. The future player reads entitlements, never order history.
 */

export type GrantInput = {
  customerId: string;
  arrangementId: string;
  sourceType: EntitlementSourceType;
  orderAllocationId?: string | null;
  sourceReference?: string | null;
  grantedByStaffId?: string | null;
  grantReason?: string | null;
};

/** Adds a source and makes sure the entitlement is ACTIVE. Idempotent per order allocation. */
export async function grantEntitlementSource(tx: ShopTx, input: GrantInput) {
  const entitlement = await tx.entitlement.upsert({
    where: { customerId_arrangementId: { customerId: input.customerId, arrangementId: input.arrangementId } },
    create: { customerId: input.customerId, arrangementId: input.arrangementId, status: "ACTIVE" },
    update: {},
  });

  if (input.orderAllocationId) {
    const existing = await tx.entitlementSource.findUnique({ where: { orderAllocationId: input.orderAllocationId } });
    if (existing) return { entitlement, source: existing, created: false };
  }

  const source = await tx.entitlementSource.create({
    data: {
      entitlementId: entitlement.id,
      sourceType: input.sourceType,
      orderAllocationId: input.orderAllocationId ?? null,
      sourceReference: input.sourceReference ?? null,
      grantedByStaffId: input.grantedByStaffId ?? null,
      grantReason: input.grantReason ?? null,
    },
  });
  if (entitlement.status !== "ACTIVE") {
    await tx.entitlement.update({ where: { id: entitlement.id }, data: { status: "ACTIVE", revokedAt: null } });
  }
  return { entitlement, source, created: true };
}

/** Revokes one source and recomputes the entitlement's status. */
export async function revokeEntitlementSource(
  tx: ShopTx,
  sourceId: string,
  reason: string,
  revokedByStaffId: string | null,
) {
  const source = await tx.entitlementSource.findUnique({ where: { id: sourceId } });
  if (!source) throw new ShopError("NOT_FOUND", "Entitlement source not found");
  if (!source.revokedAt) {
    await tx.entitlementSource.update({
      where: { id: sourceId },
      data: { revokedAt: new Date(), revokeReason: reason, revokedByStaffId },
    });
  }
  return recomputeEntitlementStatus(tx, source.entitlementId);
}

export async function recomputeEntitlementStatus(tx: ShopTx, entitlementId: string) {
  const remaining = await tx.entitlementSource.count({ where: { entitlementId, revokedAt: null } });
  const status = remaining > 0 ? "ACTIVE" : "REVOKED";
  return tx.entitlement.update({
    where: { id: entitlementId },
    data: { status, revokedAt: status === "REVOKED" ? new Date() : null },
  });
}

export async function activeEntitlementArrangementIds(customerId: string, tx?: ShopTx): Promise<Set<string>> {
  const db = tx ?? shopDb();
  const rows = await db.entitlement.findMany({
    where: { customerId, status: "ACTIVE" },
    select: { arrangementId: true },
  });
  return new Set(rows.map((r) => r.arrangementId));
}

/** Admin: manual grant. No fake paid order is created. */
export async function adminGrantEntitlement(input: {
  staffId: string;
  customerId: string;
  arrangementId: string;
  reason: string;
  sourceType?: "ADMIN_GRANT" | "PROMOTION" | "LEGACY_IMPORT";
  reference?: string;
}) {
  return shopDb().$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw new ShopError("NOT_FOUND", "Customer not found");
    const arrangement = await tx.arrangement.findUnique({ where: { id: input.arrangementId } });
    if (!arrangement) throw new ShopError("NOT_FOUND", "Arrangement not found");
    const result = await grantEntitlementSource(tx, {
      customerId: input.customerId,
      arrangementId: input.arrangementId,
      sourceType: input.sourceType ?? "ADMIN_GRANT",
      grantedByStaffId: input.staffId,
      grantReason: input.reason,
      sourceReference: input.reference ?? null,
    });
    await audit(
      { type: "STAFF", staffId: input.staffId },
      "entitlement.grant",
      { type: "Entitlement", id: result.entitlement.id },
      { customerId: input.customerId, arrangementId: input.arrangementId, sourceType: input.sourceType ?? "ADMIN_GRANT", reason: input.reason },
      tx,
    );
    return result;
  });
}

/** Admin: revoke one specific source (e.g. a mistaken grant). */
export async function adminRevokeEntitlementSource(input: { staffId: string; sourceId: string; reason: string }) {
  return shopDb().$transaction(async (tx) => {
    const entitlement = await revokeEntitlementSource(tx, input.sourceId, input.reason, input.staffId);
    await audit(
      { type: "STAFF", staffId: input.staffId },
      "entitlement.revoke_source",
      { type: "EntitlementSource", id: input.sourceId },
      { entitlementId: entitlement.id, resultingStatus: entitlement.status, reason: input.reason },
      tx,
    );
    return entitlement;
  });
}

/** Customer library: ACTIVE entitlements joined with arrangement metadata (no asset keys). */
export async function customerLibrary(customerId: string) {
  return shopDb().entitlement.findMany({
    where: { customerId, status: "ACTIVE" },
    orderBy: { firstGrantedAt: "desc" },
    select: {
      id: true,
      firstGrantedAt: true,
      sources: { where: { revokedAt: null }, select: { sourceType: true, grantedAt: true } },
      arrangement: {
        select: {
          id: true, slug: true, sku: true, displayTitle: true, subtitle: true, status: true,
          durationSeconds: true, containsMidi: true, containsAudio: true, containsVideo: true,
          work: { select: { title: true, originalArtist: true } },
          arranger: { select: { name: true } },
        },
      },
    },
  });
}
