// Prisma CLI configuration for the DMI shop database.
// The shop uses its own SHOP_DATABASE_URL so shop migrations can never be pointed at
// another database by accident. Next.js loads .env.local itself; the CLI does it here.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct connection; poolers (Neon, PgBouncer) are for the app.
    url: process.env.SHOP_DATABASE_URL_UNPOOLED ?? process.env.SHOP_DATABASE_URL ?? "",
  },
});
