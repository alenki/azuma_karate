# SK Azuma — Home Page Design Specification
## «Первая черта» / “The First Stroke”

| | |
|---|---|
| Version | 1.1 — 2026-09-03 — the sheet is the viewport (§2 Rhythm); v1.0 was a centred 82rem column |
| Scope | Home page only. Other pages exist as navigation targets. |
| Status | Chosen by a three-judge panel (Awwwards juror, Nalchik parent, lead engineer) from five independent concepts; grafts from the runners-up applied. |

---

## 1. Concept and signature

**What a juror remembers.** The page is a printed Kyokushin manual crossed with a fashion magazine: warm paper, one high-contrast Cyrillic serif at a single weight, mono folios, hairline rules, black-and-white plates with captions, and ten chapters counted the way a sensei counts a set — 一 二 三 … 十 — printed in the binding margin. Everything on the page is typeset and still. The only thing that moves, and the only thing that is red, is the sensei’s brush. It draws the first stroke 一 across the hero, then walks through the manual annotating it — an underline under «предельная истина», a circle around the «4» in «С 4 лет», a seal pressed on the coach’s page, tally marks 正 counting medals, corner brackets 「 」 around a parent’s words, a tick under today’s column in the timetable, a check beside each answered question — and closes as an ensō drawn in one breath around «Записаться». From one line to a circle: the whole Kyokushin path, in one colour, on one scroll. The brush skips chapter six (the photo spread) on purpose; the absence is felt.

**What a parent feels.** The tone is calm and confident, not an agency showcase: the coach’s credential appears by chapter four, the groups and ages by chapter three, the timetable is marked “today”, the FAQ answers safety and price, and a live “next session” strip plus a sticky mobile bar make the first trial session one tap away at any point. The brand’s black-and-red energy lives in two heavy ink blocks (chapters five and ten) and the footer, and in one colour photograph of medals.

**Brush marks are real calligraphy, not path draw-ons.** Every mark is a filled shape generated from a centreline with a pressed head, thinning belly and lifted dry tail (`scratchpad/brush/brush.py` → `src/components/brush/marks.ts`), revealed through an SVG mask whose centreline animates `pathLength`, so ink appears under the bristles. 正 uses KanjiVG stroke order.

## 2. Design tokens (`src/app/[locale]/globals.css` → `@theme`)

**Colour** (contrast checked against WCAG AA for text):

| Token | Hex | Role | Pairs |
|---|---|---|---|
| `--color-paper` | `#F3EFE6` | page ground | ink 15.4:1 |
| `--color-paper-2` | `#EAE4D8` | row highlight, plate placeholder | |
| `--color-paper-3` | `#FBF9F4` | today’s column, selection text | |
| `--color-ink` | `#151311` | text, ink grounds | |
| `--color-ink-2` | `#5A554E` | secondary text on paper | 6.9:1 on paper |
| `--color-ink-quiet` | `#726C62` | folios, ordinals, entry labels — the lightest legal tone | 4.53:1 on paper |
| `--color-ink-3` | `#A29B90` | ORNAMENT ONLY — register marks, ruler ticks, ghost seats | **2.399:1 — never text at any size** |
| `--color-rule` | `#D8D2C6` | hairlines on paper | |
| `--color-bone` | `#EFE9DD` | text on ink | 14.6:1 |
| `--color-bone-2` | `#A8A196` | secondary text on ink | 6.6:1 |
| `--color-rule-dark` | `#2B2724` | hairlines on ink | |
| `--color-shu` | `#C41E2A` | the brush, on paper | 5.5:1 as text on paper |
| `--color-shu-lift` | `#E8404A` | the brush, focus rings and red on ink | 4.6:1 on ink |

**Type.** Prata 400 (display: hero, chapter titles, statements, big numerals — never below ~28px); Golos Text 400/500/600 (body, UI); IBM Plex Mono 400/500 (folios, running heads, captions, tables, labels: uppercase 11px tracking 0.12em, or mixed-case 13px tracking 0.02em); Cormorant Garamond italic 400/500 (exactly: the hero aside, reviewers’ names/sign-off, footer «Осу.»); Unbounded 600 latin only as the wordmark stand-in until the client’s vector lockup arrives. Japanese glyphs are never a webfont: 極真, the numerals 一…十, 押忍 and 正 are inline SVG from KanjiVG (`src/content/kanji.ts`, credited in the footer).

Scale (clamp): hero `clamp(2.9rem, 8.6vw, 15rem)` — except chapter one, which sets its display size to the measure (§5.1) — chapter `clamp(2.25rem, 5.6vw, 9rem)`, statement `clamp(1.5rem, 2.6vw, 3.75rem)`, h3 `clamp(1.25rem, 1.6vw, 2.125rem)`, lead `clamp(1.125rem, 1.4vw, 1.625rem)`, body `clamp(1rem, 0.75vw, 1.125rem)`/1.55, caption `clamp(0.8125rem, 0.72vw, 1rem)`, micro `clamp(0.6875rem, 0.62vw, 0.875rem)`. Line-height 0.98 for the hero, 1.0 chapter, 1.18 statement. Letter-spacing −0.01em at hero size, 0 elsewhere.

Every `vw` growth term is the one v1.0 shipped; only the ceilings moved. Nothing below ~1600px changes size — the raised caps exist so type keeps growing on a sheet that is now as wide as the screen, instead of freezing at a size chosen for a 1312px column.

**Rhythm — the sheet is the viewport.** There is no centred column: `.wrap` is the *trim*, `width:100%` with `padding-inline: var(--gutter)`, and every chapter is set to the width of the screen it is read on. `--gutter: clamp(1.25rem, 3.6vw, 6rem)` is both the trim and the binding margin the chapter numerals hang in (capped so a 2560 display keeps a 3.6% margin that clears the numeral). `--col-gap: clamp(1rem, 1.5vw, 2.25rem)` gaps a real, shared 12-column field — `.page-grid` — that chapters range across; `.bleed` / `.bleed-l` / `.bleed-r` take an element past the trim to the paper edge, where `calc(100% + var(--gutter))` lands exactly. Line length is held on the text, in `ch` (`--measure-prose` 62ch, `--measure-lead` 46ch, `--measure-caption` 40ch), never by a container. Chapter padding 9–17rem at 2560; vertical spacing in 0.5rem multiples; hairlines 1px; radii 0–2px; no shadows. Header height `clamp(5rem, 4vw, 6.5rem)`. Film grain (`.grain`, inline feTurbulence tile, soft-light 35%) on ink blocks only.

Chapters gain structure on a wide sheet rather than stretching: most carry a `min-width: 1600px` tier (some also 2000px) where a layout re-columns, a chart's unit grows, or a plate takes a larger band — see each chapter's stylesheet, which documents its own arithmetic.

**Motion tokens.** `--ease-out` cubic-bezier(.16,1,.3,1) (all reveals); `--ease-brush` (.3,.02,.15,1) (fast contact, slow lift); `--ease-press` (.34,1.56,.64,1) (the seal); `--ease-inout` (.65,0,.35,1) (accordion, crossfades). Durations 200 / 500 / 750ms; brush marks 0.4–1.4s proportional to length (ichi 1.1s, ensō 1.4s).

## 3. Motion system

- **Page load (the one orchestrated moment).** 100ms eyebrow → 250/340ms headline lines rise inside overflow masks → 350–1450ms plate curtain (clip-path inset from the bottom) → 1250ms the 一 stroke draws (1.1s) finishing «Потом удар.» → 1450ms lead → 1600ms actions → 1800ms folio bar. Nothing else on the page moves until scrolled.
- **Scroll reveals.** `Reveal` (fade + 28px rise, once, margin −12%) and `LineReveal` (masked line rise) in reading order: rules → type → plate → brush, the brush always last.
- **Brush.** `Brush` draws once when in view; the accordion check and the timetable tick draw on state change; reduced motion prints the finished mark.
- **Hover language.** Colour swaps (ink → shu), row backgrounds paper-2, underline scaleX on nav links; transform-only lifts (1px). No custom cursor. No auto-advancing carousels.
- **Smooth scroll.** Lenis, lerp 0.085, duration 1.15, wheel only; disabled under `prefers-reduced-motion`. Motion runs under `MotionConfig reducedMotion="user"`.

## 4. Global chrome

- **Header** (fixed, `clamp(5rem, 4vw, 6.5rem)`, transparent → 92% paper with blur and a hairline after 24px of scroll; the bar stands on the page grid so the running head is centred on the sheet rather than wherever flex leaves it): wordmark lockup left (text only — there is no figurative mark); four mono links at ≥1280px («О клубе», «Расписание», «Галерея», «Контакты»); a running head «Глава 03 · Группы» (aria-live polite) at ≥1024px driven by the active chapter; a RU | EN toggle whose current locale is inert and whose other locale is the only link, either side of a hairline rule; «Записаться» ink button at ≥768px; «Меню» below 1280px opens a full-screen paper menu with Prata links, the chapter contents and contacts (Escape closes, scroll locked, Lenis stopped). A skip link is the first focusable element.
- **Mobile bar.** 56px sticky bottom bar with the live next session and «Записаться», shown after 60% of the first viewport, hidden while chapter ten or the footer is in view.
- **Footer** (ink): the aphorism «Каждый чёрный пояс когда-то был белым.», the Kyokushin belt list with swatches, sections, contacts (address, coordinates 43°29′ N · 43°36′ E, phone, Telegram, Instagram, language link), the lockup with «Осу.», the colophon (fonts, KanjiVG credit, placeholder-photo note), and 押忍 printed at 8% in the corner.

## 5. Chapters

All copy lives in `src/content/home.ts` (RU source, EN mirror). Each chapter is a `<Chapter>` with its numeral and folio in the binding margin (≥768px) or an inline folio on phones, one `h2`, and exactly one brush mark unless noted.

| # | id | Ground | Designed idea | Brush mark | Plate |
|---|---|---|---|---|---|
| 一 | `hero` | paper | The first stroke is laid across the whole measure at poster scale and **the plate lives inside it**; «Потом удар.» straddles the ink; printed plate caption and a note on the mark; lead, seal-tiled button and Telegram at the lower right; live next-session folio bar; scroll cue | ichi, at poster scale | heroStroke ≈5:1 letterbox, bw, preload |
| 二 | `kyokushin` | paper | Dictionary entry: «Киокуши́н — предельная истина», reassurance couplet «Мы не учим драться. / Мы учим держать удар.», facts table; 極真 watermark bleeding off the top-right | underline | — |
| 三 | `programs` | paper | Statement «С 4 лет» with the digit circled; five hairline programme rows (name, ages, note, days · time) linked to the timetable; tipped-in checklist «Что взять на первую тренировку» with big numerals | circle | — |
| 四 | `sensei` | paper | Portrait overlapping the chapter top; name, rank «Мастер спорта международного класса», the decree as a plain summary line (never a facsimile), bio, quote, signature; “see him as his students do”: grayscale → colour on hover or toggle | seal | coachPortrait 3:4 |
| 五 | `results` | ink | Tally board: medals/gradings/tournaments counted in 正 strokes, then the numerals; season timeline; the page’s one colour photograph (trophies); «Лучший спортсмен года» strip; grain | sei (tally) | trophies 16:9, colour |
| 六 | `morning` | paper | The photo spread: 21:9 muted plate with transform-only parallax, paper caption card with today’s computed sunrise; «Два адреса. Один путь.»; meta line with days, time and Telegram meeting point | none (deliberate) | sunriseKick 21:9 muted; parkAlley 4:5 bw |
| 七 | `reviews` | paper | One large Prata quote at a time with corner brackets drawn L then R; attribution names the group; prev/next buttons and counter; no auto-advance | bracketL + bracketR | — |
| 八 | `schedule` | paper | «Неделя»: printed 7-column table (per-day accordion under 768px, today open), legend that highlights a group’s cells; route and Telegram buttons; provisional note | tick under today | — |
| 九 | `faq` | paper | Sticky title «Что нужно, чтобы начать?»; seven questions (age, what to bring, safety, price, competitions optional, medical certificate, adults); a check drawn beside the open answer | check | — |
| 十 | `join` | ink | «Первая тренировка»: name / age / contact form with visible labels and inline validation; the ensō drawn around «Записаться»; on success the seal stamps «Осу» beside the message; Telegram alternative and trust line | ensō (+ seal on success) | — |

### 5.1 Hero composition

**The idea.** The photograph is not beside the stroke, it *is* the stroke’s ink. The mark is cut as a CSS mask, so the plate takes the shape of real calligraphy — a pressed head at the left gutter, a belly that thins, and a dry tail that breaks into bristle ribbons and runs off the right edge of the page. The brush stays the only red thing: the mark is drawn in vermilion first, the plate floods in behind the same front a beat later, and because the plate is masked to a silhouette eroded by ~2 units, a hairline of pigment survives around the whole gesture while the traces too thin to hold an image stay pure vermilion.

**The seam.** «Потом удар.» is set twice in one box — once in `--color-ink`, once in `--color-bone` masked to the same silhouette at the same size and offset — so the same words print black on the paper and light inside the ink, cut on exactly the contour the brush left. `--seam` is the fraction of Prata’s cap band left above the ink (0.62 desktop, 0.55 phones); `--mark-top` is how far below the trimmed mask box the ink’s top edge actually runs where the headline crosses it (7.8% wide mark, 4.8% narrow — `scripts/gen-hero-stroke.ts` reports both). The stroke is positioned against line 2’s own box, so the seam holds wherever line 1 wraps. Blend modes were rejected for this: `difference` against a photographic plate makes legibility vary letter by letter.

**Type set to the measure.** The display size is the measure — now the whole trim, `calc(100cqw - 2 * var(--gutter))` — divided by the longer of the two headline lines, measured in em (`heroFit` in `src/content/home.ts`: RU 8.36 / 6.04, EN 7.38). The headline therefore fills the sheet exactly in either language at any width: 158px at 1440, 282px (RU) / 320px (EN) at 2560. `--hero-max` is 22rem, high enough that the measure governs everywhere a reader is likely to be; what actually guards the fold is `--fold-cap`, `(100svh − --fold-fixed − 0.922·--band-h) / 1.642`, where `--fold-fixed: calc(18rem + 7vw)` is the measured height of everything in the chapter that is not the headline. It is non-binding at 1440×900 and 2560×1440 and binds only on screens far wider than they are tall — at 2560×1080 it holds the headline to ~178px, which is the one width where the type does not reach the trim. `cqw` is used rather than `vw` so the scrollbar is excluded, and because percentages are illegal inside `font-size`.

**The stroke keeps its proportion.** `hero-stroke.svg` is 1963×358 (5.48:1) with `preserveAspectRatio="none"`, so `--band-h` alone decides how hard the ink is stretched. A flat `svh` height would have smeared the mark to 10.8:1 on a full-bleed sheet, so the height carries a width term — `clamp(8.5rem, max(21svh, (100vw + --band-bleed − --gutter) / 7.55), 34rem)`, where 7.55 is the native ratio times the 1.377 horizontal stretch v1.0 drew it at. Measured: 7.48:1 at 1440 and 7.51:1 at 2560. The seam is algebraically invariant to `--band-h` — the `--mark-top · --band-h` terms cancel between `--straddle` and the ink's top edge — so «Потом удар.» crosses the cap band at the same fraction however tall the band is.

- 1440: masthead (mono left, italic aside «— с четырёх лет» right) and a rule → «Сначала поклон.» filling the trim → the stroke, ~21svh tall, from the left trim to 8vw past the page, with «Потом удар.» straddling it → the plate’s caption and «Тушь · одно движение · без исправлений» at the left, the lead (40ch), the ink button with its vermilion seal tile, «Первая тренировка — пробная» and Telegram at the right → folio bar: hairline, live strip «Ближайшая тренировка · Сегодня 17:00 · Первый шаг · 4–6 лет · ул. Кирова, 157 →», scroll cue. The chapter is exactly 100svh. From 1440 up the masthead, the under-plate register (colophon cols 1–3, lead cols 5–8, seal-tiled button cols 10–12) and the folio row all stand on the same twelve-column field, so the whole sheet hangs on two verticals.
- 390: masthead, three headline lines, a shorter and proportionally thicker mark with its own silhouette, the seam kept, then the lead, a full-width button and Telegram on paper — never over the plate — then the caption and the folio strip.
- Load: 0.06s masthead → 0.14s rule → 0.24s line 1 → 0.42s the brush lands and lays the stroke in vermilion (1.15s, `--ease-brush`) → 0.66s the plate floods in behind it (1.2s) → 0.72s line 2 rises into the ink → 1.05s lead and button → 1.2s caption → 1.3s folio. Still by ~1.9s. Under `prefers-reduced-motion` the stroke, the plate and the type are simply printed.
- Scrolling drifts the plate inside the mask and the pointer leans it ±1.2%, transform-only, so the mark reads as a slot cut through the page rather than a picture pasted on it. Both are bounded by the image’s inset headroom, so no edge of the plate can be exposed.
- The stage clips its own horizontal overflow: `body { overflow-x: clip }` does not stop the document scrolling sideways when a child bleeds past the page.

## 6. Media

Every plate is a named slot in `src/content/media.ts` (src, dimensions, RU/EN alt, focal point). All current files are Wikimedia Commons placeholders under CC licences (credits in `public/media/placeholders/CREDITS.md`) and must be replaced with the club’s photography. Grading: `.plate-bw` (grayscale, sepia 0.12, contrast 1.05) is the default; `.plate-muted` for the morning spread; full colour only for the trophies plate and the coach’s hover state.

Shot list for the client: child bowing on the tatami (3:4, calm left third), coach portrait against a plain wall (3:4), trophies/medals (16:9, colour), park at 8am (21:9 and 4:5), kids in headgear sparring (4:5), adults group (16:9), belt grading group photo (3:2).

## 7. Internationalisation

Routes: `/` (RU, default) and `/en` (EN) from `src/app/[locale]`, both statically generated; `/ru/*` redirects to `/*`. Copy is a typed dictionary keyed by locale; components call `useLocale()`. Russian is the source language; long words are handled by `text-wrap: balance` on headlines, fluid clamp sizes, no `nowrap` on content, and hero sizing verified for «Сначала поклон.» at 1024–1920px.

## 8. Accessibility and performance

- AA contrast on both grounds. The paper ramp is ink 16.15:1 → ink-2 6.43:1 → ink-quiet 4.53:1; `--color-ink-3` is 2.399:1 and is not in it — it is below even the 3:1 large-text floor, so it carries no visible text anywhere, and `aria-hidden` does not exempt it (WCAG 1.4.3 covers visible text whether or not AT reads it). v1.0 of this table said 2.9:1; that was wrong. focus rings 2px shu on paper / shu-lift on ink; skip link; one h1, one h2 per chapter, `aria-labelledby`; accordion with `aria-expanded`/`aria-controls` and arrow keys; timetable has a mobile list alternative; buttons ≥44px; decorative SVG `aria-hidden`; live values (today, next session, sunrise) rendered after mount to avoid hydration mismatch.
- `prefers-reduced-motion`: reveals and brush marks render finished; Lenis off; marquee static.
- LCP: the hero headline text and one `preload` plate (`priority` is deprecated in Next 16, and `preload` + `priority` together throw); fonts via `next/font` with size-adjusted fallbacks; AVIF/WebP via `next/image` with `sizes`; no video; no WebGL; grain is a static tile.

## 9. Component inventory

`layout/Header`, `layout/Footer`, `layout/MobileBar`, `layout/Chapter` + `ChapterContext`; `brush/Brush`, `brush/Kanji`, `brush/Seal`, `brush/marks`; `ui/Reveal`, `ui/LineReveal`, `ui/Marquee`, `ui/Grain`, `ui/Button`, `ui/Accordion`, `ui/Photo`, `ui/NextSessionStrip`; `sections/Hero`, `Kyokushin`, `Programs`, `Sensei`, `Results`, `Morning`, `Reviews`, `Schedule` (+ `Timetable`), `Faq`, `Join`; `providers/SmoothScroll`, `providers/MotionProvider`; `lib/schedule` (next session, timetable), `lib/sunrise` (NOAA); `content/home`, `content/schedule`, `content/media`, `content/nav`, `content/kanji`; `brand/Logo`.

## 10. Non-goals for this phase

Other pages, a CMS, a real form backend (the form validates and simulates success; wire it to Telegram/e-mail next), analytics, cookie banner, the client’s vector logo and real photography, confirmed facts (schedule, prices, decree number, second coach, reviews and consent).
