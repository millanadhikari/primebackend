/*
  Warnings:

  - You are about to drop the column `agedCareRecipientId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `generalInformation` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `usefulInformation` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "agedCareRecipientId",
DROP COLUMN "generalInformation",
DROP COLUMN "usefulInformation",
ADD COLUMN     "agedCareId" TEXT,
ADD COLUMN     "customField" TEXT,
ADD COLUMN     "generalInfo" TEXT,
ADD COLUMN     "invoiceTravel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "needToKnowInfo" TEXT,
ADD COLUMN     "smsReminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usefulInfo" TEXT;

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "contactNumber" TEXT,
    "address" TEXT,
    "relation" TEXT,
    "companyName" TEXT,
    "purchaseOrder" TEXT,
    "referenceNumber" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isBilling" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
