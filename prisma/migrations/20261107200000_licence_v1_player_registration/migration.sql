-- Licence v1 (contract C7, Decap-System): players register with their `.decapreq`,
-- every customer gets a Decap customer number `K<number>`.

-- Customer number: own sequence starting at 1001, so the numbers K0001..K1000 that were
-- handed out by hand before the shop existed can never be issued twice. Existing customers
-- get a number now, new ones on insert. Same result as Prisma's SERIAL, only the start differs.
CREATE SEQUENCE "Customer_customerNumber_seq" AS INTEGER START WITH 1001;
ALTER TABLE "Customer" ADD COLUMN "customerNumber" INTEGER NOT NULL DEFAULT nextval('"Customer_customerNumber_seq"');
ALTER SEQUENCE "Customer_customerNumber_seq" OWNED BY "Customer"."customerNumber";
CREATE UNIQUE INDEX "Customer_customerNumber_key" ON "Customer"("customerNumber");

-- Player ID + public key from the `.decapreq` (both public, lowercase hex).
ALTER TABLE "RegisteredPlayer" ADD COLUMN     "licensePlayerId" CHAR(32),
ADD COLUMN     "licensePublicKey" CHAR(64),
ADD COLUMN     "licenseRequestAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "RegisteredPlayer_licensePlayerId_key" ON "RegisteredPlayer"("licensePlayerId");

-- Last line of defence: only well-formed values, and ID and key always together.
ALTER TABLE "RegisteredPlayer" ADD CONSTRAINT "RegisteredPlayer_licensePlayerId_hex"
  CHECK ("licensePlayerId" IS NULL OR "licensePlayerId" ~ '^[0-9a-f]{32}$');
ALTER TABLE "RegisteredPlayer" ADD CONSTRAINT "RegisteredPlayer_licensePublicKey_hex"
  CHECK ("licensePublicKey" IS NULL OR "licensePublicKey" ~ '^[0-9a-f]{64}$');
ALTER TABLE "RegisteredPlayer" ADD CONSTRAINT "RegisteredPlayer_license_pair"
  CHECK (("licensePlayerId" IS NULL) = ("licensePublicKey" IS NULL));
