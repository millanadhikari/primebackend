-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "meta" JSONB,
ADD COLUMN     "targetId" TEXT,
ADD COLUMN     "targetType" TEXT;
