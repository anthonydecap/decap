import { NextResponse } from "next/server";
import { roleHasPermission } from "@/modules/shop/auth/session";
import { ShopError } from "@/modules/shop/errors";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { musicMigrationRunSchema } from "@/modules/shop/schemas";
import { migrationQueue, runMigrationFromAdmin } from "@/modules/shop/services/music-admin";

export const dynamic = "force-dynamic";

export const GET = adminRoute("music:migration", async () => NextResponse.json({ queue: await migrationQueue() }));

/** Runs the legacy migration (dry run by default). Applying for everyone is ADMIN-level. */
export const POST = adminRoute("music:migration", async (req, { staff }) => {
  const input = await parseJson(req, musicMigrationRunSchema);
  if (!input.dryRun && !input.customerId && !roleHasPermission(staff.staff.role, "music:grant")) {
    throw new ShopError("FORBIDDEN", "Applying the migration for all customers requires an administrator");
  }
  return NextResponse.json(await runMigrationFromAdmin(staff.staff.id, input));
});
