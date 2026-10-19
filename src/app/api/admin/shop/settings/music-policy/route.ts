import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { musicPolicySchema } from "@/modules/shop/schemas";
import { getMusicPolicy, updateMusicPolicy } from "@/modules/shop/services/music-policy";

export const dynamic = "force-dynamic";

export const GET = adminRoute("music:read", async () => NextResponse.json(await getMusicPolicy()));

/** The one place commercial licensing rules change: additional-player price, resale, replacement. */
export const PUT = adminRoute("settings:write", async (req, { staff }) => {
  const policy = await parseJson(req, musicPolicySchema);
  return NextResponse.json(await updateMusicPolicy(staff.staff.id, policy));
});
