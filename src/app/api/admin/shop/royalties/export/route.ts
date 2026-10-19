import { ShopError } from "@/modules/shop/errors";
import { adminRoute } from "@/modules/shop/http-admin";
import { royaltyReport } from "@/modules/shop/services/admin-ops";

export const dynamic = "force-dynamic";

const cell = (v: string | number) => {
  const s = String(v);
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) && typeof v === "string" ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const GET = adminRoute("royalties:read", async (req) => {
  const url = new URL(req.url);
  const from = new Date(url.searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const to = new Date(url.searchParams.get("to") ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new ShopError("VALIDATION_FAILED", "Dates must be YYYY-MM-DD");
  }
  const arrangerParam = url.searchParams.get("arrangerId");
  const arrangerId = arrangerParam && /^[0-9a-f-]{36}$/i.test(arrangerParam) ? arrangerParam : undefined;
  const { rows } = await royaltyReport({ from, to, arrangerId });
  const lines = [
    ["arranger", "currency", "sales", "refunds", "net_revenue_cents", "royalty_cents"].join(","),
    ...rows.map((r) => [r.name, r.currency, r.salesCount, r.refundCount, r.netRevenueCents, r.royaltyCents].map(cell).join(",")),
  ];
  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="royalties-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.csv"`,
    },
  });
});
