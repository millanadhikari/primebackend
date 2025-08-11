-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "title" TEXT;
