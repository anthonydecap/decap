/**
 * Grants or changes a staff role for an Auth0 user (by `sub`, never by email).
 *
 *   npm run shop:staff -- --sub "auth0|64f…" --role ADMIN [--name "Sam Okafor"] [--deactivate]
 *
 * This is the bootstrap path for the first SUPER_ADMIN. Everyone after that is managed
 * from /admin/shop/staff, so access is never pinned to a hard-coded list of e-mails.
 *
 * Find the `sub` in the Auth0 dashboard (User Management → Users → user_id).
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/shop-prisma/client";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

async function main() {
  const sub = arg("sub");
  const role = (arg("role") ?? "ADMIN").toUpperCase();
  if (!sub) throw new Error("--sub is required (the Auth0 user_id)");
  const ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "CATALOG_MANAGER", "FINANCE"];
  if (!ROLES.includes(role)) throw new Error(`--role must be one of ${ROLES.join(", ")}`);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.SHOP_DATABASE_URL! }) });
  const status = args.includes("--deactivate") ? "DISABLED" : "ACTIVE";
  const staff = await db.staffAccount.upsert({
    where: { authSubject: sub },
    create: { authSubject: sub, role: role as "ADMIN", displayName: arg("name") ?? null, status },
    update: { role: role as "ADMIN", status, ...(arg("name") ? { displayName: arg("name") } : {}) },
  });
  await db.auditLog.create({
    data: { actorType: "SYSTEM", action: "staff.upsert_cli", entityType: "StaffAccount", entityId: staff.id, metadata: { role, status } },
  });
  console.log(`${status} ${staff.role} ${staff.id} for ${sub}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
