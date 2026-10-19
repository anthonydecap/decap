-- CreateTable
CREATE TABLE "StaffInvite" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "invitedByStaffId" UUID,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedStaffId" UUID,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDocument" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "registeredPlayerId" UUID,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedByStaffId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffInvite_tokenHash_key" ON "StaffInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "StaffInvite_email_idx" ON "StaffInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDocument_storageKey_key" ON "CustomerDocument"("storageKey");

-- CreateIndex
CREATE INDEX "CustomerDocument_customerId_createdAt_idx" ON "CustomerDocument"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerDocument_registeredPlayerId_idx" ON "CustomerDocument"("registeredPlayerId");

-- AddForeignKey
ALTER TABLE "StaffInvite" ADD CONSTRAINT "StaffInvite_invitedByStaffId_fkey" FOREIGN KEY ("invitedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_registeredPlayerId_fkey" FOREIGN KEY ("registeredPlayerId") REFERENCES "RegisteredPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_uploadedByStaffId_fkey" FOREIGN KEY ("uploadedByStaffId") REFERENCES "StaffAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
