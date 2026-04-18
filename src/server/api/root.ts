import { concoursRouter } from "~/server/api/routers/concours";
import { subjectRouter } from "~/server/api/routers/subject";
import { chapterRouter } from "~/server/api/routers/chapter";
import { lessonRouter } from "~/server/api/routers/lesson";
import { userProgressRouter } from "~/server/api/routers/userProgress";
import { quizRouter } from "~/server/api/routers/quiz";
import { questionRouter } from "~/server/api/routers/question";
import { errorReportRouter } from "~/server/api/routers/errorReport";
import { spacedRepetitionRouter } from "~/server/api/routers/spacedRepetition";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  concours: concoursRouter,
  subject: subjectRouter,
  chapter: chapterRouter,
  lesson: lessonRouter,
  userProgress: userProgressRouter,
  quiz: quizRouter,
  question: questionRouter,
  errorReport: errorReportRouter,
  spacedRepetition: spacedRepetitionRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
