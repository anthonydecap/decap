import "server-only";
import Stripe from "stripe";
import { shopConfig } from "../config";

/**
 * Stripe access. Only the methods the shop uses are part of `StripeLike`, so tests can
 * inject a fake without network access.
 */
export type StripeLike = {
  paymentIntents: Pick<Stripe["paymentIntents"], "create" | "retrieve" | "cancel">;
  refunds: Pick<Stripe["refunds"], "create">;
  customers: Pick<Stripe["customers"], "create">;
  webhooks: Pick<Stripe["webhooks"], "constructEvent">;
};

let client: StripeLike | null = null;

export function stripe(): StripeLike {
  if (!client) {
    const key = shopConfig.stripeSecretKey;
    if (shopConfig.isProduction && key.startsWith("sk_live_") && process.env.SHOP_ALLOW_LIVE_STRIPE !== "true") {
      // The shop ships in TEST/SANDBOX mode. Going live is a deliberate switch.
      throw new Error("Live Stripe keys are disabled until SHOP_ALLOW_LIVE_STRIPE=true");
    }
    client = new Stripe(key, { appInfo: { name: "DMI Music Shop" }, maxNetworkRetries: 2 });
  }
  return client;
}

export function setStripeForTests(s: StripeLike | null) {
  client = s;
}
