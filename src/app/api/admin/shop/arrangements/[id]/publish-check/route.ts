import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { arrangementPublishIssues } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const GET = adminRoute<{ id: string }>("catalog:write", async (_req, { params }) => {
  const { id } = await params;
  const issues = await arrangementPublishIssues(uuidParam(id));
  return NextResponse.json({ publishable: issues.length === 0, issues });
});
