/*
  Warnings:

  - Added the required column `defaultPassword` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "defaultPassword" TEXT NOT NULL,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "inviteStaffViaSMS" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kinEmail" TEXT,
ADD COLUMN     "kinName" TEXT,
ADD COLUMN     "kinPhone" TEXT,
ADD COLUMN     "kinRelation" TEXT,
ADD COLUMN     "languageSpoken" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "sendOnboardingEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "unitApartmentNumber" TEXT,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
