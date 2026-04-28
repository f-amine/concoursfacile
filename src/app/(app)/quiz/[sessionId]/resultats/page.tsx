"use client";

import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type Tone = "success" | "warning" | "destructive";

function scoreTone(score: number): Tone {
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  return "destructive";
}

const toneStyles: Record<
  Tone,
  { ring: string; text: string; bg: string; label: string }
> = {
  success: {
    ring: "border-success/30 bg-success/[0.06]",
    text: "text-success",
    bg: "bg-success",
    label: "Reussi",
  },
  warning: {
    ring: "border-warning/30 bg-warning/[0.06]",
    text: "text-warning",
    bg: "bg-warning",
    label: "Limite",
  },
  destructive: {
    ring: "border-destructive/30 bg-destructive/[0.06]",
    text: "text-destructive",
    bg: "bg-destructive",
    label: "A retravailler",
  },
};

export default function QuizResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const { data: results, isLoading } = api.quiz.getResults.useQuery(
    { sessionId },
    { refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 pt-8">
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[13px] text-muted-foreground">
          Resultats introuvables
        </p>
      </div>
    );
  }

  const correctCount = results.responses.filter((r) => r.isCorrect === true)
    .length;
  const totalCount = results.responses.length;
  const scorePercent = Math.round(results.score ?? 0);
  const tone = scoreTone(scorePercent);
  const toneCfg = toneStyles[tone];

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}min ${sec.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-8 pb-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/cours")}
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" />
        Retour aux cours
      </Button>

      {/* Score summary */}
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card shadow-xs",
          toneCfg.ring,
        )}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  toneCfg.text,
                  "bg-card shadow-sm ring-1 ring-current/20",
                )}
              >
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  Resultat
                </p>
                <p className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-[2.5rem] font-semibold tabular-nums leading-none tracking-tight">
                    {scorePercent}%
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                      toneCfg.text,
                      "bg-current/10",
                    )}
                  >
                    {toneCfg.label}
                  </span>
                </p>
                <p className="mt-1 text-[13px] tabular-nums text-muted-foreground">
                  {correctCount}/{totalCount} reponses correctes
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full transition-all", toneCfg.bg)}
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5 tabular-nums">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(results.timeSpentMs)}
            </span>
            <span className="tabular-nums">
              {results.earnedPoints}/{results.totalPoints} points
            </span>
            <span className="rounded-md border border-border/70 bg-secondary px-2 py-0.5 text-[11px] font-medium tracking-wide text-foreground/70">
              {results.mode === "STUDY" ? "Etude" : "Examen"}
            </span>
          </div>
        </div>
      </section>

      {/* Detailed corrections */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold tracking-tight">
            Corrections detaillees
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/quiz/preparer")}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Nouveau quiz
          </Button>
        </div>

        <div className="space-y-3">
          {results.responses.map((response, index) => {
            const correct = response.isCorrect;
            return (
              <article
                key={index}
                className="overflow-hidden rounded-xl border bg-card shadow-xs"
              >
                <header className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
                      <span className="font-medium">Q{index + 1}</span>
                      <span className="text-border">/</span>
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 font-medium tracking-wide uppercase">
                        {response.question.type}
                      </span>
                      <span className="text-border">/</span>
                      <span className="truncate">
                        {response.question.chapterTitle}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] font-medium leading-relaxed">
                      {response.question.text}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {correct ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="text-[12px] font-semibold tabular-nums">
                      {response.pointsEarned}/{response.question.points}
                    </span>
                  </div>
                </header>

                <div className="space-y-2 px-5 py-4">
                  {response.question.answers.map((answer) => {
                    const wasSelected = response.selectedAnswerIds.includes(
                      answer.id,
                    );
                    const isCorrect = answer.isCorrect;
                    return (
                      <div
                        key={answer.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-[13px]",
                          isCorrect &&
                            "border-success/30 bg-success/[0.06]",
                          !isCorrect &&
                            wasSelected &&
                            "border-destructive/30 bg-destructive/[0.06]",
                          !isCorrect &&
                            !wasSelected &&
                            "border-border/70 bg-card",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="leading-relaxed">{answer.text}</p>
                            {isCorrect && (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                            )}
                            {!isCorrect && wasSelected && (
                              <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                            )}
                          </div>
                          {answer.explanation && (
                            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                              {answer.explanation}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                          {answer.selectedPercent}%
                        </span>
                      </div>
                    );
                  })}

                  {response.question.explanation && (
                    <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2.5">
                      <p className="text-[10px] font-medium tracking-[0.16em] text-foreground/70 uppercase">
                        Correction
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-foreground/85">
                        {response.question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
