import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { getPlayerLicenseOrder, licenseSongsFile } from "@/modules/shop/services/player-licenses";

export const dynamic = "force-dynamic";

/** The song IDs for `decaplic issue --nummers`, one per line. */
export const GET = adminRoute<{ id: string }>("licences:issue", async (_req, { params }) => {
  const { id } = await params;
  const { filename, text } = licenseSongsFile(await getPlayerLicenseOrder(uuidParam(id)));
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8", "content-disposition": `attachment; filename="${filename}"` } });
});
