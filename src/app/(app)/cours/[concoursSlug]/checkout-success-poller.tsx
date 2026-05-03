"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { api } from "~/trpc/react";

export function CheckoutSuccessPoller({
  slug,
  initialHasAccess,
}: {
  slug: string;
  initialHasAccess: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("checkout") === "success";

  const [polling, setPolling] = useState(isSuccess && !initialHasAccess);
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef<number>(Date.now());

  const query = api.concours.getBySlug.useQuery(
    { slug },
    {
      enabled: polling,
      refetchInterval: polling ? 1500 : false,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (!isSuccess) return;

    const stripQuery = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("checkout");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    };

    if (initialHasAccess) {
      stripQuery();
      return;
    }

    if (query.data?.hasAccess) {
      setPolling(false);
      stripQuery();
      router.refresh();
      return;
    }

    if (Date.now() - startedAt.current > 30_000) {
      setPolling(false);
      setTimedOut(true);
    }
  }, [
    isSuccess,
    initialHasAccess,
    query.data?.hasAccess,
    router,
    searchParams,
  ]);

  if (!isSuccess || initialHasAccess) return null;

  if (timedOut) {
    return (
      <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/[0.06] px-5 py-4 text-[13px]">
        <p className="font-semibold">Paiement en cours de validation</p>
        <p className="mt-1 text-muted-foreground">
          Si l&apos;acces n&apos;apparait pas dans une minute, rafraichissez la
          page ou contactez le support.
        </p>
      </div>
    );
  }

  if (polling) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] px-5 py-4 text-[13px]">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p>
          <span className="font-semibold">Validation du paiement…</span>{" "}
          <span className="text-muted-foreground">
            Activation de l&apos;acces en cours.
          </span>
        </p>
      </div>
    );
  }

  return null;
}
