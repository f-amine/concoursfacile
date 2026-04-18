"use client";

import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ArrowLeft,
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
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

export default function QuizResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const { data: results, isLoading } = api.quiz.getResults.useQuery(
    { sessionId },
    { refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Chargement des resultats...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Resultats introuvables</p>
      </div>
    );
  }

  const correctCount = results.responses.filter(
    (r) => r.isCorrect === true,
  ).length;
  const totalCount = results.responses.length;
  const scorePercent = results.score ?? 0;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}min ${sec}s`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <Button variant="ghost" onClick={() => router.push("/cours")}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Retour aux cours
      </Button>

      {/* Summary card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                scorePercent >= 70
                  ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                  : scorePercent >= 50
                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400"
                    : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
              )}
            >
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {Math.round(scorePercent)}%
              </CardTitle>
              <CardDescription>
                {correctCount}/{totalCount} reponses correctes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={scorePercent} className="h-2" />
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(results.timeSpentMs)}
            </span>
            <span>
              {results.earnedPoints}/{results.totalPoints} points
            </span>
            <Badge variant="outline">
              {results.mode === "STUDY" ? "Etude" : "Examen"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed corrections */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Corrections detaillees</h2>
        {results.responses.map((response, index) => (
          <Card
            key={index}
            className={cn(
              "border-l-4",
              response.isCorrect
                ? "border-l-green-500"
                : "border-l-red-500",
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Question {index + 1}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {response.question.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {response.question.chapterTitle}
                    </Badge>
                  </div>
                  <p className="font-medium">{response.question.text}</p>
                </div>
                <div className="flex items-center gap-1">
                  {response.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {response.pointsEarned}/{response.question.points}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {response.question.answers.map((answer) => {
                const wasSelected = response.selectedAnswerIds.includes(
                  answer.id,
                );
                return (
                  <div
                    key={answer.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-sm",
                      answer.isCorrect &&
                        "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
                      !answer.isCorrect &&
                        wasSelected &&
                        "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p>{answer.text}</p>
                        {answer.isCorrect && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                        )}
                        {!answer.isCorrect && wasSelected && (
                          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                        )}
                      </div>
                      {answer.explanation && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {answer.explanation}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {answer.selectedPercent}%
                    </span>
                  </div>
                );
              })}

              {response.question.explanation && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium">Correction :</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {response.question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
