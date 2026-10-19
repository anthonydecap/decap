import "server-only";
import type Stripe from "stripe";
import { computeRoyaltyReversalCents } from "../domain/royalty";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { revokeLicenseForRefund } from "./software-licensing";
import { revokeEntitlementSource } from "./entitlements";
import { revokeLicenseForRefundedAllocation } from "./music-licenses";
import { stripe } from "./stripe";

/**
 * Refunds (Stripe test mode). Refunds are per allocation (a whole arrangement within an
 * order line). Applying a refund:
 *   - revokes only the EntitlementSource rows created by those allocations,
 *   - revokes the player MusicLicense each allocation created (following any transfer),
 *   - keeps an Entitlement ACTIVE when another valid source remains,
 *   - books negative royalty ledger entries,
 *   - never deletes order history.
 * A file already delivered to an offline device cannot be remotely erased; revocation stops
 * future delivery / re-delivery only.
 */

export async function createRefund(input: {
  staffId: string;
  orderId: string;
  /** Omit both for a full refund of everything still refundable. */
  allocationIds?: string[];
  /** Non-music lines (software licenses). */
  orderItemIds?: string[];
  reason: string;
}) {
  const db = shopDb();
  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: { allocations: true, items: { where: { itemType: "SOFTWARE_LICENSE" } } },
  });
  if (!order) throw new ShopError("NOT_FOUND", "Order not found");
  if (!["FULFILLED", "PARTIALLY_REFUNDED", "PAID"].includes(order.status) || !order.stripePaymentIntentId) {
    throw new ShopError("INVALID_STATE", `Order in status ${order.status} cannot be refunded`);
  }
  const pendingCount = await db.refund.count({ where: { orderId: order.id, status: "PENDING" } });
  if (pendingCount > 0) throw new ShopError("CONFLICT", "A refund for this order is still pending");

  const full = !input.allocationIds && !input.orderItemIds;
  const selected = order.allocations.filter(
    (a) => (full || input.allocationIds?.includes(a.id)) && a.allocatedCents - a.refundedCents > 0,
  );
  const selectedLines = order.items.filter(
    (i) => (full || input.orderItemIds?.includes(i.id)) && i.chargedCents - i.refundedCents > 0,
  );
  if ((input.allocationIds && selected.length !== input.allocationIds.length) || (input.orderItemIds && selectedLines.length !== input.orderItemIds.length)) {
    throw new ShopError("VALIDATION_FAILED", "Some selected items are not refundable");
  }
  if (selected.length === 0 && selectedLines.length === 0) throw new ShopError("INVALID_STATE", "Nothing left to refund on this order");
  const amountCents =
    selected.reduce((s, a) => s + (a.allocatedCents - a.refundedCents), 0) +
    selectedLines.reduce((s, i) => s + (i.chargedCents - i.refundedCents), 0);
  if (amountCents <= 0) throw new ShopError("INVALID_STATE", "Nothing left to refund on this order");

  const refund = await db.refund.create({
    data: {
      orderId: order.id,
      amountCents,
      currency: order.currency,
      reason: input.reason,
      requestedByStaffId: input.staffId,
      allocations: { create: selected.map((a) => ({ allocationId: a.id, amountCents: a.allocatedCents - a.refundedCents })) },
      orderItems: { create: selectedLines.map((i) => ({ orderItemId: i.id, amountCents: i.chargedCents - i.refundedCents })) },
    },
  });
  await audit({ type: "STAFF", staffId: input.staffId }, "refund.requested", { type: "Refund", id: refund.id }, {
    orderId: order.id, amountCents, allocationCount: selected.length, reason: input.reason,
  });

  let stripeRefund: Stripe.Refund;
  try {
    stripeRefund = await stripe().refunds.create(
      {
        payment_intent: order.stripePaymentIntentId,
        amount: amountCents,
        reason: "requested_by_customer",
        metadata: { shop: "dmi", refundId: refund.id, orderId: order.id },
      },
      { idempotencyKey: `dmi-refund-${refund.id}` },
    );
  } catch (e) {
    await db.refund.update({ where: { id: refund.id }, data: { status: "FAILED", completedAt: new Date() } });
    throw new ShopError("PAYMENT_PROVIDER_ERROR", "Stripe rejected the refund", {
      provider: e instanceof Error ? e.message.slice(0, 200) : "unknown",
    });
  }
  await db.refund.update({ where: { id: refund.id }, data: { stripeRefundId: stripeRefund.id } });
  await syncRefundFromStripe(stripeRefund);
  return db.refund.findUniqueOrThrow({ where: { id: refund.id } });
}

/** Mirrors a Stripe refund status onto our Refund; applies effects once on success. */
export async function syncRefundFromStripe(r: Pick<Stripe.Refund, "id" | "status" | "metadata">) {
  const db = shopDb();
  const refundId = r.metadata?.refundId;
  const refund = refundId
    ? await db.refund.findUnique({ where: { id: refundId } })
    : await db.refund.findUnique({ where: { stripeRefundId: r.id } });
  if (!refund) return; // Refund made outside the shop (e.g. Stripe dashboard) — staff reconcile manually.

  if (!refund.stripeRefundId) await db.refund.update({ where: { id: refund.id }, data: { stripeRefundId: r.id } });
  if (r.status === "succeeded") {
    await applyRefund(refund.id);
  } else if (r.status === "failed" || r.status === "canceled") {
    await db.refund.updateMany({
      where: { id: refund.id, appliedAt: null },
      data: { status: r.status === "failed" ? "FAILED" : "CANCELED", completedAt: new Date() },
    });
  }
}

export async function applyRefund(refundId: string) {
  const db = shopDb();
  await db.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<{ appliedAt: Date | null }[]>`
      SELECT "appliedAt" FROM "Refund" WHERE "id" = ${refundId}::uuid FOR UPDATE`;
    if (!locked[0] || locked[0].appliedAt) return;

    const refund = await tx.refund.findUniqueOrThrow({
      where: { id: refundId },
      include: { allocations: { include: { allocation: { include: { entitlementSource: true } } } }, orderItems: true },
    });
    await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${refund.orderId}::uuid FOR UPDATE`;

    for (const ra of refund.allocations) {
      const a = ra.allocation;
      const newRefunded = Math.min(a.refundedCents + ra.amountCents, a.allocatedCents);
      await tx.orderItemAllocation.update({
        where: { id: a.id },
        data: { refundedCents: newRefunded, refundedAt: new Date() },
      });

      if (a.entitlementSource && !a.entitlementSource.revokedAt) {
        await revokeEntitlementSource(tx, a.entitlementSource.id, `refund:${refund.id}`, refund.requestedByStaffId);
      }
      // The playback license this allocation paid for (wherever it was moved since) stops
      // authorizing future deliveries. Order, allocation and license history all stay.
      await revokeLicenseForRefundedAllocation(tx, a.id, refund.id, refund.requestedByStaffId);

      // Royalty reversal: proportional, and exact on the final refund of an allocation.
      const previous = await tx.royaltyLedgerEntry.aggregate({
        where: { allocationId: a.id, entryType: "REFUND" },
        _sum: { amountCents: true },
      });
      const alreadyReversed = -(previous._sum.amountCents ?? 0);
      const reversal = newRefunded >= a.allocatedCents
        ? a.royaltyCents - alreadyReversed
        : Math.min(computeRoyaltyReversalCents(a, ra.amountCents), a.royaltyCents - alreadyReversed);
      await tx.royaltyLedgerEntry.createMany({
        data: [{
          arrangerId: a.arrangerId,
          arrangementId: a.arrangementId,
          orderId: refund.orderId,
          allocationId: a.id,
          refundId: refund.id,
          entryType: "REFUND",
          amountCents: -Math.max(reversal, 0),
          netRevenueCents: -ra.amountCents,
          currency: refund.currency,
          basisSnapshot: a.royaltyBasis,
          rateBpsSnapshot: a.royaltyRateBps,
          idempotencyKey: `refund:${refund.id}:${a.id}`,
        }],
        skipDuplicates: true,
      });
    }

    // Software lines: license revoked, installations kept as history.
    for (const line of refund.orderItems) {
      const item = await tx.orderItem.findUniqueOrThrow({ where: { id: line.orderItemId } });
      await tx.orderItem.update({ where: { id: item.id }, data: { refundedCents: Math.min(item.refundedCents + line.amountCents, item.chargedCents) } });
      await revokeLicenseForRefund(tx, item.id, refund.id, refund.requestedByStaffId);
    }

    const order = await tx.order.findUniqueOrThrow({ where: { id: refund.orderId } });
    const refundedCents = Math.min(order.refundedCents + refund.amountCents, order.totalCents);
    await tx.order.update({
      where: { id: order.id },
      data: { refundedCents, status: refundedCents >= order.totalCents ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    });
    await tx.refund.update({
      where: { id: refund.id },
      data: { status: "SUCCEEDED", completedAt: new Date(), appliedAt: new Date() },
    });
    await recordActivity({
      tx,
      customerId: order.customerId,
      type: "order.refunded",
      summary: `Refunded ${(refund.amountCents / 100).toFixed(2)} ${refund.currency} on order DMI-${String(order.number).padStart(6, "0")}${refund.allocations.length ? ` (${refund.allocations.length} arrangement${refund.allocations.length === 1 ? "" : "s"} no longer licensed)` : ""}${refund.orderItems.length ? ` (${refund.orderItems.length} software license${refund.orderItems.length === 1 ? "" : "s"} revoked)` : ""}`,
      staffId: refund.requestedByStaffId,
      metadata: { orderId: order.id, refundId: refund.id, amountCents: refund.amountCents },
    });
    await audit({ type: "SYSTEM" }, "refund.applied", { type: "Refund", id: refund.id }, {
      orderId: order.id, amountCents: refund.amountCents, allocationCount: refund.allocations.length, softwareLines: refund.orderItems.length,
    }, tx);
  });
}
