/*
  Warnings:

  - You are about to drop the column `isFirstLogin` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "isFirstLogin";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isFirstLogin" BOOLEAN NOT NULL DEFAULT true;
