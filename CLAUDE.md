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

## One language

Russian, and nothing else. Pages live at `src/app/` and are served from the bare
paths; `next.config.ts` carries no rewrites and no redirects.

There was an English edition under `/en`, generated from an `src/app/[locale]`
segment, with Russian rewritten to `/ru/…` internally and redirected back out so
each page had one canonical URL per language. It is gone: the segment, the
`src/i18n` module (`localeHref()`, `useLocale()`, `Locale`), the `RESERVED`
rewrite list, the bar's `RU | EN` toggle and the colophon's link to the other
edition were all removed, and every `Record<Locale, T>` in `src/content/` was
collapsed to its Russian side.

- Hrefs are plain paths now. There is no locale to thread through them, so
  `sectionLink()` and `homeAnchorHref()` in `src/lib/sections.ts` take
  `(href, route)` and build `/#anchor` directly.
- `<html lang="ru">` is a literal in the layout, and the head states one
  `canonical` with no `languages` map and no `hreflang`.
- Do not reintroduce a language toggle or a second dictionary side without the
  route to back it: a toggle whose only state is the current one is furniture
  pretending to be a control.

## Content layer

`src/content/` is the single source for every fact and every string; components
hold no copy and no image paths.

- `home.ts` — the page dictionary, plain Russian strings. It was typed
  `L<T> = Record<Locale, T>` while there was an English mirror; both are gone.
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

**No em dash.** Not one, anywhere a reader can see it:
not in copy, a `<title>`, a description, alt text or an `aria-label`. It used to
be this manual's main joint and it was taken out of every string; the sentences
were rebuilt around it (split in two, or rejoined with a colon, a comma or a
conjunction) rather than having it swapped for a lookalike. Rebuild the sentence
the same way rather than reintroducing one. The en dash is untouched where it
sets a range («4–6», «10–9», «5–6 октября»), and `PENDING_MARK` is now «·».

**Bound spaces.** Copy binds a non-breaking space after short
prepositions/conjunctions and between a figure and its unit. Always write it as
the escape `\u00A0`, never as a literal NBSP — an editor that normalises whitespace would
silently undo it. Alt text and screen-reader-only strings carry no bound
spaces.

## Styling

Tailwind v4, configured entirely in CSS. Three tiers:

- `src/app/globals.css` — `@theme` tokens, `@layer base`, typographic
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

The one exception is the belt dyes, `--color-obi-*`, printed on the colophon's
dye card: there the hue **is** the fact being recorded, not emphasis applied to
one, and a grey standing in for «оранжевый» is the worse mark. Do not put the
strip back to greyscale. They sit in their own `@theme static` block because
Tailwind v4 drops theme variables it cannot see used and each patch names its
dye at runtime (`var(--color-obi-${b.dye})`); they are `background` values for
that one strip and for nothing else.

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
- `useId` is numbered by sibling COUNT as well as position, so removing a child
  above a mark redraws every unseeded `<Brush>` below it. `page.tsx` keeps an
  empty `{null}` in the slot the phone's foot bar used to fill, for that reason.
- Clock-driven values (today's weekday in the timetable) go through
  `lib/useLiveValue.ts` — a module-scope store read with `useSyncExternalStore`,
  with the server value passed in.

## The flyleaf (loading screen)

`components/flyleaf/`: the page is counted in the way a Kyokushin class counts
its repetitions, 一 to 十, one large numeral per tenth of the load on the book's
own paper, its Russian reading (`content/count.ts`) small at the foot. 十 is the
one red mark and means ready; it is pushed toward the reader and the page cuts
in. The numerals are Shippori Mincho outlines carried as paths
(`numerals.ts`), because a loader cannot wait for a Japanese web font. It is a
server component printed at the head of `<body>`, and everything that moves is
`run.ts`, serialised with `Function.prototype.toString` into the inline script
right after it.

- **`mode="load"` means "when the flyleaf lifts", not "on mount".** LineReveal,
  Reveal/Register/Settle, Curtain, Brush (`trigger="load"`), Seal and the hero
  plate all read `useFlyleafOpen()`. Anything new that animates on arrival must
  too, or it plays unseen under the sheet. The hook answers `false` on the
  server and while hydrating, and `true` when no flyleaf ran at all (blocked,
  no script): a missing leaf must never hold an entrance forever.
- The count cannot run ahead of the page: shares of it are released by
  DOMContentLoaded, window load + fonts and the hero plate's decode, 九 holds
  until React has hydrated (`FlyleafCue`), and a 10s ceiling from navigation
  start releases 十 regardless. The beat keeps a cached page from flashing.
- It runs on EVERY full load, reloads and `#anchor` URLs included: the owner
  asked for exactly that. A tap, wheel, key or focus move after 0.4s skips
  straight to the page (on click, so a tap never presses what lies beneath).
  Reduced motion gets the same count with nothing scaling, then a fade.
- `run.ts` is shipped as the compiler emits it: keep it self-contained,
  function declarations, no optional chaining, nothing from module scope.
  Curves come in through its config from `lib/ease` (it uses `EASE_PUSH`,
  the one curve with no CSS twin), never `getComputedStyle`.
- It is `display: none` until the script sets `data-live`, so no-JS and CSP
  readers never meet it. The node is never removed; `data-stage="gone"` hides
  it. In a headless capture, wait about 3s or emulate reduced motion.
- `<body>` in the layout keeps exactly three children, the new nodes grouped
  in one fragment: every `useId` on the page, and so the hand of every
  unseeded `<Brush>`, derives from MotionProvider's slot there.

## Before launch

`NEXT_PUBLIC_SITE_URL` must be set or every absolute URL in the head (canonical,
`og:url`, `og:image`) points at localhost. Photography, the logo lockup, the
schedule, prices, medal counts and reviews are all placeholders — see the
README's "Before this can go live".

**The sign-up form has a backend now.** Chapter 六 POSTs to
`public/api/send.php`, which relays to a Telegram bot. It is PHP and not a
route handler because the hosting is shared: no Node, so the build has to
become a static export, and an exported route handler is GET-only. Two things
are outstanding and both are in the README: the club's bot token and chat id
(a PHP file above the web root, never in this repo), and the `output: 'export'`
switch itself, which is deliberately NOT flipped because it forces
`images.unoptimized` and would quietly degrade every plate on the page.

Three rules the relay depends on:

- **The browser posts the four raw answers, never the assembled message.** A
  relay that accepted finished text would be an open relay into the coach's
  phone. The message is built server-side.
- **The message exists in two places and only one of them is authored.**
  `join.opening` and `join.years` in `content/home.ts` are the source;
  `scripts/gen-join-message.ts` writes them to `public/api/join-message.json`
  for the relay. Reword either and re-run the script, or the receipt on the
  page and the message on the coach's phone drift apart.
- **The page never claims a send it did not make.** Three outcomes, not two:
  `sent` prints a receipt, `failed` prints the error over the old carry-by-hand
  slip, and `carry` — nothing answering at that endpoint, including a relay
  with no token yet — prints the slip alone and says nothing at all. The
  152-ФЗ consent line prints only because data now genuinely leaves the page.
