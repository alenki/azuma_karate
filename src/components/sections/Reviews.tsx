"use client";

import "@/styles/sections/reviews.css";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState, type KeyboardEvent } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";
import { chapters, reviews } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, EASE_OUT_EXPO } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "reviews")!;
const HEADING_ID = "reviews-title";

type ReviewItem = (typeof reviews.items)[number];

/**
 * One quote, set as the chapter's monument.
 *
 * The same markup is printed twice: once live, and once per item inside the
 * height sizer, where it is invisible and only there to reserve the tallest
 * quote's height (see `reviews.css`). The ghost prints an empty box of the
 * bracket's own proportion instead of the drawn mark — a hidden `Brush` would
 * mount three more animated SVGs to draw something nobody can see.
 */
function QuoteBody({ item, locale, ghost = false }: { item: ReviewItem; locale: Locale; ghost?: boolean }) {
  return (
    <>
      <blockquote className="relative m-0">
        {ghost ? (
          <span className="reviews__bracket reviews__bracket--ghost reviews__bracket--open" />
        ) : (
          <Brush
            kind="bracketL"
            className="reviews__bracket reviews__bracket--open text-shu"
            trigger="load"
            delay={0.1}
          />
        )}
        <span className="t-statement reviews__quote">{item.quote[locale]}</span>
        {ghost ? (
          <span className="reviews__bracket reviews__bracket--ghost reviews__bracket--close" />
        ) : (
          <Brush
            kind="bracketR"
            className="reviews__bracket reviews__bracket--close text-shu"
            trigger="load"
            delay={0.55}
          />
        )}
      </blockquote>
      <figcaption className="reviews__caption">
        <p className="t-caption text-ink">{item.who[locale]}</p>
        <p className="t-mono reviews__quiet mt-1">{item.group[locale]}</p>
      </figcaption>
    </>
  );
}

/**
 * Chapter 七 / 07 — «Слова родителей».
 *
 * One quote at a time, large, with the chapter's brush marks: Japanese corner
 * brackets drawn around it — the opening one first, the closing one after the
 * words have landed. Switching quotes remounts the pair, so the brush draws
 * them again by hand. Nothing advances on its own.
 *
 * On the full-viewport sheet the chapter is composed as a page and not as a
 * centred card: running head and title on the trim, the quote indented two
 * columns so the opening bracket has a margin to hang in, the arrows and the
 * counter at the far right on the attribution's line, and a closing hairline
 * across the whole trim holding the two ends together. The measurements and
 * the reasons are in `reviews.css`.
 */
export function Reviews() {
  const { locale } = useLocale();
  const t = reviews;
  const [i, setI] = useState(0);
  const count = t.items.length;
  const item = t.items[i];

  const go = useCallback((step: number) => setI((prev) => (prev + step + count) % count), [count]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };

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
        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="shichi" className="chapter__kanji" label={null} /> 07
          </span>
        </Reveal>

        <h2 id={HEADING_ID} className="reviews__title t-chapter">
          <LineReveal as="span" className="block" lines={[t.title[locale]]} />
        </h2>

        {/* ---- the quote, and the controls at the other end of the sheet ----
            The twelve-column field and both blocks' places on it are set in
            `reviews.css` (`.reviews__region`), not here. */}
        <div
          className="reviews__region"
          role="group"
          aria-roledescription={locale === "ru" ? "отзывы" : "reviews"}
          aria-label={t.title[locale]}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="reviews__stack">
            {/* The height sizer: every quote at once, invisible and out of the
                accessibility tree, so switching quotes never shifts the page
                and the controls always meet the attribution's line. */}
            <div className="reviews__sizer" aria-hidden="true">
              {t.items.map((ghostItem, n) => (
                <figure key={n} className="reviews__figure m-0">
                  <QuoteBody item={ghostItem} locale={locale} ghost />
                </figure>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={i}
                className="reviews__figure reviews__figure--live m-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
              >
                <QuoteBody item={item} locale={locale} />
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* ---- controls ---- */}
          <div className="reviews__nav">
            <div className="flex">
              <button type="button" className="reviews__btn" onClick={() => go(-1)} aria-label={t.prev[locale]}>
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" className="reviews__btn" onClick={() => go(1)} aria-label={t.next[locale]}>
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="t-mono reviews__quiet" aria-live="polite">
              {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* the rule the attribution and the controls both hang off */}
        <div className="rule reviews__rule-close" />
      </div>
    </Chapter>
  );
}
