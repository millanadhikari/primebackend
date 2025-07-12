import { PrismaClient, Prisma } from "@prisma/client";

export function enforceSingleFeatured(prisma: PrismaClient) {
  return async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    if (
      params.model === "Blog" &&
      (params.action === "create" || params.action === "update") &&
      params.args?.data?.isFeatured === true
    ) {
      const blogId =
        params.action === "update" ? params.args.where?.id : undefined;

      await prisma.blog.updateMany({
  where: {
    isFeatured: true,
    NOT: { id: params.args.where.id },  // exclude current blog
  },
  data: { isFeatured: false },
});
    return next(params);
  };
}}
