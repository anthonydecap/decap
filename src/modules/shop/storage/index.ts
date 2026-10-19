import "server-only";
import path from "node:path";
import { shopConfig } from "../config";
import { LocalStorageService } from "./local";
import { MemoryStorageService } from "./memory";
import type { StorageService } from "./types";
import { VercelBlobStorageService } from "./vercel-blob";

let instance: StorageService | null = null;

export function storage(): StorageService {
  if (instance) return instance;
  switch (shopConfig.storageDriver) {
    case "vercel-blob":
      instance = new VercelBlobStorageService({
        previewsAccess: shopConfig.previewsAccess,
        handleUploadUrl: `${shopConfig.appBaseUrl}/api/admin/shop/uploads/blob`,
      });
      break;
    case "local":
      instance = new LocalStorageService({
        root: path.resolve(process.cwd(), ".shop-storage"),
        baseUrl: shopConfig.appBaseUrl,
        secret: shopConfig.uploadTicketSecret,
      });
      break;
    case "memory":
      instance = new MemoryStorageService();
      break;
  }
  return instance;
}

/** Tests inject a driver. */
export function setStorageForTests(s: StorageService | null) {
  instance = s;
}

export type { StorageService, StoreName, UploadTarget, ObjectRef } from "./types";
