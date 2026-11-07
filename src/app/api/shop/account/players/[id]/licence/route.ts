import { requireCustomer } from "@/modules/shop/auth/session";
import { route, uuidParam } from "@/modules/shop/http";
import { customerLicenseFile } from "@/modules/shop/services/player-licenses";
import { rateLimit } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/**
 * The newest licence (.decaplic) of one of the signed-in customer's own players (contract C7
 * rule 4: session + right on every download, never a storage URL).
 */
export const GET = route<{ id: string }>(async (_req, { params }) => {
  const customer = await requireCustomer();
  await rateLimit(`licence-download:${customer.id}`, 30, 60);
  const { id } = await params;
  const { filename, bytes } = await customerLicenseFile(customer.id, uuidParam(id));
  return new Response(bytes as BodyInit, {
    headers: { "content-type": "application/octet-stream", "content-disposition": `attachment; filename="${filename}"` },
  });
});
