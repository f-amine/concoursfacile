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
  Clock,
  Lock,
} from "lucide-react";

import { api } from "~/trpc/server";

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
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalReadingTime = subject.chapters.reduce(
    (s, ch) => s + ch.totalReadingTime,
    0,
  );
  const finished = overallPct === 100;

  // Find first non-completed lesson across chapters
  let nextChapter: (typeof subject.chapters)[number] | null = null;
  let nextLesson: (typeof subject.chapters)[number]["lessons"][number] | null = null;
  for (const ch of subject.chapters) {
    const candidate = ch.lessons.find((l) => !l.completed && !l.locked);
    if (candidate) {
      nextChapter = ch;
      nextLesson = candidate;
      break;
    }
  }
  const activeChapterId = nextChapter?.id;

  return (
    <div className="mx-auto max-w-3xl pt-8">
      <Link
        href={`/cours/${concoursSlug}`}
        className="mb-10 inline-flex items-center gap-1 rounded-md text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {subject.concours.name}
      </Link>

      {/* Header */}
      <header className="mb-10">
        <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Matiere {subject.concours.name}
        </p>
        <h1 className="mt-2 text-[2.25rem] font-semibold leading-[1.05] tracking-display sm:text-[2.75rem]">
          {subject.name}
        </h1>
        {subject.description && (
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            {subject.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] tabular-nums text-muted-foreground">
          <span>
            <span className="font-display-num text-foreground font-semibold">
              {subject.chapters.length}
            </span>{" "}
            chapitre{subject.chapters.length > 1 ? "s" : ""}
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span className="font-display-num text-foreground font-semibold">
              {totalReadingTime}
            </span>{" "}
            min
          </span>
          {totalLessons > 0 && (
            <>
              <span className="text-border">·</span>
              <span>
                <span
                  className={`font-display-num font-semibold ${
                    finished ? "text-success" : "text-primary"
                  }`}
                >
                  {completedLessons}
                </span>
                /{totalLessons} lecons
              </span>
            </>
          )}
        </div>

        {totalLessons > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground tabular-nums">
                {overallPct}% complete
              </span>
              {finished && (
                <span className="font-medium tracking-wide uppercase text-success">
                  Termine
                </span>
              )}
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  finished ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Reprendre CTA — points at the next non-completed lesson */}
      {nextLesson && nextChapter && (
        <Link
          href={`/cours/${concoursSlug}/${subjectSlug}/${nextChapter.slug}/${nextLesson.slug}`}
          className="group relative mb-12 block overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg outline-none transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <div
            aria-hidden="true"
            className="bg-dot-grid pointer-events-none absolute inset-0 text-white/[0.07]"
          />
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-[0.22em] text-white/60 uppercase">
                {completedLessons === 0 ? "Demarrer" : "Reprendre"}
              </p>
              <p className="mt-1.5 text-[12px] text-white/70 tabular-nums">
                Chapitre {subject.chapters.indexOf(nextChapter) + 1} —{" "}
                {nextChapter.title}
              </p>
              <h2 className="mt-2 text-[1.375rem] font-semibold leading-snug tracking-tight sm:text-[1.75rem]">
                {nextLesson.title}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/90 ring-1 ring-white/15">
                  <Clock className="h-3 w-3" />
                  {nextLesson.readingTimeMin} min
                </span>
                {nextLesson.isFree && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase text-white">
                    Gratuit
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-primary shadow-md transition-transform group-hover:translate-x-1">
              <Play className="h-4 w-4" fill="currentColor" />
              Lire la lecon
            </span>
          </div>
        </Link>
      )}

      {/* Chapters */}
      <div className="space-y-12">
        {subject.chapters.map((chapter, idx) => {
          const total = chapter.lessons.length;
          const done = chapter.completedLessons;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const chapterDone = pct === 100;
          const inProgress = pct > 0 && pct < 100;
          const isActive = chapter.id === activeChapterId;
          const chapterNextLesson = chapter.lessons.find(
            (l) => !l.completed && !l.locked,
          );

          return (
            <section
              key={chapter.id}
              className={`relative ${isActive ? "pl-5 sm:pl-6" : ""}`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 left-0 h-12 w-[3px] rounded-full bg-primary"
                />
              )}
              <header className="mb-4 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <span
                    className={`mt-0.5 font-mono text-[12px] font-medium tabular-nums leading-none tracking-wider ${
                      chapterDone
                        ? "text-success"
                        : isActive
                          ? "text-primary"
                          : "text-muted-foreground/70"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2
                      className={`text-[1.125rem] font-semibold leading-snug tracking-tight sm:text-[1.25rem] ${
                        chapterDone
                          ? "text-foreground/70"
                          : isActive
                            ? "text-foreground"
                            : "text-foreground"
                      }`}
                    >
                      {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                        {chapter.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground tabular-nums">
                      <span>
                        {total} lecon{total > 1 ? "s" : ""}
                      </span>
                      <span className="text-border">·</span>
                      <span>{chapter.totalReadingTime}m</span>
                      {chapter._count.questions > 0 && (
                        <>
                          <span className="text-border">·</span>
                          <span>{chapter._count.questions} questions</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums tracking-wide ${
                    chapterDone
                      ? "bg-success/10 text-success"
                      : inProgress
                        ? "bg-primary/[0.08] text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {chapterDone
                    ? "Termine"
                    : inProgress
                      ? `${pct}%`
                      : `${done}/${total}`}
                </span>
              </header>

              <div
                className={`overflow-hidden rounded-xl border bg-card shadow-xs ${
                  isActive ? "border-primary/20" : ""
                }`}
              >
                {chapter.lessons.map((lesson, li) => {
                  const isLast =
                    li === chapter.lessons.length - 1 &&
                    chapter._count.questions === 0;
                  const isNext = chapterNextLesson?.id === lesson.id;
                  const highlight = isActive && isNext && !lesson.locked;
                  const rowClass = `group relative flex items-center gap-3 px-4 py-3.5 outline-none transition-colors ${
                    !isLast ? "border-b border-border/70" : ""
                  } ${highlight ? "bg-primary/[0.04]" : ""} ${
                    lesson.locked
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
                  }`;

                  const inner = (
                    <>
                      <span className="font-mono text-[10px] font-medium tabular-nums text-muted-foreground/60">
                        {String(li + 1).padStart(2, "0")}
                      </span>
                      {lesson.locked ? (
                        <Lock className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
                      ) : lesson.completed ? (
                        <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-success" />
                      ) : (
                        <Circle
                          className={`h-[18px] w-[18px] shrink-0 ${
                            highlight ? "text-primary/60" : "text-border"
                          }`}
                          strokeWidth={highlight ? 2.25 : 1.5}
                        />
                      )}

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[14px] leading-tight ${
                            lesson.completed
                              ? "font-medium text-foreground/65"
                              : highlight
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground"
                          }`}
                        >
                          {lesson.title}
                        </span>
                      </span>

                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {lesson.readingTimeMin}m
                      </span>

                      {lesson.isFree && (
                        <span className="shrink-0 rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-success">
                          Gratuit
                        </span>
                      )}

                      {lesson.locked ? (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      ) : highlight ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                          <Play className="h-3 w-3" fill="currentColor" />
                        </span>
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/0 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                      )}
                    </>
                  );

                  return lesson.locked ? (
                    <div
                      key={lesson.id}
                      className={rowClass}
                      aria-disabled="true"
                      title="Acces verrouille — paiement requis"
                    >
                      {inner}
                    </div>
                  ) : (
                    <Link
                      key={lesson.id}
                      href={`/cours/${concoursSlug}/${subjectSlug}/${chapter.slug}/${lesson.slug}`}
                      className={rowClass}
                    >
                      {inner}
                    </Link>
                  );
                })}

                {chapter._count.questions > 0 && (
                  chapter.quizLocked ? (
                    <Link
                      href={`/cours/${concoursSlug}`}
                      aria-disabled="true"
                      className="group flex items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
                      title="Debloquez ce concours pour tester ce chapitre"
                    >
                      <span className="flex items-center gap-2.5 text-[13px] font-semibold text-muted-foreground">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                        Tester ce chapitre
                      </span>
                      <span className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
                        <span className="rounded-md bg-foreground/[0.06] px-1.5 py-0.5 font-semibold tracking-wide uppercase text-[10px]">
                          Premium
                        </span>
                        {chapter._count.questions} questions
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href={`/quiz/preparer?chapters=${chapter.id}`}
                      className="group flex items-center justify-between gap-3 border-t border-border/70 bg-primary/[0.03] px-4 py-3 outline-none transition-colors hover:bg-primary/[0.07] focus-visible:bg-primary/[0.07] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
                    >
                      <span className="flex items-center gap-2.5 text-[13px] font-semibold text-primary">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                          <FileQuestion className="h-3.5 w-3.5" />
                        </span>
                        Tester ce chapitre
                      </span>
                      <span className="flex items-center gap-2 text-[11px] tabular-nums text-primary/80">
                        {chapter.playableQuestions < chapter._count.questions ? (
                          <>
                            <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-success">
                              {chapter.playableQuestions} gratuites
                            </span>
                            <span className="text-muted-foreground">
                              / {chapter._count.questions}
                            </span>
                          </>
                        ) : (
                          <>{chapter._count.questions} questions</>
                        )}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  )
                )}
              </div>
            </section>
          );
        })}
      </div>

      {subject.chapters.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card/40 py-20 text-center">
          <BookOpen className="mx-auto h-7 w-7 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun chapitre disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
