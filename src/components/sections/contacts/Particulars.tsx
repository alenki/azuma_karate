"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { localeHref } from "@/i18n/config";
import { particulars as copy, pendingParticulars } from "@/content/contacts";
import { chapters, sensei } from "@/content/home";
import { club } from "@/content/schedule";
import { CHAPTER_NUMERALS } from "@/components/layout/Chapter";
import { kanji } from "@/content/kanji";
import type { Pending } from "@/content/home";

/**
 * The register of particulars — the foot of «Ваша группа».
 *
 * Four entries on leaders: a label, a dotted rule carrying the eye across, a
 * value, and a LOCATOR. The leader is `--color-rule-hair`, whose note in
 * globals.css names this exact job — "separations inside a block: table rows,
 * list entries, definition leaders" — and which had never been used for one.
 *
 * THE LOCATOR IS WHAT MAKES THIS PAGE THE BOOK'S INDEX. Two of the four
 * entries end in the chapter of the home page that answers them in full, set
 * with that chapter's own binding numeral: 六 Запись, 四 Тренер. The numerals
 * ride the margin of every chapter on the home page as a counting device; here
 * they become the site's only map, and they cost one mono word per row.
 *
 * THE OTHER TWO END IN A ROUTE, because nobody has answered them. «Что взять»
 * and «Стоимость» are the two questions a parent asks straight after «в какую
 * группу», and both are `pendingFact`s: they print the ruled blank and what is
 * awaited, with Telegram beside them as the way to ask. A page that omitted
 * them would look finished and answer nothing.
 */
type Row = {
  label: string;
  /** Either a printed fact or a slot nobody has filled. */
  value: string | Pending;
  locator: { label: string; href: string; numeral?: string };
};

export function Particulars() {
  const { locale } = useLocale();

  /* the chapter a locator points at, with its own binding numeral — read off
     the same two tables the home page's margin is drawn from, so a chapter that
     is renumbered there is renumbered here */
  const chapterLink = (id: string) => {
    const c = chapters.find((ch) => ch.id === id)!;
    return {
      label: c.title[locale],
      href: `${localeHref(locale, "/")}#${c.id}`,
      numeral: kanji[CHAPTER_NUMERALS[c.index - 1]].char,
    };
  };
  const ask = { label: copy.ask[locale], href: club.telegram };

  const rows: Row[] = [
    { label: copy.trial[locale], value: copy.trialValue[locale], locator: chapterLink("join") },
    { label: copy.kit[locale], value: pendingParticulars.kit, locator: ask },
    { label: copy.price[locale], value: pendingParticulars.price, locator: ask },
    { label: copy.coach[locale], value: sensei.name[locale], locator: chapterLink("sensei") },
  ];

  return (
    <dl className="parts">
      {rows.map((row) => {
        const pending = typeof row.value !== "string";
        return (
          /*
            A <dl> row may wrap its pair in a <div>, and that <div> may contain
            NOTHING but <dt> and <dd> — so the leader and the locator live inside
            the <dd> rather than beside it, which they did until this comment was
            written. The layout is unaffected: the <dd> is the row's second track
            and carries its own three-column grid, and the locator's `min-width`
            is what stands the four of them on one vertical.
          */
          <div key={row.label} className="parts__row">
            <dt className="t-mono parts__label">{row.label}</dt>
            <dd className="parts__value">
              {/* the leader is ornament and is drawn BETWEEN the two, never
                  through them: a flex filler with a bottom rule, so nothing in
                  it is ever selected, read aloud or copied */}
              <span aria-hidden="true" className="parts__leader" />
              {pending ? (
                <span className="t-note parts__pending">
                  <span aria-hidden="true" className="parts__blank" />
                  <span className="parts__awaiting">{(row.value as Pending).awaiting[locale]}</span>
                </span>
              ) : (
                <span className="t-note parts__fact">{row.value as string}</span>
              )}
              <span className="parts__locator">
                {row.locator.numeral ? (
                  <Link href={row.locator.href} className="t-mono parts__link">
                    <span aria-hidden="true" className="parts__numeral">
                      {row.locator.numeral}
                    </span>
                    {/* the numeral is a printed mark and is hidden, so the
                        accessible name would otherwise be a bare chapter title
                        with nothing saying it IS a chapter. The word is added
                        BEFORE the visible label rather than replacing it, so the
                        name still contains what a speech-input user would say
                        (2.5.3 Label in Name). */}
                    <span className="sr-only">{copy.seeChapter[locale]} </span>
                    {row.locator.label}
                    <span aria-hidden="true"> →</span>
                  </Link>
                ) : (
                  <a href={row.locator.href} rel="noopener" className="t-mono parts__link">
                    {row.locator.label}
                    <span aria-hidden="true"> →</span>
                  </a>
                )}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
