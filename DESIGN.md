# ConcoursFacile Design System

Tokens live in `src/styles/globals.css`. The landing page narrows the palette to the brand triad via an inline `LANDING_THEME` `style={}` on the outer wrapper in `src/app/page.tsx` so all child components inherit through CSS custom properties.

## Color

OKLCH-equivalent HSL tokens. Never `#000` or `#fff` alone — the brand-blue tinted shadows and `#0b1530` foreground replace pure neutrals.

### Brand triad

| Role | Light | Dark | Notes |
|---|---|---|---|
| `--primary` | `hsl(221 83% 53%)` ≈ `#1f4dc1` | `hsl(217 91% 60%)` brighter | Royal blue from logo C. CTAs, active states, link color. |
| `--accent` (landing) | `#43b870` (green) | `#43b870` | Vibrant check-green from logo. Success, positive trends, "correct" affordances. NOT used as a hover surface — `--secondary` does that job. |
| `--foreground` | `#0b1530` | `hsl(210 40% 96%)` | Logo wordmark navy. All body text. |
| `--background` | `#ffffff` (landing) / `hsl(210 40% 98%)` (dashboard) | `hsl(222 47% 7%)` | |
| `--secondary` | `#eef3ff` | `hsl(222 47% 14%)` | Soft blue surface for hover, chips, muted regions. |
| `--muted-foreground` | `#5b6b8a` | `hsl(215 20% 65%)` | Slate body text, captions. |

### Color strategy on landing

**Restrained**. The page is mostly white. Brand blue carries about 8 % of pixels (CTAs, headings, focus). Brand green appears only on success/positive moments (checkmarks in lists, the "Concours couverts" separators, the active row of two filieres in the accordion). Both blue and green are full-saturation when used — no muted tints of the brand colors. Tints are reserved for hover surfaces (`#eef3ff`, `#e8f6ee`).

### Tinted shadows

Shadows are blue-tinted (`hsl(221 83% 25% / 0.08-0.30)`), never pure black. This keeps the white surfaces from feeling clinical and ties shadow depth to the brand.

## Typography

- **Display**: Geist Sans via `next/font/google`, exposed as `--font-geist-sans`.
- **Body**: same.
- **Mono**: JetBrains Mono (`--font-mono`).

### Scale

Three display sizes in use on landing:

```
H1 (hero)        : text-4xl sm:text-5xl lg:text-[64px]   font-semibold leading-tight
H2 (section)     : text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight
H3 (subsection)  : text-xl md:text-2xl                   font-semibold tracking-tight
```

Body uses `text-base sm:text-lg` for hero/sub-hero copy, `text-[15px]` to `text-base` for inline body, `text-[11px]` to `text-[13px]` for labels and captions. Tabular numerals (`tabular-nums`) on every count, stat, or numeral.

### Eyebrow label (recurring micro-pattern)

```
inline-flex rounded-full
border border-[#1f4dc1]/20 bg-[#1f4dc1]/[0.06]
px-4 py-1
text-[11px] font-medium uppercase tracking-[0.25em] text-[#1f4dc1]
```

Hue swap (blue/green) per section. This is extracted as `<EyebrowLabel hue="blue|green">` for reuse — never rebuild it inline.

## Spacing & Rhythm

- Section vertical padding standard: `py-24 md:py-32` for major content sections. CtaBanner is intentionally tighter at `py-20 md:py-28` because it's a punchy interruption between testimonials and pricing.
- Container max widths: `max-w-6xl` for most sections, `max-w-5xl` for the concours accordion (intentionally narrower so it reads as one focused widget, not a sprawling grid).
- Gutter: `px-6 md:px-10`.
- Card radius: `rounded-2xl` (16px) for atom cards, `rounded-3xl` (24px) for major surfaces, `rounded-[28px]` for hero / accordion / CTA wrappers.

## Motion

GSAP (`power3.out`, `power3.inOut`) on landing for scroll-triggered reveals. ScrollTrigger `start: "top 90%"` so reveals fire as soon as a section enters the viewport — no opacity-0 traps.

Global rules:
- Never animate layout properties (width/height auto excepted via GSAP measurement).
- All scroll reveals go through `gsap.matchMedia` to honor `prefers-reduced-motion: reduce`. Reduced-motion users see the final state instantly.
- Auto-cycle progress bars are visible: users see what's about to happen, can pause by clicking.

## Components

shadcn primitives in `src/components/ui/` cover atoms (button, card, input, dialog, dropdown-menu, etc.). Landing-specific compositions live in `src/components/blocks/`:

- `hero-section-nexus.tsx` — interactive hero with dot-grid canvas, rotating filiere word, primary CTA.
- `landing-extras.tsx` — `StatsStrip`, `ConcoursGrid` (accordion), `ProcessSteps`, `CtaBanner`. Plus a future home for `EyebrowLabel` and `SectionHeading` extracted during polish.

Conventions:
- All decorative effects use `pointer-events-none` and `aria-hidden`.
- All interactive elements have explicit hover, focus-visible, and active states.
- Icons come from `lucide-react`, default `strokeWidth={1.85-2.25}`.

## Accessibility floor

- WCAG AA contrast on every text/background pair.
- Keyboard navigation works on every interactive surface.
- `aria-expanded` / `aria-controls` on the concours accordion rows.
- `prefers-reduced-motion` is respected globally.
