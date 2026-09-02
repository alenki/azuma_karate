# SK AZUMA

Website for SK AZUMA, a Kyokushin karate club in Nalchik (Kabardino-Balkaria).
This repository currently contains **the home page only**. The other sections
exist as navigation targets and are built in a later phase.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

Node 22, npm 11. Stack: Next.js 16 (App Router), React 19, TypeScript,
Tailwind CSS v4, Motion 13, Lenis.

## Languages

Russian is the default language and is served from the bare paths (`/`).
English lives under `/en`. Both are statically generated from
`src/app/[locale]`; `/ru/...` permanently redirects to `/...` so every page has
one canonical URL per language. All copy lives in `src/content/home.ts` as a
Russian-first dictionary with an English mirror.

## The design

The concept is **«Первая черта» / "The First Stroke"**: the page is a printed
Kyokushin manual crossed with a fashion magazine — warm paper, one
high-contrast serif at a single weight, mono folios, hairline rules,
black-and-white plates with captions, ten chapters counted 一 二 三 … 十 in the
binding margin. Everything is typeset and still. The only thing that moves and
the only thing that is red is the sensei's brush, which annotates one chapter
at a time and closes as an ensō around the sign-up button.

The full specification is in
[`docs/superpowers/specs/2026-09-01-sk-azuma-home-design.md`](docs/superpowers/specs/2026-09-01-sk-azuma-home-design.md).

Brush marks are generated procedurally (a centreline plus a width profile with
a pressed head, thinning belly and lifted tail) and revealed through an SVG
mask, so the ink appears under the bristles rather than fading in. The kanji
and the 正 tally use KanjiVG stroke-order data (CC BY-SA 3.0, Ulrich Apel).

## Before this can go live

Everything below is a placeholder and needs the client's confirmation:

- **Photography.** `public/media/placeholders/` holds temporary Wikimedia
  Commons images under their own licences; see `CREDITS.md` in that folder.
  Replace them and update `src/content/media.ts` — nothing else references
  image paths.
- **Logo.** `public/brand/logo-mark.svg` and `src/components/brand/Logo.tsx`
  are a hand-drawn approximation. Swap in the club's real vector lockup.
- **Facts.** Schedule and groups (`src/content/schedule.ts`), prices, the
  Ministry of Sport decree reference, the second coach, medal counts and the
  season timeline (`src/content/home.ts`).
- **Reviews.** The three parent quotes are illustrative. Real quotes need
  written consent, as do photographs of children.
- **Sign-up form.** It validates and simulates success; it has no backend yet.
  The Telegram link is the working route in the meantime.

## Frontend aesthetics

You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on: Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics. Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration. Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic. Avoid generic AI-generated aesthetics:- Overused font families (Inter, Roboto, Arial, system fonts)- Clichéd color schemes (particularly purple gradients on white backgrounds)- Predictable layouts and component patterns- Cookie-cutter design that lacks context-specific character Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
