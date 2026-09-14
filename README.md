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

**The sheet is the viewport.** There is no centred column: `.wrap` is the trim —
full width, with only the gutter reserved, which is also the binding margin the
chapter numerals hang in. Chapters are set to the width of the screen they are
read on, and they gain structure rather than stretch, mostly at a `min-width:
1600px` tier: the hero's headline is set to the width of its own column (245px
at 2560),
the week's timetable bleeds edge to edge, the age chart's unit grows with the
sheet, and the glossary spread re-columns. Line length is held on the text, in
`ch`, never by a container.

The full specification is in
[`docs/superpowers/specs/2026-09-01-sk-azuma-home-design.md`](docs/superpowers/specs/2026-09-01-sk-azuma-home-design.md).

### The press

Everything printed on this page goes through one set of SVG filters, defined
once per document in `src/components/ui/PressDefs.tsx` and referenced by id.

**Plates.** A photograph here is not a desaturated photograph, it is a plate
pulled in the two inks the page is printed in: `feColorMatrix` takes the
luminance and `feComponentTransfer` maps it onto the line between two real
tokens, so the lightest tone in any plate is exactly the page's paper and the
darkest is exactly its ink. There are two, because there are two grounds —
`#duotone-paper-ink`, and `#duotone-ink-bone` for the dark chapters, where a
paper-white highlight would punch a hole in the ground. Nothing is exempt: the
one plate that used to print in full colour, the trophies in chapter five, was
gold cups and blue ribbons on a black page, and an exemption that size is not
an exception to a palette, it is the end of one. Colour survives in exactly one
place, chapter four, where the reader can lift the grade off the sensei's
portrait themselves — colour as content, not as decoration.

**Ink.** Brush marks are generated procedurally (a centreline plus a width
profile with a pressed head, thinning belly and lifted tail) and revealed
through an SVG mask, so the ink appears under the bristles rather than fading
in. Filled flat, that renders as a vector blob — the concept says brush and the
render says `border-radius` — so the marks that are read at size are pressed:
low-frequency displacement gives the silhouette tooth, a fine noise field
multiplied into the alpha gives the ink density where the paper's tooth held
less pigment, and a faint blurred copy underneath is the bleed into the fibre.
Every parameter is a fraction of the mark's own thickness, so one formula
serves a 64-unit hero stroke and a 26-unit ring.

A drying brush does **not** fade — a smooth ramp to transparent is the one
thing that reads as a CSS gradient rather than as pigment. It breaks. So the
linear marks carry a second, static mask in which a gradient is fed to a filter
as a position signal, streak noise is added to it, and the sum is thresholded
into ribbons: full-strength ink with bare paper between. Rings do not get one —
the gradient runs along x, which would dry one *side* of a circle rather than
the end of the gesture.

No two repeats of a mark are identical. A mark seeds its own hand — a
sub-degree tilt, a fraction of a percent of scale, its own turbulence phase —
deterministically, so the eight 正 in chapter five and the two quote brackets in
chapter seven vary the way a hand varies and SSR and the client still agree.

The kanji and the 正 tally use KanjiVG stroke-order data (CC BY-SA 3.0, Ulrich
Apel). They are drawn in two voices: display kanji get modulated stroke weight,
and only the 東 construction figure in chapter two keeps the honest monoline,
because there the reader is being shown how the glyph is *built*.

### The stock

Neither ground is a single hex. The paper carries two multiplied noise fields —
a 140px tooth for the surface and a 420px cloud for the unevenness of the pull,
deliberately coprime so a 2560 sheet does not read as a repeat. The dark
chapters do not get the same treatment and that is a decision, not an omission:
multiply has nothing to take from ink, and screening a field back in lifts the
black to charcoal and reads as compression noise, because the eye resolves
luminance variation in the shadows far better than in the highlights. They
carry `<Grain>` instead, at an amplitude set by a contrast budget.

That budget is the thing to understand before touching either. `--color-ink-quiet`
and `--color-shu-lift` were each chosen as the *extreme* tone that still clears
4.5:1 against a flat ground, which is to say with no headroom at all — and a
texture moves the ground. Both had to move (`#6b6559` and `#ec4a54`) and the
tile amplitudes are capped so the worst pixel of paper stays at 0.96 and the
worst pixel of ink at `#1D1B19`. **The tone and the texture are one decision
and neither can be retuned alone.**

### The rota

Vermilion has exactly three jobs: an actual `<Brush>` mark, the `<Seal>`, and
the reader's own accent — the focus ring and `::selection`. It is not a label
colour, a status colour, a hover state, a wordmark or an ornament. It was all
five, in all ten chapters, and an accent that is never absent is not an accent:
the hero's one giant stroke had to compete with red labels, red brackets and a
red masthead before the reader had scrolled a pixel. Emphasis and state are
carried by a rule, a fill, a weight or a ground inversion instead — never by
hue alone, which 1.4.1 would forbid anyway. Chapter eight marks today with the
brush's own tick and a rule; it used to just print the word in red.

Chapter one carries no brush mark at all. `scripts/gen-hero-stroke.ts` and the
silhouettes it writes into `public/brand/` are the remains of a version in
which it did — a vermilion 一 at poster scale, laid across the sheet under the
headline — and they are kept because the script is the only record of how those
marks are generated, not because anything renders them:

```bash
npx tsx scripts/gen-hero-stroke.ts        # regenerate the 一 silhouettes
HERO_PROOF_DIR=./proofs npx tsx scripts/gen-hero-stroke.ts   # + PNG proof sheets
```

### The first screen

Chapter one is one photograph at the size of the screen, and the sentence is
written across it:

    Глава первая · Киокушинкай каратэ · Нальчик
    Сначала поклон.                                <- half size

           ( a black belt, drawn tight, filling the sheet )

    Потом удар.                     Детям с четырёх лет…
                                    [ Записаться → ]

**The beat is the plate.** The sheet still sets one sentence and still puts the
silence inside it — the bow at exactly half the strike, with an interval
between them that is the count a student holds. What changed is what the
interval is made of. It was a band of bare paper; it is the technique itself
now, so the composition states its own subject instead of gesturing at it.

**And the plate is made once.** It is the one moving plate in the book: 2.34s
of the belt being pulled taut, cut from the club's own reel, and then the sheet
is a photograph for as long as the reader stays on it. No loop and nothing
ambient — a background cycling every few seconds is exactly what this chapter's
own rule forbids. The video lies *over* the plate and is never the plate:
`<Photo>` prints its frame 0 underneath, and that `<img>` is the LCP element,
the alt text, and what the reader keeps on a phone, under reduced motion, or
wherever autoplay is refused. `src/components/ui/Reel.tsx` holds the three
conditions; `scripts/press-hero-reel.sh` cuts the file and bakes the duotone
into it, because a full-screen SVG filter over 30fps is a per-frame pass.

The chapter is `ground="paper"`, so the fixed bar does *not* invert over it —
one fewer thing happening on the first screen, and it costs nothing here. (This
paragraph claimed `ground="ink"` and a bar inverting to bone for a long time
after the chapter stopped being ink. Judge this file against the render.)

Chapter 二 is paper too, so the plate's foot does not end on a tonal cliff: it
runs out into the page's own paper, the way a plate bled to a trimmed edge meets
the sheet it is printed on. That dissolve is what stops a photograph at this
size reading as a website hero image, and `src/styles/sections/hero.css` carries
the measurement of the seam.

Chapter 二 is an ink chapter too, so that boundary is photographic ink meeting
flat ink rather than ink meeting paper. It still reads, because what changes
across it is texture, not tone — but only while the plate's foot reaches the
page's own black, which is why the hero's `<Grain>` runs at the 0.25 the other
ink chapters use rather than at full strength. At full strength it lifted the
foot twelve levels above the next chapter's ground and the hero ended on a grey
band. The seam is measured in `hero.css`.

The plate is pressed to bone (`#duotone-ink-bone`), and the ink ramps over it
are not a black overlay on a photograph: the dark end of every one of them is
`--color-ink`, which is exactly the tone the press gives the plate's own
shadows, so it bleeds off rather than darkens. They are also the only thing
making the foot legible, and they are set by arithmetic and then measured
against the render: bone needs the plate's local tone at or under L 0.403 to
clear 4.5:1, and the gi in this frame runs to L 0.9. Measured at 390, 768, 1280,
1512 and 2560, the worst pixel under any text on this screen is 5.74:1.

Two cuts of the frame, chosen by the SHAPE of the viewport rather than its
width — `(max-aspect-ratio: 4/5)` — because what ruins the wide cut is a tall
box, not a narrow one. `ui/Photo`'s `art` prop resolves both through
`getImageProps` into one `<picture>`, so exactly one file is fetched.

If the headline copy or the display face changes, re-measure `heroFit` in
`src/content/home.ts`: the hero divides its column by those numbers to set the
type to the exact width in both languages. The column is 0.62 of the trim from
1280 up and the whole trim below it, where the offer stacks underneath instead.
`--fold-fixed` in `hero.css` is everything on the sheet that is *not* the
headline — re-state it if a row is added or removed.

## Before this can go live

Everything below is a placeholder and needs the client's confirmation:

- **Photography.** `public/media/placeholders/` holds temporary Wikimedia
  Commons images under their own licences; see `CREDITS.md` in that folder.
  Replace them and update `src/content/media.ts` — nothing else references
  image paths.

  **The first screen is no longer one of them.** `firstScreen`,
  `firstScreenTall` and `reels.firstScreen` are cut from the club's own footage
  and live under `public/media/hero/`. `media.ts` still states the five
  requirements against the slot, because whatever replaces it has to meet them
  too: a genuinely light and EVEN ground, one subject, nothing competing in the
  bottom-left quadrant, real tonal separation, and no third-party wordmark.
  Every other plate on the page is still a Wikimedia stand-in.

  Two files under `public/media/placeholders/` are now orphaned —
  `snow-kick-1970.jpg` and `snow-kick-1970-portrait.jpg`, which were the first
  screen. Nothing references them; delete them and their `CREDITS.md` rows, or
  keep them if the belt is not final.
- **Logo.** There is no figurative mark. The hand-drawn kicking figure that
  stood in for one has been removed — a placeholder of somebody else's logo
  teaches the reader a mark that will not survive launch — so the lockup in
  `src/components/brand/Logo.tsx` is the "SK AZUMA" wordmark and nothing else,
  set in Unbounded as a stand-in for the club's lettering. Swap in their real
  vector lockup. The seal (`src/components/brush/Seal.tsx`) carries 東 in the
  meantime, which is the club's own name and not a guess at their mark.
- **Facts.** Session times and group names (`src/content/schedule.ts`), prices,
  the Ministry of Sport decree reference, the second coach, medal counts and
  the season timeline (`src/content/home.ts`). The four age bands and the two
  intake families in that file are the club's own and are CONFIRMED — chapter
  二's roster and chapter 三's timetable legend both read them from there, so
  they can only ever be corrected in one place. The bands overlap at 6 and at
  16 on purpose; that is how the club runs them.
- **Reviews.** The three parent quotes are illustrative. Real quotes need
  written consent, as do photographs of children.
- **Every plate** now goes through the duotone press
  (`src/components/ui/PressDefs.tsx`), so the client's own photography will be
  printed in the two inks the page uses and nothing in a replacement can
  introduce a second hue. That also means a replacement is judged on
  *luminance* — a photograph that is only legible through its colour will come
  out flat, so prefer frames with real tonal separation.
- **The second coach and the decree number** are modelled as pending
  (`pendingText()` / `pendingFact()` in `src/content/home.ts`), not invented.
  They print as a ruled blank with the label beside it, the way a manual prints
  a slot it does not have a fact for yet. Do not replace a pending slot with
  plausible-looking copy — fill it or leave it ruled.
- **Sign-up form.** It validates and simulates success; it has no backend yet.
  The Telegram link is the working route in the meantime.

## Frontend aesthetics

You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on: Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics. Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration. Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic. Avoid generic AI-generated aesthetics:- Overused font families (Inter, Roboto, Arial, system fonts)- Clichéd color schemes (particularly purple gradients on white backgrounds)- Predictable layouts and component patterns- Cookie-cutter design that lacks context-specific character Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
