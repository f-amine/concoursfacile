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
  ListChecks,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type CorrectionData = {
  isCorrect: boolean | null;
  pointsEarned: number;
  explanation: string | null;
  answers:
    | {
        id: string;
        text: string;
        isCorrect: boolean;
        explanation: string | null;
        selectedPercent: number;
      }[]
    | null;
};

const letterFor = (i: number) => String.fromCharCode(65 + i);

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

    await finishQuiz.mutateAsync({ sessionId, timeSpentMs: timerMs });
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

  const answeredCount =
    session?.responses.filter(
      (r) =>
        r.selectedAnswerIds.length > 0 ||
        (selectedAnswers.get(r.question.id)?.size ?? 0) > 0,
    ).length ?? 0;

  const totalCount = session?.responses.length ?? 0;
  const progressPct = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[13px] text-muted-foreground">
          Chargement du quiz...
        </p>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[13px] text-muted-foreground">Session introuvable</p>
      </div>
    );
  }

  return (
    <div className="-mx-4 flex h-[calc(100vh-3.5rem)] overflow-hidden border-t border-border/70 sm:-mx-6 lg:-mx-10">
      {/* Question grid sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-hidden border-r border-border/70 bg-muted/40 md:flex">
        <div className="border-b border-border/70 px-5 py-4">
          <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            <ListChecks className="h-3 w-3" />
            Progression
          </p>
          <p className="mt-2 font-display-num text-[1.75rem] font-semibold tabular-nums leading-none tracking-display">
            {answeredCount}
            <span className="text-muted-foreground/60 text-[1.25rem]">
              {" "}/{totalCount}
            </span>
          </p>
          <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
            {totalCount - answeredCount} restantes
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-5 gap-1.5">
            {session.responses.map((r, i) => {
              const isAnswered =
                r.selectedAnswerIds.length > 0 ||
                (selectedAnswers.get(r.question.id)?.size ?? 0) > 0;
              const correctionResult = corrections.get(r.question.id);
              const isCurrent = i === currentIndex;

              const tone = correctionResult
                ? correctionResult.isCorrect
                  ? "success"
                  : "destructive"
                : isAnswered
                  ? "answered"
                  : "idle";

              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentIndex(i)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={cn(
                    "relative flex h-9 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60",
                    isCurrent &&
                      "ring-2 ring-primary ring-offset-1 ring-offset-muted/40",
                    tone === "success" && "bg-success/15 text-success",
                    tone === "destructive" &&
                      "bg-destructive/15 text-destructive",
                    tone === "answered" && "bg-primary/[0.1] text-primary",
                    tone === "idle" &&
                      "bg-card text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border/70 bg-card px-4 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              aria-label="Question precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-[13px] font-medium tabular-nums">
              <span className="font-mono text-muted-foreground/80">Q</span>
              <span className="font-display-num font-semibold">
                {currentIndex + 1}
              </span>
              <span className="mx-1 text-muted-foreground/60">/</span>
              <span className="text-muted-foreground tabular-nums">
                {totalCount}
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setCurrentIndex(Math.min(totalCount - 1, currentIndex + 1))
              }
              disabled={currentIndex === totalCount - 1}
              aria-label="Question suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTimerRunning((r) => !r)}
              aria-label={timerRunning ? "Mettre en pause" : "Reprendre"}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium tabular-nums text-foreground/80 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {timerRunning ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono">{formatTime(timerMs)}</span>
            </button>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase",
                session.mode === "EXAM"
                  ? "bg-warning/10 text-warning"
                  : "bg-primary/10 text-primary",
              )}
            >
              {session.mode === "STUDY" ? "Etude" : "Examen"}
            </span>
          </div>
        </div>

        {/* Mobile progress strip */}
        <div className="border-b border-border/70 bg-card px-4 py-2 md:hidden">
          <div className="flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>{answeredCount} repondues</span>
            <span>{totalCount - answeredCount} restantes</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-2xl space-y-7">
            <div>
              <div className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                  {currentQuestion.type}
                </span>
                <span className="font-medium">
                  {currentQuestion.points} pt
                  {currentQuestion.points > 1 ? "s" : ""}
                </span>
                {currentQuestion.type === "QCM" ? (
                  <span className="text-muted-foreground/70">
                    Une seule reponse
                  </span>
                ) : (
                  <span className="text-muted-foreground/70">
                    Reponses multiples
                  </span>
                )}
              </div>
              <p className="mt-4 text-[1.25rem] font-semibold leading-[1.4] tracking-tight text-foreground sm:text-[1.5rem]">
                {currentQuestion.text}
              </p>
            </div>

            {/* Answer options — letter pills */}
            <div className="space-y-2.5">
              {currentQuestion.answers.map((answer, i) => {
                const isSelected = currentSelected.has(answer.id);
                const correctionAnswer = correction?.answers?.find(
                  (a) => a.id === answer.id,
                );
                const showCorrection = hasCorrection && correctionAnswer;
                const isAnswerCorrect = correctionAnswer?.isCorrect;
                const letter = letterFor(i);

                let letterClass =
                  "border-border/80 bg-card text-foreground/70 group-hover:border-foreground/30 group-hover:bg-muted";
                let cardClass =
                  "border-border/70 bg-card hover:border-foreground/20 hover:bg-muted/40";

                if (!hasCorrection && isSelected) {
                  letterClass =
                    "border-primary bg-primary text-primary-foreground shadow-xs";
                  cardClass = "border-primary bg-primary/[0.06] shadow-xs";
                }
                if (showCorrection && isAnswerCorrect) {
                  letterClass =
                    "border-success bg-success text-white shadow-xs";
                  cardClass = "border-success/40 bg-success/[0.06]";
                }
                if (showCorrection && !isAnswerCorrect && isSelected) {
                  letterClass =
                    "border-destructive bg-destructive text-white shadow-xs";
                  cardClass =
                    "border-destructive/40 bg-destructive/[0.06]";
                }
                if (showCorrection && !isAnswerCorrect && !isSelected) {
                  letterClass = "border-border/60 bg-card text-muted-foreground/70";
                  cardClass = "border-border/70 bg-card opacity-70";
                }

                return (
                  <button
                    key={answer.id}
                    onClick={() => toggleAnswer(answer.id)}
                    disabled={hasCorrection}
                    className={cn(
                      "group flex w-full items-start gap-4 rounded-2xl border p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60",
                      cardClass,
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[14px] font-semibold tabular-nums transition-all",
                        letterClass,
                      )}
                    >
                      {letter}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] leading-relaxed">
                        {answer.text}
                      </p>
                      {showCorrection && correctionAnswer.explanation && (
                        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                          {correctionAnswer.explanation}
                        </p>
                      )}
                    </div>
                    {showCorrection && (
                      <div className="flex shrink-0 flex-col items-end gap-1 pt-1.5">
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {correctionAnswer.selectedPercent}%
                        </span>
                        {isAnswerCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : isSelected ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Correction summary */}
            {hasCorrection && correction && (
              <div
                className={cn(
                  "rounded-2xl border p-5",
                  correction.isCorrect
                    ? "border-success/30 bg-success/[0.06]"
                    : "border-destructive/30 bg-destructive/[0.06]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {correction.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span
                      className={cn(
                        "text-[15px] font-semibold tracking-tight",
                        correction.isCorrect
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      {correction.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "font-display-num text-[14px] font-semibold tabular-nums",
                      correction.isCorrect
                        ? "text-success"
                        : "text-destructive",
                    )}
                  >
                    {correction.pointsEarned}/{currentQuestion.points} pts
                  </span>
                </div>
                {correction.explanation && (
                  <div className="mt-4 border-t border-current/10 pt-3 text-[13px]">
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-foreground/60">
                      Correction
                    </p>
                    <p className="mt-1.5 leading-relaxed text-foreground/85">
                      {correction.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReportingQuestionId(
                    reportingQuestionId === questionId ? null : questionId,
                  );
                  setReportMessage("");
                }}
                aria-pressed={reportingQuestionId === questionId}
              >
                <Flag className="mr-1 h-3 w-3" />
                Signaler
              </Button>
            </div>

            {reportingQuestionId === questionId && (
              <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
                <p className="text-[12px] font-medium">
                  Signaler une erreur sur cette question
                </p>
                <textarea
                  className="mt-2 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/40"
                  rows={3}
                  placeholder="Decrivez l'erreur (typo, ambiguite, mauvaise reponse marquee correcte...)"
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleReport}
                    disabled={!reportMessage.trim() || reportError.isPending}
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
                    <span className="text-[11px] font-medium text-success">
                      Signalement envoye, merci.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-border/70 bg-card px-4 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/cours")}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Quitter
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {answeredCount}/{totalCount} repondues
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFinish}
              disabled={finishQuiz.isPending}
            >
              {finishQuiz.isPending ? "Finalisation..." : "Terminer le quiz"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
