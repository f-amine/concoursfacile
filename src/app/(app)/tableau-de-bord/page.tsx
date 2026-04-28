import Link from "next/link";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Brain,
  FileQuestion,
  Flame,
  BarChart3,
  Sparkles,
} from "lucide-react";

import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";
import { Stagger, FadeIn } from "./animated";

function scoreTone(score: number) {
  if (score >= 70) return "success" as const;
  if (score >= 50) return "warning" as const;
  return "destructive" as const;
}

const toneRing: Record<"success" | "warning" | "destructive", string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

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
  const hasAnything = recentLessons.length > 0 || stats.recentSessions.length > 0;

  const totalDue = srStats.dueToday + srStats.dueTomorrow + srStats.dueLater;
  const todayShare =
    totalDue > 0 ? Math.round((srStats.dueToday / totalDue) * 100) : 0;
  const tomorrowShare =
    totalDue > 0 ? Math.round((srStats.dueTomorrow / totalDue) * 100) : 0;
  const laterShare =
    totalDue > 0 ? Math.max(0, 100 - todayShare - tomorrowShare) : 0;

  const progressionRows = [
    {
      label: "Lecons lues",
      value: stats.lessonsCompleted,
      max: Math.max(stats.lessonsCompleted, 20),
      tone: "primary" as const,
    },
    {
      label: "Quiz faits",
      value: stats.totalQuizSessions,
      max: Math.max(stats.totalQuizSessions, 10),
      tone: "primary" as const,
    },
    {
      label: "Cartes ancrees",
      value: srStats.total,
      max: Math.max(srStats.total, 30),
      tone: "success" as const,
    },
    {
      label: "A revoir bientot",
      value: srStats.dueToday + srStats.dueTomorrow,
      max: Math.max(srStats.total, 30),
      tone: "warning" as const,
    },
  ];

  return (
    <Stagger className="space-y-12 pt-8 sm:pt-10">
      {/* ── Greeting (display scale) ─────────────────────────── */}
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
              {formattedDate}
            </p>
            <h1 className="mt-2 text-[2.5rem] font-semibold leading-[1.05] tracking-display sm:text-[3.25rem] lg:text-[3.75rem]">
              Bonjour,{" "}
              <span className="text-primary">{userName}</span>.
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              {srStats.dueToday > 0
                ? `${srStats.dueToday} carte${srStats.dueToday > 1 ? "s" : ""} a ancrer aujourd'hui. Le rythme avant le volume.`
                : "Aucune revision urgente. Lisez, testez, ancrez."}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* ── Continue hero (deep blue focal moment) ──────────── */}
      {lastLesson ? (
        <FadeIn>
          <Link
            href={`/cours/${lastLesson.lesson.chapter.subject.concours.slug}/${lastLesson.lesson.chapter.subject.slug}/${lastLesson.lesson.chapter.slug}/${lastLesson.lesson.slug}`}
            className="group relative block overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg outline-none transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {/* Dot-grid texture echoing the landing hero */}
            <div
              aria-hidden="true"
              className="bg-dot-grid pointer-events-none absolute inset-0 text-white/[0.07]"
            />
            {/* Diagonal sheen on hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_top_right,white/15,transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            {/* Content */}
            <div className="relative grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:gap-10 lg:px-14 lg:py-14">
              <div className="min-w-0">
                <p className="text-[10px] font-medium tracking-[0.24em] text-white/60 uppercase">
                  Continuer ou j&apos;en etais
                </p>
                <h2 className="mt-3 max-w-2xl text-[1.625rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem] lg:text-[2.5rem]">
                  {lastLesson.lesson.title}
                </h2>
                <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/70">
                  <span className="font-medium text-white/90">
                    {lastLesson.lesson.chapter.subject.concours.name}
                  </span>
                  <span aria-hidden="true" className="text-white/30">/</span>
                  <span>{lastLesson.lesson.chapter.subject.name}</span>
                  <span aria-hidden="true" className="text-white/30">/</span>
                  <span className="truncate">{lastLesson.lesson.chapter.title}</span>
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    {lastLesson.lesson.readingTimeMin} min
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                    <BookOpen className="h-3 w-3" />
                    {lastLesson.lesson.chapter.subject.name}
                  </span>
                </div>
              </div>

              <div className="flex items-end lg:items-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-primary shadow-md transition-transform group-hover:translate-x-1">
                  Reprendre
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        </FadeIn>
      ) : (
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-10 sm:px-10 sm:py-12">
            <div
              aria-hidden="true"
              className="bg-dot-grid pointer-events-none absolute inset-0 text-primary/[0.06]"
            />
            <div className="relative max-w-xl">
              <p className="text-[10px] font-medium tracking-[0.24em] text-primary uppercase">
                Premier pas
              </p>
              <h2 className="mt-2 text-[1.625rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">
                Choisissez votre concours pour demarrer.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                Lisez les premieres lecons gratuites, lancez un quiz pour calibrer votre niveau, puis laissez les ancrages prendre le relais.
              </p>
              <Link
                href="/cours"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground shadow-md outline-none transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                Explorer les cours
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── Action lanes (asymmetric: Ancrages dominant, Cours/Quiz stacked) ── */}
      <div className="grid gap-3 lg:grid-cols-3 lg:grid-rows-2">
        {/* Ancrages — wide tile */}
        <FadeIn className="lg:col-span-2 lg:row-span-2">
          <Link
            href="/ancrages"
            className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-xs outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/60 sm:p-7 ${
              srStats.dueToday > 0
                ? "border-primary/20 bg-primary/[0.04]"
                : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  srStats.dueToday > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/60"
                }`}
              >
                <Brain className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Ancrages
              </span>
            </div>

            <div className="mt-8 flex items-end gap-4">
              <span className="font-display-num text-[4rem] font-semibold leading-none tracking-display sm:text-[5rem]">
                {srStats.dueToday}
              </span>
              <span className="mb-2 text-[14px] text-muted-foreground">
                carte{srStats.dueToday !== 1 ? "s" : ""} a revoir
                <br />
                aujourd&apos;hui
              </span>
            </div>

            {/* 3-segment forecast strip */}
            <div className="mt-7">
              <div className="flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
                <span className="text-foreground/70">Prochains jours</span>
                <span>{totalDue} au total</span>
              </div>
              {totalDue > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {[
                    {
                      label: "Auj.",
                      count: srStats.dueToday,
                      pct: todayShare,
                      strong: true,
                    },
                    {
                      label: "Demain",
                      count: srStats.dueTomorrow,
                      pct: tomorrowShare,
                      strong: false,
                    },
                    {
                      label: "+ tard",
                      count: srStats.dueLater,
                      pct: laterShare,
                      strong: false,
                    },
                  ].map((seg) => (
                    <div
                      key={seg.label}
                      className={`overflow-hidden rounded-lg border px-3 py-2.5 ${
                        seg.strong
                          ? "border-primary/30 bg-primary/10"
                          : "border-border/70 bg-card"
                      }`}
                    >
                      <p
                        className={`text-[10px] font-medium tracking-wide uppercase ${
                          seg.strong ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {seg.label}
                      </p>
                      <p
                        className={`mt-1 text-[18px] font-semibold tabular-nums leading-none ${
                          seg.strong ? "text-primary" : "text-foreground/80"
                        }`}
                      >
                        {seg.count}
                      </p>
                      <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${
                            seg.strong ? "bg-primary" : "bg-foreground/30"
                          }`}
                          style={{ width: `${Math.max(seg.pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-lg border border-dashed border-border/70 bg-card px-3 py-3 text-center text-[12px] text-muted-foreground">
                  Pas encore de cartes. Repondez a un quiz pour ancrer.
                </div>
              )}
            </div>

            <span
              className={`mt-auto flex items-center justify-between gap-2 pt-7 text-[14px] font-semibold ${
                srStats.dueToday > 0 ? "text-primary" : "text-foreground/80"
              }`}
            >
              <span>
                {srStats.dueToday > 0 ? "Reviser maintenant" : "Voir le paquet"}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </FadeIn>

        {/* Cours — small */}
        <FadeIn>
          <Link
            href="/cours"
            className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-xs outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground/70">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Cours
              </span>
            </div>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-display-num text-[2.25rem] font-semibold leading-none tracking-display">
                {stats.lessonsCompleted}
              </span>
              <span className="text-[12px] text-muted-foreground">
                lue{stats.lessonsCompleted !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="mt-auto flex items-center justify-between pt-4 text-[13px] font-medium text-foreground/80 transition-colors group-hover:text-foreground">
              Explorer
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </FadeIn>

        {/* Quiz — small */}
        <FadeIn>
          <Link
            href="/cours"
            className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-xs outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground/70">
                <FileQuestion className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Quiz
              </span>
            </div>
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="font-display-num text-[2.25rem] font-semibold leading-none tracking-display">
                {stats.totalQuizSessions}
              </span>
              <span className="text-[12px] text-muted-foreground">
                session{stats.totalQuizSessions !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="mt-auto flex items-center justify-between pt-4 text-[13px] font-medium text-foreground/80 transition-colors group-hover:text-foreground">
              Lancer un quiz
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </FadeIn>
      </div>

      {/* ── Activity + Sidebar ───────────────────────────── */}
      <div className="grid gap-10 lg:grid-cols-5">
        {/* Main — recent activity */}
        <div className="space-y-12 lg:col-span-3">
          {otherLessons.length > 0 && (
            <FadeIn>
              <section>
                <header className="mb-5 flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                      Activite
                    </p>
                    <h3 className="mt-1 text-[1.25rem] font-semibold tracking-tight">
                      Visites recentes
                    </h3>
                  </div>
                  <Link
                    href="/cours"
                    className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Tout voir &rarr;
                  </Link>
                </header>
                <ol className="-mx-2 space-y-px">
                  {otherLessons.map((progress, i) => {
                    const { lesson } = progress;
                    const { chapter } = lesson;
                    const href = `/cours/${chapter.subject.concours.slug}/${chapter.subject.slug}/${chapter.slug}/${lesson.slug}`;

                    return (
                      <li key={progress.id}>
                        <Link
                          href={href}
                          className="group flex items-center gap-4 rounded-xl px-2 py-3 outline-none transition-colors hover:bg-muted/70 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          <span className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground/70 group-hover:text-primary">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-medium leading-tight">
                              {lesson.title}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                              {chapter.subject.name}{" "}
                              <span className="text-border">/</span> {chapter.title}
                            </span>
                          </span>
                          <span className="hidden items-center gap-1 text-[11px] tabular-nums text-muted-foreground sm:flex">
                            <Clock className="h-3 w-3" />
                            {lesson.readingTimeMin}m
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/0 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </FadeIn>
          )}

          {stats.recentSessions.length > 0 && (
            <FadeIn>
              <section>
                <header className="mb-5">
                  <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                    Performance
                  </p>
                  <h3 className="mt-1 text-[1.25rem] font-semibold tracking-tight">
                    Resultats recents
                  </h3>
                </header>
                <div className="grid gap-3 sm:grid-cols-2">
                  {stats.recentSessions.slice(0, 4).map((s) => {
                    const scorePercent =
                      s.score !== null ? Math.round(s.score) : null;
                    const tone =
                      scorePercent !== null
                        ? scoreTone(scorePercent)
                        : "destructive";
                    const radius = 16;
                    const circumference = 2 * Math.PI * radius;
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-xs"
                      >
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                          <svg
                            viewBox="0 0 40 40"
                            className="h-14 w-14 -rotate-90"
                          >
                            <circle
                              cx="20"
                              cy="20"
                              r={radius}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-secondary"
                            />
                            {scorePercent !== null && (
                              <circle
                                cx="20"
                                cy="20"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={
                                  circumference -
                                  (scorePercent / 100) * circumference
                                }
                                className={toneRing[tone]}
                              />
                            )}
                          </svg>
                          <span className="absolute font-display-num text-[13px] font-semibold tabular-nums">
                            {scorePercent ?? "-"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold tracking-tight">
                            {s.mode === "STUDY" ? "Mode etude" : "Mode examen"}
                          </p>
                          <p className="text-[11px] text-muted-foreground tabular-nums">
                            {s.earnedPoints}/{s.totalPoints} pts
                            {s.finishedAt && (
                              <>
                                <span className="mx-1 text-border">/</span>
                                {new Date(s.finishedAt).toLocaleDateString(
                                  "fr-FR",
                                  { day: "numeric", month: "short" },
                                )}
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

          {!hasAnything && (
            <FadeIn>
              <div className="relative overflow-hidden rounded-2xl border border-dashed bg-card/40 px-6 py-14 text-center">
                <div
                  aria-hidden="true"
                  className="bg-dot-grid pointer-events-none absolute inset-0 text-primary/[0.05]"
                />
                <div className="relative">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[18px] font-semibold tracking-tight">
                    Pret a demarrer.
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                    Choisissez votre concours, lisez les premieres lecons gratuites et lancez un quiz pour calibrer votre niveau.
                  </p>
                  <Link
                    href="/cours"
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg"
                  >
                    Explorer les cours
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Sidebar — calendar + progression */}
        <div className="space-y-6 lg:col-span-2">
          <FadeIn>
            <section className="rounded-2xl border bg-card p-6 shadow-xs">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <h3 className="text-[12px] font-semibold tracking-[0.18em] uppercase">
                    Calendrier
                  </h3>
                </div>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {totalDue} cartes
                </span>
              </header>

              <ul className="mt-5 space-y-3">
                {[
                  {
                    label: "Aujourd'hui",
                    count: srStats.dueToday,
                    accent: true,
                  },
                  {
                    label: "Demain",
                    count: srStats.dueTomorrow,
                    accent: false,
                  },
                  {
                    label: "Plus tard",
                    count: srStats.dueLater,
                    accent: false,
                  },
                ].map((row) => {
                  const active = row.accent && row.count > 0;
                  return (
                    <li key={row.label} className="flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            active ? "bg-primary" : "bg-border"
                          }`}
                        />
                        <span
                          className={`text-[14px] ${
                            active ? "font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          {row.label}
                        </span>
                      </span>
                      <span
                        className={`font-display-num text-[1.5rem] font-semibold tabular-nums leading-none tracking-display ${
                          active
                            ? "text-primary"
                            : row.count > 0
                              ? "text-foreground/80"
                              : "text-muted-foreground/50"
                        }`}
                      >
                        {row.count}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {srStats.dueToday > 0 && (
                <Link
                  href="/ancrages"
                  className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-xs transition-all hover:shadow-sm"
                >
                  Reviser maintenant
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </section>
          </FadeIn>

          <FadeIn>
            <section className="rounded-2xl border bg-card p-6 shadow-xs">
              <header className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 className="text-[12px] font-semibold tracking-[0.18em] uppercase">
                  Progression
                </h3>
              </header>

              <ul className="mt-5 space-y-4">
                {progressionRows.map((row) => {
                  const pct = row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0;
                  const barColor =
                    row.tone === "success"
                      ? "bg-success"
                      : row.tone === "warning"
                        ? "bg-warning"
                        : "bg-primary";
                  return (
                    <li key={row.label}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="font-display-num text-[15px] font-semibold tabular-nums">
                          {row.value}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </FadeIn>
        </div>
      </div>
    </Stagger>
  );
}
