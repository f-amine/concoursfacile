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
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";

const qualityLabels = [
  { value: 0, label: "Aucune idee", color: "bg-red-500" },
  { value: 1, label: "Incorrect", color: "bg-red-400" },
  { value: 2, label: "Presque", color: "bg-orange-400" },
  { value: 3, label: "Difficile", color: "bg-yellow-400" },
  { value: 4, label: "Bien", color: "bg-green-400" },
  { value: 5, label: "Facile", color: "bg-green-500" },
];

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
        // All cards reviewed — invalidate and show completion
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

  // No cards due
  if (!isLoading && (!cards || cards.length === 0)) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ancrages</h1>
          <p className="text-muted-foreground">
            Revision par repetition espacee
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Aujourd&apos;hui</CardDescription>
                <CardTitle className="text-2xl">{stats.dueToday}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Demain</CardDescription>
                <CardTitle className="text-2xl">{stats.dueTomorrow}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Plus tard</CardDescription>
                <CardTitle className="text-2xl">{stats.dueLater}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium">Tout est a jour !</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats?.total === 0
                ? "Repondez a des quiz pour ajouter des cartes de revision"
                : "Revenez demain pour vos prochaines revisions"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/cours")}
            >
              Aller aux cours
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All current batch reviewed
  if (cards && currentIndex >= cards.length) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ancrages</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium">
              {reviewedCount} carte{reviewedCount > 1 ? "s" : ""} revisee
              {reviewedCount > 1 ? "s" : ""} !
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Continuez comme ca !
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentIndex(0);
                  setReviewedCount(0);
                  void utils.spacedRepetition.getDueCards.invalidate();
                }}
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                Recharger
              </Button>
              <Button onClick={() => router.push("/tableau-de-bord")}>
                Tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !question) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Chargement des cartes...</p>
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ancrages</h1>
          <p className="text-sm text-muted-foreground">
            Carte {currentIndex + 1} / {cards?.length ?? 0} &middot;{" "}
            {reviewedCount} revisee{reviewedCount > 1 ? "s" : ""}
          </p>
        </div>
        {stats && (
          <Badge variant="secondary">
            <Brain className="mr-1 h-3 w-3" />
            {stats.dueToday} restante{stats.dueToday > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{question.chapter.subject.concours.name}</span>
            <span>&middot;</span>
            <span>{question.chapter.subject.name}</span>
            <span>&middot;</span>
            <span>{question.chapter.title}</span>
          </div>
          <CardTitle className="mt-2 text-lg leading-relaxed">
            {question.text}
          </CardTitle>
          <Badge variant="secondary" className="w-fit">
            {question.type}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.answers.map((answer) => {
            const isSelected = selectedAnswers.has(answer.id);
            const isAnswerCorrect = answer.isCorrect;

            return (
              <button
                key={answer.id}
                onClick={() => toggleAnswer(answer.id)}
                disabled={showAnswer}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  !showAnswer && isSelected && "border-primary bg-primary/5",
                  !showAnswer && !isSelected && "hover:bg-muted/50",
                  showAnswer &&
                    isAnswerCorrect &&
                    "border-green-500 bg-green-50 dark:bg-green-950/30",
                  showAnswer &&
                    !isAnswerCorrect &&
                    isSelected &&
                    "border-red-500 bg-red-50 dark:bg-red-950/30",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  className="mt-0.5"
                  disabled={showAnswer}
                />
                <span className="flex-1 text-sm">{answer.text}</span>
                {showAnswer && isAnswerCorrect && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                )}
                {showAnswer && !isAnswerCorrect && isSelected && (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
              </button>
            );
          })}

          {/* Correction */}
          {showAnswer && (
            <div
              className={cn(
                "mt-4 rounded-lg border p-4",
                isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
              )}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {isCorrect ? "Correct !" : "Incorrect"}
                </span>
              </div>
              {question.explanation && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {!showAnswer ? (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleReveal}
                disabled={selectedAnswers.size === 0}
              >
                Verifier
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              <p className="text-center text-sm font-medium">
                A quel point avez-vous trouve cette question facile ?
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {qualityLabels.map((q) => (
                  <Button
                    key={q.value}
                    variant="outline"
                    size="sm"
                    className="flex flex-col gap-1 py-3"
                    onClick={() => handleRate(q.value)}
                    disabled={reviewCard.isPending}
                  >
                    <div
                      className={cn("h-2 w-2 rounded-full", q.color)}
                    />
                    <span className="text-xs">{q.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
