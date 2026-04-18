"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";

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
    createQuiz.mutate({
      chapterIds,
      mode,
      filter,
    });
  };

  if (chapterIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">
          Aucun chapitre selectionne. Retournez aux cours pour choisir un
          chapitre.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/cours")}
        >
          Retour aux cours
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preparer un quiz</h1>
        <p className="text-muted-foreground">
          Configurez votre session de questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions disponibles</CardTitle>
          <CardDescription>
            {isLoading
              ? "Chargement..."
              : `${stats?.total ?? 0} questions au total, ${stats?.answered ?? 0} deja repondues`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats?.byType &&
            Object.entries(stats.byType).map(([type, data]) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{type}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.total} questions &middot; {data.correct}/{data.answered}{" "}
                    correct
                  </p>
                </div>
                <Badge variant="secondary">{data.total}</Badge>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="exam-mode" className="flex flex-col gap-1">
              <span>Mode examen</span>
              <span className="text-xs font-normal text-muted-foreground">
                {mode === "EXAM"
                  ? "Corrections affichees a la fin"
                  : "Correction apres chaque question"}
              </span>
            </Label>
            <Switch
              id="exam-mode"
              checked={mode === "EXAM"}
              onCheckedChange={(checked) =>
                setMode(checked ? "EXAM" : "STUDY")
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Filtrer les questions</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "all", label: "Toutes" },
                  { value: "unanswered", label: "Non repondues" },
                  { value: "incorrect", label: "Incorrectes" },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.value}
                  variant={filter === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {session.mode === "STUDY" ? "Etude" : "Examen"} &middot;{" "}
                      {session._count.responses} questions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.finishedAt
                        ? new Date(session.finishedAt).toLocaleDateString(
                            "fr-FR",
                          )
                        : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      session.score !== null && session.score >= 50
                        ? "default"
                        : "secondary"
                    }
                  >
                    {session.score !== null
                      ? `${Math.round(session.score)}%`
                      : "-"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleStart}
        disabled={createQuiz.isPending || isLoading}
      >
        {createQuiz.isPending ? "Creation..." : "Commencer le quiz"}
      </Button>

      {createQuiz.error && (
        <p className="text-center text-sm text-destructive">
          {createQuiz.error.message}
        </p>
      )}
    </div>
  );
}

export default function QuizPreparerPage() {
  return (
    <Suspense fallback={<div className="p-6">Chargement...</div>}>
      <QuizPreparerContent />
    </Suspense>
  );
}
