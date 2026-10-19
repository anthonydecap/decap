import "server-only";
import { cache } from "react";
import { shopDb } from "../db";
import { productImages } from "./software";

/**
 * The software that *is* a player (Virtual Orchestrion): a product a music-capable player
 * type points at. Used to tell customers without a player exactly what to get.
 */
export type PlayerProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  priceCents: number | null;
  currency: string;
  iconUrl: string | null;
  forSale: boolean;
};

export const playerProducts = cache(async (): Promise<PlayerProduct[]> => {
  const rows = await shopDb().softwareProduct.findMany({
    where: { status: "ACTIVE", playerTypes: { some: { supportsMusicLibrary: true, active: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return Promise.all(rows.map(async (p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    priceCents: p.defaultLicensePriceCents,
    currency: p.currency,
    iconUrl: (await productImages(p)).iconUrl ?? null,
    forSale: p.defaultLicensePriceCents != null && p.defaultLicensePriceCents > 0,
  })));
});

/** The main player product (first by sort order), if any is on sale. */
export async function primaryPlayerProduct(): Promise<PlayerProduct | null> {
  return (await playerProducts())[0] ?? null;
}

export type PlayerJourneyStage = "buy" | "activate" | "activating" | "paused";

/**
 * Where a customer without an active player stands with the player software: still to buy
 * it, bought and waiting for their registration code, or being activated by DMI.
 */
export async function playerJourney(customerId: string): Promise<{ product: PlayerProduct; stage: PlayerJourneyStage } | null> {
  const product = await primaryPlayerProduct();
  if (!product) return null;
  const { customerSoftwareOverview } = await import("./software");
  const mine = (await customerSoftwareOverview(customerId)).find((s) => s.product.id === product.id);
  const status = mine?.status ?? "NOT_DOWNLOADED";
  const stage: PlayerJourneyStage =
    status === "REGISTRATION_CODE_NEEDED" || status === "ATTENTION" || status === "ACTION_REQUIRED" ? "activate"
    : status === "WAITING_FOR_DMI" || status === "BEING_PROCESSED" || status === "LICENSED" ? "activating"
    : status === "SUSPENDED" ? "paused"
    : "buy";
  return { product, stage };
}
