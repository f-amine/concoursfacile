import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight, Target, BookOpen } from "lucide-react";

import { api } from "~/trpc/server";
import { LessonContent } from "./lesson-content";
import { MarkCompleteButton } from "./mark-complete-button";

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
    <div className="mx-auto max-w-2xl py-6">
      {/* Back to subject */}
      <Link
        href={`/cours/${concoursSlug}/${subjectSlug}`}
        className="mb-8 inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {subject.name}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{subject.concours.name}</span>
          <span className="text-border">/</span>
          <span>{subject.name}</span>
          <span className="text-border">/</span>
          <span>{chapter.title}</span>
        </div>
        <h1 className="mt-3 text-[1.375rem] font-semibold leading-snug tracking-tight">
          {lesson.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {lesson.readingTimeMin} min de lecture
          </span>
          {lesson.isFree && (
            <span className="rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground">
              Gratuit
            </span>
          )}
        </div>
      </header>

      {/* Objectives */}
      {lesson.objectives.length > 0 && (
        <div className="mb-10 rounded-xl border bg-card p-5 shadow-xs">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold">
            <Target className="h-4 w-4 text-muted-foreground" />
            Objectifs du cours
          </h3>
          <ul className="mt-3 space-y-2">
            {lesson.objectives.map((obj) => (
              <li
                key={obj.id}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
                {obj.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content */}
      <LessonContent content={lesson.content} />

      {/* Mark complete */}
      <div className="mt-10">
        <MarkCompleteButton lessonId={lesson.id} />
      </div>

      {/* Previous / Next */}
      <nav className="mt-10 grid grid-cols-2 gap-3 border-t pt-6">
        {lesson.prevLesson ? (
          <Link
            href={`/cours/${concoursSlug}/${subjectSlug}/${chapterSlug}/${lesson.prevLesson.slug}`}
            className="group flex items-start gap-2 rounded-xl border bg-card p-4 shadow-xs transition-all hover:shadow-sm"
          >
            <ChevronLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Precedent</p>
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
            className="group flex items-start justify-end gap-2 rounded-xl border bg-card p-4 text-right shadow-xs transition-all hover:shadow-sm"
          >
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Suivant</p>
              <p className="mt-0.5 truncate text-[13px] font-medium">
                {lesson.nextLesson.title}
              </p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ) : (
          <Link
            href={`/cours/${concoursSlug}/${subjectSlug}`}
            className="group flex items-center justify-end gap-2 rounded-xl border bg-card p-4 text-right shadow-xs transition-all hover:shadow-sm"
          >
            <div>
              <p className="text-[11px] text-muted-foreground">Termine</p>
              <p className="text-[13px] font-medium">Retour au cours</p>
            </div>
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        )}
      </nav>
    </div>
  );
}
