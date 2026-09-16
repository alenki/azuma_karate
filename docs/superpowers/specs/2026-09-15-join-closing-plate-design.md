# Chapter 六 «Запись» — the closing plate

2026-09-15. Supersedes the three-band sign-up spread described in
`2026-09-01-sk-azuma-home-design.md` for this chapter only.

## Why

The chapter carried a four-field enquiry form that had nowhere to post. Its
`Status` type said so in as many words: `"idle" | "unsent"`, with a notice whose
job was to admit that nothing had left the page and hand the reader the club's
Telegram instead. That was the honest shape for a form with no route.

The route now exists, and it is not a route — it is a page. `/contacts` ships
`Door` / `GroupBand` / `Letter`, and `Letter` is the enquiry, assembled in the
reader's own browser and carried across to Telegram. Two asks for one act, one
of which cannot complete, is one ask too many.

So chapter 六 stops collecting and starts closing. It becomes the last plate of
the manual: a statement, a mark, and one door out.

## The plate

Five things, centred on the full-bleed ink sheet. Centring is the exception this
chapter earns and no other one does — it is the last page, which is the one page
a printed manual centres.

1. **The watermark — 押忍.** `content/kanji.ts` already carries `ou` and `su` as
   KanjiVG stroke paths, and `<Kanji>` already renders them through the same
   taper table as the chapter numerals. So the ghost is drawn, never typeset:
   the page ships two Latin faces and one mono and no CJK at all, so a text node
   here would resolve to Yu Gothic on Windows and Hiragino on macOS and to
   tofu where neither exists. As vectors it is the book's own type on every
   machine. Printed static, `draw={false}` — the one hand-made mark in this
   chapter is the sensei's brush, and a watermark that writes itself is a
   different claim entirely.
2. **The title.** «Первая тренировка», `.t-chapter`, through `LineReveal`.
3. **One line.** The lead is rewritten: the old one instructed the reader to
   leave a name and age *on this sheet*, which stops being true.
4. **The act.** The ensō keeps its job; the word inside it becomes a link to
   `/contacts` rather than a submit. The ring is drawn once and stays drawn.
5. **The exit.** A hairline, then `join.alt` and `join.trust` — the Telegram
   route, which is the only route that has ever actually worked here.

## Deleted, and why each one goes

| gone | reason |
|---|---|
| the four fields, labels, placeholders | the enquiry is `Letter` on `/contacts` |
| `validate` / `onBlur` / `errors` | nothing left to validate |
| the `Status` machine and `join-notice` | a live region with nothing to announce |
| the honeypot | it guarded a submit that no longer exists |
| the consent line (`join.privacy`) | **this is the load-bearing one.** No personal data is collected on this sheet any more. A 152-ФЗ consent printed under a form that is not there is false apparatus — it tells the reader they have agreed to something by pressing a button that only navigates. The consent belongs to `Letter`, where the data actually is. |

## Copy

`content/home.ts`, the `join` block. One string changes:

    lead.ru  «Оставьте заявку\u00A0— мы подберём группу.»
    lead.en  "Leave a request\u00A0— we will suggest a group."

No new fact is asserted. Both claims already live in the block. Nothing about
price, or a free first session, is invented — those remain pending.

Bound spaces per the Russian convention: before the em dash, written as the
escape and never as a literal U+00A0.

The strings the form used — `fields`, `placeholders`, `errors`, `sending`,
`success`, `error` — are left in place and marked dead in a comment rather than
deleted: `home.ts` is being edited by a concurrent session, and `contacts.ts`
still names `join.privacy` and `join.trust` in its own reasoning. They get swept
in one pass once `/contacts` settles.

## The CTA's destination

`/contacts`, the top of the page — not `#letter`. The reader arrives at «Дверь»:
the address, the hall, the live session line, then their group, then the letter.
That is the page's intended reading order and the door is the better first
impression.

## Known consequence, not fixed here

`app/[locale]/contacts/page.tsx:88` points that page's mobile-bar «Записаться»
back at home chapter 六, reasoning that "this page's own act is a letter, not a
booking". With 六 now pointing at `/contacts`, that is a round trip. The file
belongs to another session in flight and is not edited here.

Related: `content/nav.ts` still sends the header and mobile-bar CTA to `#join`,
so «Записаться» in the chrome is now two clicks from the form. Re-pointing it at
`/contacts` is a site-wide change and is out of scope for this chapter.

## Colour

Unchanged, and the rota is not bent. The only vermilion on the plate is the
ensō — a `<Brush>` mark, which is one of red's three jobs. The watermark is an
opaque tone mixed from `--color-bone` into `--color-ink`, not a translucent
bone: `<Kanji>` paints each stroke as seven overlapping taper passes, and seven
stacked alphas would compound into a glyph several times darker than asked for.
It is ornament, never text, and is `aria-hidden`, so no contrast floor applies —
but it must stay under the tone where it starts competing with the title.
