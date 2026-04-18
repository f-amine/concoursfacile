"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  X,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type CorrectionData = {
  isCorrect: boolean | null;
  pointsEarned: number;
  explanation: string | null;
  answers: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string | null;
    selectedPercent: number;
  }[] | null;
};

export default function QuizSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [corrections, setCorrections] = useState<Map<string, CorrectionData>>(
    new Map(),
  );
  const [timerMs, setTimerMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(
    null,
  );
  const [reportMessage, setReportMessage] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: session, isLoading } = api.quiz.getSession.useQuery(
    { sessionId },
    { refetchOnWindowFocus: false },
  );

  const submitAnswer = api.quiz.submitAnswer.useMutation();
  const finishQuiz = api.quiz.finish.useMutation();
  const reportError = api.errorReport.create.useMutation();

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerMs((prev) => prev + 1000);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const currentResponse = session?.responses[currentIndex];
  const currentQuestion = currentResponse?.question;
  const questionId = currentQuestion?.id ?? "";
  const isStudyMode = session?.mode === "STUDY";
  const hasCorrection = corrections.has(questionId);
  const correction = corrections.get(questionId);

  const currentSelected = selectedAnswers.get(questionId) ?? new Set();

  // Initialize selections from existing answers
  useEffect(() => {
    if (!session) return;
    const newSelections = new Map<string, Set<string>>();
    for (const r of session.responses) {
      if (r.selectedAnswerIds.length > 0) {
        newSelections.set(r.question.id, new Set(r.selectedAnswerIds));
      }
    }
    setSelectedAnswers(newSelections);
  }, [session]);

  const toggleAnswer = useCallback(
    (answerId: string) => {
      if (hasCorrection) return;
      setSelectedAnswers((prev) => {
        const next = new Map(prev);
        const current = new Set(next.get(questionId) ?? []);
        if (current.has(answerId)) {
          current.delete(answerId);
        } else {
          // For single-answer QCM, clear previous
          if (currentQuestion?.type === "QCM") {
            current.clear();
          }
          current.add(answerId);
        }
        next.set(questionId, current);
        return next;
      });
    },
    [questionId, hasCorrection, currentQuestion?.type],
  );

  const handleVerify = async () => {
    if (!currentQuestion || currentSelected.size === 0) return;

    const result = await submitAnswer.mutateAsync({
      sessionId,
      questionId: currentQuestion.id,
      answerIds: [...currentSelected],
    });

    if (isStudyMode && result.answers) {
      setCorrections((prev) => {
        const next = new Map(prev);
        next.set(currentQuestion.id, result as CorrectionData);
        return next;
      });
    }
  };

  const handleFinish = async () => {
    // Submit any remaining unanswered questions in exam mode
    if (!isStudyMode && session) {
      for (const r of session.responses) {
        const selected = selectedAnswers.get(r.question.id);
        if (selected && selected.size > 0 && !corrections.has(r.question.id)) {
          await submitAnswer.mutateAsync({
            sessionId,
            questionId: r.question.id,
            answerIds: [...selected],
          });
        }
      }
    }

    await finishQuiz.mutateAsync({
      sessionId,
      timeSpentMs: timerMs,
    });

    router.push(`/quiz/${sessionId}/resultats`);
  };

  const handleReport = async () => {
    if (!reportingQuestionId || !reportMessage.trim()) return;
    await reportError.mutateAsync({
      questionId: reportingQuestionId,
      message: reportMessage,
    });
    setReportingQuestionId(null);
    setReportMessage("");
  };

  const answeredCount = session?.responses.filter(
    (r) =>
      r.selectedAnswerIds.length > 0 ||
      (selectedAnswers.get(r.question.id)?.size ?? 0) > 0,
  ).length ?? 0;

  const totalCount = session?.responses.length ?? 0;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Chargement du quiz...</p>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Session introuvable</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left sidebar — question list */}
      <div className="hidden w-64 shrink-0 overflow-y-auto border-r bg-muted/30 p-4 md:block">
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            {answeredCount}/{totalCount} repondues
          </p>
        </div>
        <div className="space-y-1">
          {session.responses.map((r, i) => {
            const isAnswered =
              r.selectedAnswerIds.length > 0 ||
              (selectedAnswers.get(r.question.id)?.size ?? 0) > 0;
            const hasCorrected = corrections.has(r.question.id);
            const correctionResult = corrections.get(r.question.id);

            return (
              <button
                key={r.id}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  i === currentIndex
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <span className="font-medium">Q{i + 1}</span>
                {hasCorrected && correctionResult?.isCorrect === true && (
                  <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-green-500" />
                )}
                {hasCorrected && correctionResult?.isCorrect === false && (
                  <XCircle className="ml-auto h-3.5 w-3.5 text-red-500" />
                )}
                {!hasCorrected && isAnswered && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Question {currentIndex + 1} / {totalCount}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setCurrentIndex(Math.min(totalCount - 1, currentIndex + 1))
              }
              disabled={currentIndex === totalCount - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setTimerRunning((r) => !r)}
              >
                {timerRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono">{formatTime(timerMs)}</span>
            </div>
            <Badge variant="outline">
              {session.mode === "STUDY" ? "Etude" : "Examen"}
            </Badge>
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {currentQuestion.type} &middot; {currentQuestion.points} pt
                {currentQuestion.points > 1 ? "s" : ""}
              </Badge>
              <p className="text-lg font-medium leading-relaxed">
                {currentQuestion.text}
              </p>
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {currentQuestion.answers.map((answer) => {
                const isSelected = currentSelected.has(answer.id);
                const correctionAnswer = correction?.answers?.find(
                  (a) => a.id === answer.id,
                );
                const showCorrection = hasCorrection && correctionAnswer;

                return (
                  <button
                    key={answer.id}
                    onClick={() => toggleAnswer(answer.id)}
                    disabled={hasCorrection}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                      !hasCorrection && isSelected && "border-primary bg-primary/5",
                      !hasCorrection && !isSelected && "hover:bg-muted/50",
                      showCorrection &&
                        correctionAnswer.isCorrect &&
                        "border-green-500 bg-green-50 dark:bg-green-950/30",
                      showCorrection &&
                        !correctionAnswer.isCorrect &&
                        isSelected &&
                        "border-red-500 bg-red-50 dark:bg-red-950/30",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mt-0.5"
                      disabled={hasCorrection}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{answer.text}</p>
                      {showCorrection && correctionAnswer.explanation && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {correctionAnswer.explanation}
                        </p>
                      )}
                    </div>
                    {showCorrection && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {correctionAnswer.selectedPercent}%
                        </span>
                        {correctionAnswer.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : isSelected ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Correction summary for study mode */}
            {hasCorrection && correction && (
              <div
                className={cn(
                  "rounded-lg border p-4",
                  correction.isCorrect
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
                )}
              >
                <div className="flex items-center gap-2">
                  {correction.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {correction.isCorrect ? "Correct" : "Incorrect"} &middot;{" "}
                    {correction.pointsEarned}/{currentQuestion.points} pts
                  </span>
                </div>
                {correction.explanation && (
                  <div className="mt-3 text-sm">
                    <p className="font-medium">Correction :</p>
                    <p className="mt-1 text-muted-foreground">
                      {correction.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {!hasCorrection && (
                  <Button
                    onClick={handleVerify}
                    disabled={
                      currentSelected.size === 0 || submitAnswer.isPending
                    }
                  >
                    {submitAnswer.isPending ? "..." : "Verifier"}
                  </Button>
                )}
                {hasCorrection && currentIndex < totalCount - 1 && (
                  <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
                    Question suivante
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReportingQuestionId(
                      reportingQuestionId === questionId ? null : questionId,
                    );
                    setReportMessage("");
                  }}
                >
                  <Flag className="mr-1 h-3 w-3" />
                  Signaler
                </Button>
              </div>
            </div>

            {/* Error report form */}
            {reportingQuestionId === questionId && (
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium">
                  Signaler une erreur
                </p>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Decrivez l'erreur..."
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleReport}
                    disabled={
                      !reportMessage.trim() || reportError.isPending
                    }
                  >
                    Envoyer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReportingQuestionId(null)}
                  >
                    Annuler
                  </Button>
                  {reportError.isSuccess && (
                    <span className="text-xs text-green-600">
                      Signalement envoye
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/cours")}
          >
            <X className="mr-1 h-4 w-4" />
            Quitter
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {answeredCount}/{totalCount} repondues
            </span>
            <Button
              variant="outline"
              onClick={handleFinish}
              disabled={finishQuiz.isPending}
            >
              {finishQuiz.isPending
                ? "Finalisation..."
                : "Terminer le quiz"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
