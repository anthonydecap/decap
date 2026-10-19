import { NextResponse } from "next/server";
import { adminRoute } from "@/modules/shop/http-admin";
import { searchCrmCustomers } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

/** Compact customer lookup for pickers (e.g. the player transfer target). */
export const GET = adminRoute("customers:read", async (req) => {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ items: [] });
  const r = await searchCrmCustomers({ q });
  return NextResponse.json({
    items: r.items.slice(0, 10).map((c) => ({
      id: c.id,
      label: [c.companyName, [c.firstName, c.lastName].filter(Boolean).join(" ")].filter(Boolean).join(", ") || c.email,
      email: c.email,
    })),
  });
});
