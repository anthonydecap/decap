-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CustomerAccountType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "CrmStatus" AS ENUM ('PROSPECT', 'CUSTOMER', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CustomerSource" AS ENUM ('WEBSITE', 'DIRECT_SALE', 'DEALER', 'REFERRAL', 'TRADE_SHOW', 'LEGACY_IMPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'OTHER');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'RETIRED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('PHONE_CALL', 'EMAIL', 'WHATSAPP', 'IN_PERSON', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunicationDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "SupportCategory" AS ENUM ('PLAYER_REGISTRATION', 'PLAYER_PROBLEM', 'MUSIC_DOWNLOAD', 'MUSIC_PLAYBACK', 'ORDER_PAYMENT', 'ARRANGEMENT_QUESTION', 'ACCOUNT', 'BILLING', 'REFUND_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_SUPPORT', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MessageAuthorType" AS ENUM ('CUSTOMER', 'STAFF', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageVisibility" AS ENUM ('PUBLIC', 'INTERNAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StaffRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "StaffRole" ADD VALUE 'SUPPORT';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "accountType" "CustomerAccountType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyRegistrationNumber" TEXT,
ADD COLUMN     "crmStatus" "CrmStatus" NOT NULL DEFAULT 'PROSPECT',
ADD COLUMN     "customerSource" "CustomerSource",
ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingConsentAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredLanguage" VARCHAR(5),
ADD COLUMN     "vatCountryCode" CHAR(2),
ADD COLUMN     "vatNumber" TEXT;

-- AlterTable
-- `active` becomes `status`. Written in three steps rather than Prisma's drop-and-add so
-- that an already deactivated account stays deactivated instead of silently becoming
-- ACTIVE again, which would hand back admin access.
ALTER TABLE "StaffAccount" ADD COLUMN "createdByStaffId" UUID;
ALTER TABLE "StaffAccount" ADD COLUMN "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE';
UPDATE "StaffAccount" SET "status" = 'DISABLED' WHERE "active" = false;
ALTER TABLE "StaffAccount" DROP COLUMN "active";

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'BILLING',
    "name" TEXT,
    "companyName" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateOrProvince" TEXT,
    "countryCode" CHAR(2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderBillingSnapshot" (
    "orderId" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "companyName" TEXT,
    "vatNumber" TEXT,
    "email" TEXT NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "stateOrProvince" TEXT,
    "countryCode" CHAR(2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderBillingSnapshot_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "PlayerType" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisteredPlayer" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "playerTypeId" UUID NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "registrationIdentifier" TEXT NOT NULL,
    "activationKeyEncrypted" TEXT,
    "serialNumber" TEXT,
    "adminLabel" TEXT,
    "status" "PlayerStatus" NOT NULL DEFAULT 'PENDING',
    "purchaseDate" TIMESTAMP(3),
    "warrantyUntil" TIMESTAMP(3),
    "dealerName" TEXT,
    "registeredAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "retiredAt" TIMESTAMP(3),
    "createdByStaffId" UUID,
    "updatedByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegisteredPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerTag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isAlert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerTagAssignment" (
    "customerId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerTagAssignment_pkey" PRIMARY KEY ("customerId","tagId")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerTask" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "registeredPlayerId" UUID,
    "supportTicketId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "assignedStaffId" UUID,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationLogEntry" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "direction" "CommunicationDirection" NOT NULL DEFAULT 'OUTBOUND',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerActivity" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "staffId" UUID,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "customerId" UUID NOT NULL,
    "registeredPlayerId" UUID,
    "orderId" UUID,
    "arrangementId" UUID,
    "category" "SupportCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'WAITING_FOR_SUPPORT',
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "assignedStaffId" UUID,
    "firstResponseAt" TIMESTAMP(3),
    "lastCustomerReplyAt" TIMESTAMP(3),
    "lastStaffReplyAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "authorType" "MessageAuthorType" NOT NULL,
    "customerId" UUID,
    "staffId" UUID,
    "visibility" "MessageVisibility" NOT NULL DEFAULT 'PUBLIC',
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportAttachment" (
    "id" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerAddress_customerId_type_idx" ON "CustomerAddress"("customerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerType_code_key" ON "PlayerType"("code");

-- CreateIndex
CREATE INDEX "PlayerType_active_idx" ON "PlayerType"("active");

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredPlayer_registrationCode_key" ON "RegisteredPlayer"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "RegisteredPlayer_registrationIdentifier_key" ON "RegisteredPlayer"("registrationIdentifier");

-- CreateIndex
CREATE INDEX "RegisteredPlayer_customerId_status_idx" ON "RegisteredPlayer"("customerId", "status");

-- CreateIndex
CREATE INDEX "RegisteredPlayer_serialNumber_idx" ON "RegisteredPlayer"("serialNumber");

-- CreateIndex
CREATE INDEX "RegisteredPlayer_playerTypeId_idx" ON "RegisteredPlayer"("playerTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerTag_name_key" ON "CustomerTag"("name");

-- CreateIndex
CREATE INDEX "CustomerTagAssignment_tagId_idx" ON "CustomerTagAssignment"("tagId");

-- CreateIndex
CREATE INDEX "CustomerNote_customerId_createdAt_idx" ON "CustomerNote"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerTask_customerId_status_idx" ON "CustomerTask"("customerId", "status");

-- CreateIndex
CREATE INDEX "CustomerTask_assignedStaffId_status_dueAt_idx" ON "CustomerTask"("assignedStaffId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "CustomerTask_status_dueAt_idx" ON "CustomerTask"("status", "dueAt");

-- CreateIndex
CREATE INDEX "CommunicationLogEntry_customerId_occurredAt_idx" ON "CommunicationLogEntry"("customerId", "occurredAt");

-- CreateIndex
CREATE INDEX "CustomerActivity_customerId_occurredAt_idx" ON "CustomerActivity"("customerId", "occurredAt");

-- CreateIndex
CREATE INDEX "CustomerActivity_type_idx" ON "CustomerActivity"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_number_key" ON "SupportTicket"("number");

-- CreateIndex
CREATE INDEX "SupportTicket_status_priority_updatedAt_idx" ON "SupportTicket"("status", "priority", "updatedAt");

-- CreateIndex
CREATE INDEX "SupportTicket_customerId_status_idx" ON "SupportTicket"("customerId", "status");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedStaffId_status_idx" ON "SupportTicket"("assignedStaffId", "status");

-- CreateIndex
CREATE INDEX "SupportTicket_registeredPlayerId_idx" ON "SupportTicket"("registeredPlayerId");

-- CreateIndex
CREATE INDEX "SupportMessage_ticketId_createdAt_idx" ON "SupportMessage"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportAttachment_messageId_idx" ON "SupportAttachment"("messageId");

-- CreateIndex
CREATE INDEX "Customer_crmStatus_idx" ON "Customer"("crmStatus");

-- CreateIndex
CREATE INDEX "Customer_accountType_idx" ON "Customer"("accountType");

-- CreateIndex
CREATE INDEX "Customer_companyName_idx" ON "Customer"("companyName");

-- CreateIndex
CREATE INDEX "Customer_vatNumber_idx" ON "Customer"("vatNumber");

-- CreateIndex
CREATE INDEX "StaffAccount_status_idx" ON "StaffAccount"("status");

-- CreateIndex
CREATE INDEX "StaffAccount_role_idx" ON "StaffAccount"("role");

-- AddForeignKey
ALTER TABLE "StaffAccount" ADD CONSTRAINT "StaffAccount_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBillingSnapshot" ADD CONSTRAINT "OrderBillingSnapshot_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisteredPlayer" ADD CONSTRAINT "RegisteredPlayer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisteredPlayer" ADD CONSTRAINT "RegisteredPlayer_playerTypeId_fkey" FOREIGN KEY ("playerTypeId") REFERENCES "PlayerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisteredPlayer" ADD CONSTRAINT "RegisteredPlayer_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisteredPlayer" ADD CONSTRAINT "RegisteredPlayer_updatedByStaffId_fkey" FOREIGN KEY ("updatedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTagAssignment" ADD CONSTRAINT "CustomerTagAssignment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTagAssignment" ADD CONSTRAINT "CustomerTagAssignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CustomerTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTask" ADD CONSTRAINT "CustomerTask_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTask" ADD CONSTRAINT "CustomerTask_registeredPlayerId_fkey" FOREIGN KEY ("registeredPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTask" ADD CONSTRAINT "CustomerTask_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "SupportTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTask" ADD CONSTRAINT "CustomerTask_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerTask" ADD CONSTRAINT "CustomerTask_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLogEntry" ADD CONSTRAINT "CommunicationLogEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationLogEntry" ADD CONSTRAINT "CommunicationLogEntry_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_registeredPlayerId_fkey" FOREIGN KEY ("registeredPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAttachment" ADD CONSTRAINT "SupportAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "SupportMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

