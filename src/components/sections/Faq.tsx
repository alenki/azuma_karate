"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, faq } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Kanji } from "@/components/brush/Kanji";
import { Accordion } from "@/components/ui/Accordion";
import { LineReveal } from "@/components/ui/LineReveal";
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
 * The parents' questions, typeset as a printed list: the title holds the left
 * column while the answers scroll past it, and the chapter's brush mark is the
 * red check drawn beside the question that is open — and un-drawn when it
 * closes, the way a reader ticks a manual and rubs the mark out again.
 */
export function Faq() {
  const { locale } = useLocale();
  const t = faq;

  return (
    <Chapter id={chapter.id} index={chapter.index} title={chapter.title[locale]} labelledBy={HEADING_ID}>
      <div className="wrap py-24 md:py-36">
        <div className="rule" />
        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="kyu" className="chapter__kanji" label={null} /> 09
          </span>
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-10 md:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <h2 id={HEADING_ID} className="t-chapter">
                <LineReveal as="span" className="block" lines={[t.title[locale]]} />
              </h2>
              <Reveal delay={0.3} className="mt-8">
                <a href={club.telegram} className="btn-text t-mono inline-flex min-h-11 items-center" rel="noopener">
                  {ui[locale].ask} <span aria-hidden="true" className="ml-2">→</span>
                </a>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
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
