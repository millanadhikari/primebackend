/*
  Warnings:

  - You are about to drop the `FormResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_clientId_fkey";

-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_formId_fkey";

-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_userId_fkey";

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "FormResponse";

-- CreateTable
CREATE TABLE "FilledForm" (
    "id" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT,
    "responses" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilledForm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FilledForm" ADD CONSTRAINT "FilledForm_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilledForm" ADD CONSTRAINT "FilledForm_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilledForm" ADD CONSTRAINT "FilledForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
