import { notFound } from "next/navigation";
import { guardStaffPage } from "@/modules/shop/ui/admin/guard";
import { BatchConsole } from "@/modules/shop/ui/admin/imports/BatchConsole";
import { NoAccess } from "@/modules/shop/ui/admin/NoAccess";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ImportBatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autostart?: string }>;
}) {
  const { id } = await params;
  const guard = await guardStaffPage("imports:manage", `/admin/shop/imports/${id}`);
  if (!guard.ok) return <NoAccess reason={guard.reason} />;
  if (!UUID.test(id)) notFound();
  const { autostart } = await searchParams;
  return <BatchConsole key={id} batchId={id} autostart={autostart === "1"} />;
}
