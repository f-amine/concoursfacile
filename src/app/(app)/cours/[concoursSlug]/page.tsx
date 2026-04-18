import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ArrowRight, ChevronLeft, Layers } from "lucide-react";

import { api } from "~/trpc/server";

export default async function ConcoursDetailPage({
  params,
}: {
  params: Promise<{ concoursSlug: string }>;
}) {
  const { concoursSlug } = await params;
  const concours = await api.concours.getBySlug({ slug: concoursSlug });

  if (!concours) notFound();

  return (
    <div className="py-8">
      <Link
        href="/cours"
        className="mb-8 inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Tous les concours
      </Link>

      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {concours.name}
        </h1>
        {concours.description && (
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {concours.description}
          </p>
        )}
      </div>

      {concours.subjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {concours.subjects.map((subject) => {
            const chapterCount = subject._count.chapters;

            return (
              <Link
                key={subject.id}
                href={`/cours/${concoursSlug}/${subject.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border bg-background/80">
                    <BookOpen className="h-5 w-5 text-foreground/70" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {subject.name}
                  </h2>
                  {subject.description && (
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {subject.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t px-6 py-3.5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {chapterCount} chapitre{chapterCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-foreground/70 transition-colors group-hover:text-foreground">
                    Etudier
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                <BookOpen className="pointer-events-none absolute -right-3 -bottom-3 h-24 w-24 text-foreground/[0.03] transition-transform duration-500 group-hover:scale-110" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <BookOpen className="mx-auto h-7 w-7 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Aucune matiere disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
