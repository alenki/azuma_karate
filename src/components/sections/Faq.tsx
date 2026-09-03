"use client";

import "@/styles/sections/faq.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, faq } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { ChapterFoot } from "@/components/layout/ChapterFoot";
import { Kanji } from "@/components/brush/Kanji";
import { Accordion } from "@/components/ui/Accordion";
import { LineReveal } from "@/components/ui/LineReveal";
import { RegisterMark } from "@/components/ui/RegisterMark";
import { Register } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "faq")!;
const HEADING_ID = "faq-title";

const ui = {
  ru: {
    hint: "Нажмите на строку — ответ раскроется под вопросом.",
    count: "Вопросов",
    ask: "Написать в Telegram",
    foot: "Не нашли свой вопрос — спросите в Telegram, отвечаем в тот же день.",
  },
  en: {
    hint: "Tap a line — the answer opens underneath the question.",
    count: "Questions",
    ask: "Message on Telegram",
    foot: "A question that is not here — ask on Telegram; we answer the same day.",
  },
} as const;

/**
 * How each entry is classified — the register's third field.
 *
 * These are page furniture rather than copy: one word per entry, set in the
 * mono, ranged to the trim, so the seven rows can be scanned by subject
 * instead of read one by one. They are keyed to `faq.items` BY POSITION, and
 * that is the one thing wrong with them — they belong beside the questions in
 * `content/home.ts`, and should move there the next time that file is opened.
 * Until they do, a row whose tag is missing simply prints without one rather
 * than printing the wrong one.
 */
const topics = [
  { ru: "Возраст", en: "Age" },
  { ru: "Экипировка", en: "Kit" },
  { ru: "Безопасность", en: "Safety" },
  { ru: "Оплата", en: "Fees" },
  { ru: "Турниры", en: "Tournaments" },
  { ru: "Документы", en: "Paperwork" },
  { ru: "Взрослые", en: "Adults" },
] as const;

/**
 * Chapter 九 / 09 — «Вопросы».
 *
 * The parents' questions, typeset as a REGISTER: full-trim ruled rows on the
 * model of the chronicle in chapter five — the ordinal hanging in the binding
 * columns, the question set at display size across the middle of the sheet,
 * its subject ranged to the trim, and the answer opening in place beneath its
 * own question. The chapter's one brush mark is the red check ticked beside
 * the row that is open, and un-drawn when it closes, the way a reader ticks a
 * manual and rubs the mark out again.
 *
 * It used to be a two-column slab — the title jammed into the left four
 * columns, a stock accordion in the right seven — which broke «Что / нужно, /
 * чтобы / начать?» into four stubs led by a three-letter orphan and left a
 * 230px channel of blank paper running the full height of the chapter between
 * the two. The title is a full-trim line now, where it sets on one line in
 * either language from 768 up and fills about four fifths of the sheet; the
 * register runs the whole trim under it; and the way out of the chapter —
 * the Telegram line that used to hang at the foot of the title column — is a
 * <ChapterFoot>, the same bracket the other chapters close with.
 *
 * The register head states the fields before the first entry: the sentence
 * that says a row opens, set in the question's own columns, and the count of
 * the entries ranged right where each row's tag will be. See
 * `styles/sections/faq.css` for the arithmetic, and note that
 * `ui/Accordion.tsx` prints the rows' semantics and this chapter's stylesheet
 * places them.
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
          <div className="rule rule--strong" />
          <RegisterMark className="faq__reg faq__reg--start" />
          <RegisterMark className="faq__reg faq__reg--end" />
        </div>
        <Register className="faq__head-row" delay={0.1} duration={0.7} stagger={0.08}>
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
        </Register>

        <h2 id={HEADING_ID} className="t-chapter faq__title">
          <LineReveal as="span" className="block" lines={[t.title[locale]]} />
        </h2>

        <div className="faq__register">
          <div className="rule" />
          {/*
            The head of the register. Its two fields stand on the same
            verticals the entries do — the sentence in the question's columns,
            the count where every row's tag is ranged — so the reader knows
            what the columns are before the first hairline. It comes into
            register along that line rather than rising into it.
          */}
          <Register className="faq__register-head" delay={0.15} duration={0.7} stagger={0.08} x={-10}>
            <p className="t-note faq__hint">{ui[locale].hint}</p>
            <p className="t-mono faq__count">
              {ui[locale].count} · {String(t.items.length).padStart(2, "0")}
            </p>
          </Register>

          <Accordion
            brush
            defaultOpen={0}
            items={t.items.map((q, i) => ({
              id: `faq-${i}`,
              question: q.q[locale],
              tag: topics[i]?.[locale],
              answer: <p className="max-w-[62ch]">{q.a[locale]}</p>,
            }))}
          />
          <div className="rule" />
        </div>

        {/* The chapter's exit. `rule={false}` because the register closes
            itself with a hairline a finger's width above, and two rules that
            close together are a printing error, not a colophon. */}
        <ChapterFoot
          rule={false}
          index={chapter.index}
          note={ui[locale].foot}
          links={[{ href: club.telegram, label: ui[locale].ask }]}
        />
      </div>
    </Chapter>
  );
}
