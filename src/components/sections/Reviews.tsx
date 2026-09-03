"use client";

import "@/styles/sections/reviews.css";

import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import { chapters, reviews } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { ChapterFoot } from "@/components/layout/ChapterFoot";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { LineReveal } from "@/components/ui/LineReveal";
import { Register, Reveal, Settle } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "reviews")!;
const HEADING_ID = "reviews-title";
/** the chapter's own two digits, printed at the head of every entry below */
const FOLIO = String(chapter.index).padStart(2, "0");

type ReviewItem = (typeof reviews.items)[number];

/**
 * One testimony, set as a ruled entry of the manual.
 *
 * Every entry opens exactly the way the chapter does — a hairline across the
 * whole trim with a counted mark at each end: the plate number «07 · 01» at
 * the binding and the parent's group at the fore-edge. That rule is the
 * composition's spine: it carries ink into the outer columns on all three
 * rows, so the testimony underneath is free to sit wherever the walk wants it
 * without leaving the sheet's edges bare.
 *
 * The testimony itself is then indented and sized BY THE ENTRY (`--col-a`,
 * `--col-b`, `--size` in `reviews.css`), which is what turns three quotes into
 * a spread rather than a stack.
 *
 * The plate number is `aria-hidden` for the same reason the colophon's folio
 * is: <Chapter> already announces "Что говорят дома — 07" once, and three more
 * readings of those two digits inside it are noise. The group beside it is
 * read, so it stays.
 */
function Testimony({ item, locale, n }: { item: ReviewItem; locale: Locale; n: number }) {
  return (
    <figure className={`reviews__item reviews__item--${n + 1} m-0`}>
      <div className="rule reviews__entry-rule" />
      <Register className="reviews__entry-head" delay={0.05} stagger={0.08} duration={0.6} x={-12}>
        <span className="t-mono reviews__quiet" aria-hidden="true">
          {FOLIO}
          {" · "}
          {String(n + 1).padStart(2, "0")}
        </span>
        <span className="t-mono reviews__quiet">{item.group[locale]}</span>
      </Register>

      {/* The brackets are the anchor's own children, so the hang is measured
          from the text block and not from the entry's track: `relative` has to
          sit on the element the type actually starts at. */}
      <blockquote className="reviews__quote-block m-0">
        <Reveal className="relative" y={18} duration={0.85} delay={0.05}>
          <Brush kind="bracketL" className="reviews__bracket reviews__bracket--open" delay={0.15} />
          <span className="t-statement reviews__quote">{item.quote[locale]}</span>
          <Brush kind="bracketR" className="reviews__bracket reviews__bracket--close" delay={0.7} />
        </Reveal>
      </blockquote>

      <figcaption className="reviews__caption">
        <Settle delay={0.85}>
          <p className="t-caption reviews__who">{item.who[locale]}</p>
        </Settle>
      </figcaption>
    </figure>
  );
}

/**
 * Chapter 七 / 07 — «Слова родителей».
 *
 * All three testimonies, printed. This chapter used to be a carousel: one
 * quote on the sheet, an «01 / 03» counter and two bordered arrow boxes — the
 * only bordered box in the manual — with the other two thirds of the club's
 * testimony behind a next button, and a hidden sizer holding the cell open at
 * the height of the longest quote so the two shorter ones each reserved a gap
 * the reader could not account for. A printed manual does not page through its
 * own testimonials, and the mechanism was also what emptied the sheet: the
 * chapter carried the lowest ink coverage on the page, with its right third
 * and bottom fifth blank.
 *
 * So the chapter is a spread now. Three ruled entries down the sheet, each
 * opened by a hairline that runs the full trim, with the testimony indented
 * differently under each and set one size smaller than the one above it — the
 * first is the chapter's monument, the second and third are its corroboration.
 * The indents walk left → right → left, so the eye crosses the page three
 * times instead of reading a column, and nothing is hidden behind a control.
 *
 * Motion follows the reading rather than repeating one gesture: the entry's
 * head comes into <Register> along its rule, the quote arrives with <Reveal>,
 * the sensei's brackets are drawn around it by hand — the opening one before
 * the words, the closing one after they have landed — and the attribution is
 * <Settle>d under it like a caption under a plate.
 *
 * The brackets are ink, not vermilion. They are aria-hidden ornament, and six
 * red marks on one sheet is a brand colour rather than an accent; red on this
 * page belongs to the sensei's own strokes and the seal.
 */
export function Reviews() {
  const { locale } = useLocale();
  const t = reviews;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="reviews relative overflow-hidden"
    >
      <div className="wrap reviews__inner">
        {/* ---- running head ---- */}
        <div className="rule" />
        <Register className="reviews__head" delay={0.1} stagger={0.08} duration={0.7} x={-12}>
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="shichi" className="chapter__kanji" label={null} /> {FOLIO}
          </span>
        </Register>

        <h2 id={HEADING_ID} className="reviews__title t-chapter">
          <LineReveal as="span" className="block" lines={[t.title[locale]]} />
        </h2>

        {/* ---- the spread ----
            Each entry's place on the twelve-column field is set in
            `reviews.css` (`.reviews__item--1|2|3`), not here. */}
        <div className="reviews__spread">
          {t.items.map((item, n) => (
            <Testimony key={n} item={item} locale={locale} n={n} />
          ))}
        </div>

        <ChapterFoot index={chapter.index} />
      </div>
    </Chapter>
  );
}
