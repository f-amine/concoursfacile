import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const lessonRouter = createTRPCRouter({
  getBySlug: protectedProcedure
    .input(
      z.object({
        concoursSlug: z.string(),
        subjectSlug: z.string(),
        chapterSlug: z.string(),
        lessonSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.lesson.findFirst({
        where: {
          slug: input.lessonSlug,
          chapter: {
            slug: input.chapterSlug,
            subject: {
              slug: input.subjectSlug,
              concours: { slug: input.concoursSlug },
            },
          },
        },
        include: {
          objectives: { orderBy: { order: "asc" } },
          chapter: {
            select: {
              id: true,
              title: true,
              slug: true,
              subject: {
                select: {
                  name: true,
                  slug: true,
                  concours: { select: { name: true, slug: true } },
                },
              },
              lessons: {
                where: { isActive: true },
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  order: true,
                },
              },
            },
          },
        },
      });

      if (!lesson) return null;

      // Update or create progress
      await ctx.db.userLessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: ctx.session.user.id,
            lessonId: lesson.id,
          },
        },
        update: { lastReadAt: new Date() },
        create: {
          userId: ctx.session.user.id,
          lessonId: lesson.id,
          lastReadAt: new Date(),
        },
      });

      // Find previous and next lessons
      const allLessons = lesson.chapter.lessons;
      const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
      const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
      const nextLesson =
        currentIndex < allLessons.length - 1
          ? allLessons[currentIndex + 1]
          : null;

      return {
        ...lesson,
        prevLesson,
        nextLesson,
      };
    }),

  markComplete: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userLessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: ctx.session.user.id,
            lessonId: input.lessonId,
          },
        },
        update: { completed: true, lastReadAt: new Date() },
        create: {
          userId: ctx.session.user.id,
          lessonId: input.lessonId,
          completed: true,
          lastReadAt: new Date(),
        },
      });
    }),
});
