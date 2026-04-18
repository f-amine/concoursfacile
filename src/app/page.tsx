import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getSession } from "~/server/better-auth/server";
import { Button } from "~/components/ui/button";
import {
  Navbar,
  Hero,
  AnimatedSection,
  FeaturesGrid,
  PricingCard,
  FaqSection,
  ConcoursGrid,
  SectionHeader,
} from "~/app/_landing-components";

/* ─── Page ───────────────────────────────────────────── */

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/tableau-de-bord");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      {/* ── Features ──────────────────────────────────── */}
      <AnimatedSection id="fonctionnalites" className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHeader
            label="Fonctionnalites"
            title="Tout ce qu'il faut pour reussir"
            description="Une plateforme conçue pour les concours post-bac marocains."
          />
          <FeaturesGrid />
        </div>
      </AnimatedSection>

      {/* ── Concours ──────────────────────────────────── */}
      <AnimatedSection id="concours" className="border-t border-border/40 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHeader
            label="Concours"
            title="5 concours couverts"
            description="Du contenu adapte aux programmes officiels de chaque concours."
          />
          <ConcoursGrid />
        </div>
      </AnimatedSection>

      {/* ── Pricing ───────────────────────────────────── */}
      <section id="tarif" className="border-t border-border/40 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mx-auto mb-14 max-w-lg text-center">
            <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
              Tarif
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Un seul paiement, un an d&apos;acces
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Pas d&apos;abonnement. Payez une fois, preparez-vous sereinement.
            </p>
          </div>
          <PricingCard />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────── */}
      <FaqSection />

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="border-t border-border/40 py-24 md:py-32">
        <div className="mx-auto max-w-md px-5 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Pret a commencer ?
          </h2>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Creez votre compte et accedez aux premiers cours gratuitement.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              className="h-11 gap-2 rounded-lg px-6 text-[13px] font-semibold"
              render={<Link href="/inscription" />}
            >
              Creer un compte
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 text-center">
          <div className="flex items-center gap-5 text-[13px] text-muted-foreground">
            <a href="#fonctionnalites" className="hover:text-foreground">Fonctionnalites</a>
            <a href="#concours" className="hover:text-foreground">Concours</a>
            <a href="#tarif" className="hover:text-foreground">Tarif</a>
            <Link href="/connexion" className="hover:text-foreground">Connexion</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} ConcoursFacile &middot; Fait au Maroc
          </p>
        </div>
      </footer>
    </div>
  );
}
