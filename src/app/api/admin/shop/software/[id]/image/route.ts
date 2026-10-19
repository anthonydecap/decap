import { NextResponse } from "next/server";
import { z } from "zod";
import { ShopError } from "@/modules/shop/errors";
import { parseMultipart, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { uploadProductImage } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = adminRoute<{ id: string }>("software:write", async (req, { params, staff }) => {
  const { id } = await params;
  const { data, files } = await parseMultipart(req, z.object({ kind: z.enum(["cover", "icon"]) }));
  if (files.length !== 1) throw new ShopError("VALIDATION_FAILED", "Attach one image");
  await uploadProductImage({ staffId: staff.staff.id }, uuidParam(id), data.kind, files[0]!);
  return NextResponse.json({ ok: true });
});
