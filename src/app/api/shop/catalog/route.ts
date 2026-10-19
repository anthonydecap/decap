import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { route } from "@/modules/shop/http";
import { catalogQuerySchema } from "@/modules/shop/schemas";
import { searchCatalog } from "@/modules/shop/services/catalog";
import { storefrontPlayerContext } from "@/modules/shop/services/storefront-player";
import { toCatalogQuery } from "@/modules/shop/ui/catalog-params";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { player, ...params } = Object.fromEntries(new URL(req.url).searchParams.entries());
  const query = toCatalogQuery(catalogQuerySchema.parse(params));
  const customer = await getCurrentCustomer();
  // States and prices for the shopping player (`?player=` or the remembered one).
  const viewer = customer ? await storefrontPlayerContext(customer.id, player) : null;
  return NextResponse.json(await searchCatalog(query, viewer));
});
