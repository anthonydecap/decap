import { NextResponse } from "next/server";
import { notFound } from "@/modules/shop/errors";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { deleteDraftImport, getImportBatch } from "@/modules/shop/services/imports";

export const dynamic = "force-dynamic";

/** Batch status/details for resumable review. Never includes storage keys. */
export const GET = adminRoute<{ id: string }>("imports:manage", async (_req, { params }) => {
  const { id } = await params;
  const batch = await getImportBatch(uuidParam(id));
  if (!batch) throw notFound("Import batch");
  return NextResponse.json({
    id: batch.id,
    label: batch.label,
    status: batch.status,
    totalItems: batch.totalItems,
    uploadedItems: batch.uploadedItems,
    validItems: batch.validItems,
    failedItems: batch.failedItems,
    dryRunSummary: batch.dryRunSummary,
    confirmedAt: batch.confirmedAt,
    completedAt: batch.completedAt,
    rows: batch.metadataRows.map((r) => ({
      rowNumber: r.rowNumber, sku: r.sku, errors: r.errors, warnings: r.warnings,
      action: (r.normalized as { action?: string } | null)?.action ?? null,
      resultingArrangementId: r.resultingArrangementId,
    })),
    items: batch.items,
  });
});

/** Removes an unconfirmed (abandoned) draft batch. */
export const DELETE = adminRoute<{ id: string }>("imports:manage", async (_req, { params, staff }) => {
  const { id } = await params;
  await deleteDraftImport({ staffId: staff.staff.id }, uuidParam(id));
  return NextResponse.json({ ok: true });
});
