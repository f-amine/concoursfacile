import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

/**
 * SM-2 Algorithm implementation.
 * Quality: 0-5 rating (0-2 = forgot, 3 = hard, 4 = good, 5 = easy)
 */
function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number,
): { repetitions: number; easeFactor: number; interval: number } {
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions++;
  } else {
    // Incorrect response — reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
  };
}

export const spacedRepetitionRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const [dueToday, dueTomorrow, total] = await Promise.all([
      ctx.db.spacedRepetitionCard.count({
        where: {
          userId: ctx.session.user.id,
          nextReviewAt: { lte: todayEnd },
        },
      }),
      ctx.db.spacedRepetitionCard.count({
        where: {
          userId: ctx.session.user.id,
          nextReviewAt: { gt: todayEnd, lte: tomorrow },
        },
      }),
      ctx.db.spacedRepetitionCard.count({
        where: { userId: ctx.session.user.id },
      }),
    ]);

    const dueLater = total - dueToday - dueTomorrow;

    return { dueToday, dueTomorrow, dueLater, total };
  }),

  getDueCards: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const cards = await ctx.db.spacedRepetitionCard.findMany({
        where: {
          userId: ctx.session.user.id,
          nextReviewAt: { lte: todayEnd },
        },
        orderBy: { nextReviewAt: "asc" },
        take: input.limit,
        include: {
          question: {
            include: {
              answers: { orderBy: { order: "asc" } },
              chapter: {
                select: {
                  title: true,
                  subject: {
                    select: {
                      name: true,
                      concours: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return cards;
    }),

  reviewCard: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        quality: z.number().min(0).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.db.spacedRepetitionCard.findUnique({
        where: { id: input.cardId },
      });

      if (card?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const result = sm2(
        input.quality,
        card.repetitions,
        card.easeFactor,
        card.interval,
      );

      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + result.interval);

      await ctx.db.spacedRepetitionCard.update({
        where: { id: input.cardId },
        data: {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewAt,
          lastReviewedAt: new Date(),
        },
      });

      return { nextReviewAt, interval: result.interval };
    }),

  createFromQuestion: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Upsert — don't create duplicates
      return ctx.db.spacedRepetitionCard.upsert({
        where: {
          userId_questionId: {
            userId: ctx.session.user.id,
            questionId: input.questionId,
          },
        },
        update: {
          // Reset card on re-add (they got it wrong again)
          repetitions: 0,
          interval: 1,
          easeFactor: 2.5,
          nextReviewAt: new Date(),
        },
        create: {
          userId: ctx.session.user.id,
          questionId: input.questionId,
        },
      });
    }),
});
