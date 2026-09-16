"use client";

import "@/styles/sections/join.css";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, join } from "@/content/home";
import { club } from "@/content/schedule";
import type { KanjiId } from "@/content/kanji";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { Grain } from "@/components/ui/Grain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "join")!;
const HEADING_ID = "join-title";

/**
 * 押忍 — the watermark, and the only thing on this sheet that is not read.
 *
 * DRAWN, NOT TYPESET, and that is not a stylistic preference. The page ships
 * two Latin faces and one mono and no CJK whatsoever, so a text node here would
 * resolve to Yu Gothic on Windows, Hiragino on macOS, Noto on a Linux box that
 * happens to have it and tofu on one that does not — four different marks at
 * the size of a headline. `content/kanji.ts` already holds both characters as
 * KanjiVG centrelines, and `<Kanji>` already strokes them through the same
 * taper table as the chapter numerals 一…六, so the glyph below is the same
 * printed type as the numeral in the binding margin, on every machine.
 *
 * It is never DRAWN in the animated sense (`draw` stays false). The one
 * hand-made mark in this chapter is the sensei's brush; a watermark that
 * writes itself in front of the reader is a different claim entirely, and it
 * would also be the second gesture competing with the ensō below it.
 */
const GHOST: readonly KanjiId[] = ["ou", "su"];

/**
 * Chapter 六 / 06 — «Запись». The last plate of the manual.
 *
 * WHAT THIS CHAPTER STOPPED DOING. It carried a four-field enquiry form whose
 * own `Status` type admitted the problem in as many words — `"idle" | "unsent"`
 * — because there was no bot token, no chat id, and no confirmed channel for an
 * enquiry to land in. Pressing the button validated the entry and then told the
 * reader, honestly, that nothing had left the page.
 *
 * The route exists now, and it turned out not to be a route but a page.
 * `/contacts` ships «Дверь», «Ваша группа» and «Письмо», and «Письмо» is the
 * enquiry — assembled in the reader's own browser and carried across. Two asks
 * for one act, one of which cannot complete, is one ask too many. So this
 * chapter stops collecting and starts closing.
 *
 * FIVE THINGS, CENTRED, and the centring is the exception this chapter earns
 * and no other one does. `.wrap` is still the trim and there is still no centred
 * column anywhere in this book — what is centred here is the CONTENT of the last
 * sheet, which is the one sheet a printed manual does centre. Chapter 五 above
 * it is ranged left like every other; the change of axis is how the reader knows
 * the book has ended.
 *
 *   the watermark   押忍, at the size of the sheet, a tone off the ground
 *   the title       «Первая тренировка», over the watermark's lower third
 *   one line        what happens if you press
 *   the act         the ensō, with the door inside it
 *   the exit        a hairline, then the Telegram route and what it promises
 *
 * THE ENSŌ NOW HOLDS A DOOR, NOT A SUBMIT. The ring is drawn once and stays
 * drawn — it is the chapter's closing mark, never a progress indicator — and
 * the thing inside it is an <a>, because the act it performs is navigation.
 * There is no consent line under it any more: no personal data is collected on
 * this sheet, and a 152-ФЗ consent printed beneath a button that only navigates
 * tells the reader they have agreed to something they have not. That line
 * belongs to «Письмо», where the data actually is.
 */
export function Join() {
  const { locale, href } = useLocale();
  const t = join;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      ground="ink"
      /* `overflow-x-clip`, never `overflow-hidden`: hidden on either axis makes
         this section its own scroll container, which would pin the sticky
         binding numeral at the chapter head and undo the rail. Clip holds the
         watermark's overhang inside the paper without that side effect. */
      className="join relative overflow-x-clip"
      bleed={<Grain opacity={0.22} />}
    >
      <div className="join__sheet wrap relative z-10">
        <div className="join__plate">
          {/* ---- the watermark and the title, in that order and in one box ----
              The glyphs are positioned OUT of flow so the title alone sets the
              height of this block. In flow they would be two 400px squares
              deciding the chapter's proportions, and the mark would stop being
              a watermark and start being a picture with a caption. */}
          <div className="join__head">
            <div className="join__ghost" aria-hidden="true">
              {GHOST.map((id) => (
                <Kanji key={id} id={id} className="join__ghost-glyph" weight={5.5} label={null} />
              ))}
            </div>

            <h2 id={HEADING_ID} className="t-chapter">
              <LineReveal as="span" className="block" lines={[t.title[locale]]} />
            </h2>
          </div>

          <Reveal delay={0.2} className="join__lead-band">
            <p className="t-lead join__lead">{t.lead[locale]}</p>
          </Reveal>

          {/* ---- the act ---- */}
          <Reveal delay={0.34} className="join__act-band">
            <div className="join-act">
              <Brush kind="enso" className="join-enso" delay={0.5} />
              <Link href={href("/contacts")} className="join-cta t-mono">
                {t.submit[locale]}
              </Link>
            </div>
          </Reveal>

          {/* ---- the exit ----
              Still «или напишите в Telegram»: the word «или» is doing real work
              now that the thing it offers an alternative TO is a page rather
              than a form. The trust line stays with it rather than following
              the lead, so that what the club promises is printed next to the
              route that delivers it. */}
          <Reveal delay={0.46} className="join__exit">
            <div className="rule rule--hair join__exit-rule" />
            <a href={club.telegram} className="join-out t-note" rel="noopener">
              <span className="join-out__label">{t.alt[locale]}</span>
              <span aria-hidden="true" className="join-out__arrow">
                →
              </span>
            </a>
            <p className="t-note join__trust">{t.trust[locale]}</p>
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
