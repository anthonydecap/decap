-- CreateEnum
CREATE TYPE "MusicLicenseStatus" AS ENUM ('UNASSIGNED', 'ACTIVE', 'TRANSFER_PENDING', 'RETIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "MusicLicenseSource" AS ENUM ('PURCHASE', 'BUNDLE', 'ADDITIONAL_PLAYER_PURCHASE', 'ADMIN_GRANT', 'PROMOTION', 'CUSTOMER_SERVICE', 'PLAYER_STARTER_PACK', 'LEGACY_IMPORT', 'LEGACY_MIGRATION', 'TRANSFER', 'REPLACEMENT_TRANSFER');

-- CreateEnum
CREATE TYPE "MusicLicenseEventType" AS ENUM ('CREATED', 'ASSIGNED', 'TRANSFERRED_OUT', 'TRANSFERRED_IN', 'RETIRED', 'REVOKED', 'REACTIVATED');

-- CreateEnum
CREATE TYPE "MusicTransferType" AS ENUM ('HARDWARE_REPLACEMENT', 'WARRANTY_REPLACEMENT', 'COMPUTER_REPLACEMENT', 'UPGRADE', 'CUSTOMER_PLAYER_TRANSFER', 'PLAYER_RESALE', 'ADMIN_CORRECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "MusicTransferMode" AS ENUM ('MOVE', 'COPY', 'PLAYER_OWNERSHIP');

-- CreateEnum
CREATE TYPE "MusicTransferStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- DropIndex
DROP INDEX "CartItem_cartId_arrangementId_key";

-- DropIndex
DROP INDEX "CartItem_cartId_bundleId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "targetPlayerId" UUID;

-- AlterTable
ALTER TABLE "DeliveryArtifact" ADD COLUMN     "musicLicenseId" UUID,
ADD COLUMN     "registeredPlayerId" UUID;

-- AlterTable
ALTER TABLE "EncodingJob" ADD COLUMN     "musicLicenseId" UUID,
ADD COLUMN     "registeredPlayerId" UUID;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "targetPlayerId" UUID,
ADD COLUMN     "targetPlayerNameSnapshot" TEXT,
ADD COLUMN     "targetRegistrationMaskedSnapshot" TEXT;

-- AlterTable
ALTER TABLE "OrderItemAllocation" ADD COLUMN     "additionalPlayer" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PlayerType" ADD COLUMN     "softwareProductId" UUID,
ADD COLUMN     "starterBundleId" UUID,
ADD COLUMN     "supportsMusicLibrary" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RegisteredPlayer" ADD COLUMN     "friendlyName" TEXT;

-- CreateTable
CREATE TABLE "MusicLicense" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "entitlementId" UUID,
    "licensedPlayerId" UUID,
    "status" "MusicLicenseStatus" NOT NULL,
    "licenseSource" "MusicLicenseSource" NOT NULL,
    "orderId" UUID,
    "orderItemId" UUID,
    "orderAllocationId" UUID,
    "entitlementSourceId" UUID,
    "originalMusicLicenseId" UUID,
    "pricePaidCents" INTEGER,
    "currency" CHAR(3),
    "grantedByStaffId" UUID,
    "reason" TEXT,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "retiredAt" TIMESTAMP(3),
    "transferredAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "statusReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicLicenseEvent" (
    "id" UUID NOT NULL,
    "musicLicenseId" UUID NOT NULL,
    "type" "MusicLicenseEventType" NOT NULL,
    "fromPlayerId" UUID,
    "toPlayerId" UUID,
    "transferId" UUID,
    "staffId" UUID,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MusicLicenseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicLicenseTransfer" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "type" "MusicTransferType" NOT NULL,
    "mode" "MusicTransferMode" NOT NULL,
    "status" "MusicTransferStatus" NOT NULL DEFAULT 'COMPLETED',
    "fromPlayerId" UUID NOT NULL,
    "toPlayerId" UUID,
    "customerId" UUID NOT NULL,
    "newCustomerId" UUID,
    "libraryPolicy" TEXT,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "licenseCount" INTEGER NOT NULL DEFAULT 0,
    "createdByStaffId" UUID NOT NULL,
    "approvedByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MusicLicenseTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlayerTypeToSystemProfile" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PlayerTypeToSystemProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MusicLicense_orderAllocationId_key" ON "MusicLicense"("orderAllocationId");

-- CreateIndex
CREATE INDEX "MusicLicense_customerId_status_idx" ON "MusicLicense"("customerId", "status");

-- CreateIndex
CREATE INDEX "MusicLicense_licensedPlayerId_status_idx" ON "MusicLicense"("licensedPlayerId", "status");

-- CreateIndex
CREATE INDEX "MusicLicense_arrangementId_idx" ON "MusicLicense"("arrangementId");

-- CreateIndex
CREATE INDEX "MusicLicense_needsReview_idx" ON "MusicLicense"("needsReview");

-- CreateIndex
CREATE INDEX "MusicLicenseEvent_musicLicenseId_createdAt_idx" ON "MusicLicenseEvent"("musicLicenseId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MusicLicenseTransfer_number_key" ON "MusicLicenseTransfer"("number");

-- CreateIndex
CREATE INDEX "MusicLicenseTransfer_customerId_createdAt_idx" ON "MusicLicenseTransfer"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "MusicLicenseTransfer_fromPlayerId_idx" ON "MusicLicenseTransfer"("fromPlayerId");

-- CreateIndex
CREATE INDEX "MusicLicenseTransfer_toPlayerId_idx" ON "MusicLicenseTransfer"("toPlayerId");

-- CreateIndex
CREATE INDEX "_PlayerTypeToSystemProfile_B_index" ON "_PlayerTypeToSystemProfile"("B");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "DeliveryArtifact_musicLicenseId_idx" ON "DeliveryArtifact"("musicLicenseId");

-- CreateIndex
CREATE INDEX "RegisteredPlayer_friendlyName_idx" ON "RegisteredPlayer"("friendlyName");

-- AddForeignKey
ALTER TABLE "PlayerType" ADD CONSTRAINT "PlayerType_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerType" ADD CONSTRAINT "PlayerType_starterBundleId_fkey" FOREIGN KEY ("starterBundleId") REFERENCES "Bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncodingJob" ADD CONSTRAINT "EncodingJob_musicLicenseId_fkey" FOREIGN KEY ("musicLicenseId") REFERENCES "MusicLicense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncodingJob" ADD CONSTRAINT "EncodingJob_registeredPlayerId_fkey" FOREIGN KEY ("registeredPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryArtifact" ADD CONSTRAINT "DeliveryArtifact_musicLicenseId_fkey" FOREIGN KEY ("musicLicenseId") REFERENCES "MusicLicense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryArtifact" ADD CONSTRAINT "DeliveryArtifact_registeredPlayerId_fkey" FOREIGN KEY ("registeredPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_targetPlayerId_fkey" FOREIGN KEY ("targetPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_targetPlayerId_fkey" FOREIGN KEY ("targetPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_licensedPlayerId_fkey" FOREIGN KEY ("licensedPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_orderAllocationId_fkey" FOREIGN KEY ("orderAllocationId") REFERENCES "OrderItemAllocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_entitlementSourceId_fkey" FOREIGN KEY ("entitlementSourceId") REFERENCES "EntitlementSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_originalMusicLicenseId_fkey" FOREIGN KEY ("originalMusicLicenseId") REFERENCES "MusicLicense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicense" ADD CONSTRAINT "MusicLicense_grantedByStaffId_fkey" FOREIGN KEY ("grantedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseEvent" ADD CONSTRAINT "MusicLicenseEvent_musicLicenseId_fkey" FOREIGN KEY ("musicLicenseId") REFERENCES "MusicLicense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseEvent" ADD CONSTRAINT "MusicLicenseEvent_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "MusicLicenseTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseEvent" ADD CONSTRAINT "MusicLicenseEvent_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseTransfer" ADD CONSTRAINT "MusicLicenseTransfer_fromPlayerId_fkey" FOREIGN KEY ("fromPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseTransfer" ADD CONSTRAINT "MusicLicenseTransfer_toPlayerId_fkey" FOREIGN KEY ("toPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseTransfer" ADD CONSTRAINT "MusicLicenseTransfer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseTransfer" ADD CONSTRAINT "MusicLicenseTransfer_newCustomerId_fkey" FOREIGN KEY ("newCustomerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseTransfer" ADD CONSTRAINT "MusicLicenseTransfer_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicLicenseTransfer" ADD CONSTRAINT "MusicLicenseTransfer_approvedByStaffId_fkey" FOREIGN KEY ("approvedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerTypeToSystemProfile" ADD CONSTRAINT "_PlayerTypeToSystemProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "PlayerType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerTypeToSystemProfile" ADD CONSTRAINT "_PlayerTypeToSystemProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "SystemProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- One music line per cart + item + target player ("assign later" = NULL counts as one target).
CREATE UNIQUE INDEX "CartItem_arrangement_target_key" ON "CartItem"("cartId", "arrangementId", COALESCE("targetPlayerId", '00000000-0000-0000-0000-000000000000'::uuid)) WHERE "arrangementId" IS NOT NULL;
CREATE UNIQUE INDEX "CartItem_bundle_target_key" ON "CartItem"("cartId", "bundleId", COALESCE("targetPlayerId", '00000000-0000-0000-0000-000000000000'::uuid)) WHERE "bundleId" IS NOT NULL;

-- One live playback license per player + arrangement (history rows are RETIRED/REVOKED/UNASSIGNED).
CREATE UNIQUE INDEX "MusicLicense_player_arrangement_live_key" ON "MusicLicense"("licensedPlayerId", "arrangementId") WHERE "status" IN ('ACTIVE', 'TRANSFER_PENDING');

-- Transfer references start at TRF-1001.
ALTER SEQUENCE "MusicLicenseTransfer_number_seq" RESTART WITH 1001;
