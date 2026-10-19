/**
 * Phase 4: migrates account-level music purchases (Entitlements) to player-bound
 * MusicLicenses. Dry run by default; prints a report and writes it to a JSON file.
 *
 *   npm run shop:migrate-music                 # dry run: report only, nothing written
 *   npm run shop:migrate-music -- --apply      # writes licenses (idempotent, safe to re-run)
 *   npm run shop:migrate-music -- --customer <uuid> [--apply]
 *
 * Take a database backup (Neon branch) before --apply. Ambiguous customers (several
 * players) are never guessed: they land in /admin/shop/music/migration for staff.
 */
import { writeFileSync } from "node:fs";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/shop-prisma/client";
import { runLegacyMusicMigration } from "../src/modules/shop/migration/legacy-music";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const ci = args.indexOf("--customer");
const customerIds = ci >= 0 && args[ci + 1] ? [args[ci + 1]!] : undefined;

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.SHOP_DATABASE_URL! }) });
  try {
    const report = await runLegacyMusicMigration(db, { dryRun: !apply, customerIds });
    const file = `music-migration-${apply ? "applied" : "dry-run"}-${report.startedAt.replace(/[:.]/g, "-")}.json`;
    writeFileSync(file, JSON.stringify(report, null, 2));
    console.log(apply ? "APPLIED" : "DRY RUN (nothing written)");
    console.table(report.customers.map((c) => ({
      customer: c.email ?? c.customerId, entitlements: c.entitlements, alreadyLicensed: c.alreadyLicensed, players: c.eligiblePlayers,
      auto: c.outcomes.AUTO_ASSIGNED, evidence: c.outcomes.EVIDENCE_ASSIGNED, review: c.outcomes.NEEDS_REVIEW + c.outcomes.INCOMPATIBLE_REVIEW,
      waiting: c.outcomes.WAITING_FOR_PLAYER, status: c.status,
    })));
    console.log("Totals:", report.totals);
    console.log(`Report written to ${file}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
