import { PrismaClient } from "@prisma/client";
import { enforceSingleFeatured } from "../prisma/middleware/ensureSingleFeaturedBlog";

const prisma = new PrismaClient();
prisma.$use(enforceSingleFeatured(prisma) as any);
export default prisma;
