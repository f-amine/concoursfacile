import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  ChevronLeft,
  Layers,
  Lock,
  CheckCircle2,
} from "lucide-react";

import { api } from "~/trpc/server";
import { CheckoutSuccessPoller } from "./checkout-success-poller";
import { UnlockButton } from "./unlock-button";

export default async function ConcoursDetailPage({
  params,
}: {
  params: Promise<{ concoursSlug: string }>;
}) {
  const { concoursSlug } = await params;
  const concours = await api.concours.getBySlug({ slug: concoursSlug });

  if (!concours) notFound();

  const total = concours.subjects.length;
  const totalChapters = concours.subjects.reduce(
    (s, sub) => s + sub._count.chapters,
    0,
  );

  return (
    <div className="pt-8 sm:pt-10">
      <Link
        href="/cours"
        className="mb-10 inline-flex items-center gap-1 rounded-md text-[13px] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Tous les concours
      </Link>

      <header className="mb-12 grid gap-6 sm:mb-16 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
            Concours
          </p>
          <h1 className="mt-2 text-[2.25rem] font-semibold leading-[1.05] tracking-display sm:text-[3rem] lg:text-[3.5rem]">
            {concours.name}
          </h1>
          {concours.description && (
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
              {concours.description}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-right sm:gap-x-10">
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Matieres
            </dt>
            <dd className="font-display-num text-[1.75rem] font-semibold tabular-nums leading-none tracking-display">
              {total}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Chapitres
            </dt>
            <dd className="font-display-num text-[1.75rem] font-semibold tabular-nums leading-none tracking-display">
              {totalChapters}
            </dd>
          </div>
        </dl>
      </header>

      <CheckoutSuccessPoller
        slug={concoursSlug}
        initialHasAccess={concours.hasAccess}
      />

      {concours.hasAccess ? (
        <div className="mb-10 flex items-center gap-3 rounded-2xl border border-success/20 bg-success/[0.05] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-success">
              Acces actif
            </p>
            <p className="text-[12px] text-muted-foreground">
              Tous les cours et QCM de ce concours sont debloques.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-foreground">
                Acces verrouille — {concours.priceMad} MAD pour {concours.accessMonths} mois
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Paiement unique pour ce concours. Les chapitres marques
                &laquo;Gratuit&raquo; restent accessibles sans paiement.
              </p>
            </div>
          </div>
          <UnlockButton
            concoursId={concours.id}
            priceMad={concours.priceMad}
          />
        </div>
      )}

      {concours.subjects.length > 0 ? (
        <ol className="border-y border-border/70">
          {concours.subjects.map((subject, index) => {
            const initial = subject.name.charAt(0).toUpperCase();
            const chapterCount = subject._count.chapters;

            return (
              <li
                key={subject.id}
                className={index !== 0 ? "border-t border-border/70" : ""}
              >
                <Link
                  href={`/cours/${concoursSlug}/${subject.slug}`}
                  className="group grid grid-cols-12 items-center gap-4 px-2 py-6 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 sm:gap-6 sm:py-7"
                >
                  {/* Initial monogram */}
                  <div className="col-span-2 sm:col-span-1">
                    <span className="font-mono text-[11px] tabular-nums tracking-wider text-muted-foreground sm:hidden">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-card text-[1.25rem] font-semibold tracking-tight text-foreground/70 shadow-xs transition-all group-hover:border-primary/40 group-hover:bg-primary/[0.06] group-hover:text-primary sm:flex"
                    >
                      {initial}
                    </span>
                  </div>

                  <div className="col-span-7 min-w-0 sm:col-span-8">
                    <h2 className="text-[1.375rem] font-semibold leading-tight tracking-tight transition-colors sm:text-[1.75rem] group-hover:text-primary">
                      {subject.name}
                    </h2>
                    {subject.description && (
                      <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
                        {subject.description}
                      </p>
                    )}
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase tabular-nums">
                      <Layers className="h-3 w-3" />
                      {chapterCount} chapitre{chapterCount > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="col-span-3 flex items-center justify-end">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/60 shadow-xs transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-px" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border border-dashed bg-card/40 py-20 text-center">
          <BookOpen className="mx-auto h-7 w-7 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Aucune matiere disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
