import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const errorReportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        message: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.errorReport.create({
        data: {
          questionId: input.questionId,
          userId: ctx.session.user.id,
          message: input.message,
        },
      });
    }),
});
