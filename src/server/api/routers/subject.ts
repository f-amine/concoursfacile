import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const subjectRouter = createTRPCRouter({
  listByConcours: publicProcedure
    .input(z.object({ concoursSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.subject.findMany({
        where: {
          isActive: true,
          concours: { slug: input.concoursSlug },
        },
        orderBy: { order: "asc" },
        include: {
          concours: { select: { name: true, slug: true } },
          _count: { select: { chapters: true } },
          chapters: {
            where: { isActive: true },
            select: {
              id: true,
              _count: {
                select: { lessons: true, questions: true },
              },
            },
          },
        },
      });
    }),

  getBySlug: protectedProcedure
    .input(
      z.object({ concoursSlug: z.string(), subjectSlug: z.string() }),
    )
    .query(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findFirst({
        where: {
          slug: input.subjectSlug,
          concours: { slug: input.concoursSlug },
        },
        include: {
          concours: { select: { name: true, slug: true } },
          chapters: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
              _count: { select: { lessons: true, questions: true } },
              lessons: {
                where: { isActive: true },
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  readingTimeMin: true,
                  order: true,
                  isFree: true,
                },
              },
            },
          },
        },
      });

      if (!subject) return null;

      // Get user progress for all lessons in this subject
      const lessonIds = subject.chapters.flatMap((ch) =>
        ch.lessons.map((l) => l.id),
      );

      const progresses = await ctx.db.userLessonProgress.findMany({
        where: {
          userId: ctx.session.user.id,
          lessonId: { in: lessonIds },
        },
        select: { lessonId: true, completed: true },
      });

      const progressMap = new Map(
        progresses.map((p) => [p.lessonId, p.completed]),
      );

      return {
        ...subject,
        chapters: subject.chapters.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((l) => ({
            ...l,
            completed: progressMap.get(l.id) ?? false,
          })),
          completedLessons: ch.lessons.filter(
            (l) => progressMap.get(l.id) === true,
          ).length,
          totalReadingTime: ch.lessons.reduce(
            (sum, l) => sum + l.readingTimeMin,
            0,
          ),
        })),
      };
    }),
});
