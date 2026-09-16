# Chapter 五 «Хроника» — the roll

2026-09-15. Replaces the tally-board-plus-timeline composition of chapter 五
with a photograph-led horizontal chronicle.

## Why the chapter changes

The chapter's subject is a season's record, and the section carried it as a
three-row tally board, a four-row printed timeline of invented events, and one
duotone plate of trophies. Three problems, in order of size:

1. **No evidence.** A club's victories are photographs. The chapter asserted
   counts and named tournaments the client had not confirmed, and showed one
   stock photograph of somebody else's cups.
2. **The press throws the subject away.** Gold, ribbons and a red mat pressed
   ink-to-bone are grey. The one chapter where the page should be loud was the
   quietest one on the site.
3. **It ran down the page like every other chapter.** Ten chapters of vertical
   stacking, and the one whose subject is a *sequence in time* had no form of
   its own.

## The concept — СВИТОК

A *makimono* is a handscroll: a chronicle read by unrolling it sideways. That
is what a season's record is, so chapter 五 is the one chapter in this manual
that does not run down the page. The reader scrolls down; the season unrolls
across.

This is the justification a horizontal gallery normally does not have. The form
is not borrowed from a trend — it is the form the subject is kept in.

## Composition

The section is a tall spacer holding a `sticky`, `100vh` stage. Three layers
travel at three speeds:

| layer | content | rate |
|---|---|---|
| backdrop | «ХРОНИКА» / «CHRONICLE» in Prata at 18vw, 32% bone on ink | its own overflow (≈0.36× as built) |
| track | the panels | 1× |
| chrome | folio `02 / 05`, progress rule | fixed |

The backdrop is *printed on the page*; the plates are tipped in over it, so the
letters a reader can see are the ones no photograph is covering. It is
`aria-hidden` ornament — the chapter's real heading is in the first panel.

**Two things this section got wrong before the render corrected them**, both
recorded here because the reasoning, not the number, is what generalises:

- *The backdrop is not a multiplier of the track's travel.* Mapping it onto its
  own overflow is what guarantees it starts flush left and ends flush right at
  any entry count; a fixed 0.35× runs out early or overshoots as the chronicle
  grows.
- *The word cannot be centred on the sheet.* Centred it crossed the band every
  panel sets its type in and measured **3.40:1** against the colophon's bone-2
  labels — a real contrast failure. It is geometric and not tunable: the word is
  wider than the stage and must travel slower than the track, so it cannot be
  padded clear of the first and last sheets without overtaking the plates. The
  fix is compositional — the word sits high, and the masthead and colophon are
  bottom-aligned, so the only thing that ever crosses those letters is an opaque
  photograph.

### Panels

```
00  masthead   Сезон 2025/26 · the lead · a scroll hint
01  event      tall plate 3:4   RCC Kyokushin Fight 4
02  event      wide plate 4:3   Чемпионат и Первенство России
03  event      tall plate 3:4   Russian Open Cup 2025
04  colophon   the 正 tally, the record, the sensei's underline
```

Event panels alternate tall/wide by index, so an event added to
`results.events` keeps the rhythm without touching a component. Plate tops are
offset per kind, which is the stagger the reference images carry; the ledger
follows its own plate rather than a shared baseline.

A panel is a plate, a hairline, and then the ledger: mono date, Prata title,
mono note. No cards, no rounded corners, no shadow — plates in this book are
tipped onto a page.

The chronicle ends on the count, not on another photograph: panel 04 is the
existing 正 tally, struck by the existing brush hand, and it closes with the
season's record under the chapter's one vermilion mark.

## Motion

| device | implementation |
|---|---|
| unroll | `useScroll` over the spacer → springed `x` on the track |
| three depths | backdrop travel is its own overflow, not a multiplier — so it can never run out |
| velocity skew | `useVelocity(x)` → `skewX`, clamped ±3°, springed. What makes it read as material |
| arrival | panel titles run `<LineReveal>`; plates open under `<Curtain>` |
| the count | unchanged `<Brush kind="sei">` |

Everything uses `src/lib/ease.ts`. Nothing inlines a bezier.

## Degradation

The pin is a *wide-viewport enhancement*, not the content.

- **Below 1024** the panels stack vertically at trim width. No spacer height, no
  sticky, no transforms.
- **Reduced motion** gets the same vertical stack. The inline transform Motion
  rewrites every frame cannot be overridden from JS, so the stack is enforced
  with `transform: none !important` in a `prefers-reduced-motion` block, which
  is the pattern `useStillness`'s own documentation prescribes.
- **No JS** leaves the track in normal flow as a horizontal `scroll-snap`
  strip, so the chronicle is still readable and still scrollable.
- Panels are `<li>` of an `<ol>` in reading order with real headings. Nothing
  focusable goes inside the track, so a pinned `translateX` can never strand a
  focus ring off-screen.

## Colour — a second exception to the press

Every plate on this site goes through the duotone press. These do not. Chapter
四 was the single exception (a portrait, printed in colour because that chapter
is about a person); chapter 五 is now the second, and the reason is different:
a victory is gold, ribbons and a red mat, and a chronicle of victories printed
in two inks is a chronicle with its subject removed.

Both exceptions are deliberate and both are stated in the README. The rota for
*vermilion* is untouched: the chapter still spends its one red on the sensei's
closing underline. Nothing else in the chapter is hued.

### What colour costs, stated

Pressed to bone, a third-party banner in a placeholder frame was texture. In
full colour at plate scale it is legible, and it asserts a federation the club
does not belong to. `kids-podium-trophies.jpg` prints «ISRAEL UNITED KYOKUSHIN
KARATE» across its top and again on a floor logo; `champion-medal-team.jpg`
carries «FIRST EUROPEAN KYOKUSHIN/SHINKYOKUSHIN» on the diploma and a KARATE
極真 banner. No crop removes both from either frame, so neither is used — which
is the same test `media.ts` already applies to the first screen and to chapter
四's plate.

The three frames used are clean: an adult kumite exchange, a table of cups, and
a jumping kick. They are still placeholders and the client's own competition
photography replaces them by editing `media.ts` and nothing else.

## Content

`results.timeline` (four invented rows) is replaced by `results.events`, which
carries the client's real record:

| date | title |
|---|---|
| 26 июля 2025 | RCC Kyokushin Fight 4 |
| 5—6 октября 2024 | Чемпионат и Первенство России |
| 20—23 февраля 2025 | Russian Open Cup 2025 |

Each event is `{ date, title, note, plate }`. The note does not restate the
date — the date is its own field, which is what a chronicle is ordered by. The
tally counts stay `PLACEHOLDER` and stay the club's to confirm.

Russian copy binds a non-breaking space as the ` ` escape, written through
a shell heredoc so the escape survives to disk.

## Files

| file | change |
|---|---|
| `src/components/ui/Roll.tsx` | new — the pinned roll: measurement, scroll mapping, skew, folio, progress, fallbacks |
| `src/components/sections/results/Tally.tsx` | moved out of `Results.tsx` unchanged |
| `src/components/sections/Results.tsx` | rewritten as the composition |
| `src/styles/sections/results.css` | rewritten |
| `src/content/home.ts` | `timeline` → `events` |
| `src/content/media.ts` | three event plates |
| `README.md` | the second press exception |

`.results` loses `overflow: hidden`: an `overflow` on an ancestor makes it the
sticky element's containing block and the pin silently dies. The stage clips
itself instead, which is harmless because the stage *is* the sticky element.

## Measured, on the built page

At 1512×950 the section is 2404px tall, travel 1454px, and the track reaches
exactly `x = -1454` with the last sheet keeping its 54px gutter. Verified at
1512×950, 1280×800, 2560×1440, 390×844 and at 1512 under
`prefers-reduced-motion: reduce`:

- no page-level horizontal overflow in any case;
- in every pinned case the lowest element of every panel ends **above** the
  stage foot (worst case −70px at 1280×800, the short-laptop case the plate
  height caps exist for);
- the column cases report `pinned=false` with the backdrop and the scroll hint
  both withheld;
- no console or page errors, in Russian or English.

Two defects the render caught that the numbers alone did not:

- `.roll__panel` was a flex container, which sized its child to the child's own
  content. Invisible while the pinned form gives every panel an explicit width,
  and wrong the moment it does not — in the column fallback the plates collapsed
  to their intrinsic width with three quarters of the trim empty beside them.
- The folio's probe was fixed at the middle of the stage, so with two and a half
  sheets open at once it could only ever read 02…04 of 05. It sweeps from the
  stage's left edge to its right edge across the roll instead, which reaches
  both ends and is still the middle in the middle.
