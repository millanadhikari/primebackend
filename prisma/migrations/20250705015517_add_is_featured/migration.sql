-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- Unique constraint: only one blog post can be featured at a time
CREATE UNIQUE INDEX only_one_featured_blog
ON "Blog" ("isFeatured")
WHERE "isFeatured" = true;