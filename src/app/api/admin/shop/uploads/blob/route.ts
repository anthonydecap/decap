import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireStaff } from "@/modules/shop/auth/session";
import { shopConfig } from "@/modules/shop/config";
import { ShopError } from "@/modules/shop/errors";
import { assertSameOrigin, route } from "@/modules/shop/http";
import { storage } from "@/modules/shop/storage";
import { verifyTicket } from "@/modules/shop/storage/tickets";
import { VercelBlobStorageService } from "@/modules/shop/storage/vercel-blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Vercel Blob presigned-upload handshake used by `uploadPresigned` in the admin browser.
 * The browser-chosen pathname is ignored unless it equals the server-generated key in the
 * signed ticket; the minted token is PUT-only, single-pathname, size/type-constrained and
 * expires with the ticket (5–15 minutes). Store credentials never leave the server.
 */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const blob = storage();
  if (!(blob instanceof VercelBlobStorageService)) throw new ShopError("NOT_FOUND", "Not found");
  const { staff } = await requireStaff();
  const body = (await req.json()) as HandleUploadPresignedBody;
  if (body.type !== "blob.generate-presigned-url") throw new ShopError("VALIDATION_FAILED", "Unsupported event");

  const result = await handleUploadPresigned({
    body,
    request: req,
    getSignedToken: async (pathname, clientPayload) => {
      const ticket = clientPayload ? verifyTicket(clientPayload, shopConfig.uploadTicketSecret) : null;
      if (!ticket) throw new ShopError("UPLOAD_EXPIRED", "Upload ticket expired or invalid");
      if (ticket.staffId !== staff.id) throw new ShopError("FORBIDDEN", "Upload ticket belongs to another user");
      if (ticket.key !== pathname) throw new ShopError("FORBIDDEN", "Pathname does not match the issued upload");
      const token = await blob.issueUploadToken(
        { store: ticket.store, key: ticket.key },
        { validUntil: ticket.exp, contentType: ticket.contentType, maxBytes: ticket.maxBytes },
      );
      return {
        token,
        urlOptions: {
          validUntil: ticket.exp,
          allowedContentTypes: [ticket.contentType],
          maximumSizeInBytes: ticket.maxBytes,
          allowOverwrite: false,
          addRandomSuffix: false,
        },
      };
    },
  });
  return NextResponse.json(result);
});
