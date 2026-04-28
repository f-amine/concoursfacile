"use client";

import { useState } from "react";
import { CheckCircle2, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function MarkCompleteButton({ lessonId }: { lessonId: string }) {
  const [marked, setMarked] = useState(false);
  const utils = api.useUtils();

  const markComplete = api.lesson.markComplete.useMutation({
    onSuccess: () => {
      setMarked(true);
      void utils.userProgress.invalidate();
    },
  });

  if (marked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/[0.06] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success text-white shadow-xs">
          <Check className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-success">Lecon terminee</p>
          <p className="text-[11px] text-success/80">
            Votre progression a ete mise a jour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() => markComplete.mutate({ lessonId })}
      disabled={markComplete.isPending}
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />
      {markComplete.isPending ? "En cours..." : "Marquer comme termine"}
    </Button>
  );
}
