import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const concoursRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.concours.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        _count: {
          select: { subjects: true },
        },
      },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.concours.findUnique({
        where: { slug: input.slug },
        include: {
          subjects: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
              _count: {
                select: { chapters: true },
              },
            },
          },
        },
      });
    }),
});
