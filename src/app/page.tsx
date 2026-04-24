import { redirect } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";

import { getSession } from "~/server/better-auth/server";
import InteractiveHero from "~/components/blocks/hero-section-nexus";
import SectionWithMockup from "~/components/ui/section-with-mockup";
import { Features } from "~/components/ui/features-10";
import { TestimonialsColumn } from "~/components/ui/testimonials-columns-1";
import * as PricingCard from "~/components/ui/pricing-card";
import FAQ1 from "~/components/ui/faq-monocrhome";
import { CinematicFooter } from "~/components/ui/motion-footer";
import { CheckCircle2, GraduationCap } from "lucide-react";

const TESTIMONIALS = [
  {
    text: "J'ai reussi le concours ENSA grace aux QCM corriges. Les explications m'ont vraiment aide a comprendre mes erreurs.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Yassine B.",
    role: "Admis ENSA Kenitra",
  },
  {
    text: "Plateforme claire, bien structuree. Je revisais partout, meme sur mon telephone entre deux cours.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Salma E.",
    role: "Admise ENCG Settat",
  },
  {
    text: "Le suivi de progression m'a motivee a ne rien lacher. Voir mes points faibles diminuer, c'etait encourageant.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Imane R.",
    role: "Admise Faculte de Medecine",
  },
  {
    text: "Mode examen excellent pour se mettre en conditions reelles. Je stressais moins le jour J.",
    image: "https://randomuser.me/api/portraits/men/51.jpg",
    name: "Anas T.",
    role: "Admis CPGE MP",
  },
  {
    text: "Rapport qualite-prix imbattable. Pour 300 MAD, j'ai eu acces a tout pendant un an.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    name: "Meryem K.",
    role: "Admise ENSAM Casablanca",
  },
  {
    text: "Contenu 100% marocain, adapte aux concours nationaux. Pas de jonglage avec des ressources francaises.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    name: "Hamza D.",
    role: "Admis ENSA Marrakech",
  },
  {
    text: "La repetition espacee m'a fait gagner un temps fou. Je reviens sur les bons chapitres au bon moment.",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    name: "Nour F.",
    role: "Admise ENCG Tanger",
  },
  {
    text: "Je recommande systematiquement la plateforme a mes eleves qui preparent les concours post-bac.",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
    name: "Karim S.",
    role: "Professeur, Rabat",
  },
  {
    text: "J'ai commence par les chapitres gratuits. Au bout de deux semaines, j'ai pris l'acces complet sans hesiter.",
    image: "https://randomuser.me/api/portraits/women/90.jpg",
    name: "Oumaima L.",
    role: "Admise CPGE BCPST",
  },
];

const col1 = TESTIMONIALS.slice(0, 3);
const col2 = TESTIMONIALS.slice(3, 6);
const col3 = TESTIMONIALS.slice(6, 9);

const PRICING_FEATURES = [
  "Acces a tous les cours",
  "QCM illimites avec corrections",
  "Mode etude et mode examen",
  "Suivi de progression complet",
  "Revision par repetition espacee",
  "Acces aux 5 concours",
];

// Scoped theme tokens — override shadcn's beige `--primary` with the hero's #0CF2A0
// so shadcn-styled components (features-10 CardDecorator, pricing-card, testimonials shadow)
// render with the landing's green accent instead of drifting toward the admin palette.
const LANDING_THEME: CSSProperties = {
  ["--background" as string]: "#0a0a0a",
  ["--foreground" as string]: "#f5f5f5",
  ["--card" as string]: "#111111",
  ["--card-foreground" as string]: "#f5f5f5",
  ["--popover" as string]: "#111111",
  ["--popover-foreground" as string]: "#f5f5f5",
  ["--primary" as string]: "#0CF2A0",
  ["--primary-foreground" as string]: "#0a0a0a",
  ["--secondary" as string]: "rgba(255,255,255,0.06)",
  ["--secondary-foreground" as string]: "#f5f5f5",
  ["--muted" as string]: "rgba(255,255,255,0.04)",
  ["--muted-foreground" as string]: "#9ca3af",
  ["--accent" as string]: "rgba(12,242,160,0.12)",
  ["--accent-foreground" as string]: "#0CF2A0",
  ["--border" as string]: "rgba(255,255,255,0.08)",
  ["--input" as string]: "rgba(255,255,255,0.08)",
  ["--ring" as string]: "#0CF2A0",
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex">
      <span className="rounded-full border border-[#0CF2A0]/20 bg-[#0CF2A0]/[0.06] px-4 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-[#0CF2A0]">
        {children}
      </span>
    </div>
  );
}

function HighlightCard({
  label,
  title,
  description,
  image,
}: {
  label: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111111] transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#0CF2A0]/25 hover:shadow-[0_30px_80px_-30px_rgba(12,242,160,0.25)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
          style={{ backgroundImage: `url(${image})` }}
        />
        {/* Fade image into card body */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent"
        />
        {/* Top hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          }}
        />
      </div>
      <div className="relative p-7 md:p-8">
        <span className="inline-flex rounded-full border border-[#0CF2A0]/20 bg-[#0CF2A0]/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-[#0CF2A0]">
          {label}
        </span>
        <h3 className="mt-4 text-xl font-semibold tracking-tight text-white md:text-2xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400 md:text-[15px]">
          {description}
        </p>
      </div>
    </article>
  );
}

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/tableau-de-bord");
  }

  return (
    <div
      className="dark min-h-screen bg-[#0a0a0a] text-[#f5f5f5] antialiased"
      style={LANDING_THEME}
    >
      <InteractiveHero />

      <SectionWithMockup
        label="Cours"
        title={
          <>
            Des cours structures,
            <br />
            pour chaque concours.
          </>
        }
        description={
          <>
            ENSA, ENCG, ENSAM, Medecine, CPGE. Chaque filiere a ses propres cours
            alignes sur le programme officiel. Tu avances chapitre par chapitre,
            sans jamais te perdre.
          </>
        }
        imageSrc="/landing/courses.webp"
      />

      <SectionWithMockup
        label="Examen"
        title={
          <>
            QCM corriges,
            <br />
            mode examen chronometrie.
          </>
        }
        description={
          <>
            Plus de 2000 questions avec des explications detaillees. Bosse en
            mode etude a ton rythme, puis passe en mode examen pour simuler les
            conditions reelles.
          </>
        }
        imageSrc="/landing/exam-mode.webp"
        reverseLayout
      />

      <Features />

      <section className="relative bg-[#0a0a0a] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <SectionLabel>Panorama</SectionLabel>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1]">
              Reuni au meme endroit.
            </h2>
            <p className="mt-5 text-base text-neutral-400 sm:text-lg">
              Une plateforme, cinq concours, des reperes clairs a chaque etape.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <HighlightCard
              label="Concours"
              title="5 concours couverts"
              description="ENSA, ENCG, ENSAM, Medecine, CPGE. Chaque filiere avec son programme officiel, rien de generique."
              image="/landing/concours-grid.webp"
            />
            <HighlightCard
              label="Resultats"
              title="Des chiffres qui parlent"
              description="Score moyen, temps par question, difficulte. Apres chaque session, tu sais exactement ou tu en es."
              image="/landing/results-summary.webp"
            />
          </div>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <SectionLabel>Temoignages</SectionLabel>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1]">
              Ils ont reussi leurs concours
            </h2>
            <p className="mt-5 text-base text-neutral-400 sm:text-lg">
              Des lyceens et bacheliers marocains partagent leur experience.
            </p>
          </div>

          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[640px] overflow-hidden">
            <TestimonialsColumn testimonials={col1} duration={28} />
            <TestimonialsColumn
              testimonials={col2}
              className="hidden md:block"
              duration={34}
            />
            <TestimonialsColumn
              testimonials={col3}
              className="hidden lg:block"
              duration={30}
            />
          </div>
        </div>
      </section>

      <section
        id="tarif"
        className="relative flex flex-col items-center bg-[#0a0a0a] px-6 py-24 md:py-32"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(12,242,160,0.08) 0.8px, transparent 0.8px)",
            backgroundSize: "14px 14px",
            maskImage:
              "radial-gradient(circle at 50% 30%, rgba(0,0,0,1), rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 70%)",
          }}
        />

        <div className="relative mb-14 max-w-xl text-center">
          <SectionLabel>Tarif</SectionLabel>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1]">
            Un paiement, un an d&apos;acces.
          </h2>
          <p className="mt-5 text-base text-neutral-400 sm:text-lg">
            Pas d&apos;abonnement. Pas de renouvellement automatique.
          </p>
        </div>

        <PricingCard.Card>
          <PricingCard.Header>
            <PricingCard.Plan>
              <PricingCard.PlanName>
                <GraduationCap aria-hidden="true" />
                <span className="text-muted-foreground">Acces complet</span>
              </PricingCard.PlanName>
              <PricingCard.Badge>1 an</PricingCard.Badge>
            </PricingCard.Plan>
            <PricingCard.Price>
              <PricingCard.MainPrice>300 MAD</PricingCard.MainPrice>
              <PricingCard.Period>/ an</PricingCard.Period>
            </PricingCard.Price>
            <PricingCard.Description>
              Paiement unique, environ 33 USD.
            </PricingCard.Description>
            <Link
              href="/inscription"
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-gradient-to-b from-[#0CF2A0] to-[#0ac890] text-sm font-semibold text-black shadow-[0_10px_25px_rgba(12,242,160,0.3)] transition-all hover:brightness-110"
            >
              Obtenir l&apos;acces
            </Link>
          </PricingCard.Header>
          <PricingCard.Body>
            <PricingCard.List>
              {PRICING_FEATURES.map((item) => (
                <PricingCard.ListItem key={item}>
                  <span className="mt-0.5">
                    <CheckCircle2
                      className="h-4 w-4 text-[#0CF2A0]"
                      aria-hidden="true"
                    />
                  </span>
                  <span>{item}</span>
                </PricingCard.ListItem>
              ))}
            </PricingCard.List>
          </PricingCard.Body>
        </PricingCard.Card>
      </section>

      <div id="faq">
        <FAQ1 />
      </div>

      <CinematicFooter />
    </div>
  );
}
