import Link from "next/link";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Brain,
  FileQuestion,
  ChevronRight,
  Flame,
  BarChart3,
  Layers,
} from "lucide-react";

import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";
import { Stagger, FadeIn } from "./animated";

export default async function TableauDeBordPage() {
  const session = await getSession();
  const userName = session?.user.name?.split(" ")[0] ?? "Etudiant";

  const [recentLessons, stats, srStats] = await Promise.all([
    api.userProgress.getRecentLessons(),
    api.userProgress.getDashboardStats(),
    api.spacedRepetition.getStats(),
  ]);

  const lastLesson = recentLessons[0];
  const otherLessons = recentLessons.slice(1);

  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <Stagger className="space-y-10 py-8">
      {/* ━━━ Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <FadeIn>
        <p className="text-[13px] text-muted-foreground">{formattedDate}</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Bonjour, {userName}
        </h1>
      </FadeIn>

      {/* ━━━ Continue where you left off ━━━━━━━━━━━━━━━━ */}
      {lastLesson && (
        <FadeIn>
          <Link
            href={`/cours/${lastLesson.lesson.chapter.subject.concours.slug}/${lastLesson.lesson.chapter.subject.slug}/${lastLesson.lesson.chapter.slug}/${lastLesson.lesson.slug}`}
            className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Continuer
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight leading-snug">
                    {lastLesson.lesson.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    {lastLesson.lesson.chapter.subject.concours.name}
                    {" · "}
                    {lastLesson.lesson.chapter.subject.name}
                    {" · "}
                    {lastLesson.lesson.chapter.title}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lastLesson.lesson.readingTimeMin} min de lecture
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {lastLesson.lesson.chapter.subject.name}
                </span>
              </div>
            </div>
          </Link>
        </FadeIn>
      )}

      {/* ━━━ Three action lanes ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Spaced rep */}
        <FadeIn>
          <Link
            href="/ancrages"
            className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <Brain className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-[13px] font-semibold">Ancrages</span>
            </div>
            <div className="mt-4 flex-1">
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {srStats.dueToday}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                carte{srStats.dueToday !== 1 ? "s" : ""} a revoir aujourd&apos;hui
              </p>
            </div>
            {srStats.dueToday > 0 && (
              <div className="mt-4 flex items-center gap-1 text-[13px] font-medium text-foreground">
                Commencer
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            )}
          </Link>
        </FadeIn>

        {/* Lessons */}
        <FadeIn>
          <Link
            href="/cours"
            className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-[13px] font-semibold">Cours</span>
            </div>
            <div className="mt-4 flex-1">
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {stats.lessonsCompleted}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                lecon{stats.lessonsCompleted !== 1 ? "s" : ""} terminee{stats.lessonsCompleted !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[13px] font-medium text-foreground">
              Explorer
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </FadeIn>

        {/* Quiz */}
        <FadeIn>
          <Link
            href="/cours"
            className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-[13px] font-semibold">Quiz</span>
            </div>
            <div className="mt-4 flex-1">
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {stats.totalQuizSessions}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                session{stats.totalQuizSessions !== 1 ? "s" : ""} completee{stats.totalQuizSessions !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[13px] font-medium text-foreground">
              Lancer un quiz
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </FadeIn>
      </div>

      {/* ━━━ Two columns: activity + sidebar ━━━━━━━━━━━━ */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Main column ─────────────────────────────── */}
        <div className="space-y-8 lg:col-span-3">
          {/* Other recent lessons */}
          {otherLessons.length > 0 && (
            <FadeIn>
              <section>
                <h3 className="mb-3 text-[13px] font-semibold tracking-tight">
                  Visites recentes
                </h3>
                <div className="space-y-0.5">
                  {otherLessons.map((progress) => {
                    const { lesson } = progress;
                    const { chapter } = lesson;
                    const href = `/cours/${chapter.subject.concours.slug}/${chapter.subject.slug}/${chapter.slug}/${lesson.slug}`;

                    return (
                      <Link
                        key={progress.id}
                        href={href}
                        className="group -mx-1.5 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium leading-tight">
                            {lesson.title}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {chapter.subject.name} · {chapter.title}
                          </span>
                        </span>
                        <span className="hidden text-[11px] tabular-nums text-muted-foreground sm:block">
                          {lesson.readingTimeMin}m
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </FadeIn>
          )}

          {/* Quiz results */}
          {stats.recentSessions.length > 0 && (
            <FadeIn>
              <section>
                <h3 className="mb-3 text-[13px] font-semibold tracking-tight">
                  Resultats recents
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {stats.recentSessions.slice(0, 4).map((s) => {
                    const scorePercent = s.score !== null ? Math.round(s.score) : null;
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-xs"
                      >
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                          <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
                            <circle
                              cx="18" cy="18" r="15"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-secondary"
                            />
                            {scorePercent !== null && (
                              <circle
                                cx="18" cy="18" r="15"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 15}
                                strokeDashoffset={
                                  2 * Math.PI * 15 -
                                  (scorePercent / 100) * 2 * Math.PI * 15
                                }
                                className="text-foreground"
                              />
                            )}
                          </svg>
                          <span className="absolute text-[10px] font-semibold tabular-nums">
                            {scorePercent ?? "–"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium">
                            {s.mode === "STUDY" ? "Etude" : "Examen"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {s.earnedPoints}/{s.totalPoints} pts
                            {s.finishedAt && (
                              <>
                                {" · "}
                                {new Date(s.finishedAt).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </FadeIn>
          )}

          {/* Empty state */}
          {recentLessons.length === 0 && stats.recentSessions.length === 0 && (
            <FadeIn>
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <Layers className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <h3 className="mt-4 text-sm font-semibold">
                  Commencez votre preparation
                </h3>
                <p className="mx-auto mt-1.5 max-w-xs text-[13px] text-muted-foreground">
                  Explorez les cours disponibles et lancez votre premier quiz
                  pour suivre votre progression.
                </p>
                <Link
                  href="/cours"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Explorer les cours
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </FadeIn>
          )}
        </div>

        {/* ── Sidebar column ──────────────────────────── */}
        <div className="space-y-4 lg:col-span-2">
          {/* Spaced rep schedule */}
          <FadeIn>
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-[13px] font-semibold">Calendrier de revision</h3>
              </div>

              <div className="mt-4 space-y-1">
                {[
                  { label: "Aujourd'hui", count: srStats.dueToday, active: true },
                  { label: "Demain", count: srStats.dueTomorrow, active: false },
                  { label: "Plus tard", count: srStats.dueLater, active: false },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                      row.active && row.count > 0 ? "bg-accent" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[13px]">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          row.active ? "bg-foreground" : "bg-border"
                        }`}
                      />
                      {row.label}
                    </span>
                    <span
                      className={`text-[13px] tabular-nums ${
                        row.active && row.count > 0
                          ? "font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>

              {srStats.dueToday > 0 && (
                <Link
                  href="/ancrages"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Reviser maintenant
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </FadeIn>

          {/* Progress snapshot */}
          <FadeIn>
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-[13px] font-semibold">Progression</h3>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">
                    {stats.lessonsCompleted}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Lecons lues</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">
                    {stats.totalQuizSessions}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Quiz faits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">
                    {srStats.total}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Cartes totales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">
                    {srStats.dueToday + srStats.dueTomorrow}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">A revoir bientot</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Quick nav */}
          <FadeIn>
            <nav className="space-y-0.5">
              {[
                { href: "/cours", icon: BookOpen, label: "Explorer les cours" },
                { href: "/ancrages", icon: Brain, label: "Ancrages" },
                { href: "/profil", icon: BarChart3, label: "Mon profil" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </FadeIn>
        </div>
      </div>
    </Stagger>
  );
}
