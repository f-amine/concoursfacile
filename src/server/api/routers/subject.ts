import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { hasConcoursAccess } from "~/lib/access";

export const subjectRouter = createTRPCRouter({
  listByConcours: publicProcedure
    .input(z.object({ concoursSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const subjects = await ctx.db.subject.findMany({
        where: {
          isActive: true,
          concours: { slug: input.concoursSlug },
        },
        orderBy: { order: "asc" },
        include: {
          concours: { select: { id: true, name: true, slug: true } },
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

      const hasAccess =
        ctx.session?.user && subjects[0]
          ? await hasConcoursAccess(ctx.db, ctx.session.user.id, {
              concoursId: subjects[0].concours.id,
            })
          : false;

      return { subjects, hasAccess };
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
          concours: { select: { id: true, name: true, slug: true } },
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

      const hasAccess = await hasConcoursAccess(
        ctx.db,
        ctx.session.user.id,
        { concoursId: subject.concours.id },
      );

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

      const chapterIds = subject.chapters.map((ch) => ch.id);
      const freeCounts = await ctx.db.question.groupBy({
        by: ["chapterId"],
        where: {
          chapterId: { in: chapterIds },
          isActive: true,
          isFree: true,
        },
        _count: { _all: true },
      });
      const freeMap = new Map(
        freeCounts.map((r) => [r.chapterId, r._count._all]),
      );

      return {
        ...subject,
        hasAccess,
        chapters: subject.chapters.map((ch) => {
          const freeQuestions = freeMap.get(ch.id) ?? 0;
          const totalQuestions = ch._count.questions;
          const playableQuestions = hasAccess ? totalQuestions : freeQuestions;
          return {
            ...ch,
            freeQuestions,
            playableQuestions,
            quizLocked: !hasAccess && freeQuestions === 0 && totalQuestions > 0,
            lessons: ch.lessons.map((l) => ({
              ...l,
              locked: !hasAccess && !l.isFree,
              completed: progressMap.get(l.id) ?? false,
            })),
            completedLessons: ch.lessons.filter(
              (l) => progressMap.get(l.id) === true,
            ).length,
            totalReadingTime: ch.lessons.reduce(
              (sum, l) => sum + l.readingTimeMin,
              0,
            ),
          };
        }),
      };
    }),
});
