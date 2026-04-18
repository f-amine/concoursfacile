import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userProgressRouter = createTRPCRouter({
  getRecentLessons: protectedProcedure.query(async ({ ctx }) => {
    const progresses = await ctx.db.userLessonProgress.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { lastReadAt: "desc" },
      take: 5,
      include: {
        lesson: {
          select: {
            title: true,
            slug: true,
            readingTimeMin: true,
            chapter: {
              select: {
                title: true,
                slug: true,
                subject: {
                  select: {
                    name: true,
                    slug: true,
                    concours: { select: { name: true, slug: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return progresses;
  }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [lessonsCompleted, totalQuizSessions, recentSessions] =
      await Promise.all([
        ctx.db.userLessonProgress.count({
          where: { userId, completed: true },
        }),
        ctx.db.quizSession.count({
          where: { userId },
        }),
        ctx.db.quizSession.findMany({
          where: { userId, finishedAt: { not: null } },
          orderBy: { finishedAt: "desc" },
          take: 5,
          select: {
            id: true,
            mode: true,
            startedAt: true,
            finishedAt: true,
            score: true,
            earnedPoints: true,
            totalPoints: true,
            chapterIds: true,
          },
        }),
      ]);

    return {
      lessonsCompleted,
      totalQuizSessions,
      recentSessions,
    };
  }),
});
