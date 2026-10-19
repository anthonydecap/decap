import "server-only";
import type { Prisma } from "@/generated/shop-prisma/client";
import { DEFAULT_MUSIC_POLICY, normaliseMusicPolicy, type MusicPolicy } from "../domain/music-policy";
import { shopDb, type ShopTx } from "../db";
import { audit } from "./audit";

const KEY = "music.policy";

export async function getMusicPolicy(tx?: ShopTx): Promise<MusicPolicy> {
  const row = await (tx ?? shopDb()).shopSetting.findUnique({ where: { key: KEY } });
  return row ? normaliseMusicPolicy(row.value) : DEFAULT_MUSIC_POLICY;
}

export async function updateMusicPolicy(staffId: string, next: MusicPolicy): Promise<MusicPolicy> {
  const value = normaliseMusicPolicy(next);
  const before = await getMusicPolicy();
  await shopDb().shopSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: value as unknown as Prisma.InputJsonValue },
    update: { value: value as unknown as Prisma.InputJsonValue },
  });
  await audit({ type: "STAFF", staffId }, "settings.music_policy", { type: "ShopSetting", id: KEY }, { before, after: value });
  return value;
}
