import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { route } from "@/modules/shop/http";
import { catalogQuerySchema } from "@/modules/shop/schemas";
import { searchCatalog } from "@/modules/shop/services/catalog";
import { toCatalogQuery } from "@/modules/shop/ui/catalog-params";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const query = toCatalogQuery(catalogQuerySchema.parse(params));
  const customer = await getCurrentCustomer();
  return NextResponse.json(await searchCatalog(query, customer?.id));
});
