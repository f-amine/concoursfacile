import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { hasConcoursAccess } from "~/lib/access";

export const chapterRouter = createTRPCRouter({
  getBySlug: protectedProcedure
    .input(
      z.object({
        concoursSlug: z.string(),
        subjectSlug: z.string(),
        chapterSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findFirst({
        where: {
          slug: input.chapterSlug,
          subject: {
            slug: input.subjectSlug,
            concours: { slug: input.concoursSlug },
          },
        },
        include: {
          subject: {
            select: {
              name: true,
              slug: true,
              concours: { select: { id: true, name: true, slug: true } },
            },
          },
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
          _count: { select: { questions: true } },
        },
      });

      if (!chapter) return null;

      const hasAccess = await hasConcoursAccess(
        ctx.db,
        ctx.session.user.id,
        { concoursId: chapter.subject.concours.id },
      );

      const progresses = await ctx.db.userLessonProgress.findMany({
        where: {
          userId: ctx.session.user.id,
          lessonId: { in: chapter.lessons.map((l) => l.id) },
        },
        select: { lessonId: true, completed: true },
      });

      const progressMap = new Map(
        progresses.map((p) => [p.lessonId, p.completed]),
      );

      return {
        ...chapter,
        hasAccess,
        lessons: chapter.lessons.map((l) => ({
          ...l,
          locked: !hasAccess && !l.isFree,
          completed: progressMap.get(l.id) ?? false,
        })),
      };
    }),
});
