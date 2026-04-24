# Landing Page — AI Image Generation Prompts

These are **marketing visuals**, not app screenshots. Each image is an editorial product composition: tilted floating UI fragments, layered glass, abstract green ribbons and rings, gradient nebula backgrounds, lens flares, depth of field, particles. The goal is to make someone scroll to a section and feel *motion and energy*, not read a flat screen.

If your output looks like a single app screen shot head-on with no depth, no floating shapes, no atmosphere — **reject it and regenerate**. The prompt went in flat-screenshot mode.

## How to use this file

- **Prompt format**: each prompt is natural language that works across Midjourney, Flux, DALL-E, Nano Banana, Gemini. The trailing `--ar W:H` flag + MJ flags are Midjourney-specific; `px` dimensions are given for DALL-E/Flux.
- **Negative prompts** (Stable Diffusion / Flux Dev / ComfyUI) live in a separate block. MJ / DALL-E / Gemini ignore them.
- **Style anchor**: every prompt names 2–3 visual references (Linear marketing hero, Apple product reveal, Arc Browser, Vercel art, Stripe illustrations, Framer site hero). Keep those — they're the biggest stability lever.
- **Consistency**: use the same seed / style reference across images 1–6 if your tool supports it, so the six marketing shots feel like one campaign.

## Global marketing art direction (prepend to every prompt if the tool loses context)

Editorial product marketing artwork for a premium 2025 dark-mode SaaS landing page. **Not a flat app screenshot.** Layered composition with foreground, mid-ground and background depth. Tilted 3/4 perspective on floating UI fragments (not full screens — isolated cards, pills, progress rings lifted out of a product). Surrounding atmosphere of abstract geometry: thin `#0CF2A0` neon rings, curved bright green light ribbons, floating glass discs, soft gradient orbs, dust particles, volumetric lens flare. Deep black `#0a0a0a` background with a large radial `#0CF2A0` aurora glow (10–15% opacity) behind the subject, plus secondary cyan `rgba(87, 220, 205, 0.5)` wash from the opposite corner. Cinematic depth of field — foreground crisp, background softly blurred. Film grain overlay. Product surfaces `#111111` with 1px `rgba(255,255,255,0.08)` borders, glass-morphism translucency where layered. Typography visible on cards: crisp geometric sans (Inter / Geist / Söhne), tight tracking. Mood: quiet confidence, premium, luminous, French-language product. Style anchors: Linear marketing hero, Apple iPhone reveal render, Arc Browser marketing site, Vercel landing art, Framer.com hero composition, Stripe product illustrations, Fey.com charts. Avoid: flat full-screen screenshots, boring head-on UI, emoji, stock-photo people, purple gradients, rainbow accents, 3D cartoon style, clip-art icons, skeuomorphic glossy buttons.

---

## Image 0 — HERO brand visual (the single most important shot on the page)

**File target**: `public/landing/hero-preview.webp`
**Code location**: `src/components/blocks/hero-section-nexus.tsx` — replaces the hardcoded JSX dashboard mockup currently rendered inside the `aspect-[1024/640]` container at the bottom of the hero section
**Rendered at**: landscape 16:10, up to 1024×640 on desktop (max-w-4xl). The single largest visual on the page.
**Purpose**: This is **not another product screenshot** — it is a **brand visual**. Think Apple keynote backdrop, Linear launch hero, Stripe Press book cover. The five other images on the page all show floating UI fragments; the hero must break that pattern and introduce *the name of the company* with gravity. Minimal. Iconic. Feels like something you'd see framed on a wall.

**Concept**: *La session en cours* — a focused study session in progress. A massive glowing circular TIMER/PROGRESS RING is the hero subject at the center of the frame, tilted in 3D space, partially filled in bright `#0CF2A0`. One small chapter-card floats in mid-ground behind the ring showing a French course title. A tiny streak-flame badge orbits in the foreground. Same editorial treatment as images 1–6 (floating UI fragments, tilted 3/4 perspective, aurora, ribbons, particles), but centered on a different moment — the act of *focused practice* rather than navigation, quiz-taking, or post-session analytics.

**Prompt**:

```
Editorial product marketing artwork for a dark-mode study &
quiz SaaS landing page hero, landscape 16:10. Same visual
language as my other mockup images: cinematic scene of floating
UI fragments in 3D space, tilted 3/4 perspective, aurora glow,
thin neon ribbons, particles, depth of field — NOT a flat
screenshot, NOT a browser or phone frame. Different composition
idea this time: a focused study session in progress, anchored
on one dominant glowing timer-ring rather than a quiz card.

HERO ELEMENT — center of frame, dominant, occupying about 55%
of the frame height:
A massive circular TIMER / PROGRESS RING, rendered as a thick
arc stroke in bright `#0CF2A0` on a faint `rgba(255,255,255,
0.06)` track, about 8–10px visual weight. The ring is tilted
gently in 3D space about 10 degrees toward the viewer, showing
real depth (not flat). The arc is partially filled — roughly
40% of its circumference is bright green, the remaining arc
is muted gray. The ring emits a soft volumetric green bloom
around its stroke, especially at the bright arc's endpoints.
The interior of the ring is empty except for a subtle centered
horizontal rule — no numbers, no timer digits, no readable
text. The ring alone is the subject.

SUPPORTING CARD (mid-ground, upper-left, tilted back ~12°,
slightly blurred by depth):
A compact `#111111` card with 1px white/8% border, 16px
rounded corners, about 28% the scale of the hero ring. The
card shows a small `#0CF2A0`/15% pill label at top-left
reading "CHAPITRE 04" in uppercase green, below it the
chapter title "Integrales definies" in crisp white
geometric sans, and beneath that a single thin `#0CF2A0`
progress bar at about 35% on a faint track. No other copy.

FLOATING STREAK ACCENT (foreground, lower-right, soft focus):
A small rounded pill in `#111111` with 1px `#0CF2A0`/30%
border, holding a minimal flame glyph (1px stroke outline,
not a cartoon flame) in bright `#0CF2A0` on the left, and
the number "7" in white geometric sans on the right. That's
the only numeral in the whole frame. Single digit, standard
font, crisp.

BACKGROUND ACCENT — a single thin `#0CF2A0` neon ribbon arc
sweeping diagonally from bottom-left to upper-right across
the full composition, at 40% opacity, passing behind the
hero ring. Evokes motion and time.

ATMOSPHERE:
- Deep solid `#0a0a0a` background
- Massive soft radial `#0CF2A0` aurora at 20% peak opacity
  centered behind the hero ring, fading to pure black at
  the frame edges
- Secondary cool cyan `rgba(87, 220, 205, 0.3)` wash from
  the bottom-right corner
- Sparse drifting dust particles catching green light,
  concentrated around the hero ring, ~30 particles total,
  varying sizes
- A single subtle volumetric lens flare streak from the
  upper-left at a gentle diagonal
- Fine film grain overlay across the full frame

DEPTH OF FIELD:
Hero timer-ring razor sharp, supporting chapter card
moderately crisp, foreground streak pill slightly soft
focus, background particles and far atmosphere softly
blurred. Cinematic bokeh.

COMPOSITION RULES (critical):
- ONE dominant hero element (the timer ring) — everything
  else is supporting, no competing subjects.
- The chapter card is the only card in the frame; do NOT
  add a quiz question card, results card, or multiple
  floating UI cards (those moments belong to the other
  images in the set). Keep this hero distinct.
- Readable text is limited to: "CHAPITRE 04" (one short
  label), "Integrales definies" (one short chapter title),
  and the single digit "7". That's it. No sentences, no
  paragraphs, no quiz questions, no brand name, no school
  names, no logos.
- All text must be crisp standard geometric sans, no
  distortion, no handwriting, no calligraphy.

MOOD: focused, quiet, disciplined, luminous. The feeling of
sitting down for a real study session — calm concentration,
time moving forward, progress accruing.

STYLE ANCHORS: Linear.app marketing hero, Apple product
reveal render, Arc Browser landing art, Fey.com chart art,
Vercel hero compositions, Framer.com site heros. Match the
visual treatment of the other 6 mockup images in this set
(same palette, same atmosphere, same tilt) — this is part
of the same campaign, just a different moment.

AVOID: flat full-screen UI screenshot, head-on perspective,
browser chrome, window dots, traffic lights, MacBook frame,
iPhone, iPhone notch, phone mockup, device frame, hand,
human, person, face, photograph, 3D toy render, cartoon,
emoji, clip-art, pictogram, brand logo, wordmark, caption,
watermark, signature, quiz question card, multiple-choice
answer rows, result summary card, dashboard grid (those
belong to other images), purple, blue, red, orange, yellow,
rainbow, skeuomorphic glossy buttons, bevel, heavy drop
shadows, ornate decorative, text beyond the three short
labels specified, distorted letters.

--ar 16:10 --style raw --q 2 --v 6.1
```

**Dimensions (DALL-E / Flux)**: 1600 × 1000 px (2× display target for retina)

**Negative (SD / Flux only)**:
`flat screenshot, head-on perspective, full-screen UI, browser chrome, window dots, traffic lights, MacBook, iPhone, device frame, hand, human, person, face, photograph, 3D toy, cartoon, emoji, clip-art, pictogram, quiz question card, multiple-choice answers, results card, dashboard grid, brand logo, wordmark, caption, watermark, signature, long text, paragraph, sentence, purple, blue, red, orange, yellow, rainbow, skeuomorphic, glossy, bevel, heavy shadows, ornate baroque, distorted letters, doubled letters, wobbly text`

---

## Image 1 — "Des cours structures" — floating course-nav composition

**File target**: `public/landing/section-1-courses.webp`
**Code location**: `src/app/page.tsx:110` (primary foreground mockup of the first `SectionWithMockup`)
**Rendered at**: portrait ~3:4, 471×637 desktop
**Purpose**: Opening marketing visual beside the headline "Des cours structures, pour chaque concours." It should feel like course structure *floating into place* — organized, calm, aspirational.

**Prompt**:

```
Editorial product marketing artwork for a dark-mode SaaS landing
page, portrait 3:4 composition. NOT a flat app screenshot — it is a
cinematic scene of floating UI fragments in 3D space.

Center: a single tall mobile-app card tilted at a gentle 8-degree
3/4 angle toward the viewer, `#111111` surface with 1px
white/8% border and 24px rounded corners, catching a soft rim light
on its right edge. Inside the card: a header reading
"Mathematiques - ENSA" in crisp white geometric sans, a thin
progress bar at 62% filled in bright `#0CF2A0`, and a vertical
stack of 4 visible chapter rows — numbered 01-04, French titles
("Derivees et primitives", "Integrales", "Equations
differentielles", "Suites numeriques"), durations ("14 min",
"22 min"), with status circles on the right (two filled
`#0CF2A0` checks, one active with a neon ring, one hollow).

Floating in front-right of the main card at about 60% scale: an
isolated "active chapter" pill lifted out of the card plane, glowing
`#0CF2A0` left edge, as if it detached and drifted forward. Behind
it, a short arc of 3 small translucent glass discs trailing.

Floating behind-left of the main card at about 40% scale and
slightly blurred by depth of field: a fragment of another screen
— just the top progress-bar + the first two chapter rows — tilted
the opposite direction, a ghost of the main.

Background atmosphere: deep `#0a0a0a` with a large soft radial
`#0CF2A0` aurora glow at 12% opacity centered behind the main card,
and a secondary cyan `rgba(87,220,205,0.4)` wash from the bottom-
left. Two thin curved `#0CF2A0` neon ribbons drift across the
background in smooth arcs, one behind the main card, one in front
partially occluding its lower corner. Fine dust particles
suspended in the air, catching light. A subtle volumetric lens flare
from the top-right.

Composition layering: far background (gradient + glow), mid-back
(ghost card + ribbons), hero (main tilted card), foreground
(floating detached pill + small glass discs + particles).
Cinematic depth of field — crisp on the hero, soft blur at
foreground and background extremes. Film grain overlay.

Style anchors: Linear.app marketing hero, Apple iPhone feature
reveal render, Arc Browser landing page composition, Framer.com
hero art.

Avoid: flat screenshot, head-on perspective, emoji, stock-photo
people, purple, blue, orange, rainbow, clip-art icons, cartoon
style, skeuomorphic buttons, glossy plastic, readable body
paragraphs (titles only), device frames / iPhone notch, hands
holding phone, realistic photography.

--ar 3:4 --style raw --q 2 --v 6.1
```

**Dimensions (DALL-E / Flux)**: 1024 × 1365 px

**Negative (SD/Flux)**:
`flat screenshot, head-on perspective, single full-screen UI, iPhone frame, iPhone notch, human hand, person, photograph, 3D cartoon, cartoon icon, emoji, purple, blue accent, orange accent, rainbow, watermark, text distortion, low contrast, oversaturated, glossy button, skeuomorphic bevel`

---

## Image 2 — Concours grid, exploded composition

**File target**: `public/landing/section-1-bg.webp`
**Code location**: `src/app/page.tsx:111` (decorative secondary card behind the primary)
**Rendered at**: 1:1 square, 472×500 desktop, shown slightly offset & blurred behind primary
**Purpose**: Secondary depth card — peeking from behind the main mockup. Must read instantly as "5 concours covered" without needing detail.

**Prompt**:

```
Editorial product marketing artwork, square 1:1 composition, dark
mode. An exploded floating constellation of 5 concours tiles
drifting in 3D space around a central radial bloom — NOT a flat
grid.

Five identical `#111111` square tiles, each with 1px white/8%
border, 16px rounded corners, arranged in a loose asymmetric orbit
around the image center. Each tile shows a concours name in bold
white geometric sans and a small abstract monogram glyph in
`#0CF2A0` (1px stroke, NOT a pictogram of a building or book):
- ENSA — top-right, tilted 12° right
- ENCG — left, tilted 8° left
- ENSAM — top-left, tilted 5° back
- Medecine — center-front, largest, tilted slightly forward, in
  active state (2px `#0CF2A0` border, faint inner green glow)
- CPGE — bottom-right, smallest, tilted 15° right, slightly
  blurred by depth

Center of the composition: a large radial `#0CF2A0` bloom at 18%
opacity, with a thin concentric `#0CF2A0` ring glowing around it
(2px stroke at 60% opacity). Thin curved `#0CF2A0` ribbons connect
two of the tiles with graceful arcs, suggesting the tiles are
nodes in a system.

Background: `#0a0a0a` with a secondary cyan
`rgba(87,220,205,0.35)` wash coming from the bottom-right corner.
Fine drifting particles. A soft volumetric lens flare off the top
edge.

Depth of field: hero tile (Medecine) crisp, surrounding tiles with
progressive softness based on distance. Subtle film grain.

Style anchors: Vercel landing composition, Linear abstract hero,
Arc Browser marketing art, Apple reveal renders.

Avoid: flat grid layout, head-on perspective, clip-art icons,
cartoon pictograms of schools, human figures, purple, blue, orange,
rainbow, skeuomorphic buttons, emoji, photograph, device frame,
text paragraphs.

--ar 1:1 --style raw --q 2 --v 6.1
```

**Dimensions**: 1024 × 1024 px

**Negative**:
`flat grid, head-on, clip-art, cartoon, person, hand, photograph, 3D toy style, purple, blue accent, red, orange, rainbow, emoji, skeuomorphic, glossy, watermark`

---

## Image 3 — Exam mode: floating question + orbiting timer

**File target**: `public/landing/section-2-quiz.webp`
**Code location**: `src/app/page.tsx:129` (primary foreground, second `SectionWithMockup`)
**Rendered at**: portrait 3:4, 471×637 desktop
**Purpose**: Second marketing visual, beside "QCM corrigés, mode examen chronométré." Must communicate *focus + time pressure + clarity* without feeling stressful.

**Prompt**:

```
Editorial product marketing artwork for a dark-mode SaaS landing
page, portrait 3:4 composition. A cinematic scene of floating quiz
UI fragments — NOT a flat app screen.

Center hero: a tilted `#111111` question card at 10-degree 3/4
angle, 1px white/8% border, 24px rounded corners, containing a
French biology question in white geometric sans ("Quelle enzyme
catalyse la conversion du fibrinogene en fibrine ?") and
underneath it two visible answer pills — one neutral ("B. Plasmine"),
one highlighted active ("A. Thrombine" with 2px `#0CF2A0` left bar,
faint `#0CF2A0`/10% fill, green "A" letter badge). The card is
slightly translucent glass-morphism, with a subtle specular
highlight on its top-right corner.

Floating above-right of the card, orbiting it: an isolated
circular countdown timer rendered as a thick 3D ring — 2px stroke
`#0CF2A0`, 60% of its circumference filled in bright green, the
rest faint gray — with "12:34" floating at its center in white.
The ring casts a soft green bloom onto the surrounding air.

Floating below-left of the card: two isolated answer pills drifting
outward as if detached from the card, slightly smaller, softer
focus, one with a green check glyph in a `#0CF2A0` circle. Thin
curved `#0CF2A0` ribbons trail from the card toward the drifting
pills.

Behind the hero card, ghost layer: a faint duplicate of the same
question card, tilted the opposite way, blurred by depth, 30%
opacity, establishes parallax.

Background: `#0a0a0a` with a large radial `#0CF2A0` aurora at 14%
opacity behind the hero, secondary cyan wash from the bottom-left.
A subtle swooping motion-blur trail sweeps across the composition
diagonally, suggesting the timer spinning. Dust particles, soft
volumetric lens flare from top-left.

Depth of field: hero card crisp, orbiting timer crisp, detached
pills moderately soft, ghost layer softly blurred. Film grain.

Style anchors: Linear marketing hero, Apple product reveal render,
Arc Browser landing art, Stripe dashboard illustrations, Framer
hero compositions.

Avoid: flat app screenshot, head-on, single full-screen UI, device
frame, iPhone, hand, human, photograph, cartoon, emoji, purple,
blue accent, orange, rainbow, readable body paragraphs beyond the
question, skeuomorphic buttons, glossy plastic.

--ar 3:4 --style raw --q 2 --v 6.1
```

**Dimensions**: 1024 × 1365 px

**Negative**:
`flat screenshot, head-on, full-screen UI, iPhone, device frame, hand, person, photograph, 3D cartoon, cartoon icon, emoji, purple, blue, orange, rainbow, skeuomorphic, glossy, bevel, watermark, blurred text, low contrast`

---

## Image 4 — Results summary: exploded percentage + orbiting chart

**File target**: `public/landing/section-2-bg.webp`
**Code location**: `src/app/page.tsx:130` (decorative secondary, second `SectionWithMockup`)
**Rendered at**: 1:1 square, shown slightly offset & blurred behind primary
**Purpose**: Secondary depth card behind the quiz mockup. Must read at a glance as "progress + numbers."

**Prompt**:

```
Editorial product marketing artwork, square 1:1, dark mode. A
floating composition centered on a huge glowing percentage number
orbited by UI chart fragments — NOT a flat dashboard.

Center dominant: the number "84%" in white geometric sans, massive
(about 55% of the image height), font-weight 600, tight tracking,
with a very subtle `#0CF2A0` inner glow on its edge. A thin 1px
`#0CF2A0` underline strokes below it.

Orbiting the percentage at different depths and angles:
- Top-right, tilted back: a small floating line-chart card,
  `#111111`, 1px white/8% border, showing a `#0CF2A0` stroke
  trending upward across 7 tick marks with a soft `#0CF2A0`/15%
  gradient fill, last data point has a bright green dot with a
  bloom.
- Left, tilted forward: a small stat pill "17 / 20" with label
  "Bonnes reponses" in muted white.
- Bottom-right, softly blurred: a second stat pill "42 s" /
  "Temps moyen".
- Far behind the number: a faint horizontal progress bar fragment,
  `#0CF2A0` fill, 40% opacity.

Curved `#0CF2A0` neon ribbons swoop around the composition, one
behind the number, one in front threading between the chart and
the percentage.

Background: `#0a0a0a` with a large radial `#0CF2A0` aurora at 16%
opacity centered behind the number, secondary cyan wash from the
bottom-right. Dust particles. Soft volumetric lens flare from
top-left. Film grain.

Depth of field: percentage + chart card crisp, stat pills
moderately soft, far background elements softly blurred.

Style anchors: Fey.com chart cards, Linear marketing hero, Stripe
product art, Vercel landing compositions.

Avoid: flat single-screen dashboard, head-on, clip-art, cartoon,
photograph, human, device frame, purple, blue, orange, rainbow,
skeuomorphic, 3D cartoon style, emoji.

--ar 1:1 --style raw --q 2 --v 6.1
```

**Dimensions**: 1024 × 1024 px

**Negative**:
`flat screenshot, head-on, single dashboard, clip-art, cartoon, photograph, person, hand, device frame, purple, blue, red, orange, rainbow, skeuomorphic, glossy, bevel, watermark`

---

## Image 5 — QCM correction: lifted correct-answer row composition

**File target**: `public/landing/feature-qcm.webp`
**Code location**: `src/components/ui/features-10.tsx:24` + `:25` (DualModeImage — both slots share this file)
**Rendered at**: 4:3 landscape (76:59), 1207×929 native
**Purpose**: Inset inside a bordered feature card advertising "QCM corrigés." Must communicate *correction with explanation* as a visual gesture — the correct answer *revealing itself*.

**Prompt**:

```
Editorial product marketing artwork, landscape 4:3, dark mode. A
floating cinematic scene of a French multiple-choice question card
with the correct answer lifting out of the card plane — NOT a flat
screenshot of a quiz UI.

Center: a `#111111` question card tilted at a gentle 6-degree 3/4
angle, 1px white/8% border, 24px rounded corners. The card shows a
small `#0CF2A0`/15% pill label "BIOLOGIE · ENSA" in green uppercase,
the French question text in white geometric sans ("Quelle enzyme
catalyse la conversion du fibrinogene en fibrine ?"), and four
answer rows.

The hero moment: the correct answer row "A. Thrombine" is LIFTED
physically out of the card's surface, floating about 40px forward
in space with a 2px `#0CF2A0` left accent bar and a bright green
check-circle glyph on the right. A soft `#0CF2A0` glow spreads
from the floating row down onto the card beneath. The three other
rows (B. Plasmine, C. Trypsine, D. Amylase) remain flat inside
the card at neutral styling, with one ("C. Trypsine") having a
subtle white/40% X glyph marking it as the student's prior wrong
pick.

Below the card, a translucent floating "Explication" chip drifting
outward, showing a bookmark glyph in `#0CF2A0` and three lines of
shorter French explanation text. It connects to the lifted correct-
answer row via a thin curved `#0CF2A0` ribbon, suggesting the
explanation flows from the correct choice.

Behind the main card, ghost layer: a second duplicate of the card
tilted the opposite way, 25% opacity, softly blurred.

Background: `#0a0a0a` with a radial `#0CF2A0` aurora at 14%
opacity from the top-left, secondary cyan wash from the bottom-
right. Drifting particles. Subtle swooping light ribbons in the
background. Soft volumetric lens flare from top-right. Film grain.

Depth of field: hero card crisp, lifted answer row crisp,
explanation chip moderately soft, ghost behind softly blurred.

Style anchors: Linear marketing hero, Apple feature reveal, Stripe
product illustrations, Fey.com, Arc Browser.

Avoid: flat screenshot, head-on perspective, device frame, iPhone,
hand, person, photograph, cartoon, emoji, purple, blue accent,
orange, rainbow, skeuomorphic, glossy button, readable long
paragraphs beyond the question + short explanation.

--ar 4:3 --style raw --q 2 --v 6.1
```

**Dimensions**: 1207 × 929 px (native) or 1280 × 960 px

**Negative**:
`flat screenshot, head-on, full-screen UI, device frame, hand, human, photograph, 3D cartoon, cartoon icon, emoji, purple, blue, orange, rainbow, skeuomorphic, glossy, bevel, watermark, blurred text, low contrast, oversaturated`

---

## Image 6 — Progression dashboard: orbiting chart composition

**File target**: `public/landing/feature-progress.webp`
**Code location**: `src/components/ui/features-10.tsx:42` + `:43` (DualModeImage — both slots share this file)
**Rendered at**: 4:3 landscape, 1207×929 native
**Purpose**: Inset inside a feature card advertising "Suivi de progression." Must feel like a growing system — progress that keeps moving.

**Prompt**:

```
Editorial product marketing artwork, landscape 4:3, dark mode. A
floating cinematic scene of progression UI — a large radial
progress ring at the center, orbited by subject bars and stat
cards — NOT a flat dashboard screenshot.

Center hero: a massive 3D-feeling radial progress ring at 68%
completion, 8px stroke bright `#0CF2A0` on a faint
`rgba(255,255,255,0.06)` track, diameter filling about 55% of
the image height. Inside the ring: "68%" in white geometric sans
at large size, with a muted "Progression globale" label below.
The ring has a soft volumetric green bloom around its stroke,
especially where it meets the arc endpoints.

Orbiting the ring at different depths and angles:
- Top-right, tilted back: a floating vertical stack of 3 subject
  rows — "Mathematiques 85%", "Physique 72%", "SVT 54%" — each
  with its own thin `#0CF2A0` progress bar, floating as a glass
  card with 1px white/8% border. Subtle translucency.
- Bottom-left, tilted forward, slightly softer focus: a stat card
  showing "7 jours" with a minimal flame glyph in `#0CF2A0`.
- Right-center, smaller: a compact card "142 QCM reussis" with a
  green check glyph.
- Top-left, furthest back, heavy depth-of-field blur: a line chart
  fragment trending upward.

Curved thin `#0CF2A0` neon ribbons sweep around the ring, one
behind it, one threading through the foreground between the
orbiting cards. A few bright green data-dot particles float around
the ring as if representing individual QCM completions.

Background: `#0a0a0a` with a large radial `#0CF2A0` aurora at
15% opacity behind the ring, secondary cyan
`rgba(87,220,205,0.35)` wash from the top-right. Fine dust
particles. Soft volumetric lens flare from the bottom-left. Film
grain.

Depth of field: central ring razor sharp, subject stack + close
cards crisp, distant line chart softly blurred.

Style anchors: Linear analytics hero, Fey.com chart art, Vercel
landing composition, Apple product reveal, Plausible.io.

Avoid: flat dashboard, head-on perspective, clip-art, cartoon,
emoji, pictogram of human figure, photograph, hand, person,
device frame, purple, blue, orange, rainbow, skeuomorphic, glossy,
readable long paragraphs.

--ar 4:3 --style raw --q 2 --v 6.1
```

**Dimensions**: 1207 × 929 px (native) or 1280 × 960 px

**Negative**:
`flat dashboard, head-on, full-screen UI, clip-art, cartoon, photograph, person, hand, device frame, pictogram of human, purple, blue, orange, rainbow, skeuomorphic, glossy, bevel, watermark, low contrast`

---

## Image 7 (optional) — Testimonial avatars × 9

**File target**: `public/landing/avatars/<firstname>.webp`
**Code location**: `src/app/page.tsx:14-68` — `TESTIMONIALS[].image`, currently `randomuser.me`
**Rendered at**: 40×40 px inside a rounded avatar, source 1:1 512×512
**Purpose**: Social proof portraits. These are genuinely photographic — keep them literal. The editorial marketing direction applies to the 6 mockups, NOT these.

**Shared base prompt** (append the variant line at the end):

```
Portrait photograph of a Moroccan student in their late teens or
early twenties. Head-and-shoulders framing, eye contact with the
camera, gentle neutral expression with a soft hint of a smile. Shot
on 85mm lens at f/1.8, natural soft window light from camera-left,
plain near-black `#121212` studio backdrop with no visible texture.
Editorial color grading, slightly desaturated. True photographic
realism — not illustration, not 3D, not stylized, no AI plastic-
skin look, no glamour retouching. Will be cropped to a 40px
circular avatar on a dark landing page — tight crop on the face,
no distracting accessories.

Avoid: stylized illustration, 3D render, plastic skin, heavy
makeup, visible brand logos, watermarks, busy background, text
overlay, blurred face, split lighting, over-saturated tones,
cartoon style.

--ar 1:1 --style raw --q 2 --v 6.1
```

**Dimensions**: 512 × 512 px (plenty for 40px render)

**Per-avatar variant lines** (append one to each generation):

1. `yassine.webp` — male, 21, short dark hair, plain charcoal crewneck, no facial hair, admitted to ENSA.
2. `salma.webp` — female, 20, soft beige silk hijab, simple white blouse, warm skin tone, quiet confidence.
3. `imane.webp` — female, 19, shoulder-length dark hair parted in the middle, minimal silver stud earrings, ivory knit top.
4. `anas.webp` — male, 22, thin wire-frame glasses, closely trimmed beard, black turtleneck.
5. `meryem.webp` — female, 21, dusty rose hijab, olive-green cardigan, warm earth tones.
6. `hamza.webp` — male, 18, short curly black hair, olive green t-shirt, slight teeth-showing smile.
7. `nour.webp` — female, 20, long straight dark hair, single thin chain necklace, cream sweater.
8. `karim.webp` — male, 34, short beard with flecks of grey, navy blazer over a white shirt, reading-glasses pushed onto forehead — professorial feel (he's a teacher).
9. `oumaima.webp` — female, 19, charcoal hijab, light grey sweater, cool neutral tones, serene expression.

---

## File placement + code wiring (post-generation checklist)

1. Export every generated image as `.webp` (quality 82 for the 6 mockups, 70 for avatars). Strip metadata.
2. Put files under:

   ```
   public/landing/
     section-1-courses.webp        ← Image 1
     section-1-bg.webp             ← Image 2
     section-2-quiz.webp           ← Image 3
     section-2-bg.webp             ← Image 4
     feature-qcm.webp              ← Image 5
     feature-progress.webp         ← Image 6
     avatars/yassine.webp          ← Image 7a (optional)
     avatars/salma.webp            ← Image 7b
     ...
   ```

3. Swap URLs in source:
   - `src/app/page.tsx:110` → `/landing/section-1-courses.webp`
   - `src/app/page.tsx:111` → `/landing/section-1-bg.webp`
   - `src/app/page.tsx:129` → `/landing/section-2-quiz.webp`
   - `src/app/page.tsx:130` → `/landing/section-2-bg.webp`
   - `src/components/ui/features-10.tsx:24-25` → `/landing/feature-qcm.webp` (both slots)
   - `src/components/ui/features-10.tsx:42-43` → `/landing/feature-progress.webp` (both slots)
   - Optional: avatars in `src/app/page.tsx:14-68` → `/landing/avatars/<firstname>.webp`

4. Target file sizes: mockups < 200 KB (higher than before because they're more visually complex — atmospheric art compresses less), avatars < 25 KB. If larger: re-export with `cwebp -q 75`.

5. Send me the file list when ready and I'll wire the swaps.
