import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { shopConfig } from "@/modules/shop/config";
import { handleStripeEvent } from "@/modules/shop/services/fulfillment";
import { stripe } from "@/modules/shop/services/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Stripe webhook — the only authority for paid fulfillment.
 * Verifies the signature over the raw body; every event id is processed at most once.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, shopConfig.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    const { duplicate } = await handleStripeEvent(event);
    return NextResponse.json({ received: true, duplicate });
  } catch (e) {
    // 500 → Stripe retries with backoff. No internals in the response or logs.
    console.error("[shop] webhook processing failed", event.type, e instanceof Error ? e.name : "unknown");
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
