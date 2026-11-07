-- Licence v1 (contract C7 §2, §4, §5): the queue of player licences and the song ID per arrangement.
-- CreateEnum
CREATE TYPE "PlayerLicenseOrderStatus" AS ENUM ('WAITING', 'DONE', 'REFUSED');

-- AlterTable
ALTER TABLE "Arrangement" ADD COLUMN     "songId" VARCHAR(64);

-- CreateTable
CREATE TABLE "PlayerLicenseOrder" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "PlayerLicenseOrderStatus" NOT NULL DEFAULT 'WAITING',
    "reason" TEXT NOT NULL,
    "edition" TEXT NOT NULL DEFAULT 'standard',
    "midiOut" BOOLEAN NOT NULL DEFAULT true,
    "validUntil" CHAR(10),
    "dmiUserId" INTEGER,
    "licenseId" VARCHAR(64),
    "signerKeyId" VARCHAR(64),
    "issued" VARCHAR(10),
    "fileSha256" CHAR(64),
    "storageKey" TEXT,
    "issuedSongIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "refusedReason" TEXT,
    "processedByStaffId" UUID,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerLicenseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerLicenseOrderSong" (
    "orderId" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "songId" VARCHAR(64) NOT NULL,

    CONSTRAINT "PlayerLicenseOrderSong_pkey" PRIMARY KEY ("orderId","songId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerLicenseOrder_licenseId_key" ON "PlayerLicenseOrder"("licenseId");

-- CreateIndex
CREATE INDEX "PlayerLicenseOrder_status_createdAt_idx" ON "PlayerLicenseOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerLicenseOrder_playerId_createdAt_idx" ON "PlayerLicenseOrder"("playerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Arrangement_songId_key" ON "Arrangement"("songId");

-- AddForeignKey
ALTER TABLE "PlayerLicenseOrder" ADD CONSTRAINT "PlayerLicenseOrder_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "RegisteredPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLicenseOrder" ADD CONSTRAINT "PlayerLicenseOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLicenseOrder" ADD CONSTRAINT "PlayerLicenseOrder_processedByStaffId_fkey" FOREIGN KEY ("processedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLicenseOrderSong" ADD CONSTRAINT "PlayerLicenseOrderSong_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PlayerLicenseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLicenseOrderSong" ADD CONSTRAINT "PlayerLicenseOrderSong_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- At most one WAITING order per player: new music for a player that already waits only
-- refreshes that order.
CREATE UNIQUE INDEX "PlayerLicenseOrder_one_waiting_per_player" ON "PlayerLicenseOrder"("playerId") WHERE "status" = 'WAITING';

-- Last line of defence on the values that end up in (or come from) a licence.
ALTER TABLE "Arrangement" ADD CONSTRAINT "Arrangement_songId_format"
  CHECK ("songId" IS NULL OR "songId" ~ '^[A-Za-z0-9._-]{1,64}$');
ALTER TABLE "PlayerLicenseOrderSong" ADD CONSTRAINT "PlayerLicenseOrderSong_songId_format"
  CHECK ("songId" ~ '^[A-Za-z0-9._-]{1,64}$');
ALTER TABLE "PlayerLicenseOrder" ADD CONSTRAINT "PlayerLicenseOrder_edition"
  CHECK ("edition" IN ('standard', 'pro'));
ALTER TABLE "PlayerLicenseOrder" ADD CONSTRAINT "PlayerLicenseOrder_validUntil_format"
  CHECK ("validUntil" IS NULL OR "validUntil" ~ '^\d{4}-\d{2}-\d{2}$');
ALTER TABLE "PlayerLicenseOrder" ADD CONSTRAINT "PlayerLicenseOrder_dmiUserId_range"
  CHECK ("dmiUserId" IS NULL OR "dmiUserId" BETWEEN 1 AND 16777215);
ALTER TABLE "PlayerLicenseOrder" ADD CONSTRAINT "PlayerLicenseOrder_done_has_file"
  CHECK ("status" <> 'DONE' OR ("licenseId" IS NOT NULL AND "fileSha256" IS NOT NULL AND "storageKey" IS NOT NULL));
