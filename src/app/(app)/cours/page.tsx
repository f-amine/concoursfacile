import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Beaker,
  Scale,
  Wrench,
  Stethoscope,
  FlaskConical,
} from "lucide-react";

import { api } from "~/trpc/server";

const concoursThemes: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; tagline: string }
> = {
  ensa: { icon: Beaker, tagline: "Sciences appliquees & ingenierie" },
  encg: { icon: Scale, tagline: "Commerce, gestion & TAFEM" },
  ensam: { icon: Wrench, tagline: "Arts et metiers" },
  medecine: { icon: Stethoscope, tagline: "Medecine & pharmacie" },
  cpge: { icon: FlaskConical, tagline: "Classes preparatoires" },
};

const fallbackTheme = { icon: BookOpen, tagline: "Preparation au concours" };

export default async function CoursPage() {
  const concoursList = await api.concours.list();
  const subjectTotal = concoursList.reduce(
    (s, c) => s + c._count.subjects,
    0,
  );
  const total = concoursList.length;

  return (
    <div className="pt-8 sm:pt-10">
      <header className="mb-12 sm:mb-16">
        <p className="text-[10px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Bibliotheque
        </p>
        <h1 className="mt-2 text-[2.25rem] font-semibold leading-[1.05] tracking-display sm:text-[3rem] lg:text-[3.5rem]">
          Choisissez votre <span className="text-primary">concours</span>.
        </h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{total} concours</span>,{" "}
          {subjectTotal} matieres alignees au programme marocain.
        </p>
      </header>

      {concoursList.length > 0 ? (
        <ol className="border-y border-border/70">
          {concoursList.map((concours, index) => {
            const theme = concoursThemes[concours.slug] ?? fallbackTheme;
            const Icon = theme.icon;
            const subjectCount = concours._count.subjects;

            return (
              <li
                key={concours.id}
                className={index !== 0 ? "border-t border-border/70" : ""}
              >
                <Link
                  href={`/cours/${concours.slug}`}
                  className="group relative grid grid-cols-12 items-center gap-4 px-2 py-7 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 sm:gap-6 sm:py-9"
                >
                  {/* Number index */}
                  <span className="col-span-2 font-mono text-[11px] font-medium tabular-nums tracking-wider text-muted-foreground sm:col-span-1 sm:text-[12px]">
                    {String(index + 1).padStart(2, "0")}
                    <span className="text-muted-foreground/40">
                      {" "}/{" "}
                    </span>
                    {String(total).padStart(2, "0")}
                  </span>

                  {/* Display name + tagline */}
                  <div className="col-span-7 min-w-0 sm:col-span-8">
                    <h2 className="text-[1.875rem] font-semibold leading-[1] tracking-display transition-colors sm:text-[2.5rem] lg:text-[3rem] group-hover:text-primary">
                      {concours.name}
                    </h2>
                    <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                      {concours.description ?? theme.tagline}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase tabular-nums">
                      <span>
                        {subjectCount} matiere{subjectCount > 1 ? "s" : ""}
                      </span>
                    </p>
                  </div>

                  {/* Ghost icon + arrow */}
                  <div className="col-span-3 flex items-center justify-end gap-3 sm:gap-5">
                    <Icon
                      aria-hidden="true"
                      className="h-12 w-12 text-foreground/[0.08] transition-all duration-500 group-hover:scale-105 group-hover:text-primary/30 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
                    />
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
            Aucun concours disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
