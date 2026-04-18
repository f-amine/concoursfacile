import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const questionRouter = createTRPCRouter({
  listByChapter: protectedProcedure
    .input(
      z.object({
        chapterIds: z.array(z.string()).min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const questions = await ctx.db.question.findMany({
        where: {
          chapterId: { in: input.chapterIds },
          isActive: true,
        },
        select: {
          id: true,
          type: true,
          chapterId: true,
        },
      });

      // Get answered question IDs for this user
      const answeredResponses = await ctx.db.quizResponse.findMany({
        where: {
          quizSession: { userId: ctx.session.user.id },
          questionId: { in: questions.map((q) => q.id) },
          isCorrect: { not: null },
        },
        select: { questionId: true, isCorrect: true },
      });

      const answeredMap = new Map<string, boolean>();
      for (const r of answeredResponses) {
        const existing = answeredMap.get(r.questionId);
        // If ever answered correctly, mark as correct
        if (existing === undefined || r.isCorrect === true) {
          answeredMap.set(r.questionId, r.isCorrect ?? false);
        }
      }

      const byType = new Map<string, { total: number; answered: number; correct: number }>();
      for (const q of questions) {
        let entry = byType.get(q.type);
        if (!entry) {
          entry = { total: 0, answered: 0, correct: 0 };
          byType.set(q.type, entry);
        }
        entry.total++;
        if (answeredMap.has(q.id)) {
          entry.answered++;
          if (answeredMap.get(q.id)) entry.correct++;
        }
      }

      return {
        total: questions.length,
        answered: answeredMap.size,
        byType: Object.fromEntries(byType),
      };
    }),
});
