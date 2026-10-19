import { csvTemplate } from "@/modules/shop/domain/import-plan";
import { adminRoute } from "@/modules/shop/http-admin";

export const dynamic = "force-dynamic";

export const GET = adminRoute("imports:manage", async () =>
  new Response(csvTemplate(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="dmi-import-template.csv"',
    },
  }),
);
