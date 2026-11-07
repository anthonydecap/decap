import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { getPlayerLicenseOrder, licenseRequestFile } from "@/modules/shop/services/player-licenses";

export const dynamic = "force-dynamic";

/** The player's .decapreq for `decaplic issue` (public data only). */
export const GET = adminRoute<{ id: string }>("licences:issue", async (_req, { params }) => {
  const { id } = await params;
  const { filename, text } = licenseRequestFile(await getPlayerLicenseOrder(uuidParam(id)));
  return new Response(text, { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="${filename}"` } });
});
