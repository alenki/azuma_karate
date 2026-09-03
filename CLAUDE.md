# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build
npm start
npm run lint     # eslint (flat config, eslint.config.mjs)

npx tsx scripts/gen-hero-stroke.ts   # regenerate public/brand/hero-stroke*.svg
HERO_PROOF_DIR=./proofs npx tsx scripts/gen-hero-stroke.ts   # + PNG proof sheets
```

Node 22, npm 11. There is no test suite. Type errors surface through `next build`
or the editor; there is no separate `tsc` script. Path alias: `@/*` → `./src/*`.

## What this is

The home page of SK AZUMA, a Kyokushin karate club in Nalchik. **Only the home
page exists** — the other nav entries are targets for a later phase.

The design concept is «Первая черта» / "The First Stroke": the page is a printed
manual, not a website. Ten chapters, warm paper, one serif at one weight, mono
folios, graded hairlines, black-and-white plates, numerals 一 二 三 … 十 hanging in
the binding margin. The full spec is
`docs/superpowers/specs/2026-09-01-sk-azuma-home-design.md`, and the README
covers the design rationale and the pre-launch placeholder checklist.

The spec and the comments describe *intent*. Where they and the render disagree,
the render is the fact — judge changes against the running page, not the prose.
Some comments are already stale (`globals.css` and the README still name
`ui/DuotoneDefs.tsx`; that file is now `ui/PressDefs.tsx`).

## Locale routing

Russian is the default and is served from bare paths; English lives under `/en`.
Both are statically generated from `src/app/[locale]`. The mechanism is entirely
in `next.config.ts`: `/` and any unreserved path rewrite to `/ru/…`, and `/ru/…`
permanently redirects back to the bare path, so each page has one canonical URL
per language.

- The `RESERVED` regex in `next.config.ts` lists paths that must **not** be
  rewritten. The test is "does this file live at the app root or under
  `[locale]`" — not "is this a metadata route". `opengraph-image` is
  deliberately absent because ours is per-locale
  (`src/app/[locale]/opengraph-image.tsx`); adding it 404s the Russian share
  card while English keeps working.
- Build hrefs with `localeHref()` / `useLocale().href` from `src/i18n`, never by
  string concatenation.

## Content layer

`src/content/` is the single source for every fact and every string; components
hold no copy and no image paths.

- `home.ts` — the page dictionary, Russian-first with an English mirror, typed
  `L<T> = Record<Locale, T>`.
- `schedule.ts` — groups, sessions, club address/links. The layout's JSON-LD
  derives opening hours from `sessions`, so the page and the search result
  cannot disagree.
- `media.ts` — every photo as a named slot. Replacing the placeholder
  photography means editing this file and nothing else.
- `kanji.ts`, `nav.ts`.

Two conventions live here and must be preserved:

**Pending facts.** A fact the client has not confirmed is modelled as pending
(`pendingText()` / `pendingFact()` / `isPending()`), never invented. Consumers
print a ruled blank and what is still awaited. Do not replace a pending slot
with plausible-looking copy.

**Bound spaces.** Russian copy binds a non-breaking space before every em dash, after short
prepositions/conjunctions, and between a figure and its unit. Always write it as
the escape `\u00A0`, never as a literal NBSP — an editor that normalises whitespace would
silently undo it. English binds only the em dash and figure+unit. Alt text and
screen-reader-only strings carry no bound spaces.

## Styling

Tailwind v4, configured entirely in CSS. Three tiers:

- `src/app/[locale]/globals.css` — `@theme` tokens, `@layer base`, typographic
  roles (`.t-display`, `.t-mono`, …), grounds, rules, layout primitives.
- `src/styles/primitives.css` — grain, marquee, focus ring, `.sr-only`.
- `src/styles/sections/*.css` — one file per section, imported by its own
  component (`import "@/styles/sections/hero.css"`).

Base rules live inside `@layer base` on purpose: unlayered rules beat layered
ones, so anything outside the layer silently overrides Tailwind utilities.

### The colour rota — this is the design, not a preference

Vermilion (`--color-shu`) has exactly three jobs: an actual `<Brush>` mark, the
`<Seal>`, and the reader's own accent (focus ring, `::selection`). It is not a
label, status, hover, wordmark or ornament colour. Emphasis is carried by a
rule, a fill, a weight or a ground inversion — never by hue alone.

The ink ramp is role-typed and the roles are not interchangeable:

| token | role |
|---|---|
| `--color-ink-2` | secondary **text** |
| `--color-ink-quiet` | the lightest legal text tone — folios, ordinals, labels |
| `--color-ink-3` | **ornament only, never text** (2.4:1) |
| `--color-rule-hair` / `--color-rule` / `--color-rule-strong` | separations inside a block / standard hairline / a chapter's opening rule |

`--color-ink-quiet` and `--color-shu-lift` sit near the 4.5:1 floor *measured
against the grained ground*, not against flat hex. The paper stock's two noise
tiles are capped at 0.98 each for that reason — the tone and the texture are one
decision and neither can be retuned alone.

### Layout

**The sheet is the viewport.** There is no centred column. `.wrap` is the trim —
full width with only `--gutter` reserved, which is also the binding margin the
chapter numerals hang in. `.page-grid` is one shared 12-column field. Line length
is held on the text in `ch` (`.measure*`), never by a container. Type ceilings in
`@theme` are solved to land at ~2560px: **nothing below ~1600px may change size**
when you touch a clamp.

## Chapters and the header

`Chapter.tsx` wraps each section: numeral rail, folio, ground (`paper` | `ink`),
and two *separate* IntersectionObservers that answer two different questions —
do not merge them:

1. **Which chapter is being read** — fires at the viewport's middle
   (`rootMargin: "-45% 0px -55% 0px"`), drives the header's running head.
2. **What is under the header bar** — `useGroundReporter` narrows the root to a
   one-pixel line along the bar's lower edge, so the header inverts the instant
   an ink chapter reaches it rather than ~475px later.

State is shared through `ChapterContext`. The bar's height is *measured* from the
DOM, because `--header-h` is a `clamp()` and an unregistered custom property
hands back the expression rather than the resolved pixel value.

## Motion and the brush

- `src/lib/ease.ts` holds the four curves, each with a job: `EASE_BRUSH` (the
  hand), `EASE_OUT` (matter arriving), `EASE_PRESS` (something stamped),
  `EASE_INOUT` (something travelling). **Never inline a bezier array in a
  component.** The same numbers exist as `--ease-*` tokens in `globals.css`;
  retune both together.
- `MotionProvider` sets `<MotionConfig reducedMotion="user">`, which covers plain
  `animate` / `whileInView`.
- Anything that decides an `initial` prop or a serialised `style` must use
  `useStillness()` instead — Motion writes `initial` into the SSR markup and
  React will not patch a mismatched attribute, so reading the media query
  directly leaves reduced-motion readers with a permanently clipped element.
- `SmoothScroll` (Lenis) owns scrolling; programmatic scrolls go through
  `useAnchorScroll` with `easeInOutCubic`.
- Brush marks are generated procedurally from `brush/marks.ts` and revealed
  through an SVG mask. `ui/PressDefs.tsx` defines every filter once per document
  (duotone plates, ink/dry brush, seal) and marks reference them by id.
- **No `Math.random()` anywhere in render.** The hand's jitter is a pure function
  of a seed (FNV-1a + splitmix32), seeded from the call site or React's `useId`,
  so server and client produce identical markup.
- Clock-driven values (next session, sunrise, today) go through
  `lib/useLiveValue.ts` — a module-scope store read with `useSyncExternalStore`,
  with the server value passed in.

## Before launch

`NEXT_PUBLIC_SITE_URL` must be set or every absolute URL in the head (canonical,
`og:url`, `og:image`) points at localhost. Photography, the logo lockup, the
schedule, prices, medal counts, reviews and the sign-up backend are all
placeholders — see the README's "Before this can go live".
