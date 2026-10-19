import "server-only";
import type { AuditActorType, Prisma } from "@/generated/shop-prisma/client";
import { shopDb, type ShopTx } from "../db";

export type AuditActor =
  | { type: "STAFF"; staffId: string }
  | { type: "CUSTOMER"; customerId: string }
  | { type: "SYSTEM" }
  | { type: "STRIPE" };

const SECRET_KEYS = /secret|token|password|signature|authorization|url|key$/i;

/** Drops anything that looks like a credential or signed URL before it reaches the log. */
export function sanitizeAuditMetadata(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => sanitizeAuditMetadata(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SECRET_KEYS.test(k) && k !== "storageKey" ? "[redacted]" : sanitizeAuditMetadata(v, depth + 1);
    }
    return out;
  }
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string" && value.length > 500) return `${value.slice(0, 500)}…`;
  return value;
}

export async function audit(
  actor: AuditActor,
  action: string,
  entity: { type: string; id?: string | null },
  metadata?: Record<string, unknown>,
  tx?: ShopTx,
) {
  const db = tx ?? shopDb();
  await db.auditLog.create({
    data: {
      actorType: actor.type as AuditActorType,
      actorStaffId: actor.type === "STAFF" ? actor.staffId : null,
      actorCustomerId: actor.type === "CUSTOMER" ? actor.customerId : null,
      action,
      entityType: entity.type,
      entityId: entity.id ?? null,
      metadata: metadata ? (sanitizeAuditMetadata(metadata) as Prisma.InputJsonValue) : undefined,
    },
  });
}
