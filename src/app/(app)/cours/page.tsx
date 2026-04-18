import Link from "next/link";
import { BookOpen, ArrowRight, Beaker, Scale, Wrench, Stethoscope, FlaskConical } from "lucide-react";

import { api } from "~/trpc/server";

/* Map slug → icon + short tagline for visual variety */
const concoursThemes: Record<string, { icon: React.ComponentType<{ className?: string }>; tagline: string }> = {
  ensa: { icon: Beaker, tagline: "Sciences appliquees & ingenierie" },
  encg: { icon: Scale, tagline: "Commerce, gestion & TAFEM" },
  ensam: { icon: Wrench, tagline: "Arts et metiers" },
  medecine: { icon: Stethoscope, tagline: "Medecine & pharmacie" },
  cpge: { icon: FlaskConical, tagline: "Classes preparatoires" },
};

const fallbackTheme = { icon: BookOpen, tagline: "Preparation au concours" };

export default async function CoursPage() {
  const concoursList = await api.concours.list();

  return (
    <div className="py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Cours</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Choisissez le concours que vous preparez.
        </p>
      </div>

      {concoursList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {concoursList.map((concours, index) => {
            const theme = concoursThemes[concours.slug] ?? fallbackTheme;
            const Icon = theme.icon;
            const subjectCount = concours._count.subjects;

            return (
              <Link
                key={concours.id}
                href={`/cours/${concours.slug}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:shadow-md ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                {/* Top section */}
                <div className="relative z-10 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border bg-background/80">
                    <Icon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {concours.name}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {concours.description ?? theme.tagline}
                  </p>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between border-t px-6 py-3.5">
                  <span className="text-xs text-muted-foreground">
                    {subjectCount} matiere{subjectCount > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-foreground/70 transition-colors group-hover:text-foreground">
                    Acceder
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                {/* Decorative: large faded icon in background */}
                <Icon className="pointer-events-none absolute -right-4 -bottom-4 h-28 w-28 text-foreground/[0.03] transition-transform duration-500 group-hover:scale-110" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <BookOpen className="mx-auto h-7 w-7 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun concours disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
