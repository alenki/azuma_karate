# SK AZUMA

Website for SK AZUMA, a Kyokushin karate club in Nalchik (Kabardino-Balkaria).
Two pages exist: **the home page** and **`/contacts`**. «О клубе», «Расписание»
and «Галерея» are still navigation targets and are re-pointed at the home
chapters that already answer them — `src/lib/sections.ts` holds that map and the
list of sections that have stopped needing it, and each entry is deleted the day
its page ships.

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
paper-white highlight would punch a hole in the ground.

Some chapters are exempt, and an exemption is a decision that has to be argued
each time rather than a licence. **Chapter four** prints one portrait in colour
because it is the one chapter about a person rather than about a practice.
**Chapter five** prints all of its plates in colour because its subject is
*winning*: gold cups, ribbons and a red mat pressed into two inks is a chronicle
with its subject taken out, and the trophies plate is the proof — it spent a
release pressed to bone and came out as grey crockery. Grep `grade="color"` for
the current list rather than trusting a count written here.

No exemption touches the rota for *vermilion*. Chapter five still spends
its one red on the sensei's closing mark and on nothing else, and colour in a
photograph is not the page acquiring a second accent — it is a plate printed in
all the inks rather than in two.

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

The 一 at poster scale is not gone from the book, though: it is in chapter
四 now, drawn by `<Brush kind="ichi">` from `brush/marks.ts` rather than by that
script, at the width of the sensei's own column. It is the chapter's only red,
and it is there because that chapter had four horizontal hairlines and the last
of them became ink instead of going away — on the page of the man who draws the
first stroke for every student. `ichi` joined `INKED` and `DRIED` in
`ui/PressDefs.tsx` with it: a thousand pixels of flat vermilion is exactly the
mark that cannot afford to render as a vector leaf.

```bash
npx tsx scripts/gen-hero-stroke.ts        # regenerate the 一 silhouettes
HERO_PROOF_DIR=./proofs npx tsx scripts/gen-hero-stroke.ts   # + PNG proof sheets
```

### The first screen

Chapter one is one photograph at the size of the screen, and the sentence is
written across it:

    Сначала поклон.                                <- half size

              ( one karateka, alone in a black room )

    Потом удар.                     Детям с четырёх лет…
                                    [ Записаться → ]

**The beat is the plate.** The sheet sets one sentence and puts the silence
inside it — the bow at exactly half the strike, with an interval between them
that is the count a student holds. What changed across two passes is what that
interval is made of. It was a band of bare paper, then a screen of white gi; it
is a black room now, and the silence is the room the strike is thrown in.

**The chapter prints on ink**, and that is the whole of the current pass. It
printed on paper until then: the headline in ink over a lit gi, a bar that never
inverted. Everything else on this screen follows from the one change of ground —
the type is bone, the header inverts the instant the reader arrives, 一/01 prints
in bone in the binding margin, and the control is the ink form of the same press
the rest of the page uses. None of that is said twice; the ground says it.

**The plate is graded, not pressed,** and it is the only one in the book that
is. Every other photograph goes through `#duotone-paper-ink` or
`#duotone-ink-bone` — an SVG filter that maps luminance onto the line between
two real inks, so a plate's lightest tone is exactly the page's own paper or
bone. That is right for a plate lying on a sheet, and it is exactly what was
blowing a tungsten-lit gi to paper-white here. The hero takes `saturate(0.55)
contrast(1.02) brightness(0.92)` instead: three colour-matrix functions, so the
room keeps its warmth — and because a colour matrix costs the compositor nothing
where a reference filter is a per-frame pass, the same declaration can be handed
to the `<img>` and the `<video>` together. Nothing is baked into the video any
more, and `scripts/press-hero-reel.sh` lost half its length with it.

**And the plate is made once.** It is the one moving plate in the book: 2.17s of
a guard becoming a straight punch, and then the sheet is a photograph for as long
as the reader stays on it. No loop and nothing ambient — a background cycling
every few seconds is exactly what this chapter's own rule forbids. The video lies
*over* the plate and is never the plate: `<Photo>` prints its frame 0 underneath,
and that `<img>` is the LCP element, the alt text, and what the reader keeps on a
phone, under reduced motion, or wherever autoplay is refused.
`src/components/ui/Reel.tsx` holds the three conditions.

**The scrim stopped being structural.** On the paper version it was the only
thing making the foot legible, and every stop in it was solved against a contrast
floor. The field around the figure is `#000` now and bone stands on it at better
than 18:1, so what is left is a bleed: a foot ramp that seats the offer and trims
the sheet, a head ramp that insures the bar, and nothing at all on the binding
side. Measured against the render at 390, 1024 × 768, 1512 and 2560, on the
still and on the reel's last frame, the worst pixel under any text on this
screen is **7.82:1** — the strike's final period at 2560, where the figure's
rear foot passes behind it, which is the only place on any sheet where the
headline and the photograph touch. The first version of that ramp measured
9.5:1 and visibly greyed his legs, which is not a better page, only a greyer
photograph. Past the floor a scrim buys nothing and costs the plate.

Chapter 二 is paper, so the plate's foot ends on a **trimmed edge** rather than a
dissolve: the photograph runs to black and the next sheet begins. That is the
ordinary arrangement in this book — every ink chapter meets its neighbour the
same way — and it is the one thing the paper version could do differently, which
is why it spent three measured ramps buying itself a seam.

Two cuts of the frame, chosen by the SHAPE of the viewport rather than its width
— `(max-aspect-ratio: 4/5)` — because what ruins the wide cut is a tall box, not
a narrow one. `ui/Photo`'s `art` prop resolves both through `getImageProps` into
one `<picture>`, so exactly one file is fetched. They are *not* the same frame:
the wide still has to be the reel's frame 0 because the reel lies over it, and
nothing lies over the upright one, so it is free to be the punch itself.

**The figure is moved off centre in the press, not in CSS.** He stands dead
centre of the source frame, and dead centre is the one place he cannot be,
because «Потом удар.» is set across the left 62% of the trim. A 16:9 plate
covering a 1512 × 900 sheet has 88px of horizontal slack in total, so
`object-position` cannot move anyone. The source background is black, so the
frame is simply made wider: 640px of black padded onto the binding side, read at
35%. A narrow sheet that is still wide-shaped — 1024 × 768, a phone in landscape
— is the case that breaks if you forget: it gets the wide cut *and* the stacked
layout, so it keeps the desktop's 0.62 column rather than letting the headline
take the whole trim and walk across him. Before that rule existed the bow
measured 1.65:1 over his shoulder.

If the headline copy or the display face changes, re-measure `heroFit` in
`src/content/home.ts`: the hero divides its column by those numbers to set the
type to the exact width in both languages. `--fold-fixed` in `hero.css` is
everything on the sheet that is *not* the headline — re-state it if a row is
added or removed.

### The chronicle

A *makimono* is a chronicle read by unrolling it sideways, which is what a
season's record is. So chapter 五 is the one chapter in the manual that does not
run down the page: the reader scrolls **down** and the sheets travel **across**.
The form is not borrowed from a gallery pattern — it is the form the subject is
kept in, and it is the reason the chapter earns a horizontal move that would be
a trend anywhere else on the site.

The mechanism is `src/components/ui/Roll.tsx` with `src/styles/roll.css`: a tall
spacer holding a sticky, viewport-high stage, with vertical progress through the
spacer mapped onto the track's horizontal overflow. **Nothing hijacks the
wheel.** There is no gesture capture and no animated scroll position, so
`PageDown`, a trackpad, find-in-page and a screen reader's own scrolling all
still work — they move the same `scrollY` the mapping reads. Panels are `<li>`
of an `<ol>` in reading order and nothing focusable goes inside the track, so a
pinned `translateX` can never strand a focus ring off-screen.

Three layers move at three rates. «ХРОНИКА» is printed on the page at poster
scale and the plates are tipped in over it, so the letters visible at any moment
are the ones no photograph is covering. The word travels on **its own** overflow
rather than at a fraction of the track's — which is what lets it start flush left
and finish flush right however many entries the chronicle grows to — and it sits
**high** on the sheet rather than centred. That is load-bearing: centred, it ran
straight through the band every panel sets its type in, and measured 3.40:1
against the colophon's labels. The collision was geometric, not a tuning
problem, so the word moved and every panel sets its matter below it.

The sheets alternate a tall plate and a wide dropped one **by index**, so an
event added to `results.events` composes itself. The roll ends on the count
rather than on another photograph: the last sheet is the 正 tally, struck by the
same hand, closing on the season's record under the chapter's one vermilion
mark.

Below 1024 and under `prefers-reduced-motion` none of it happens — the sheets
are an ordinary column, in the same order. That state is the **base** stylesheet
and the travelling form is one opt-in media query, so there is a single copy of
the column layout and nothing for an override to drift away from. Two traps are
written into `roll.css` and both are real: nothing above the stage may declare
`overflow`, or it becomes the sticky element's containing block and the pin dies
silently; and the reduced-motion block needs `transform: none !important`,
because the preference cannot be read on the server, the track is briefly pinned
during hydration, and a stylesheet is the only thing that outranks the inline
transform Motion leaves behind.

## The contacts page

`/contacts` is the manual's **back matter**, not a seventh chapter. The numerals
一…六 count the chapters of the home page; a second sheet that restarted the
count would teach the reader a device that means nothing. So the binding margin
carries the printer's register mark instead (`ui/RegisterMark`, which until now
had no call site anywhere in the repo) — where the second pass lines up on the
first: same press, different sheet.

Three bands, each a different kind of object, and the page's one vermilion is
spent once per band on a different one of its three sanctioned jobs.

**«Дверь»** — the club's particulars set the way a posted address is set:
addressee, street, city, republic, with no label on any of them, because an
address block is recognised by its shape. The **street** is the largest type on
the page and the city is one step under it; every reader this page is for is
already in Nalchik, so «НАЛЬЧИК» at poster size would be maximum scale spent on
zero information. The three routes stand where a sender's details stand on an
envelope and the **seal** is in the stamp corner — the one job a seal literally
has, and the only `<Seal>` printed anywhere on the site. One of the three routes
is a **ruled blank**: the club's phone is `club.pending.phone`, and this is the
first place in the codebase that draws what the pending convention has always
described. The fold closes on a rule carrying the hall's live state, which never
says «открыто» — the club has told us when it *trains*, not when it unlocks.

**«Ваша группа»** — the page's one gesture. The reader types an age and the
sensei's brush ticks the group they belong in, in the margin beside the row:
朱筆, the vermilion a teacher corrects a student's sheet with, which is a
different mark in kind from the ensō that closes the home page. That one is a
completion; this one is made *because of something the reader wrote*. Three
things make it a fact rather than an ornament, and all three are the club's own
data: at **6 and at 16 the mark doubles**, because `content/schedule.ts` says the
bands overlap on purpose and must not be tidied; under four **the brush
refuses**, and the floor is read off the youngest band rather than typed; and
every row prints its own week from the first paint, so marking *narrows* — the
unchosen rows drop a step down the ink ramp and lose their rules — rather than
revealing. The band closes on a register of particulars set on leaders, two of
them ruled blank, each ending in a locator: the chapter of the home page that
answers it in full, set with that chapter's own binding numeral.

**«Написать в клуб»** — the sheet turns over. The letter is the widest object on
the page, running the whole trim between two rules, and the reader's name sits
under it where a signature goes; chapter 六 books a session in a narrow column
of ruled fields, and this one writes. **It never claims to send.** There is no
route to post to, so the control says «Собрать письмо», assembles what the
reader wrote, hands it back ready to copy and becomes «Открыть Telegram» — the
label tells them before they type rather than after. There is no consent line
either, because nothing leaves the browser; the day a route exists, the consent
arrives with it.

The reference the page is drawn from answers six questions down its left edge.
For this club every one of those answers is unconfirmed, and six ruled blanks in
a row is not a design, it is an apology — so the questions are kept and the
answers given back: they are the **subjects**, and choosing one writes the first
line of the reader's own letter.

## Before this can go live

Everything below is a placeholder and needs the client's confirmation:

- **Photography.** `public/media/placeholders/` holds temporary Wikimedia
  Commons images under their own licences; see `CREDITS.md` in that folder.
  Replace them and update `src/content/media.ts` — nothing else references
  image paths.

  **The first screen is a placeholder again, and a louder one.** `firstScreen`,
  `firstScreenTall` and `reels.firstScreen` live under `public/media/hero/` and
  are cut by `scripts/press-hero-reel.sh` from a free-licence stock clip
  (Mixkit; see the foot of `CREDITS.md`). They replaced the club's own
  belt-tying footage, which was the right photograph for a chapter printed on
  paper and the wrong one for a chapter printed on ink — ninety-one seconds of
  a brightly lit sports hall has no dark frame in it, and darkening the gi only
  makes it grey.

  **The uniform in it is a taekwondo dobok, not a karate gi.** That is the one
  defect worth carrying in your head: the V-neck is the tell, no crop removes
  it, and anyone who trains will see it. It is stated in `media.ts`, in
  `CREDITS.md`, and here, because a placeholder that looks this finished is the
  kind that quietly ships.

  `media.ts` states the slot's requirements, and they INVERTED with the ground
  — whatever replaces this has to meet the new ones, not the old: a genuinely
  DARK ground everywhere the type falls, one subject, the figure out of the left
  62% of the trim, real tonal separation, and no third-party wordmark. Every
  other plate on the page is a Wikimedia stand-in.

  Two files under `public/media/placeholders/` are orphaned —
  `snow-kick-1970.jpg` and `snow-kick-1970-portrait.jpg`, which were the first
  screen two passes ago. Nothing references them; delete them and their
  `CREDITS.md` rows when the client's photography lands.
- **Logo.** There is no figurative mark. The hand-drawn kicking figure that
  stood in for one has been removed — a placeholder of somebody else's logo
  teaches the reader a mark that will not survive launch — so the lockup in
  `src/components/brand/Logo.tsx` is the "SK AZUMA" wordmark and nothing else,
  set in Unbounded as a stand-in for the club's lettering. Swap in their real
  vector lockup. The seal (`src/components/brush/Seal.tsx`) carries 東 in the
  meantime, which is the club's own name and not a guess at their mark.
- **Facts.** Session times and group names (`src/content/schedule.ts`), prices,
  medal counts and the season timeline (`src/content/home.ts`). The four age bands and the two
  intake families in that file are the club's own and are CONFIRMED — chapter
  二's intake line and chapter 三's timetable legend both read them from there,
  so they can only ever be corrected in one place. The bands overlap at 6 and at
  16 on purpose; that is how the club runs them.
- **Reviews.** The three parent quotes are illustrative. Real quotes need
  written consent, as do photographs of children.
- **Every plate outside chapters four and five** goes through the duotone press
  (`src/components/ui/PressDefs.tsx`), so the client's own photography will be
  printed in the two inks the page uses and nothing in a replacement can
  introduce a second hue. That also means a pressed replacement is judged on
  *luminance* — a photograph that is only legible through its colour will come
  out flat, so prefer frames with real tonal separation.
- **The chronicle's three plates are the most urgent replacements on the site**,
  and colour is why. Pressed to bone, a federation banner in the background of a
  stock frame was texture; printed in colour at plate scale it is *readable*,
  and it tells the reader the club belongs to an organisation it does not. Two
  otherwise perfect podium frames are on disk and unused for exactly that —
  `kids-podium-trophies.jpg` carries «ISRAEL UNITED KYOKUSHIN KARATE» twice and
  `champion-medal-team.jpg` carries «FIRST EUROPEAN KYOKUSHIN/SHINKYOKUSHIN»,
  and no single crop clears either. So a replacement needs all four: the club's
  own competition, real colour worth printing, a subject that survives a hard
  crop to 3:4 or 4:3, and no third-party wordmark anywhere legible. The test and
  the arithmetic behind each crop are stated against the slots in
  `src/content/media.ts`.
- **THE SECOND COACH IS INVENTED, AND HE IS THE ONLY INVENTED PERSON ON THIS
  SITE.** Chapter 四 sets two coaches as a spread, and the second half of it —
  «Руслан Тхагапсоев», his rank, his belt and the groups he works with
  (`assistant` in `src/content/home.ts`) — came from nobody. Neither did the
  frame beside it (`assistantPlate` in `src/content/media.ts`). Both are
  written the way real copy is written so the composition can be judged at full
  strength and so the client can see the spread they are being asked to fill;
  neither can ship.

  This breaks the project's own rule on purpose and in the open: an unconfirmed
  fact is normally PENDING and prints as a ruled blank, never as plausible copy
  (see below). Half a spread of ruled blanks is not a design anyone can judge,
  so the decision went the other way, once, with the argument written against
  the export. If the club has no second coach, delete `assistant` and
  `assistantPlate` and the chapter falls back to one entry on its own —
  `Sensei.tsx` maps over `coaches` and does not care how many there are.

  Two things in that half ARE true: the age bands (4–6 and 6–11 are the club's
  own, and are written exactly as `schedule.ts` writes them), and the fact that
  the head coach's «Ведёт детские и взрослую группы САМ» lost its «сам» to make
  room for him. A second coach and a man who does it all himself cannot both be
  printed on one page; if the second coach goes, that word comes back.
- **A fact the club has not given** is modelled as pending (`pendingText()` /
  `pendingFact()` in `src/content/home.ts`), never invented. It prints as a
  ruled blank with the label beside it, the way a manual prints a slot it does
  not have a fact for yet. Do not replace a pending slot with plausible-looking
  copy — fill it or leave it ruled. The live ones are the club's phone number
  and the hall's coordinates, in `src/content/schedule.ts`.

  Chapter 四 carries none. It printed the sentence «The title was conferred by
  order of the Ministry of Sport», the label «ORDER» and a ruled blank for the
  number and date, in the channel between the type and the plate; the whole
  block has gone — see the retirement note in `sensei` in
  `src/content/home.ts`. The ministry sentence is CONFIRMED and is the one
  thing the chapter gave up; if the club wants it back it belongs under the
  rank as a sentence, not as a label, a rule and a blank. The second coach was
  pending too, once, and that is exactly what the entry above replaced.
- **Sign-up form.** It validates and simulates success; it has no backend yet.
  The Telegram link is the working route in the meantime. `/contacts` does not
  repeat that: its control assembles a message and hands it to the reader rather
  than pretending to post one, so it needs no backend to be honest — but the day
  one exists, both should use it.
- **What to bring, and the price.** Both are `pendingFact`s in
  `src/content/contacts.ts` and both print as a ruled blank in the contacts
  register with the route to ask beside them. They are the two questions a parent
  asks straight after «в какую группу»; fill them there and nothing else changes.
- **The phone and the hall's coordinates.** Both were being rendered as facts in
  the colophon — `club.phone` as a live `tel:` to a number that does not ring,
  `coordsLabel` to the arc-minute as though the hall had been surveyed. Both are
  out of the footer now and the phone prints as a ruled blank on `/contacts`.
  They come back, as facts, the day the club confirms them.

## Frontend aesthetics

You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on: Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics. Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration. Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic. Avoid generic AI-generated aesthetics:- Overused font families (Inter, Roboto, Arial, system fonts)- Clichéd color schemes (particularly purple gradients on white backgrounds)- Predictable layouts and component patterns- Cookie-cutter design that lacks context-specific character Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
