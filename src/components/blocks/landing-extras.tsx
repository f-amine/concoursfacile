"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EyebrowLabel, SectionHeading, SectionLead } from "./landing-primitives";
import {
  Stethoscope,
  Cpu,
  Building2,
  Wrench,
  Calculator,
  UserPlus,
  BookMarked,
  Trophy,
  Sparkles,
  ArrowRight,
  Library,
  Layers,
  Clock,
  Zap,
  ChevronDown,
  FileQuestion,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ──────────────────────────────────────────────────────────
 * 1. STATS STRIP — counter-up on scroll
 * ────────────────────────────────────────────────────────── */

interface Stat {
  value: number;
  suffix?: string;
  label: string;
  icon: typeof Library;
}

const STATS: Stat[] = [
  { value: 2000, suffix: "+", label: "QCM corriges", icon: BookMarked },
  { value: 5, suffix: "", label: "Concours couverts", icon: Trophy },
  { value: 12, suffix: "", label: "Matieres", icon: Layers },
  { value: 800, suffix: "+", label: "Chapitres", icon: Library },
];

export function StatsStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Seed final values so SSR / reduced-motion users see the real numbers.
      section.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.target ?? 0);
        const suffix = el.dataset.suffix ?? "";
        el.textContent = `${target.toLocaleString("fr-FR")}${suffix}`;
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards =
          section.querySelectorAll<HTMLElement>("[data-stat-card]");
        gsap.from(cards, {
          y: 24,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });

        section
          .querySelectorAll<HTMLElement>("[data-counter]")
          .forEach((el) => {
            const target = Number(el.dataset.target ?? 0);
            const suffix = el.dataset.suffix ?? "";
            const proxy = { val: 0 };
            gsap.to(proxy, {
              val: target,
              duration: 1.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 90%",
                once: true,
              },
              onUpdate: () => {
                el.textContent = `${Math.round(proxy.val).toLocaleString("fr-FR")}${suffix}`;
              },
            });
          });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Chiffres-cles"
      className="relative -mt-16 px-4 pb-16 md:-mt-24 md:pb-24"
    >
      <div className="relative mx-auto max-w-6xl">
        {/* Floating card with brand-tinted shadow */}
        <div className="relative overflow-hidden rounded-3xl border border-[#1f4dc1]/12 bg-white p-2 shadow-[0_40px_100px_-40px_rgba(31,77,193,0.30),0_15px_40px_-20px_rgba(67,184,112,0.15)]">
          {/* Top hairline echoing the C+check logo: blue → green */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(31,77,193,0.4), rgba(67,184,112,0.4), transparent)",
            }}
          />
          {/* Faint dotted texture inside */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(rgba(31,77,193,0.06) 0.8px, transparent 0.8px)",
              backgroundSize: "18px 18px",
              maskImage:
                "radial-gradient(circle at 50% 50%, black 30%, transparent 70%)",
            }}
          />

          <div className="relative grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-[#1f4dc1]/15 sm:grid-cols-4">
            {STATS.map(({ value, suffix, label, icon: Icon }) => (
              <div
                key={label}
                data-stat-card
                className="group relative flex flex-col items-start gap-3 bg-white p-6 transition-colors duration-300 md:p-8"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef3ff] text-[#1f4dc1] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1f4dc1] group-hover:text-white">
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    data-counter
                    data-target={value}
                    data-suffix={suffix ?? ""}
                    className="text-3xl font-semibold tabular-nums tracking-tight text-[#0b1530] md:text-4xl"
                  >
                    0
                  </span>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#5b6b8a]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
 * 2. CONCOURS — interactive accordion-stack with auto-cycle
 * ────────────────────────────────────────────────────────── */

interface Concours {
  name: string;
  full: string;
  description: string;
  matieres: string[];
  chapters: number;
  qcm: number;
  niveau: string;
  duree: string;
  icon: typeof Stethoscope;
  hue: "blue" | "green";
}

const CONCOURS: Concours[] = [
  {
    name: "Medecine",
    full: "Faculte de Medecine et de Pharmacie",
    description:
      "Le concours le plus competitif du Maroc. Sciences de la vie, chimie organique, physique medicale, raisonnement clinique. Une preparation rigoureuse pour un parcours d'exception.",
    matieres: ["Biologie", "Chimie", "Physique", "Anglais"],
    chapters: 240,
    qcm: 4800,
    niveau: "Tres eleve",
    duree: "7 ans",
    icon: Stethoscope,
    hue: "green",
  },
  {
    name: "ENSA",
    full: "Ecole Nationale des Sciences Appliquees",
    description:
      "Mathematiques avancees, physique, raisonnement scientifique. 12 ENSA reparties au Maroc, formation d'ingenieurs en 5 ans avec specialisations variees.",
    matieres: ["Maths", "Physique", "Chimie", "Logique"],
    chapters: 180,
    qcm: 3200,
    niveau: "Eleve",
    duree: "5 ans",
    icon: Cpu,
    hue: "blue",
  },
  {
    name: "ENCG",
    full: "Ecole Nationale de Commerce et de Gestion",
    description:
      "Logique mathematique, culture generale, langues, raisonnement quantitatif. Formation polyvalente en management, finance, marketing et commerce international.",
    matieres: ["Maths", "Logique", "Francais", "Anglais"],
    chapters: 150,
    qcm: 2600,
    niveau: "Moyen",
    duree: "5 ans",
    icon: Building2,
    hue: "blue",
  },
  {
    name: "ENSAM",
    full: "Ecole Nationale Superieure des Arts et Metiers",
    description:
      "Mecanique, materiaux, mathematiques, sciences de l'ingenieur. Formation d'ingenieurs generalistes avec une forte orientation industrielle et technologique.",
    matieres: ["Maths", "Physique", "Mecanique", "Sci. indus."],
    chapters: 165,
    qcm: 2900,
    niveau: "Eleve",
    duree: "5 ans",
    icon: Wrench,
    hue: "green",
  },
  {
    name: "CPGE",
    full: "Classes Preparatoires aux Grandes Ecoles",
    description:
      "MP, PSI, BCPST. Programme exigeant sur deux annees intensives, preparant aux concours des plus grandes ecoles d'ingenieurs et de commerce.",
    matieres: ["Maths sup.", "Physique", "Chimie", "SVT"],
    chapters: 220,
    qcm: 4100,
    niveau: "Tres eleve",
    duree: "2 ans",
    icon: Calculator,
    hue: "blue",
  },
];

const HUE = {
  blue: { fg: "#1f4dc1", soft: "#eef3ff", strong: "#173b96", tint: "rgba(31,77,193,0.025)" },
  green: { fg: "#43b870", soft: "#e8f6ee", strong: "#236d44", tint: "rgba(67,184,112,0.025)" },
} as const;

const AUTO_CYCLE_MS = 9000;
const PAUSE_AFTER_CLICK_MS = 25000;

export function ConcoursGrid() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const bodiesRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const cycleTweenRef = useRef<gsap.core.Tween | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Section entrance — stagger reveal of header + rows
  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const head = section.querySelectorAll<HTMLElement>("[data-head]");
        gsap.from(head, {
          y: 24,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });
        const rows = section.querySelectorAll<HTMLElement>("[data-row]");
        gsap.from(rows, {
          x: -30,
          stagger: 0.07,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 88%", once: true },
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  // Initial body layout — collapse all but the active one
  useLayoutEffect(() => {
    bodiesRef.current.forEach((body, idx) => {
      if (!body) return;
      gsap.set(body, { height: idx === activeIdx ? "auto" : 0 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate body heights and reveal the new active panel content
  useEffect(() => {
    bodiesRef.current.forEach((body, idx) => {
      if (!body) return;
      gsap.to(body, {
        height: idx === activeIdx ? "auto" : 0,
        duration: 0.55,
        ease: "power3.inOut",
      });
    });

    const activeBody = bodiesRef.current[activeIdx];
    if (activeBody) {
      const items = activeBody.querySelectorAll<HTMLElement>("[data-fade]");
      gsap.fromTo(
        items,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.18,
        },
      );
    }
  }, [activeIdx]);

  // Auto-cycle progress bar — drives setActiveIdx on completion
  useEffect(() => {
    cycleTweenRef.current?.kill();
    const bar = progressBarRef.current;
    if (!bar) return;

    if (isPaused) {
      gsap.set(bar, { scaleX: 0 });
      return;
    }

    cycleTweenRef.current = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: AUTO_CYCLE_MS / 1000,
        ease: "none",
        onComplete: () => {
          setActiveIdx((cur) => (cur + 1) % CONCOURS.length);
        },
      },
    );

    return () => {
      cycleTweenRef.current?.kill();
    };
  }, [activeIdx, isPaused]);

  const handleSelect = (idx: number) => {
    if (idx === activeIdx) return;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setIsPaused(true);
    setActiveIdx(idx);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, PAUSE_AFTER_CLICK_MS);
  };

  useEffect(
    () => () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    },
    [],
  );

  return (
    <section
      ref={sectionRef}
      id="concours"
      className="relative bg-white py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 85% 10%, rgba(31,77,193,0.06), transparent 60%), radial-gradient(ellipse 45% 35% at 15% 95%, rgba(67,184,112,0.05), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 md:px-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <EyebrowLabel data-head>Concours</EyebrowLabel>
          <SectionHeading data-head className="mt-6">
            Cinq concours, un seul cap.
          </SectionHeading>
          <SectionLead data-head className="mt-5">
            Choisis ta filiere et plonge dans le programme. Chaque dossier
            s&apos;ouvre sur le contenu detaille.
          </SectionLead>
        </div>

        {/* Accordion stack */}
        <div className="overflow-hidden rounded-[28px] border border-[#1f4dc1]/12 bg-white shadow-[0_30px_80px_-30px_rgba(31,77,193,0.22),0_15px_40px_-25px_rgba(67,184,112,0.10)]">
          {CONCOURS.map((c, idx) => {
            const isActive = idx === activeIdx;
            const tone = HUE[c.hue];
            const Icon = c.icon;
            const indexLabel = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={c.name}
                data-row
                className={`relative transition-colors duration-500 ${
                  idx > 0 ? "border-t border-[#1f4dc1]/8" : ""
                }`}
                style={{ backgroundColor: isActive ? tone.tint : undefined }}
              >
                {/* Head — clickable, always visible */}
                <button
                  type="button"
                  onClick={() => handleSelect(idx)}
                  aria-expanded={isActive}
                  aria-controls={`concours-body-${idx}`}
                  className="group/row relative flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-[#1f4dc1]/[0.025] md:gap-7 md:px-10 md:py-6"
                >
                  {/* Editorial numeral */}
                  <span
                    className={`relative shrink-0 font-light tabular-nums leading-none tracking-tight transition-all duration-500 ${
                      isActive
                        ? "text-3xl md:text-[2.75rem]"
                        : "text-xl text-[#9aa6c2] md:text-2xl"
                    }`}
                    style={{ color: isActive ? tone.fg : undefined }}
                  >
                    {indexLabel}
                  </span>

                  {/* Icon with halo on active */}
                  <span
                    className="relative flex shrink-0 items-center justify-center rounded-2xl transition-all duration-500"
                    style={{
                      width: isActive ? 56 : 40,
                      height: isActive ? 56 : 40,
                      backgroundColor: isActive ? tone.fg : tone.soft,
                      color: isActive ? "#ffffff" : tone.fg,
                      boxShadow: isActive
                        ? `0 14px 30px -10px ${tone.fg}55`
                        : "none",
                    }}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl opacity-40 blur-xl"
                        style={{ backgroundColor: tone.fg }}
                      />
                    )}
                    <Icon
                      className="transition-all duration-500"
                      style={{
                        width: isActive ? 26 : 18,
                        height: isActive ? 26 : 18,
                      }}
                      strokeWidth={1.85}
                    />
                  </span>

                  {/* Title block */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-xl font-semibold leading-tight tracking-tight transition-colors duration-500 md:text-2xl"
                      style={{ color: isActive ? tone.fg : "#0b1530" }}
                    >
                      {c.name}
                    </h3>
                    <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-[#5b6b8a] md:text-[12px]">
                      {c.full}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 transition-all duration-500"
                    style={{
                      color: isActive ? tone.fg : "#9aa6c2",
                      transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    strokeWidth={2}
                  />
                </button>

                {/* Body — animated height */}
                <div
                  ref={(el) => {
                    bodiesRef.current[idx] = el;
                  }}
                  id={`concours-body-${idx}`}
                  className="overflow-hidden"
                  style={{ height: 0 }}
                >
                  <div className="grid grid-cols-1 gap-10 px-6 pb-8 md:grid-cols-[1.4fr_1fr] md:gap-14 md:px-10 md:pb-10">
                    {/* Left column — copy */}
                    <div>
                      <p
                        data-fade
                        className="text-[15px] leading-relaxed text-[#3d4a6b] md:text-base"
                      >
                        {c.description}
                      </p>

                      <div data-fade className="mt-6 flex flex-wrap gap-2">
                        {c.matieres.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide"
                            style={{
                              borderColor: `${tone.fg}30`,
                              backgroundColor: tone.soft,
                              color: tone.strong,
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      <Link
                        data-fade
                        href="/inscription"
                        className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                        style={{ color: tone.fg }}
                      >
                        Decouvrir le programme
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/row:translate-x-1" />
                      </Link>
                    </div>

                    {/* Right column — 2x2 stat grid */}
                    <div data-fade className="grid grid-cols-2 gap-3">
                      {[
                        {
                          icon: BookMarked,
                          label: "Chapitres",
                          value: c.chapters.toLocaleString("fr-FR"),
                        },
                        {
                          icon: FileQuestion,
                          label: "QCM corriges",
                          value: c.qcm.toLocaleString("fr-FR"),
                        },
                        {
                          icon: Layers,
                          label: "Niveau",
                          value: c.niveau,
                        },
                        {
                          icon: Clock,
                          label: "Duree etudes",
                          value: c.duree,
                        },
                      ].map(({ icon: SI, label, value }) => (
                        <div
                          key={label}
                          className="relative overflow-hidden rounded-2xl border border-[#1f4dc1]/10 bg-white p-4 shadow-[0_8px_20px_-12px_rgba(31,77,193,0.18)]"
                        >
                          <SI
                            className="h-3.5 w-3.5"
                            style={{ color: tone.fg }}
                            strokeWidth={2.25}
                          />
                          <p className="mt-3 text-lg font-semibold tabular-nums leading-tight text-[#0b1530] md:text-xl">
                            {value}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#5b6b8a]">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-cycle progress — only rendered for the active row */}
                  {isActive && (
                    <div className="relative h-[2px] w-full">
                      <div className="absolute inset-0 bg-[#1f4dc1]/8" />
                      <div
                        ref={progressBarRef}
                        className="absolute inset-0 origin-left"
                        style={{
                          backgroundColor: tone.fg,
                          transform: "scaleX(0)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pause-state hint */}
        <p className="mt-5 text-center text-[11px] uppercase tracking-[0.25em] text-[#9aa6c2]">
          {isPaused ? "Defilement en pause" : "Defilement automatique"}
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
 * 3. PROCESS STEPS — 3-step "how it works" with drawn connector
 * ────────────────────────────────────────────────────────── */

interface Step {
  index: string;
  icon: typeof UserPlus;
  title: string;
  body: string;
  hue: "blue" | "green";
}

const STEPS: Step[] = [
  {
    index: "01",
    icon: UserPlus,
    title: "Inscris-toi en 30 secondes",
    body: "Cree ton compte, choisis ton concours. Premiers chapitres gratuits, sans carte bancaire.",
    hue: "blue",
  },
  {
    index: "02",
    icon: BookMarked,
    title: "Apprends et entraine-toi",
    body: "Cours structures, QCM corriges, mode etude et mode examen chronometre. Tu progresses a ton rythme.",
    hue: "green",
  },
  {
    index: "03",
    icon: Trophy,
    title: "Reussis le jour J",
    body: "Suivi precis de tes points faibles, revision espacee. Tu arrives au concours sans surprise.",
    hue: "blue",
  },
];

export function ProcessSteps() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const head = section.querySelectorAll<HTMLElement>("[data-head]");
        gsap.from(head, {
          y: 24,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });

        const steps = section.querySelectorAll<HTMLElement>("[data-step]");
        gsap.from(steps, {
          y: 32,
          stagger: 0.18,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });

        // Connector line draws horizontally, scrubbed to scroll for premium feel
        const line = section.querySelector<HTMLElement>("[data-line]");
        if (line) {
          gsap.fromTo(
            line,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 70%",
                end: "center 50%",
                scrub: 0.8,
              },
            },
          );
        }

        // Number badges pulse on enter
        section
          .querySelectorAll<HTMLElement>("[data-badge]")
          .forEach((badge, i) => {
            gsap.from(badge, {
              scale: 0,
              rotate: -90,
              duration: 0.7,
              delay: i * 0.18,
              ease: "back.out(2)",
              scrollTrigger: { trigger: section, start: "top 70%", once: true },
            });
          });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f7faff] py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(31,77,193,0.05) 0.8px, transparent 0.8px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(circle at 50% 30%, black, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <EyebrowLabel data-head hue="green">
            Processus
          </EyebrowLabel>
          <SectionHeading data-head className="mt-6">
            Trois etapes, zero detour.
          </SectionHeading>
          <SectionLead data-head className="mt-5">
            De l&apos;inscription au jour du concours, un parcours pense pour
            les lyceens et bacheliers marocains.
          </SectionLead>
        </div>

        <div className="relative">
          {/* Connector line behind the badges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[10%] right-[10%] top-[44px] hidden h-px md:block"
          >
            <div
              data-line
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(31,77,193,0.6) 0%, rgba(67,184,112,0.6) 50%, rgba(31,77,193,0.6) 100%)",
              }}
            />
          </div>

          <ol className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map(({ index, icon: Icon, title, body, hue }) => (
              <li
                key={index}
                data-step
                className="relative flex flex-col items-center text-center"
              >
                <div
                  data-badge
                  className={`relative z-10 flex h-[90px] w-[90px] items-center justify-center rounded-2xl bg-white shadow-[0_18px_40px_-15px_rgba(31,77,193,0.30)] ring-1 ring-[#1f4dc1]/12`}
                >
                  <span
                    className={`absolute -top-2 -right-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-bold tabular-nums tracking-wider text-white ${
                      hue === "blue" ? "bg-[#1f4dc1]" : "bg-[#43b870]"
                    }`}
                  >
                    {index}
                  </span>
                  <Icon
                    className={`h-9 w-9 ${
                      hue === "blue" ? "text-[#1f4dc1]" : "text-[#43b870]"
                    }`}
                    strokeWidth={1.75}
                  />
                </div>

                <h3 className="mt-7 max-w-[18rem] text-xl font-semibold leading-tight tracking-tight text-[#0b1530]">
                  {title}
                </h3>
                <p className="mt-3 max-w-[20rem] text-[14px] leading-relaxed text-[#5b6b8a]">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
 * 4. CTA BANNER — gradient call-to-action before pricing
 * ────────────────────────────────────────────────────────── */

interface CtaBannerProps {
  children?: ReactNode;
}

export function CtaBanner({ children: _ = null }: CtaBannerProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const reveals =
          section.querySelectorAll<HTMLElement>("[data-reveal]");
        gsap.from(reveals, {
          y: 24,
          stagger: 0.08,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 90%", once: true },
        });

        // Slow drift on the green halo so the gradient feels alive
        if (orbRef.current) {
          gsap.to(orbRef.current, {
            xPercent: 12,
            yPercent: -8,
            duration: 9,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-white px-6 py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-6xl">
        <div
          className="relative isolate overflow-hidden rounded-[28px] px-8 py-16 shadow-[0_30px_80px_-30px_rgba(31,77,193,0.55)] md:px-16 md:py-20"
          style={{
            background:
              "linear-gradient(135deg, #1f4dc1 0%, #2456d6 45%, #173b96 100%)",
          }}
        >
          {/* Drifting green halo */}
          <div
            ref={orbRef}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(67,184,112,0.75), transparent 70%)",
            }}
          />
          {/* Diagonal stripe pattern overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, white, white 1px, transparent 1px, transparent 14px)",
            }}
          />
          {/* Top hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
            }}
          />

          <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <span
                data-reveal
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white backdrop-blur"
              >
                <Sparkles className="h-3 w-3" />
                Acces immediat
              </span>
              <h2
                data-reveal
                className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-[2.75rem]"
              >
                Pret a transformer ta preparation ?
              </h2>
              <p
                data-reveal
                className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
              >
                Rejoins les milliers de bacheliers marocains qui revisent
                serieusement, sans bachoter. 300 MAD par concours, acces 1 an.
                Premiers chapitres offerts.
              </p>

              <div
                data-reveal
                className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <Link
                  href="/inscription"
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#1f4dc1] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.35)] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.45)]"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#tarif"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  Voir le tarif
                </Link>
              </div>
            </div>

            {/* Trust column with mini stats */}
            <div data-reveal className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: "Acces instantane", value: "30 sec" },
                { icon: Clock, label: "Acces", value: "12 mois" },
                { icon: Trophy, label: "Concours", value: "5 filieres" },
                { icon: Sparkles, label: "Par concours", value: "300 MAD" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur transition-all duration-300 hover:bg-white/[0.12]"
                >
                  <Icon
                    className="h-4 w-4 text-[#43b870]"
                    strokeWidth={2.25}
                  />
                  <p className="mt-3 text-lg font-semibold text-white">
                    {value}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
