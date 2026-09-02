# SK Azuma — Home Page Design Specification
## «Первая черта» / “The First Stroke”

| | |
|---|---|
| Version | 1.0 — 2026-09-02 |
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
| `--color-ink-3` | `#A29B90` | folios, hints (decorative / large only) | 2.9:1 — never for body text |
| `--color-rule` | `#D8D2C6` | hairlines on paper | |
| `--color-bone` | `#EFE9DD` | text on ink | 14.6:1 |
| `--color-bone-2` | `#A8A196` | secondary text on ink | 6.6:1 |
| `--color-rule-dark` | `#2B2724` | hairlines on ink | |
| `--color-shu` | `#C41E2A` | the brush, on paper | 5.5:1 as text on paper |
| `--color-shu-lift` | `#E8404A` | the brush, focus rings and red on ink | 4.6:1 on ink |

**Type.** Prata 400 (display: hero, chapter titles, statements, big numerals — never below ~28px); Golos Text 400/500/600 (body, UI); IBM Plex Mono 400/500 (folios, running heads, captions, tables, labels: uppercase 11px tracking 0.12em, or mixed-case 13px tracking 0.02em); Cormorant Garamond italic 400/500 (exactly: the hero aside, reviewers’ names/sign-off, footer «Осу.»); Unbounded 600 latin only as the wordmark stand-in until the client’s vector lockup arrives. Japanese glyphs are never a webfont: 極真, the numerals 一…十, 押忍 and 正 are inline SVG from KanjiVG (`src/content/kanji.ts`, credited in the footer).

Scale (clamp): hero `clamp(2.9rem, 8.6vw, 8.25rem)`, chapter `clamp(2.25rem, 5.6vw, 5.5rem)`, statement `clamp(1.5rem, 2.6vw, 2.5rem)`, h3 `clamp(1.25rem, 1.6vw, 1.625rem)`, lead `clamp(1.125rem, 1.4vw, 1.375rem)`, body 1rem/1.55, micro 0.6875rem. Line-height 0.98 for the hero, 1.0 chapter, 1.18 statement. Letter-spacing −0.01em at hero size, 0 elsewhere.

**Rhythm.** Container 82rem (1312px) with gutters `clamp(1.25rem, 4.4vw, 4rem)`; 12-column mental grid; chapter padding 6–10rem; vertical spacing in 0.5rem multiples; hairlines 1px; radii 0–2px; no shadows. Header height 5rem. Film grain (`.grain`, inline feTurbulence tile, soft-light 35%) on ink blocks only.

**Motion tokens.** `--ease-out` cubic-bezier(.16,1,.3,1) (all reveals); `--ease-brush` (.3,.02,.15,1) (fast contact, slow lift); `--ease-press` (.34,1.56,.64,1) (the seal); `--ease-inout` (.65,0,.35,1) (accordion, crossfades). Durations 200 / 500 / 750ms; brush marks 0.4–1.4s proportional to length (ichi 1.1s, ensō 1.4s).

## 3. Motion system

- **Page load (the one orchestrated moment).** 100ms eyebrow → 250/340ms headline lines rise inside overflow masks → 350–1450ms plate curtain (clip-path inset from the bottom) → 1250ms the 一 stroke draws (1.1s) finishing «Потом удар.» → 1450ms lead → 1600ms actions → 1800ms folio bar. Nothing else on the page moves until scrolled.
- **Scroll reveals.** `Reveal` (fade + 28px rise, once, margin −12%) and `LineReveal` (masked line rise) in reading order: rules → type → plate → brush, the brush always last.
- **Brush.** `Brush` draws once when in view; the accordion check and the timetable tick draw on state change; reduced motion prints the finished mark.
- **Hover language.** Colour swaps (ink → shu), row backgrounds paper-2, underline scaleX on nav links; transform-only lifts (1px). No custom cursor. No auto-advancing carousels.
- **Smooth scroll.** Lenis, lerp 0.085, duration 1.15, wheel only; disabled under `prefers-reduced-motion`. Motion runs under `MotionConfig reducedMotion="user"`.

## 4. Global chrome

- **Header** (fixed, 80px, transparent → 92% paper with blur and a hairline after 24px of scroll): logo lockup left; six mono links at ≥1280px («О клубе», «Тренировки», «Расписание», «Соревнования», «Галерея», «Контакты»); a running head «Глава 03 · Группы» (aria-live polite) at ≥1024px driven by the active chapter; RU/EN toggle (link to the other locale’s path); «Записаться» ink button at ≥768px; «Меню» below 1280px opens a full-screen paper menu with Prata links, the chapter contents and contacts (Escape closes, scroll locked, Lenis stopped). A skip link is the first focusable element.
- **Mobile bar.** 56px sticky bottom bar with the live next session and «Записаться», shown after 60% of the first viewport, hidden while chapter ten or the footer is in view.
- **Footer** (ink): the aphorism «Каждый чёрный пояс когда-то был белым.», the Kyokushin belt list with swatches, sections, contacts (address, coordinates 43°29′ N · 43°36′ E, phone, Telegram, Instagram, language link), the lockup with «Осу.», the colophon (fonts, KanjiVG credit, placeholder-photo note), and 押忍 printed at 8% in the corner.

## 5. Chapters

All copy lives in `src/content/home.ts` (RU source, EN mirror). Each chapter is a `<Chapter>` with its numeral and folio in the binding margin (≥768px) or an inline folio on phones, one `h2`, and exactly one brush mark unless noted.

| # | id | Ground | Designed idea | Brush mark | Plate |
|---|---|---|---|---|---|
| 一 | `hero` | paper | Headline spans the page; the plate sits beside the shorter second line; the 一 stroke completes «Потом удар.» and its tail crosses the plate’s corner; live next-session folio bar; scroll cue | ichi | heroPlate 3:4 (4:3 on phones), bw, priority |
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
- 1440: eyebrow row (mono left, italic aside «— с четырёх лет» right) → h1 across 12 columns, line 1 ink, line 2 ink-2 → stroke row (max 8.4em) → lead (44ch) and actions in columns 1–8 → plate in columns 9–12 raised one headline line so it sits beside line 2, with 極真 printed beside it → folio bar: hairline, live strip «Ближайшая тренировка · Сегодня 17:00 · Первый шаг · 4–6 лет · ул. Кирова, 157 →», scroll cue.
- 390: eyebrow, aside, three headline lines, stroke full width, 4:3 plate, lead, full-width buttons, Telegram link, folio strip.
- Load choreography as in §3.

## 6. Media

Every plate is a named slot in `src/content/media.ts` (src, dimensions, RU/EN alt, focal point). All current files are Wikimedia Commons placeholders under CC licences (credits in `public/media/placeholders/CREDITS.md`) and must be replaced with the club’s photography. Grading: `.plate-bw` (grayscale, sepia 0.12, contrast 1.05) is the default; `.plate-muted` for the morning spread; full colour only for the trophies plate and the coach’s hover state.

Shot list for the client: child bowing on the tatami (3:4, calm left third), coach portrait against a plain wall (3:4), trophies/medals (16:9, colour), park at 8am (21:9 and 4:5), kids in headgear sparring (4:5), adults group (16:9), belt grading group photo (3:2).

## 7. Internationalisation

Routes: `/` (RU, default) and `/en` (EN) from `src/app/[locale]`, both statically generated; `/ru/*` redirects to `/*`. Copy is a typed dictionary keyed by locale; components call `useLocale()`. Russian is the source language; long words are handled by `text-wrap: balance` on headlines, fluid clamp sizes, no `nowrap` on content, and hero sizing verified for «Сначала поклон.» at 1024–1920px.

## 8. Accessibility and performance

- AA contrast on both grounds; focus rings 2px shu on paper / shu-lift on ink; skip link; one h1, one h2 per chapter, `aria-labelledby`; accordion with `aria-expanded`/`aria-controls` and arrow keys; timetable has a mobile list alternative; buttons ≥44px; decorative SVG `aria-hidden`; live values (today, next session, sunrise) rendered after mount to avoid hydration mismatch.
- `prefers-reduced-motion`: reveals and brush marks render finished; Lenis off; marquee static.
- LCP: the hero headline text and one `priority` plate; fonts via `next/font` with size-adjusted fallbacks; AVIF/WebP via `next/image` with `sizes`; no video; no WebGL; grain is a static tile.

## 9. Component inventory

`layout/Header`, `layout/Footer`, `layout/MobileBar`, `layout/Chapter` + `ChapterContext`; `brush/Brush`, `brush/Kanji`, `brush/Seal`, `brush/marks`; `ui/Reveal`, `ui/LineReveal`, `ui/Marquee`, `ui/Grain`, `ui/Button`, `ui/Accordion`, `ui/Photo`, `ui/NextSessionStrip`; `sections/Hero`, `Kyokushin`, `Programs`, `Sensei`, `Results`, `Morning`, `Reviews`, `Schedule` (+ `Timetable`), `Faq`, `Join`; `providers/SmoothScroll`, `providers/MotionProvider`; `lib/schedule` (next session, timetable), `lib/sunrise` (NOAA); `content/home`, `content/schedule`, `content/media`, `content/nav`, `content/kanji`; `brand/Logo`.

## 10. Non-goals for this phase

Other pages, a CMS, a real form backend (the form validates and simulates success; wire it to Telegram/e-mail next), analytics, cookie banner, the client’s vector logo and real photography, confirmed facts (schedule, prices, decree number, second coach, reviews and consent).
