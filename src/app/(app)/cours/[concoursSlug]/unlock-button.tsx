"use client";

import { Lock } from "lucide-react";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function UnlockButton({
  concoursId,
  priceMad,
}: {
  concoursId: string;
  priceMad: number;
}) {
  const checkout = api.concours.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        onClick={() => checkout.mutate({ concoursId })}
        disabled={checkout.isPending}
      >
        <Lock className="mr-2 h-4 w-4" />
        {checkout.isPending
          ? "Redirection..."
          : `Activer ce concours — ${priceMad} MAD`}
      </Button>
      {checkout.error && (
        <p className="text-[12px] text-destructive">
          {checkout.error.message}
        </p>
      )}
    </div>
  );
}
