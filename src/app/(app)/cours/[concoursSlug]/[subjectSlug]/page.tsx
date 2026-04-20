import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  FileQuestion,
  ChevronLeft,
  ArrowRight,
  Play,
} from "lucide-react";

import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ concoursSlug: string; subjectSlug: string }>;
}) {
  const { concoursSlug, subjectSlug } = await params;
  const subject = await api.subject.getBySlug({ concoursSlug, subjectSlug });

  if (!subject) notFound();

  const totalLessons = subject.chapters.reduce(
    (s, ch) => s + ch.lessons.length,
    0,
  );
  const completedLessons = subject.chapters.reduce(
    (s, ch) => s + ch.completedLessons,
    0,
  );
  const overallPct =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Link
        href={`/cours/${concoursSlug}`}
        className="mb-8 inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {subject.concours.name}
      </Link>

      {/* ── Header with progress ──────────────────────── */}
      <div className="mb-10 rounded-2xl border bg-card p-6 shadow-xs">
        <h1 className="text-xl font-semibold tracking-tight">
          {subject.name}
        </h1>
        {subject.description && (
          <p className="mt-1 text-[13px] text-muted-foreground">
            {subject.description}
          </p>
        )}

        {totalLessons > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {completedLessons} / {totalLessons} lecons
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {overallPct}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {subject.chapters.length} chapitre
            {subject.chapters.length > 1 ? "s" : ""}
          </span>
          <span>
            {subject.chapters.reduce(
              (s, ch) => s + ch.totalReadingTime,
              0,
            )}
            min de lecture
          </span>
        </div>
      </div>

      {/* ── Chapters ──────────────────────────────────── */}
      <div className="space-y-8">
        {subject.chapters.map((chapter, idx) => {
          const total = chapter.lessons.length;
          const done = chapter.completedLessons;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          /* Find the first incomplete lesson for "continue" */
          const nextLesson = chapter.lessons.find((l) => !l.completed);

          return (
            <section key={chapter.id}>
              {/* Chapter heading */}
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border bg-card text-xs font-semibold shadow-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h2 className="text-[15px] font-semibold tracking-tight leading-snug">
                      {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {chapter.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{total} lecons</span>
                      <span>&middot;</span>
                      <span>{chapter.totalReadingTime}m</span>
                      {chapter._count.questions > 0 && (
                        <>
                          <span>&middot;</span>
                          <span>{chapter._count.questions} questions</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chapter progress */}
                <span
                  className={`mt-1 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    pct === 100
                      ? "bg-foreground text-background"
                      : pct > 0
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {pct === 100 ? "Termine" : `${done}/${total}`}
                </span>
              </div>

              {/* Lesson list */}
              <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                {chapter.lessons.map((lesson, li) => {
                  const isLast =
                    li === chapter.lessons.length - 1 &&
                    chapter._count.questions === 0;
                  const isNext = nextLesson?.id === lesson.id;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/cours/${concoursSlug}/${subjectSlug}/${chapter.slug}/${lesson.slug}`}
                      className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 ${
                        !isLast ? "border-b" : ""
                      } ${isNext ? "bg-accent/30" : ""}`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-foreground" />
                      ) : (
                        <Circle
                          className={`h-[18px] w-[18px] shrink-0 ${
                            isNext ? "text-foreground/40" : "text-border"
                          }`}
                        />
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium leading-tight">
                          {lesson.title}
                        </span>
                      </span>

                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {lesson.readingTimeMin}m
                      </span>

                      {lesson.isFree && (
                        <span className="shrink-0 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                          Gratuit
                        </span>
                      )}

                      {isNext && !lesson.completed && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                          <Play className="h-3 w-3 pl-px" />
                        </span>
                      )}

                      {!isNext && (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/0 transition-all group-hover:text-muted-foreground" />
                      )}
                    </Link>
                  );
                })}

                {/* Quiz row */}
                {chapter._count.questions > 0 && (
                  <div className="border-t bg-accent/20 px-4 py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-muted-foreground hover:text-foreground"
                      render={
                        <Link
                          href={`/quiz/preparer?chapters=${chapter.id}`}
                        />
                      }
                    >
                      <span className="flex items-center gap-2">
                        <FileQuestion className="h-4 w-4" />
                        Tester ce chapitre
                      </span>
                      <span className="text-[11px]">
                        {chapter._count.questions} questions
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {subject.chapters.length === 0 && (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <BookOpen className="mx-auto h-7 w-7 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun chapitre disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
