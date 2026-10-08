import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/shop-prisma/client";

export type { Prisma } from "@/generated/shop-prisma/client";
export type ShopDb = PrismaClient;
export type ShopTx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

const globalForShop = globalThis as unknown as { __shopPrisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.SHOP_DATABASE_URL;
  if (!connectionString) throw new Error("Missing required environment variable SHOP_DATABASE_URL");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Lazily created so pages that never touch the shop don't need the shop database. */
export function shopDb(): PrismaClient {
  if (!globalForShop.__shopPrisma) globalForShop.__shopPrisma = createClient();
  return globalForShop.__shopPrisma;
}
