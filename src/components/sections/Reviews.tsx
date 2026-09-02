"use client";

import "@/styles/sections/reviews.css";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState, type KeyboardEvent } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, reviews } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, EASE_OUT_EXPO } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "reviews")!;
const HEADING_ID = "reviews-title";

/**
 * Chapter 七 / 07 — «Слова родителей».
 *
 * One quote at a time, large, with the chapter's brush marks: Japanese corner
 * brackets drawn around it — the opening one first, the closing one after the
 * words have landed. Switching quotes remounts the pair, so the brush draws
 * them again by hand. Nothing advances on its own.
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
      <div className="wrap py-24 md:py-36">
        <div className="rule" />
        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="shichi" className="chapter__kanji" label={null} /> 07
          </span>
        </Reveal>

        <h2 id={HEADING_ID} className="t-chapter mt-10 max-w-[16ch] md:mt-14">
          <LineReveal as="span" className="block" lines={[t.title[locale]]} />
        </h2>

        {/* ---- the quote ---- */}
        <div
          className="reviews__region mt-16 md:mt-24"
          role="group"
          aria-roledescription={locale === "ru" ? "отзывы" : "reviews"}
          aria-label={t.title[locale]}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={i}
              className="reviews__figure m-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            >
              <blockquote className="relative m-0">
                <Brush
                  kind="bracketL"
                  className="reviews__bracket reviews__bracket--open text-shu"
                  trigger="load"
                  delay={0.1}
                />
                <span className="t-statement">{item.quote[locale]}</span>
                <Brush
                  kind="bracketR"
                  className="reviews__bracket reviews__bracket--close text-shu"
                  trigger="load"
                  delay={0.55}
                />
              </blockquote>
              <figcaption className="mt-8">
                <p className="t-caption text-ink">{item.who[locale]}</p>
                <p className="t-mono mt-1 text-ink-3">{item.group[locale]}</p>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          {/* ---- controls ---- */}
          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="flex">
              <button type="button" className="reviews__btn" onClick={() => go(-1)} aria-label={t.prev[locale]}>
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" className="reviews__btn" onClick={() => go(1)} aria-label={t.next[locale]}>
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="t-mono text-ink-3" aria-live="polite">
              {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
