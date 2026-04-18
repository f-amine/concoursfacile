"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Clock,
  FileQuestion,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "~/components/ui/button";

/* ─── Animation variants ─────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ─── AnimatedSection ────────────────────────────────── */

export function AnimatedSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
    >
      {children}
    </motion.section>
  );
}

/* ─── SectionHeader ──────────────────────────────────── */

export function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-lg text-center">
      <motion.p
        variants={fadeUp}
        className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl"
      >
        {title}
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="mt-3 text-[15px] text-muted-foreground"
      >
        {description}
      </motion.p>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────── */

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
              scrolled ? "bg-primary" : "bg-white"
            }`}
          >
            <span
              className={`text-[9px] font-bold ${
                scrolled ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              CF
            </span>
          </div>
          <span
            className={`text-sm font-semibold transition-colors ${
              scrolled ? "text-foreground" : "text-white"
            }`}
          >
            ConcoursFacile
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {[
            ["Fonctionnalites", "#fonctionnalites"],
            ["Concours", "#concours"],
            ["Tarif", "#tarif"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className={`text-[13px] transition-colors ${
                scrolled
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`text-[13px] ${
              scrolled ? "" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            render={<Link href="/connexion" />}
          >
            Connexion
          </Button>
          <Button
            size="sm"
            className={`text-[13px] ${
              scrolled ? "" : "bg-white text-foreground hover:bg-white/90"
            }`}
            render={<Link href="/inscription" />}
          >
            Commencer
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────── */

export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-foreground pt-14">
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto max-w-5xl px-5 py-24 md:py-32 lg:py-40"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-5 text-[13px] font-medium tracking-wide text-white/35 uppercase">
            Preparation aux concours marocains
          </p>

          <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.1] font-semibold tracking-tight text-white">
            Reussissez vos concours
            <br />
            <span className="text-white/35">post-bac.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-white/45"
          >
            Cours structures, QCM corriges et revision intelligente pour
            ENSA, ENCG, ENSAM, Medecine et CPGE.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="h-11 gap-2 rounded-lg bg-white px-6 text-[13px] font-semibold text-foreground hover:bg-white/90"
              render={<Link href="/inscription" />}
            >
              Commencer gratuitement
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-11 rounded-lg px-6 text-[13px] text-white/50 hover:bg-white/5 hover:text-white/70"
              render={<Link href="#tarif" />}
            >
              Voir le tarif
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mx-auto mt-20 flex max-w-sm items-center justify-center gap-10 border-t border-white/[0.06] pt-8"
        >
          {[
            ["2000+", "Questions"],
            ["5", "Concours"],
            ["100%", "Marocain"],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="text-lg font-semibold tabular-nums text-white/70">{value}</p>
              <p className="text-[11px] text-white/25">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Feature card ───────────────────────────────────── */

export function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="group rounded-xl border border-border/50 bg-card p-5 transition-shadow duration-300 hover:shadow-[0_2px_12px_0_rgb(0_0_0/0.06)]"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>
      <h3 className="mb-1 text-[0.8125rem] font-semibold">{title}</h3>
      <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}

const featuresData = [
  { icon: BookOpen, title: "Cours structures", description: "Organises par matiere et par concours avec une progression claire." },
  { icon: FileQuestion, title: "QCM corriges", description: "Des centaines de questions avec des explications detaillees." },
  { icon: Target, title: "Suivi de progression", description: "Visualisez votre avancement et identifiez vos lacunes." },
  { icon: Brain, title: "Mode etude & examen", description: "Apprenez a votre rythme ou testez-vous en conditions reelles." },
  { icon: Clock, title: "Repetition espacee", description: "Revisez au bon moment pour une memorisation durable." },
  { icon: Sparkles, title: "Contenu gratuit", description: "Commencez gratuitement avec les premiers chapitres." },
];

export function FeaturesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {featuresData.map((f, i) => (
        <FeatureCard key={f.title} index={i} {...f} />
      ))}
    </div>
  );
}

/* ─── Concours grid ──────────────────────────────────── */

const concoursData = [
  { name: "ENSA", desc: "Ecoles Nationales des Sciences Appliquees" },
  { name: "ENCG", desc: "Ecoles Nationales de Commerce et de Gestion" },
  { name: "ENSAM", desc: "Ecole Nationale Superieure d'Arts et Metiers" },
  { name: "Medecine", desc: "Facultes de Medecine et de Pharmacie" },
  { name: "CPGE", desc: "Classes Preparatoires aux Grandes Ecoles" },
];

export function ConcoursGrid() {
  return (
    <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {concoursData.map((c, i) => (
        <motion.div
          key={c.name}
          variants={fadeUp}
          custom={i}
          className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[0.8125rem] font-semibold">{c.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Pricing card ───────────────────────────────────── */

const pricingFeatures = [
  "Acces a tous les cours",
  "QCM illimites avec corrections",
  "Mode etude et mode examen",
  "Suivi de progression complet",
  "Revision par repetition espacee",
  "Acces aux 5 concours",
  "Mises a jour pendant 1 an",
  "Support par email",
];

export function PricingCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto w-full max-w-md"
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_1px_2px_0_rgb(0_0_0/0.03)]">
        <div className="px-8 pt-8 pb-6">
          <p className="text-[13px] font-medium text-muted-foreground">
            Acces complet
          </p>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-5xl font-semibold tracking-tight">300</span>
            <span className="text-lg text-muted-foreground">MAD</span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            ~33 USD &middot; Paiement unique pour 1 an
          </p>
        </div>

        <div className="mx-8 h-px bg-border/60" />

        <div className="px-8 py-6">
          <ul className="space-y-3">
            {pricingFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-[0.8125rem]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-8 pb-8">
          <Button
            className="h-11 w-full rounded-lg text-[13px] font-semibold"
            render={<Link href="/inscription" />}
          >
            Obtenir l&apos;acces
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Pas d&apos;abonnement. Pas de renouvellement automatique.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── FAQ Section ────────────────────────────────────── */

const faqs = [
  {
    q: "C'est un abonnement ?",
    a: "Non. C'est un paiement unique de 300 MAD qui vous donne acces a la plateforme pendant 1 an. Pas de renouvellement automatique.",
  },
  {
    q: "Quels concours sont couverts ?",
    a: "ENSA, ENCG, ENSAM, Medecine et CPGE. Chaque concours a ses propres cours et QCM adaptes au programme officiel.",
  },
  {
    q: "Est-ce que je peux essayer gratuitement ?",
    a: "Oui. Creez un compte et accedez aux premiers chapitres de chaque matiere gratuitement, sans carte bancaire.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement est securise via Polar. Vous pouvez payer par carte bancaire. L'acces est active immediatement apres le paiement.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-[0.8125rem] font-medium pr-4">{q}</span>
        <span className="shrink-0 text-sm text-muted-foreground">
          {open ? "\u2212" : "+"}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {a}
        </p>
      </motion.div>
    </div>
  );
}

export function FaqSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className="border-t border-border/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-xl px-5">
        <motion.h2
          variants={fadeUp}
          className="mb-10 text-center text-2xl font-semibold tracking-tight"
        >
          Questions frequentes
        </motion.h2>
        <motion.div variants={fadeUp}>
          {faqs.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
