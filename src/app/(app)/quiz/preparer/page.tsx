"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ListChecks,
  Sparkles,
  GraduationCap,
  Timer,
  CheckCircle2,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

const filterOptions = [
  { value: "all", label: "Toutes", hint: "Tirage complet" },
  { value: "unanswered", label: "Non repondues", hint: "Que vous n'avez pas encore vues" },
  { value: "incorrect", label: "Incorrectes", hint: "Vos erreurs precedentes" },
] as const;

const modeOptions = [
  {
    value: "STUDY" as const,
    label: "Etude",
    icon: GraduationCap,
    desc: "Correction immediate apres chaque question",
  },
  {
    value: "EXAM" as const,
    label: "Examen",
    icon: Timer,
    desc: "Corrections affichees a la fin uniquement",
  },
];

function QuizPreparerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chapterIds = searchParams.get("chapters")?.split(",") ?? [];

  const [mode, setMode] = useState<"STUDY" | "EXAM">("STUDY");
  const [filter, setFilter] = useState<"all" | "unanswered" | "incorrect">(
    "all",
  );

  const { data: stats, isLoading } = api.question.listByChapter.useQuery(
    { chapterIds },
    { enabled: chapterIds.length > 0 },
  );

  const { data: history } = api.quiz.history.useQuery(
    { chapterIds, limit: 5 },
    { enabled: chapterIds.length > 0 },
  );

  const createQuiz = api.quiz.create.useMutation({
    onSuccess: (data) => {
      router.push(`/quiz/${data.sessionId}`);
    },
  });

  const handleStart = () => {
    createQuiz.mutate({ chapterIds, mode, filter });
  };

  if (chapterIds.length === 0) {
    return (
      <div className="mx-auto max-w-md pt-16">
        <div className="rounded-2xl border border-dashed bg-card/40 px-6 py-14 text-center">
          <ListChecks className="mx-auto h-7 w-7 text-muted-foreground/40" />
          <p className="mt-4 text-[13px] text-muted-foreground">
            Aucun chapitre selectionne. Choisissez un chapitre depuis la matiere
            pour preparer un quiz.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => router.push("/cours")}
          >
            Retour aux cours
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = stats?.total ?? 0;
  const answered = stats?.answered ?? 0;
  const unanswered = totalQuestions - answered;
  const accuracy =
    answered > 0
      ? Math.round(
          (Object.values(stats?.byType ?? {}).reduce(
            (s, d) => s + d.correct,
            0,
          ) /
            answered) *
            100,
        )
      : null;

  return (
    <div className="mx-auto max-w-2xl pt-8 pb-12">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-10 inline-flex items-center gap-1 rounded-md text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Retour
      </button>

      <header className="mb-10">
        <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Quiz
        </p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-[1.1] tracking-display sm:text-[2.5rem]">
          Preparer une <span className="text-primary">session</span>.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Mode, filtre, c&apos;est parti.
        </p>
      </header>

      {/* Big stats panel */}
      <section className="mb-8 grid grid-cols-3 gap-3 border-y border-border/70 py-6">
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Disponibles
          </p>
          {isLoading ? (
            <div className="mt-1.5 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1.5 font-display-num text-[2rem] font-semibold tabular-nums leading-none tracking-display sm:text-[2.5rem]">
              {totalQuestions}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            question{totalQuestions !== 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Vues
          </p>
          {isLoading ? (
            <div className="mt-1.5 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1.5 font-display-num text-[2rem] font-semibold tabular-nums leading-none tracking-display text-foreground/60 sm:text-[2.5rem]">
              {answered}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
            {unanswered} restantes
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Reussite
          </p>
          {isLoading ? (
            <div className="mt-1.5 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p
              className={`mt-1.5 font-display-num text-[2rem] font-semibold tabular-nums leading-none tracking-display sm:text-[2.5rem] ${
                accuracy === null
                  ? "text-muted-foreground/60"
                  : accuracy >= 70
                    ? "text-success"
                    : accuracy >= 50
                      ? "text-warning"
                      : "text-destructive"
              }`}
            >
              {accuracy === null ? "—" : `${accuracy}`}
              {accuracy !== null && (
                <span className="text-[1.25rem]">%</span>
              )}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {accuracy === null ? "Aucune session" : "moyenne"}
          </p>
        </div>
      </section>

      {/* Mode segmented */}
      <section className="mb-8">
        <p className="mb-3 text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Mode
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {modeOptions.map((opt) => {
            const active = mode === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                aria-pressed={active}
                className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60 ${
                  active
                    ? "border-primary bg-primary/[0.06] shadow-xs"
                    : "border-border bg-card hover:border-border hover:bg-muted/40"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[14px] font-semibold tracking-tight ${
                      active ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                    {opt.desc}
                  </p>
                </div>
                {active && (
                  <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter */}
      <section className="mb-8">
        <p className="mb-3 text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Filtre
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {filterOptions.map((opt) => {
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                aria-pressed={active}
                className={`rounded-xl border p-3 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60 ${
                  active
                    ? "border-primary bg-primary/[0.06]"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <p
                  className={`text-[13px] font-semibold ${
                    active ? "text-primary" : "text-foreground"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {opt.hint}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Question type breakdown (collapsed list) */}
      {!isLoading && stats?.byType && Object.keys(stats.byType).length > 0 && (
        <section className="mb-8">
          <p className="mb-3 text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Repartition
          </p>
          <ul className="divide-y divide-border/70 border-y border-border/70">
            {Object.entries(stats.byType).map(([type, data]) => {
              const acc =
                data.answered > 0
                  ? Math.round((data.correct / data.answered) * 100)
                  : null;
              return (
                <li
                  key={type}
                  className="flex items-center justify-between py-3 text-[13px]"
                >
                  <span className="font-medium tracking-wide uppercase text-foreground/80">
                    {type}
                  </span>
                  <span className="flex items-center gap-3 tabular-nums">
                    <span className="text-foreground font-display-num font-semibold">
                      {data.total}
                    </span>
                    {acc !== null && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          acc >= 70
                            ? "bg-success/10 text-success"
                            : acc >= 50
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {acc}%
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <section className="mb-8">
          <p className="mb-3 text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Sessions precedentes
          </p>
          <ul className="space-y-1">
            {history.map((session) => {
              const score =
                session.score !== null ? Math.round(session.score) : null;
              const tone =
                score === null
                  ? "muted"
                  : score >= 70
                    ? "success"
                    : score >= 50
                      ? "warning"
                      : "destructive";
              return (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {session.mode === "STUDY" ? "Etude" : "Examen"}
                      <span className="ml-1.5 text-[11px] font-normal text-muted-foreground tabular-nums">
                        {session._count.responses} questions
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {session.finishedAt
                        ? new Date(session.finishedAt).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "long" },
                          )
                        : "En cours"}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                      tone === "success"
                        ? "bg-success/10 text-success"
                        : tone === "warning"
                          ? "bg-warning/10 text-warning"
                          : tone === "destructive"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {score !== null ? `${score}%` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Big start CTA */}
      <button
        type="button"
        onClick={handleStart}
        disabled={createQuiz.isPending || isLoading}
        className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl bg-primary px-6 py-5 text-left text-primary-foreground shadow-lg outline-none transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        <div
          aria-hidden="true"
          className="bg-dot-grid pointer-events-none absolute inset-0 text-white/[0.06]"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/70">
              Demarrer
            </p>
            <p className="text-[16px] font-semibold tracking-tight">
              {createQuiz.isPending
                ? "Creation..."
                : `Commencer le quiz · ${mode === "STUDY" ? "Etude" : "Examen"}`}
            </p>
          </div>
        </div>
        <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
      </button>

      {createQuiz.error && (
        <p className="mt-3 text-center text-[12px] text-destructive">
          {createQuiz.error.message}
        </p>
      )}
    </div>
  );
}

export default function QuizPreparerPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-4 pt-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-12 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        </div>
      }
    >
      <QuizPreparerContent />
    </Suspense>
  );
}
