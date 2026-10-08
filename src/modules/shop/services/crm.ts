import "server-only";
import type { Prisma } from "@/generated/shop-prisma/client";
import { shopDb } from "../db";
import { sanitizeAuditMetadata } from "./audit";

/**
 * The CRM timeline.
 *
 * Separate from the audit log on purpose. The audit log answers "who did what to this
 * system" and is written for accountability; this answers "what happened with this
 * customer" and is written to be read by whoever picks up the phone next. Some events
 * appear in both, phrased differently.
 *
 * `type` is machine-readable (`player.activated`) so views can filter; `summary` is the
 * sentence staff reads.
 */

export async function recordActivity(input: {
  customerId: string;
  type: string;
  summary: string;
  staffId?: string | null;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
  tx?: Prisma.TransactionClient;
}): Promise<void> {
  const db = input.tx ?? shopDb();
  await db.customerActivity.create({
    data: {
      customerId: input.customerId,
      type: input.type,
      summary: input.summary,
      staffId: input.staffId ?? null,
      // Same redaction as the audit log: a timeline entry is read by more people, not fewer.
      metadata: input.metadata ? (sanitizeAuditMetadata(input.metadata) as Prisma.InputJsonValue) : undefined,
      ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
    },
  });
}

export type ActivityEntry = {
  id: string;
  type: string;
  summary: string;
  occurredAt: Date;
  staffName: string | null;
  metadata: unknown;
};

export async function listActivity(customerId: string, limit = 50): Promise<ActivityEntry[]> {
  const rows = await shopDb().customerActivity.findMany({
    where: { customerId },
    orderBy: { occurredAt: "desc" },
    take: limit,
    include: { staff: { select: { displayName: true, email: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    summary: r.summary,
    occurredAt: r.occurredAt,
    staffName: r.staff?.displayName ?? r.staff?.email ?? null,
    metadata: r.metadata,
  }));
}
