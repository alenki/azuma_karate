"use client";

import "@/styles/sections/faq.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, faq } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Kanji } from "@/components/brush/Kanji";
import { Accordion } from "@/components/ui/Accordion";
import { LineReveal } from "@/components/ui/LineReveal";
import { RegisterMark } from "@/components/ui/RegisterMark";
import { Reveal } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "faq")!;
const HEADING_ID = "faq-title";

const ui = {
  ru: { ask: "Не нашли ответ — напишите в Telegram" },
  en: { ask: "Didn’t find the answer — message us on Telegram" },
} as const;

/**
 * Chapter 九 / 09 — «Вопросы».
 *
 * The parents' questions, typeset as the index at the back of a manual: a
 * number hanging in a rail, the question set in the display face across the
 * page, a hairline under every entry, and the chapter's one brush mark — the
 * red check drawn beside the question that is open, and un-drawn when it
 * closes, the way a reader ticks a manual and rubs the mark out again.
 *
 * The title does not travel with the list. It holds the left of the sheet
 * while the entries scroll past it, and on a wide page it becomes what it
 * really is: a title page, with the chapter's one way out — the Telegram
 * line — set at its foot under a rule, and the empty column between it and
 * the index ruled as a binding.
 *
 * The sheet is the viewport, not a centred column, so from 1600px up the
 * chapter re-columns from 4 + 7 to 5 + rule + 6, the question keeps growing
 * with the page instead of freezing at a size chosen for a 1312 column, and
 * the entry rules run off the right edge of the paper while the type and the
 * check stay on the trim. See `styles/sections/faq.css`, which also carries
 * the reasoning for every number, and note that `ui/Accordion.tsx` is shared
 * with other chapters and is styled from there by class name rather than
 * edited here.
 */
export function Faq() {
  const { locale } = useLocale();
  const t = faq;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="faq"
    >
      <div className="wrap faq__inner">
        {/* ---- running head: a trimmed sheet ---- */}
        <div className="faq__head-rule">
          <div className="rule" />
          <RegisterMark className="faq__reg faq__reg--start" />
          <RegisterMark className="faq__reg faq__reg--end" />
        </div>
        <Reveal delay={0.1} y={12} duration={0.8} className="faq__head-row">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="kyu" className="chapter__kanji" label={null} /> 09
          </span>
          {/* what a manual prints at the outer edge of a running head. Hidden
              from assistive technology because <Chapter> already announces
              «Вопросы — 09» once, in its own visually hidden line. */}
          <span className="t-mono faq__running" aria-hidden="true">
            {chapter.title[locale]} · 09
          </span>
        </Reveal>

        <div className="faq__body">
          <span className="faq__gutter" aria-hidden="true" />

          <div className="faq__title-col">
            <div className="faq__title-inner">
              <h2 id={HEADING_ID} className="t-chapter faq__title">
                <LineReveal as="span" className="block" lines={[t.title[locale]]} />
              </h2>
              <div className="faq__ask">
                <div className="faq__ask-rule" aria-hidden="true" />
                <Reveal delay={0.3}>
                  <a href={club.telegram} className="btn-text t-mono inline-flex min-h-11 items-center" rel="noopener">
                    {ui[locale].ask} <span aria-hidden="true" className="ml-2">→</span>
                  </a>
                </Reveal>
              </div>
            </div>
          </div>

          <div className="faq__list">
            <Reveal delay={0.15}>
              <Accordion
                brush
                defaultOpen={0}
                items={t.items.map((q, i) => ({
                  id: `faq-${i}`,
                  question: q.q[locale],
                  answer: <p className="max-w-[62ch]">{q.a[locale]}</p>,
                }))}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
