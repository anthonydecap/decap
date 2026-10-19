-- CreateEnum
CREATE TYPE "SoftwareProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISCONTINUED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SoftwareLicenseType" AS ENUM ('PERPETUAL');

-- CreateEnum
CREATE TYPE "SoftwarePlatform" AS ENUM ('WINDOWS', 'MACOS', 'LINUX');

-- CreateEnum
CREATE TYPE "SoftwareArchitecture" AS ENUM ('X64', 'X86', 'ARM64', 'UNIVERSAL');

-- CreateEnum
CREATE TYPE "SoftwareReleaseChannel" AS ENUM ('STABLE', 'BETA', 'LEGACY');

-- CreateEnum
CREATE TYPE "SoftwareReleaseStatus" AS ENUM ('UPLOADING', 'DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SoftwareDownloadSource" AS ENUM ('SOFTWARE_PAGE', 'ACCOUNT', 'ADMIN', 'OTHER');

-- CreateEnum
CREATE TYPE "SoftwareLicenseStatus" AS ENUM ('PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SoftwareLicenseSource" AS ENUM ('PURCHASE', 'ADMIN', 'LEGACY_IMPORT', 'PROMOTION');

-- CreateEnum
CREATE TYPE "SoftwareActivationStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'WAITING_FOR_CUSTOMER', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SoftwareInstallationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'RETIRED');

-- AlterEnum
ALTER TYPE "CartItemType" ADD VALUE 'SOFTWARE_LICENSE';

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "softwareProductId" UUID;

-- AlterTable
ALTER TABLE "CustomerTask" ADD COLUMN     "softwareActivationRequestId" UUID;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "refundedCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "softwareProductId" UUID;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "softwareActivationRequestId" UUID,
ADD COLUMN     "softwareInstallationId" UUID,
ADD COLUMN     "softwareLicenseId" UUID,
ADD COLUMN     "softwareProductId" UUID;

-- CreateTable
CREATE TABLE "SoftwareProduct" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "systemRequirements" TEXT,
    "status" "SoftwareProductStatus" NOT NULL DEFAULT 'DRAFT',
    "trialAvailable" BOOLEAN NOT NULL DEFAULT true,
    "licenseRequiredForFullUse" BOOLEAN NOT NULL DEFAULT true,
    "currentVersion" TEXT,
    "licenseType" "SoftwareLicenseType" NOT NULL DEFAULT 'PERPETUAL',
    "defaultLicensePriceCents" INTEGER,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "defaultMaxActivations" INTEGER NOT NULL DEFAULT 1,
    "activationInstructions" TEXT,
    "coverImageKey" TEXT,
    "iconKey" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "SoftwareProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareRelease" (
    "id" UUID NOT NULL,
    "softwareProductId" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "platform" "SoftwarePlatform" NOT NULL DEFAULT 'WINDOWS',
    "architecture" "SoftwareArchitecture" NOT NULL DEFAULT 'X64',
    "releaseChannel" "SoftwareReleaseChannel" NOT NULL DEFAULT 'STABLE',
    "status" "SoftwareReleaseStatus" NOT NULL DEFAULT 'UPLOADING',
    "releaseNotes" TEXT,
    "minimumOsVersion" TEXT,
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "declaredBytes" BIGINT NOT NULL,
    "fileSizeBytes" BIGINT,
    "declaredSha256" CHAR(64),
    "sha256" CHAR(64),
    "validationErrors" JSONB,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isDownloadable" BOOLEAN NOT NULL DEFAULT true,
    "createdByStaffId" UUID,
    "uploadedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoftwareRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareDownload" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "softwareProductId" UUID NOT NULL,
    "softwareReleaseId" UUID NOT NULL,
    "source" "SoftwareDownloadSource" NOT NULL DEFAULT 'OTHER',
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoftwareDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareLicense" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "customerId" UUID NOT NULL,
    "softwareProductId" UUID NOT NULL,
    "orderId" UUID,
    "orderItemId" UUID,
    "status" "SoftwareLicenseStatus" NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "licenseType" "SoftwareLicenseType" NOT NULL DEFAULT 'PERPETUAL',
    "maxActivations" INTEGER NOT NULL DEFAULT 1,
    "licenseSource" "SoftwareLicenseSource" NOT NULL,
    "sourceReference" TEXT,
    "notes" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "statusReason" TEXT,
    "createdByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoftwareLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareActivationRequest" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "softwareLicenseId" UUID NOT NULL,
    "softwareProductId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "status" "SoftwareActivationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "conflictInstallationId" UUID,
    "replacesInstallationId" UUID,
    "customerMessage" TEXT,
    "infoRequest" TEXT,
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "assignedStaffId" UUID,
    "reviewedByStaffId" UUID,
    "reviewedAt" TIMESTAMP(3),
    "softwareInstallationId" UUID,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoftwareActivationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareInstallation" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "softwareProductId" UUID NOT NULL,
    "softwareLicenseId" UUID NOT NULL,
    "registeredPlayerId" UUID,
    "registrationCode" TEXT NOT NULL,
    "registrationIdentifier" TEXT NOT NULL,
    "activationKeyEncrypted" TEXT,
    "status" "SoftwareInstallationStatus" NOT NULL DEFAULT 'ACTIVE',
    "label" TEXT,
    "activatedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "retiredAt" TIMESTAMP(3),
    "retiredReason" TEXT,
    "createdByStaffId" UUID,
    "updatedByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoftwareInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundOrderItem" (
    "id" UUID NOT NULL,
    "refundId" UUID NOT NULL,
    "orderItemId" UUID NOT NULL,
    "amountCents" INTEGER NOT NULL,

    CONSTRAINT "RefundOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareProduct_slug_key" ON "SoftwareProduct"("slug");

-- CreateIndex
CREATE INDEX "SoftwareProduct_status_sortOrder_idx" ON "SoftwareProduct"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareRelease_storageKey_key" ON "SoftwareRelease"("storageKey");

-- CreateIndex
CREATE INDEX "SoftwareRelease_softwareProductId_status_isCurrent_idx" ON "SoftwareRelease"("softwareProductId", "status", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareRelease_softwareProductId_version_platform_architec_key" ON "SoftwareRelease"("softwareProductId", "version", "platform", "architecture", "releaseChannel");

-- CreateIndex
CREATE INDEX "SoftwareDownload_customerId_downloadedAt_idx" ON "SoftwareDownload"("customerId", "downloadedAt");

-- CreateIndex
CREATE INDEX "SoftwareDownload_softwareProductId_downloadedAt_idx" ON "SoftwareDownload"("softwareProductId", "downloadedAt");

-- CreateIndex
CREATE INDEX "SoftwareDownload_softwareReleaseId_idx" ON "SoftwareDownload"("softwareReleaseId");

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareLicense_number_key" ON "SoftwareLicense"("number");

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareLicense_orderItemId_key" ON "SoftwareLicense"("orderItemId");

-- CreateIndex
CREATE INDEX "SoftwareLicense_customerId_softwareProductId_idx" ON "SoftwareLicense"("customerId", "softwareProductId");

-- CreateIndex
CREATE INDEX "SoftwareLicense_status_idx" ON "SoftwareLicense"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareActivationRequest_number_key" ON "SoftwareActivationRequest"("number");

-- CreateIndex
CREATE UNIQUE INDEX "SoftwareActivationRequest_softwareInstallationId_key" ON "SoftwareActivationRequest"("softwareInstallationId");

-- CreateIndex
CREATE INDEX "SoftwareActivationRequest_status_submittedAt_idx" ON "SoftwareActivationRequest"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "SoftwareActivationRequest_customerId_idx" ON "SoftwareActivationRequest"("customerId");

-- CreateIndex
CREATE INDEX "SoftwareActivationRequest_registrationCode_idx" ON "SoftwareActivationRequest"("registrationCode");

-- CreateIndex
CREATE INDEX "SoftwareActivationRequest_softwareLicenseId_idx" ON "SoftwareActivationRequest"("softwareLicenseId");

-- CreateIndex
CREATE INDEX "SoftwareInstallation_customerId_idx" ON "SoftwareInstallation"("customerId");

-- CreateIndex
CREATE INDEX "SoftwareInstallation_softwareLicenseId_status_idx" ON "SoftwareInstallation"("softwareLicenseId", "status");

-- CreateIndex
CREATE INDEX "SoftwareInstallation_registrationCode_idx" ON "SoftwareInstallation"("registrationCode");

-- CreateIndex
CREATE INDEX "SoftwareInstallation_registrationIdentifier_idx" ON "SoftwareInstallation"("registrationIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "RefundOrderItem_refundId_orderItemId_key" ON "RefundOrderItem"("refundId", "orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_softwareProductId_key" ON "CartItem"("cartId", "softwareProductId");

-- CreateIndex
CREATE INDEX "CustomerTask_softwareActivationRequestId_idx" ON "CustomerTask"("softwareActivationRequestId");

-- CreateIndex
CREATE INDEX "SupportTicket_softwareLicenseId_idx" ON "SupportTicket"("softwareLicenseId");

-- AddForeignKey
ALTER TABLE "CustomerTask" ADD CONSTRAINT "CustomerTask_softwareActivationRequestId_fkey" FOREIGN KEY ("softwareActivationRequestId") REFERENCES "SoftwareActivationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_softwareLicenseId_fkey" FOREIGN KEY ("softwareLicenseId") REFERENCES "SoftwareLicense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_softwareInstallationId_fkey" FOREIGN KEY ("softwareInstallationId") REFERENCES "SoftwareInstallation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_softwareActivationRequestId_fkey" FOREIGN KEY ("softwareActivationRequestId") REFERENCES "SoftwareActivationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareRelease" ADD CONSTRAINT "SoftwareRelease_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareRelease" ADD CONSTRAINT "SoftwareRelease_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareDownload" ADD CONSTRAINT "SoftwareDownload_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareDownload" ADD CONSTRAINT "SoftwareDownload_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareDownload" ADD CONSTRAINT "SoftwareDownload_softwareReleaseId_fkey" FOREIGN KEY ("softwareReleaseId") REFERENCES "SoftwareRelease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareLicense" ADD CONSTRAINT "SoftwareLicense_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareLicense" ADD CONSTRAINT "SoftwareLicense_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareLicense" ADD CONSTRAINT "SoftwareLicense_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareLicense" ADD CONSTRAINT "SoftwareLicense_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareLicense" ADD CONSTRAINT "SoftwareLicense_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareActivationRequest" ADD CONSTRAINT "SoftwareActivationRequest_softwareLicenseId_fkey" FOREIGN KEY ("softwareLicenseId") REFERENCES "SoftwareLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareActivationRequest" ADD CONSTRAINT "SoftwareActivationRequest_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareActivationRequest" ADD CONSTRAINT "SoftwareActivationRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareActivationRequest" ADD CONSTRAINT "SoftwareActivationRequest_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareActivationRequest" ADD CONSTRAINT "SoftwareActivationRequest_reviewedByStaffId_fkey" FOREIGN KEY ("reviewedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareActivationRequest" ADD CONSTRAINT "SoftwareActivationRequest_softwareInstallationId_fkey" FOREIGN KEY ("softwareInstallationId") REFERENCES "SoftwareInstallation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareInstallation" ADD CONSTRAINT "SoftwareInstallation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareInstallation" ADD CONSTRAINT "SoftwareInstallation_softwareProductId_fkey" FOREIGN KEY ("softwareProductId") REFERENCES "SoftwareProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareInstallation" ADD CONSTRAINT "SoftwareInstallation_softwareLicenseId_fkey" FOREIGN KEY ("softwareLicenseId") REFERENCES "SoftwareLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareInstallation" ADD CONSTRAINT "SoftwareInstallation_registeredPlayerId_fkey" FOREIGN KEY ("registeredPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareInstallation" ADD CONSTRAINT "SoftwareInstallation_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareInstallation" ADD CONSTRAINT "SoftwareInstallation_updatedByStaffId_fkey" FOREIGN KEY ("updatedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundOrderItem" ADD CONSTRAINT "RefundOrderItem_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundOrderItem" ADD CONSTRAINT "RefundOrderItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

