"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Sparkles,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";

type QualityTone = "destructive" | "warning" | "success";

const qualityScale: {
  value: number;
  label: string;
  tone: QualityTone;
  intensity: 1 | 2;
}[] = [
  { value: 0, label: "Aucune idee", tone: "destructive", intensity: 2 },
  { value: 1, label: "Incorrect", tone: "destructive", intensity: 1 },
  { value: 2, label: "Presque", tone: "warning", intensity: 2 },
  { value: 3, label: "Difficile", tone: "warning", intensity: 1 },
  { value: 4, label: "Bien", tone: "success", intensity: 1 },
  { value: 5, label: "Facile", tone: "success", intensity: 2 },
];

const toneClasses: Record<QualityTone, { strong: string; soft: string; text: string }> = {
  destructive: {
    strong: "border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/20",
    soft: "border-destructive/30 bg-destructive/[0.06] text-destructive hover:bg-destructive/10",
    text: "text-destructive",
  },
  warning: {
    strong: "border-warning/40 bg-warning/15 text-warning hover:bg-warning/20",
    soft: "border-warning/30 bg-warning/[0.06] text-warning hover:bg-warning/10",
    text: "text-warning",
  },
  success: {
    strong: "border-success/40 bg-success/15 text-success hover:bg-success/20",
    soft: "border-success/30 bg-success/[0.06] text-success hover:bg-success/10",
    text: "text-success",
  },
};

export default function AncragesPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(
    new Set(),
  );
  const [reviewedCount, setReviewedCount] = useState(0);

  const utils = api.useUtils();

  const { data: stats } = api.spacedRepetition.getStats.useQuery();
  const { data: cards, isLoading } = api.spacedRepetition.getDueCards.useQuery({
    limit: 20,
  });

  const reviewCard = api.spacedRepetition.reviewCard.useMutation({
    onSuccess: () => {
      setReviewedCount((c) => c + 1);
      setShowAnswer(false);
      setSelectedAnswers(new Set());

      if (cards && currentIndex < cards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        void utils.spacedRepetition.getStats.invalidate();
        void utils.spacedRepetition.getDueCards.invalidate();
      }
    },
  });

  const currentCard = cards?.[currentIndex];
  const question = currentCard?.question;

  const toggleAnswer = useCallback(
    (answerId: string) => {
      if (showAnswer) return;
      setSelectedAnswers((prev) => {
        const next = new Set(prev);
        if (next.has(answerId)) {
          next.delete(answerId);
        } else {
          if (question?.type === "QCM") next.clear();
          next.add(answerId);
        }
        return next;
      });
    },
    [showAnswer, question?.type],
  );

  const handleReveal = () => setShowAnswer(true);

  const handleRate = (quality: number) => {
    if (!currentCard) return;
    reviewCard.mutate({ cardId: currentCard.id, quality });
  };

  // Empty inbox
  if (!isLoading && (!cards || cards.length === 0)) {
    return (
      <div className="mx-auto max-w-xl space-y-6 pt-8">
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Repetition espacee
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.1] tracking-display sm:text-[2.5rem]">
            <span className="text-primary">Ancrages</span>.
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Memoire long terme. Une carte revue au bon moment vaut dix relectures.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Aujourd'hui", value: stats.dueToday, accent: true },
              { label: "Demain", value: stats.dueTomorrow, accent: false },
              { label: "Plus tard", value: stats.dueLater, accent: false },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-xl border bg-card p-4 shadow-xs",
                  s.accent && stats.dueToday > 0 && "border-primary/30 bg-primary/[0.04]",
                )}
              >
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p
                  className={cn(
                    "mt-1.5 text-[1.5rem] font-semibold tabular-nums leading-none tracking-tight",
                    s.accent && stats.dueToday > 0 && "text-primary",
                  )}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border bg-card p-8 text-center shadow-xs">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 ring-1 ring-success/20">
            <Trophy className="h-6 w-6 text-success" />
          </span>
          <p className="mt-4 text-[15px] font-semibold tracking-tight">
            Tout est a jour.
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {stats?.total === 0
              ? "Repondez a quelques quiz pour commencer a remplir votre paquet de revisions."
              : "Revenez demain pour les prochaines cartes a ancrer."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5"
            onClick={() => router.push("/cours")}
          >
            Aller aux cours
          </Button>
        </div>
      </div>
    );
  }

  // Batch finished
  if (cards && currentIndex >= cards.length) {
    return (
      <div className="mx-auto max-w-xl space-y-6 pt-8">
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Repetition espacee
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.1] tracking-display sm:text-[2.5rem]">
            <span className="text-primary">Ancrages</span>.
          </h1>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center shadow-xs">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 ring-1 ring-success/20">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </span>
          <p className="mt-4 text-[15px] font-semibold tracking-tight">
            {reviewedCount} carte{reviewedCount > 1 ? "s" : ""} revisee
            {reviewedCount > 1 ? "s" : ""}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Bon rythme. Revenez demain pour la prochaine session.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentIndex(0);
                setReviewedCount(0);
                void utils.spacedRepetition.getDueCards.invalidate();
              }}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Recharger
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/tableau-de-bord")}
            >
              Tableau de bord
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading || !question) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pt-8">
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const correctAnswerIds = new Set(
    question.answers.filter((a) => a.isCorrect).map((a) => a.id),
  );
  const isCorrect =
    showAnswer &&
    correctAnswerIds.size === selectedAnswers.size &&
    [...correctAnswerIds].every((id) => selectedAnswers.has(id));
  const totalCards = cards?.length ?? 0;
  const progressPct = totalCards > 0 ? ((currentIndex + (showAnswer ? 0.5 : 0)) / totalCards) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-8 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Repetition espacee
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.1] tracking-display sm:text-[2.5rem]">
            <span className="text-primary">Ancrages</span>.
          </h1>
          <p className="mt-2 text-[13px] tabular-nums text-muted-foreground">
            Carte{" "}
            <span className="font-semibold text-foreground">
              {currentIndex + 1}
            </span>{" "}
            sur {totalCards}
            {reviewedCount > 0 && (
              <>
                <span className="mx-1.5 text-border">/</span>
                {reviewedCount} revisee{reviewedCount > 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>
        {stats && stats.dueToday > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-[12px] font-medium text-primary">
            <Brain className="h-3 w-3" />
            {stats.dueToday} restante{stats.dueToday > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <article className="rounded-2xl border bg-card shadow-xs">
        <header className="border-b border-border/70 px-5 py-4">
          <p className="flex flex-wrap items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
            <span>{question.chapter.subject.concours.name}</span>
            <span className="text-border">/</span>
            <span>{question.chapter.subject.name}</span>
            <span className="text-border">/</span>
            <span>{question.chapter.title}</span>
          </p>
          <h2 className="mt-2 text-[1.0625rem] font-medium leading-relaxed text-foreground">
            {question.text}
          </h2>
          <span className="mt-3 inline-flex rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase text-foreground/70">
            {question.type}
          </span>
        </header>

        <div className="space-y-2.5 px-5 py-5">
          {question.answers.map((answer) => {
            const isSelected = selectedAnswers.has(answer.id);
            const isAnswerCorrect = answer.isCorrect;
            return (
              <button
                key={answer.id}
                onClick={() => toggleAnswer(answer.id)}
                disabled={showAnswer}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60",
                  !showAnswer &&
                    isSelected &&
                    "border-primary bg-primary/[0.06] shadow-xs",
                  !showAnswer &&
                    !isSelected &&
                    "border-border/70 bg-card hover:border-border hover:bg-muted/50",
                  showAnswer &&
                    isAnswerCorrect &&
                    "border-success/40 bg-success/[0.06]",
                  showAnswer &&
                    !isAnswerCorrect &&
                    isSelected &&
                    "border-destructive/40 bg-destructive/[0.06]",
                  showAnswer &&
                    !isAnswerCorrect &&
                    !isSelected &&
                    "border-border/70 bg-card opacity-70",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  className="mt-0.5"
                  disabled={showAnswer}
                />
                <span className="flex-1 text-[13px] leading-relaxed">
                  {answer.text}
                </span>
                {showAnswer && isAnswerCorrect && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                )}
                {showAnswer && !isAnswerCorrect && isSelected && (
                  <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                )}
              </button>
            );
          })}

          {showAnswer && (
            <div
              className={cn(
                "rounded-xl border p-4",
                isCorrect
                  ? "border-success/30 bg-success/[0.06]"
                  : "border-destructive/30 bg-destructive/[0.06]",
              )}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-[13px] font-semibold",
                    isCorrect ? "text-success" : "text-destructive",
                  )}
                >
                  {isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              {question.explanation && (
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
                  {question.explanation}
                </p>
              )}
            </div>
          )}

          {!showAnswer ? (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleReveal}
                disabled={selectedAnswers.size === 0}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Reveler la reponse
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-3">
              <div className="text-center">
                <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  Auto-evaluation
                </p>
                <p className="mt-1 text-[13px] font-medium">
                  A quel point cette question vous a-t-elle paru facile ?
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {qualityScale.map((q) => {
                  const cls = toneClasses[q.tone];
                  return (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => handleRate(q.value)}
                      disabled={reviewCard.isPending}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-[11px] font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50",
                        q.intensity === 2 ? cls.strong : cls.soft,
                      )}
                    >
                      <span className="text-[15px] font-semibold tabular-nums leading-none">
                        {q.value}
                      </span>
                      <span className="leading-tight">{q.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
