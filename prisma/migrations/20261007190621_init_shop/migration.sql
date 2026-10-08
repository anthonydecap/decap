-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'CATALOG_MANAGER', 'FINANCE');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS', 'PRIVACY');

-- CreateEnum
CREATE TYPE "CatalogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RightsStatus" AS ENUM ('NOT_REVIEWED', 'PENDING_REVIEW', 'CLEARED', 'PUBLIC_DOMAIN', 'RESTRICTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RoyaltyBasis" AS ENUM ('PERCENT_OF_NET', 'FIXED_PER_UNIT', 'NONE');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('SOURCE_MIDI', 'SOURCE_DMI', 'SOURCE_AUDIO', 'SOURCE_VIDEO', 'PREVIEW_AUDIO', 'PREVIEW_VIDEO', 'COVER_IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "StorageStore" AS ENUM ('MASTERS', 'DELIVERIES', 'PREVIEWS');

-- CreateEnum
CREATE TYPE "AssetVersionStatus" AS ENUM ('UPLOADING', 'VALIDATING', 'VALID', 'INVALID', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ImportBatchStatus" AS ENUM ('DRAFT', 'UPLOADING', 'VALIDATING', 'REVIEW_REQUIRED', 'READY', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportItemStatus" AS ENUM ('QUEUED', 'UPLOADING', 'UPLOADED', 'VALIDATING', 'READY', 'NEEDS_REVIEW', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "EncodingJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "CartItemType" AS ENUM ('ARRANGEMENT', 'BUNDLE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FULFILLED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELED', 'FAILED');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "EntitlementSourceType" AS ENUM ('PURCHASE', 'BUNDLE', 'ADMIN_GRANT', 'PROMOTION', 'LEGACY_IMPORT');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "RoyaltyEntryType" AS ENUM ('SALE', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PayoutBatchStatus" AS ENUM ('DRAFT', 'APPROVED', 'PAID', 'CANCELED');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('STAFF', 'CUSTOMER', 'SYSTEM', 'STRIPE');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "authSubject" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT,
    "lastName" TEXT,
    "countryCode" CHAR(2),
    "preferredCurrency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "stripeCustomerId" TEXT,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAccount" (
    "id" UUID NOT NULL,
    "authSubject" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "role" "StaffRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalAcceptance" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "documentType" "LegalDocumentType" NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,

    CONSTRAINT "LegalAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "originalArtist" TEXT,
    "composer" TEXT,
    "year" INTEGER,
    "era" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arranger" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "contactEmail" TEXT,
    "defaultRoyaltyBasis" "RoyaltyBasis" NOT NULL DEFAULT 'PERCENT_OF_NET',
    "defaultRoyaltyRateBps" INTEGER NOT NULL DEFAULT 0,
    "defaultRoyaltyFixedCents" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arranger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemProfile" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "description" TEXT,
    "isGeneric" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrangementCompatibility" (
    "arrangementId" UUID NOT NULL,
    "systemProfileId" UUID NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ArrangementCompatibility_pkey" PRIMARY KEY ("arrangementId","systemProfileId")
);

-- CreateTable
CREATE TABLE "Arrangement" (
    "id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "workId" UUID NOT NULL,
    "arrangerId" UUID NOT NULL,
    "displayTitle" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "priceCents" INTEGER NOT NULL,
    "durationSeconds" INTEGER,
    "tempoBpm" INTEGER,
    "musicalKey" TEXT,
    "timeSignature" TEXT,
    "difficulty" INTEGER,
    "releaseDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "searchKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compatibilityNotes" TEXT,
    "containsMidi" BOOLEAN NOT NULL DEFAULT false,
    "containsAudio" BOOLEAN NOT NULL DEFAULT false,
    "containsVideo" BOOLEAN NOT NULL DEFAULT false,
    "dmiFormatVersion" TEXT,
    "internalNotes" TEXT,
    "royaltyBasis" "RoyaltyBasis",
    "royaltyRateBps" INTEGER,
    "royaltyFixedCents" INTEGER,
    "rightsStatus" "RightsStatus" NOT NULL DEFAULT 'NOT_REVIEWED',
    "rightsTerritory" TEXT,
    "licenseReference" TEXT,
    "licenseStartsAt" TIMESTAMP(3),
    "licenseEndsAt" TIMESTAMP(3),
    "rightsNotes" TEXT,
    "rightsProofAssetId" UUID,
    "rightsReviewedAt" TIMESTAMP(3),
    "rightsReviewedByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" UUID NOT NULL,
    "kind" "AssetKind" NOT NULL,
    "arrangementId" UUID,
    "bundleId" UUID,
    "label" TEXT,
    "activeVersionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetVersion" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageStore" "StorageStore" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "declaredMimeType" TEXT NOT NULL,
    "mimeType" TEXT,
    "declaredBytes" BIGINT NOT NULL,
    "bytes" BIGINT,
    "declaredSha256" CHAR(64),
    "sha256" CHAR(64),
    "status" "AssetVersionStatus" NOT NULL DEFAULT 'UPLOADING',
    "validationErrors" JSONB,
    "validationWarnings" JSONB,
    "technicalMetadata" JSONB,
    "uploadedByStaffId" UUID,
    "uploadUrlExpiresAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" UUID NOT NULL,
    "label" TEXT,
    "createdByStaffId" UUID NOT NULL,
    "status" "ImportBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "uploadedItems" INTEGER NOT NULL DEFAULT 0,
    "validItems" INTEGER NOT NULL DEFAULT 0,
    "failedItems" INTEGER NOT NULL DEFAULT 0,
    "dryRunSummary" JSONB,
    "manifestFilename" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportMetadataRow" (
    "id" UUID NOT NULL,
    "importBatchId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "raw" JSONB NOT NULL,
    "normalized" JSONB,
    "errors" JSONB,
    "warnings" JSONB,
    "sku" TEXT,
    "resultingArrangementId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportMetadataRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatchItem" (
    "id" UUID NOT NULL,
    "importBatchId" UUID NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "relativePath" TEXT,
    "detectedAssetKind" "AssetKind",
    "targetArrangementId" UUID,
    "targetSku" TEXT,
    "metadataRowId" UUID,
    "storageStore" "StorageStore",
    "storageKey" TEXT,
    "declaredMimeType" TEXT,
    "declaredBytes" BIGINT,
    "declaredSha256" CHAR(64),
    "bytes" BIGINT,
    "sha256" CHAR(64),
    "status" "ImportItemStatus" NOT NULL DEFAULT 'QUEUED',
    "validationErrors" JSONB,
    "validationWarnings" JSONB,
    "technicalMetadata" JSONB,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "resultingAssetVersionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportBatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtectionProfile" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "secretRef" TEXT NOT NULL,
    "config" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtectionProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncodingJob" (
    "id" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "sourceAssetVersionId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "deviceRegistrationRef" TEXT,
    "encoderVersion" TEXT NOT NULL,
    "protectionProfileVersion" TEXT NOT NULL,
    "status" "EncodingJobStatus" NOT NULL DEFAULT 'QUEUED',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "deliveryArtifactId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EncodingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryArtifact" (
    "id" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "sourceAssetVersionId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "deviceRegistrationRef" TEXT,
    "encoderVersion" TEXT NOT NULL,
    "protectionProfileVersion" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "outputObjectKey" TEXT NOT NULL,
    "bytes" BIGINT NOT NULL,
    "sha256" CHAR(64) NOT NULL,
    "regeneratedFromArtifactId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "priceCents" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleItem" (
    "id" UUID NOT NULL,
    "bundleId" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" UUID NOT NULL,
    "customerId" UUID,
    "anonymousToken" TEXT,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "itemType" "CartItemType" NOT NULL,
    "arrangementId" UUID,
    "bundleId" UUID,
    "lastSeenPriceCents" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "currency" CHAR(3) NOT NULL,
    "retailTotalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "refundedCents" INTEGER NOT NULL DEFAULT 0,
    "pricingHash" TEXT NOT NULL,
    "pricingSnapshot" JSONB NOT NULL,
    "customerEmailSnapshot" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "paidAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "receiptSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "itemType" "CartItemType" NOT NULL,
    "arrangementId" UUID,
    "bundleId" UUID,
    "skuSnapshot" TEXT NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "retailValueCents" INTEGER NOT NULL,
    "chargedCents" INTEGER NOT NULL,
    "bundlePriceCents" INTEGER,
    "bundleRetailTotalCents" INTEGER,
    "bundleItemCount" INTEGER,
    "excludedArrangementIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemAllocation" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "orderItemId" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "arrangerId" UUID NOT NULL,
    "skuSnapshot" TEXT NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "retailValueCents" INTEGER NOT NULL,
    "allocatedCents" INTEGER NOT NULL,
    "royaltyBasis" "RoyaltyBasis" NOT NULL,
    "royaltyRateBps" INTEGER NOT NULL,
    "royaltyFixedCents" INTEGER,
    "royaltyCents" INTEGER NOT NULL,
    "refundedCents" INTEGER NOT NULL DEFAULT 0,
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "OrderItemAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstGrantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitlementSource" (
    "id" UUID NOT NULL,
    "entitlementId" UUID NOT NULL,
    "sourceType" "EntitlementSourceType" NOT NULL,
    "orderAllocationId" UUID,
    "sourceReference" TEXT,
    "grantedByStaffId" UUID,
    "grantReason" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "revokedByStaffId" UUID,

    CONSTRAINT "EntitlementSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "stripeRefundId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "requestedByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundAllocation" (
    "id" UUID NOT NULL,
    "refundId" UUID NOT NULL,
    "allocationId" UUID NOT NULL,
    "amountCents" INTEGER NOT NULL,

    CONSTRAINT "RefundAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "livemode" BOOLEAN NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltyLedgerEntry" (
    "id" UUID NOT NULL,
    "arrangerId" UUID NOT NULL,
    "arrangementId" UUID NOT NULL,
    "orderId" UUID,
    "allocationId" UUID,
    "refundId" UUID,
    "entryType" "RoyaltyEntryType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "netRevenueCents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "basisSnapshot" "RoyaltyBasis" NOT NULL,
    "rateBpsSnapshot" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payoutBatchId" UUID,
    "note" TEXT,
    "idempotencyKey" TEXT NOT NULL,

    CONSTRAINT "RoyaltyLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutBatch" (
    "id" UUID NOT NULL,
    "arrangerId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "PayoutBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "totalCents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "createdByStaffId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PayoutBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorStaffId" UUID,
    "actorCustomerId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateTable
CREATE TABLE "_ArrangementToGenre" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ArrangementToGenre_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArrangementToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ArrangementToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_authSubject_key" ON "Customer"("authSubject");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "Customer"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAccount_authSubject_key" ON "StaffAccount"("authSubject");

-- CreateIndex
CREATE UNIQUE INDEX "LegalAcceptance_customerId_documentType_documentVersion_key" ON "LegalAcceptance"("customerId", "documentType", "documentVersion");

-- CreateIndex
CREATE INDEX "Work_title_idx" ON "Work"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Arranger_slug_key" ON "Arranger"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SystemProfile_code_key" ON "SystemProfile"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Arrangement_sku_key" ON "Arrangement"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Arrangement_slug_key" ON "Arrangement"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Arrangement_rightsProofAssetId_key" ON "Arrangement"("rightsProofAssetId");

-- CreateIndex
CREATE INDEX "Arrangement_status_featured_idx" ON "Arrangement"("status", "featured");

-- CreateIndex
CREATE INDEX "Arrangement_arrangerId_idx" ON "Arrangement"("arrangerId");

-- CreateIndex
CREATE INDEX "Arrangement_workId_idx" ON "Arrangement"("workId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_activeVersionId_key" ON "Asset"("activeVersionId");

-- CreateIndex
CREATE INDEX "Asset_arrangementId_kind_idx" ON "Asset"("arrangementId", "kind");

-- CreateIndex
CREATE INDEX "Asset_bundleId_kind_idx" ON "Asset"("bundleId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "AssetVersion_storageKey_key" ON "AssetVersion"("storageKey");

-- CreateIndex
CREATE INDEX "AssetVersion_sha256_idx" ON "AssetVersion"("sha256");

-- CreateIndex
CREATE INDEX "AssetVersion_status_idx" ON "AssetVersion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AssetVersion_assetId_versionNumber_key" ON "AssetVersion"("assetId", "versionNumber");

-- CreateIndex
CREATE INDEX "ImportBatch_createdAt_idx" ON "ImportBatch"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImportMetadataRow_importBatchId_rowNumber_key" ON "ImportMetadataRow"("importBatchId", "rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ImportBatchItem_storageKey_key" ON "ImportBatchItem"("storageKey");

-- CreateIndex
CREATE INDEX "ImportBatchItem_importBatchId_status_idx" ON "ImportBatchItem"("importBatchId", "status");

-- CreateIndex
CREATE INDEX "ImportBatchItem_sha256_idx" ON "ImportBatchItem"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "ProtectionProfile_name_version_key" ON "ProtectionProfile"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "EncodingJob_deliveryArtifactId_key" ON "EncodingJob"("deliveryArtifactId");

-- CreateIndex
CREATE INDEX "EncodingJob_status_createdAt_idx" ON "EncodingJob"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryArtifact_outputObjectKey_key" ON "DeliveryArtifact"("outputObjectKey");

-- CreateIndex
CREATE INDEX "DeliveryArtifact_customerId_arrangementId_sourceAssetVersio_idx" ON "DeliveryArtifact"("customerId", "arrangementId", "sourceAssetVersionId", "deviceRegistrationRef", "encoderVersion", "protectionProfileVersion");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_sku_key" ON "Bundle"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Bundle_slug_key" ON "Bundle"("slug");

-- CreateIndex
CREATE INDEX "Bundle_status_featured_idx" ON "Bundle"("status", "featured");

-- CreateIndex
CREATE INDEX "BundleItem_arrangementId_idx" ON "BundleItem"("arrangementId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleItem_bundleId_arrangementId_key" ON "BundleItem"("bundleId", "arrangementId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_customerId_key" ON "Cart"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_anonymousToken_key" ON "Cart"("anonymousToken");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_arrangementId_key" ON "CartItem"("cartId", "arrangementId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_bundleId_key" ON "CartItem"("cartId", "bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Order_customerId_status_idx" ON "Order"("customerId", "status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItemAllocation_orderId_idx" ON "OrderItemAllocation"("orderId");

-- CreateIndex
CREATE INDEX "OrderItemAllocation_arrangementId_idx" ON "OrderItemAllocation"("arrangementId");

-- CreateIndex
CREATE INDEX "OrderItemAllocation_arrangerId_idx" ON "OrderItemAllocation"("arrangerId");

-- CreateIndex
CREATE INDEX "Entitlement_customerId_status_idx" ON "Entitlement"("customerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_customerId_arrangementId_key" ON "Entitlement"("customerId", "arrangementId");

-- CreateIndex
CREATE UNIQUE INDEX "EntitlementSource_orderAllocationId_key" ON "EntitlementSource"("orderAllocationId");

-- CreateIndex
CREATE INDEX "EntitlementSource_entitlementId_idx" ON "EntitlementSource"("entitlementId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_stripeRefundId_key" ON "Refund"("stripeRefundId");

-- CreateIndex
CREATE INDEX "Refund_orderId_idx" ON "Refund"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundAllocation_refundId_allocationId_key" ON "RefundAllocation"("refundId", "allocationId");

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyLedgerEntry_idempotencyKey_key" ON "RoyaltyLedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "RoyaltyLedgerEntry_arrangerId_occurredAt_idx" ON "RoyaltyLedgerEntry"("arrangerId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "RateLimitBucket_windowStart_idx" ON "RateLimitBucket"("windowStart");

-- CreateIndex
CREATE INDEX "_ArrangementToGenre_B_index" ON "_ArrangementToGenre"("B");

-- CreateIndex
CREATE INDEX "_ArrangementToTag_B_index" ON "_ArrangementToTag"("B");

-- AddForeignKey
ALTER TABLE "LegalAcceptance" ADD CONSTRAINT "LegalAcceptance_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrangementCompatibility" ADD CONSTRAINT "ArrangementCompatibility_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrangementCompatibility" ADD CONSTRAINT "ArrangementCompatibility_systemProfileId_fkey" FOREIGN KEY ("systemProfileId") REFERENCES "SystemProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrangement" ADD CONSTRAINT "Arrangement_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrangement" ADD CONSTRAINT "Arrangement_arrangerId_fkey" FOREIGN KEY ("arrangerId") REFERENCES "Arranger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrangement" ADD CONSTRAINT "Arrangement_rightsProofAssetId_fkey" FOREIGN KEY ("rightsProofAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "AssetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetVersion" ADD CONSTRAINT "AssetVersion_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetVersion" ADD CONSTRAINT "AssetVersion_uploadedByStaffId_fkey" FOREIGN KEY ("uploadedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportMetadataRow" ADD CONSTRAINT "ImportMetadataRow_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatchItem" ADD CONSTRAINT "ImportBatchItem_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatchItem" ADD CONSTRAINT "ImportBatchItem_targetArrangementId_fkey" FOREIGN KEY ("targetArrangementId") REFERENCES "Arrangement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatchItem" ADD CONSTRAINT "ImportBatchItem_metadataRowId_fkey" FOREIGN KEY ("metadataRowId") REFERENCES "ImportMetadataRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportBatchItem" ADD CONSTRAINT "ImportBatchItem_resultingAssetVersionId_fkey" FOREIGN KEY ("resultingAssetVersionId") REFERENCES "AssetVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncodingJob" ADD CONSTRAINT "EncodingJob_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncodingJob" ADD CONSTRAINT "EncodingJob_sourceAssetVersionId_fkey" FOREIGN KEY ("sourceAssetVersionId") REFERENCES "AssetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncodingJob" ADD CONSTRAINT "EncodingJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncodingJob" ADD CONSTRAINT "EncodingJob_deliveryArtifactId_fkey" FOREIGN KEY ("deliveryArtifactId") REFERENCES "DeliveryArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryArtifact" ADD CONSTRAINT "DeliveryArtifact_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryArtifact" ADD CONSTRAINT "DeliveryArtifact_sourceAssetVersionId_fkey" FOREIGN KEY ("sourceAssetVersionId") REFERENCES "AssetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryArtifact" ADD CONSTRAINT "DeliveryArtifact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryArtifact" ADD CONSTRAINT "DeliveryArtifact_regeneratedFromArtifactId_fkey" FOREIGN KEY ("regeneratedFromArtifactId") REFERENCES "DeliveryArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAllocation" ADD CONSTRAINT "OrderItemAllocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAllocation" ADD CONSTRAINT "OrderItemAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementSource" ADD CONSTRAINT "EntitlementSource_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "Entitlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementSource" ADD CONSTRAINT "EntitlementSource_orderAllocationId_fkey" FOREIGN KEY ("orderAllocationId") REFERENCES "OrderItemAllocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundAllocation" ADD CONSTRAINT "RefundAllocation_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundAllocation" ADD CONSTRAINT "RefundAllocation_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "OrderItemAllocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_arrangerId_fkey" FOREIGN KEY ("arrangerId") REFERENCES "Arranger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "OrderItemAllocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltyLedgerEntry" ADD CONSTRAINT "RoyaltyLedgerEntry_payoutBatchId_fkey" FOREIGN KEY ("payoutBatchId") REFERENCES "PayoutBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutBatch" ADD CONSTRAINT "PayoutBatch_arrangerId_fkey" FOREIGN KEY ("arrangerId") REFERENCES "Arranger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArrangementToGenre" ADD CONSTRAINT "_ArrangementToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "Arrangement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArrangementToGenre" ADD CONSTRAINT "_ArrangementToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArrangementToTag" ADD CONSTRAINT "_ArrangementToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Arrangement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArrangementToTag" ADD CONSTRAINT "_ArrangementToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
