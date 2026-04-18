import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const quizRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        chapterIds: z.array(z.string()).min(1),
        mode: z.enum(["STUDY", "EXAM"]),
        questionTypes: z.array(z.enum(["QCM", "QCM_MULTI", "KFP"])).optional(),
        filter: z
          .enum(["all", "unanswered", "incorrect"])
          .default("all"),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Find all matching questions
      let questions = await ctx.db.question.findMany({
        where: {
          chapterId: { in: input.chapterIds },
          isActive: true,
          ...(input.questionTypes && input.questionTypes.length > 0
            ? { type: { in: input.questionTypes } }
            : {}),
        },
        select: { id: true },
      });

      // 2. Apply filter
      if (input.filter !== "all") {
        const previousResponses = await ctx.db.quizResponse.findMany({
          where: {
            quizSession: { userId: ctx.session.user.id },
            questionId: { in: questions.map((q) => q.id) },
            isCorrect: { not: null },
          },
          select: { questionId: true, isCorrect: true },
        });

        const answeredCorrectly = new Set<string>();
        const answeredIncorrectly = new Set<string>();
        for (const r of previousResponses) {
          if (r.isCorrect) answeredCorrectly.add(r.questionId);
          else answeredIncorrectly.add(r.questionId);
        }

        if (input.filter === "unanswered") {
          const allAnswered = new Set([
            ...answeredCorrectly,
            ...answeredIncorrectly,
          ]);
          questions = questions.filter((q) => !allAnswered.has(q.id));
        } else if (input.filter === "incorrect") {
          questions = questions.filter(
            (q) =>
              answeredIncorrectly.has(q.id) && !answeredCorrectly.has(q.id),
          );
        }
      }

      if (questions.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aucune question disponible avec ces criteres",
        });
      }

      // 3. Shuffle and limit
      const shuffled = questions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, input.limit);

      // 4. Calculate total points
      const questionDetails = await ctx.db.question.findMany({
        where: { id: { in: selected.map((q) => q.id) } },
        select: { id: true, points: true },
      });
      const totalPoints = questionDetails.reduce((sum, q) => sum + q.points, 0);

      // 5. Create session with pre-created responses
      const session = await ctx.db.quizSession.create({
        data: {
          userId: ctx.session.user.id,
          mode: input.mode,
          chapterIds: input.chapterIds,
          totalPoints,
          responses: {
            create: selected.map((q, i) => ({
              questionId: q.id,
              order: i,
            })),
          },
        },
      });

      return { sessionId: session.id };
    }),

  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findUnique({
        where: { id: input.sessionId },
        include: {
          responses: {
            orderBy: { order: "asc" },
            include: {
              question: {
                include: {
                  answers: { orderBy: { order: "asc" } },
                },
              },
              selectedAnswers: { select: { answerId: true } },
            },
          },
        },
      });

      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // In EXAM mode, hide correct answers and explanations until finished
      const isExamInProgress = session.mode === "EXAM" && !session.finishedAt;

      return {
        ...session,
        responses: session.responses.map((r) => ({
          id: r.id,
          order: r.order,
          isCorrect: isExamInProgress ? null : r.isCorrect,
          pointsEarned: isExamInProgress ? 0 : r.pointsEarned,
          selectedAnswerIds: r.selectedAnswers.map((sa) => sa.answerId),
          question: {
            id: r.question.id,
            text: r.question.text,
            type: r.question.type,
            points: r.question.points,
            explanation: isExamInProgress ? null : r.question.explanation,
            answers: r.question.answers.map((a) => ({
              id: a.id,
              text: a.text,
              order: a.order,
              // Hide correct/explanation in exam mode until finished
              isCorrect: isExamInProgress ? null : a.isCorrect,
              explanation: isExamInProgress ? null : a.explanation,
            })),
          },
        })),
      };
    }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        questionId: z.string(),
        answerIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify session ownership
      const session = await ctx.db.quizSession.findUnique({
        where: { id: input.sessionId },
        select: { userId: true, mode: true, finishedAt: true },
      });

      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (session.finishedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cette session est deja terminee",
        });
      }

      // Get the response record
      const response = await ctx.db.quizResponse.findUnique({
        where: {
          quizSessionId_questionId: {
            quizSessionId: input.sessionId,
            questionId: input.questionId,
          },
        },
      });

      if (!response) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Get the question with correct answers
      const question = await ctx.db.question.findUnique({
        where: { id: input.questionId },
        include: {
          answers: { orderBy: { order: "asc" } },
        },
      });

      if (!question) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const correctAnswerIds = new Set(
        question.answers.filter((a) => a.isCorrect).map((a) => a.id),
      );
      const selectedSet = new Set(input.answerIds);

      // Check if answer is correct
      const isCorrect =
        correctAnswerIds.size === selectedSet.size &&
        [...correctAnswerIds].every((id) => selectedSet.has(id));

      const pointsEarned = isCorrect ? question.points : 0;

      // Clear previous selections and save new ones
      await ctx.db.quizResponseAnswer.deleteMany({
        where: { quizResponseId: response.id },
      });

      await ctx.db.quizResponse.update({
        where: { id: response.id },
        data: {
          isCorrect,
          pointsEarned,
          answeredAt: new Date(),
          selectedAnswers: {
            create: input.answerIds.map((answerId) => ({
              answerId,
            })),
          },
        },
      });

      // Auto-create spaced repetition card for wrong answers
      if (!isCorrect) {
        await ctx.db.spacedRepetitionCard.upsert({
          where: {
            userId_questionId: {
              userId: ctx.session.user.id,
              questionId: input.questionId,
            },
          },
          update: {
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
      }

      // In study mode, return correction immediately
      if (session.mode === "STUDY") {
        // Get answer stats (how many users selected each answer)
        const answerStats = await ctx.db.quizResponseAnswer.groupBy({
          by: ["answerId"],
          where: {
            quizResponse: { questionId: input.questionId },
          },
          _count: true,
        });

        const totalResponses = await ctx.db.quizResponse.count({
          where: {
            questionId: input.questionId,
            isCorrect: { not: null },
          },
        });

        return {
          isCorrect,
          pointsEarned,
          explanation: question.explanation,
          answers: question.answers.map((a) => {
            const stat = answerStats.find((s) => s.answerId === a.id);
            return {
              id: a.id,
              text: a.text,
              isCorrect: a.isCorrect,
              explanation: a.explanation,
              selectedPercent:
                totalResponses > 0
                  ? Math.round(((stat?._count ?? 0) / totalResponses) * 100)
                  : 0,
            };
          }),
        };
      }

      // In exam mode, just confirm submission
      return {
        isCorrect: null,
        pointsEarned: 0,
        explanation: null,
        answers: null,
      };
    }),

  finish: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        timeSpentMs: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findUnique({
        where: { id: input.sessionId },
        include: {
          responses: { select: { pointsEarned: true, isCorrect: true } },
        },
      });

      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (session.finishedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cette session est deja terminee",
        });
      }

      const earnedPoints = session.responses.reduce(
        (sum, r) => sum + r.pointsEarned,
        0,
      );
      const score =
        session.totalPoints > 0
          ? (earnedPoints / session.totalPoints) * 100
          : 0;

      await ctx.db.quizSession.update({
        where: { id: input.sessionId },
        data: {
          finishedAt: new Date(),
          timeSpentMs: input.timeSpentMs,
          earnedPoints,
          score,
        },
      });

      return { score, earnedPoints, totalPoints: session.totalPoints };
    }),

  getResults: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findUnique({
        where: { id: input.sessionId },
        include: {
          responses: {
            orderBy: { order: "asc" },
            include: {
              question: {
                include: {
                  answers: { orderBy: { order: "asc" } },
                  chapter: { select: { title: true } },
                },
              },
              selectedAnswers: { select: { answerId: true } },
            },
          },
        },
      });

      if (session?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!session.finishedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cette session n'est pas encore terminee",
        });
      }

      // Get answer stats for all questions
      const questionIds = session.responses.map((r) => r.questionId);
      const answerStats = await ctx.db.quizResponseAnswer.groupBy({
        by: ["answerId"],
        where: {
          quizResponse: { questionId: { in: questionIds } },
        },
        _count: true,
      });

      const responseCounts = await ctx.db.quizResponse.groupBy({
        by: ["questionId"],
        where: {
          questionId: { in: questionIds },
          isCorrect: { not: null },
        },
        _count: true,
      });

      const responseCountMap = new Map(
        responseCounts.map((r) => [r.questionId, r._count]),
      );
      const answerStatMap = new Map(
        answerStats.map((s) => [s.answerId, s._count]),
      );

      return {
        id: session.id,
        mode: session.mode,
        score: session.score,
        earnedPoints: session.earnedPoints,
        totalPoints: session.totalPoints,
        timeSpentMs: session.timeSpentMs,
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
        responses: session.responses.map((r) => {
          const totalForQuestion = responseCountMap.get(r.questionId) ?? 1;
          return {
            isCorrect: r.isCorrect,
            pointsEarned: r.pointsEarned,
            selectedAnswerIds: r.selectedAnswers.map((sa) => sa.answerId),
            question: {
              id: r.question.id,
              text: r.question.text,
              type: r.question.type,
              points: r.question.points,
              explanation: r.question.explanation,
              chapterTitle: r.question.chapter.title,
              answers: r.question.answers.map((a) => ({
                id: a.id,
                text: a.text,
                isCorrect: a.isCorrect,
                explanation: a.explanation,
                selectedPercent: Math.round(
                  ((answerStatMap.get(a.id) ?? 0) / totalForQuestion) * 100,
                ),
              })),
            },
          };
        }),
      };
    }),

  history: protectedProcedure
    .input(
      z.object({
        chapterIds: z.array(z.string()).optional(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.quizSession.findMany({
        where: {
          userId: ctx.session.user.id,
          finishedAt: { not: null },
          ...(input.chapterIds
            ? { chapterIds: { hasSome: input.chapterIds } }
            : {}),
        },
        orderBy: { finishedAt: "desc" },
        take: input.limit,
        select: {
          id: true,
          mode: true,
          score: true,
          earnedPoints: true,
          totalPoints: true,
          startedAt: true,
          finishedAt: true,
          timeSpentMs: true,
          _count: { select: { responses: true } },
        },
      });
    }),
});
