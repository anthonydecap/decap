/**
 * Checks every pending / cancelled order that has a Stripe PaymentIntent against Stripe and
 * fulfills the ones that were actually paid (missed webhook). Safe to re-run.
 *
 *   npm run shop:reconcile-payments
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

async function main() {
  const { shopDb } = await import("../src/modules/shop/db");
  const { reconcileOrderPayment } = await import("../src/modules/shop/services/payment-reconcile");
  const orders = await shopDb().order.findMany({
    where: { status: { in: ["PENDING_PAYMENT", "CANCELED"] }, stripePaymentIntentId: { not: null }, paidAt: null },
    select: { id: true, number: true },
    orderBy: { number: "asc" },
  });
  for (const o of orders) {
    const r = await reconcileOrderPayment(o.id).catch((e: Error) => `ERROR ${e.message}`);
    console.log(`DMI-${String(o.number).padStart(6, "0")}: ${r}`);
  }
  if (!orders.length) console.log("Nothing to reconcile.");
  await shopDb().$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
