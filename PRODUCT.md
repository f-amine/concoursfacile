---
register: brand
---

# ConcoursFacile.ma

## Product Purpose

A Moroccan post-baccalaureat concours prep platform. Five filieres covered: Medecine, ENSA, ENCG, ENSAM, CPGE. Each one ships structured cours, QCM corriges, mode etude / mode examen, spaced-repetition revision, and progress tracking aligned to the national curriculum.

The landing page IS the product surface for prospects. Its job: convince a Moroccan bachelier (and their parents) that 300 MAD for one year of access is the most-leveraged decision they can make this summer.

## Users

- **Primary**: Moroccan lyceens and freshly-graduated bacheliers preparing post-bac concours. Tech-fluent, mobile-first, used to scrolling Instagram and TikTok between revision sessions.
- **Secondary**: Their parents, who often hold the wallet and approve the 300 MAD payment. They want trust signals: real testimonials, transparent pricing, no auto-renewal traps.
- **Tertiary**: Lycee professors who recommend tools to their students.

Most users discover the site on a phone, in French, late at night during exam season. They are price-sensitive (300 MAD is meaningful for many families), skeptical of foreign EdTech (most prep tools are French and not aligned with Moroccan programmes), and looking for a single decisive choice — not a buffet of subscriptions.

## Tone & Voice

- Direct, calm, French, no-bullshit. No motivational filler.
- Tutoiement throughout (`tu`, not `vous`). It mirrors how lyceens talk to each other.
- ASCII-only French in code: "Reussissez", "ecole", "matieres". Reason: legacy build pipeline issues with diacritics in some surfaces; consistency wins.
- "Marocain" is a feature, not a footnote. The product belongs to the local context. Say so where it matters.
- No em dashes. Commas, colons, parentheses. Periods on sentences, not on labels.

## Brand

- Logo: blue C (royal blue, ~#1f4dc1) wrapped around a green checkmark (~#43b870), wordmark "concoursfacile.ma" in deep navy.
- The C-and-checkmark motif is the single recurring symbol. Echo it in details (gradient hairlines, divider colors, success affordances) but never re-draw it as decoration.
- Visual register: editorial-clean, not maximalist. Heavy whitespace, restrained color, sharp typography. The product is education — it should read serious without being austere.

## Strategic Principles

1. **One payment, one year**. 300 MAD up front, no subscription, no auto-renewal. This is the headline trust signal. Any pricing language must repeat it explicitly.
2. **First chapters free, no card needed**. The trial path is the conversion path. Surface it everywhere a CTA appears.
3. **Filiere-first**. Users come for ONE concours. Every section should let them locate their filiere within 1 second. The five-concours grid is non-negotiable on the landing.
4. **Numbers earn their place**. 2 000+ QCM, 800+ chapitres, 5 concours, 12 matieres. Specific counts beat vague claims like "thousands of questions."
5. **No-bachotage**. The platform's positioning is "revise serieusement, sans bachoter" (study seriously, without cramming). Spaced repetition + progress tracking are the proof.

## Anti-References

- **The previous dark-mode landing**. Black background + neon green (#0CF2A0) accent. Read AI-generated, dated, hostile. Explicitly rejected.
- **Generic icon-card grids**. Five identical rounded cards with icon + heading + paragraph. SaaS cliche. The accordion-stack on the current landing is the antidote.
- **Hero-metric template**. Big number + small label + supporting stats with gradient accent. SaaS-template signal.
- **Gradient text on white**. Cliche. Solid colors only. Hierarchy through weight and size.
- **Side-stripe borders**. Never used as a colored accent on cards or callouts.
- **Glassmorphism by default**. Used once on the CTA banner's mini-stat tiles for depth, never applied globally.

## Constraints & Context

- Stack: Next.js 15 (app router), Tailwind v4 with `@theme`, shadcn primitives, GSAP for landing motion, framer-motion in the hero.
- Two color contexts: dashboard pages inherit the global tokens (white surface + brand blue active states). Landing pages override with an inline `LANDING_THEME` style block on `src/app/page.tsx` that pins primary, accent, foreground, and surface tokens.
- Logo asset is JPEG with white background — it must sit on white surfaces only.
- The landing has to perform on slow Moroccan mobile networks. No heavy hero images. WebP everywhere. GSAP reveals must be cheap.
