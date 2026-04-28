import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Target,
  BookOpen,
} from "lucide-react";

import { api } from "~/trpc/server";
import { LessonContent } from "./lesson-content";
import { MarkCompleteButton } from "./mark-complete-button";
import { ReadingProgress } from "./reading-progress";

export default async function LessonPage({
  params,
}: {
  params: Promise<{
    concoursSlug: string;
    subjectSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }>;
}) {
  const { concoursSlug, subjectSlug, chapterSlug, lessonSlug } = await params;
  const lesson = await api.lesson.getBySlug({
    concoursSlug,
    subjectSlug,
    chapterSlug,
    lessonSlug,
  });

  if (!lesson) notFound();

  const { chapter } = lesson;
  const { subject } = chapter;

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-2xl pt-6">
        <Link
          href={`/cours/${concoursSlug}/${subjectSlug}`}
          className="mb-10 inline-flex items-center gap-1 rounded-md text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {subject.name}
        </Link>

        <header className="mb-12">
          <nav
            aria-label="fil d'Ariane"
            className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase"
          >
            <span>{subject.concours.name}</span>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <span>{subject.name}</span>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <span className="truncate normal-case tracking-normal text-muted-foreground/80">
              {chapter.title}
            </span>
          </nav>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-display sm:text-[2.5rem]">
            {lesson.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[12px] font-medium tabular-nums text-foreground/80">
              <Clock className="h-3 w-3" />
              {lesson.readingTimeMin} min
            </span>
            {lesson.isFree && (
              <span className="rounded-full bg-success/10 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase text-success">
                Gratuit
              </span>
            )}
            {lesson.objectives.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[12px] font-medium tabular-nums text-foreground/80">
                <Target className="h-3 w-3" />
                {lesson.objectives.length} objectif
                {lesson.objectives.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </header>

        {lesson.objectives.length > 0 && (
          <aside className="relative mb-12 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6">
            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
              <Target className="h-3 w-3" />
              Objectifs du cours
            </p>
            <ol className="mt-4 space-y-3">
              {lesson.objectives.map((obj, i) => (
                <li
                  key={obj.id}
                  className="flex items-start gap-3 text-[14px] leading-relaxed text-foreground/85"
                >
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-primary/80 leading-relaxed mt-[3px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{obj.text}</span>
                </li>
              ))}
            </ol>
          </aside>
        )}

        <LessonContent content={lesson.content} />

        <div className="mt-12">
          <MarkCompleteButton lessonId={lesson.id} />
        </div>

        <nav
          aria-label="lecons adjacentes"
          className="mt-12 grid grid-cols-2 gap-3 border-t border-border/70 pt-8"
        >
          {lesson.prevLesson ? (
            <Link
              href={`/cours/${concoursSlug}/${subjectSlug}/${chapterSlug}/${lesson.prevLesson.slug}`}
              className="group flex items-start gap-2 rounded-xl border bg-card p-4 shadow-xs outline-none transition-all hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <ChevronLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Precedent
                </p>
                <p className="mt-0.5 truncate text-[13px] font-medium">
                  {lesson.prevLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {lesson.nextLesson ? (
            <Link
              href={`/cours/${concoursSlug}/${subjectSlug}/${chapterSlug}/${lesson.nextLesson.slug}`}
              className="group flex items-start justify-end gap-2 rounded-xl border bg-card p-4 text-right shadow-xs outline-none transition-all hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Suivant
                </p>
                <p className="mt-0.5 truncate text-[13px] font-medium">
                  {lesson.nextLesson.title}
                </p>
              </div>
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              href={`/cours/${concoursSlug}/${subjectSlug}`}
              className="group flex items-center justify-end gap-2 rounded-xl border bg-card p-4 text-right shadow-xs outline-none transition-all hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <div>
                <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Termine
                </p>
                <p className="text-[13px] font-medium">Retour au cours</p>
              </div>
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
