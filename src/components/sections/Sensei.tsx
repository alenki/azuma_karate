"use client";

import "@/styles/sections/sensei.css";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, isPending, sensei } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { ChapterFoot } from "@/components/layout/ChapterFoot";
import { Kanji } from "@/components/brush/Kanji";
import { Seal } from "@/components/brush/Seal";
import { Photo } from "@/components/ui/Photo";
import { Curtain } from "@/components/ui/Curtain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Register, Reveal, Settle } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "sensei")!;
const HEADING_ID = "sensei-heading";

/* The only string in this chapter that is not a fact about the club: the label
   on the reader's own control. Everything else comes from the content model. */
const ui = {
  ru: { colour: "Показать в цвете" },
  en: { colour: "Show in colour" },
} as const;

/*
  The plate's share of the sheet, expressed the way the CSS lays it out.
  `.wrap` is the trim, so the field is 100vw − 2 × gutter ≈ 92.8vw, and the
  plate takes five of its twelve columns up to 2000 (≈ 38vw, requested as 40)
  and four of them above it (≈ 30vw, requested as 32). The first matching
  condition wins, so the widest breakpoint has to be listed first.
*/
const PLATE_SIZES =
  "(min-width: 2000px) 32vw, (min-width: 1024px) 40vw, (min-width: 768px) 26rem, 100vw";

/**
 * Chapter 四 / 04 — «Тренер».
 *
 * The chapter was a two-column slab — portrait left, biography right — that ran
 * out of biography about four hundred pixels before the sheet ended and left
 * the bottom-left quadrant as blank paper. It is set as four ruled registers
 * now, and the two that were missing are the two that hold the bottom:
 *
 *   I   the head        the chapter's opening rule, bleeding to the paper
 *                       edge, with the plate breaking upward across it.
 *   II  the plate and   the portrait ranged to the binding trim, the
 *       the biography   biography ranged to the right trim. The headline is
 *                       the one thing here that does not hold its column edge:
 *                       from 1600 it hangs one page column into the field and
 *                       stands a single gap from the photograph.
 *   III the word        the quote LEAVES the biography column and crosses the
 *                       whole sheet from the binding — which is exactly the
 *                       quadrant that used to be empty — and the seal, the
 *                       chapter's single brush mark, is stamped at the outer
 *                       trim with the signature under it.
 *   IV  the register    the second coach, set as a register row across the
 *                       trim, and closed by the chapter's folio.
 *
 * Two facts in this chapter are not the club's yet — the decree's number and
 * the second coach's name. Both print as `PENDING SLOT` below: the label and
 * the ruled line stay, the value is a blank, and a mono note says what is
 * missing. Nothing is invented in the display face.
 */
export function Sensei() {
  const { locale } = useLocale();
  const [colour, setColour] = useState(false);
  const t = sensei;

  /* first name / surname on their own lines — both locales are two words */
  const nameLines = t.name[locale].split(" ");

  /*
    The two facts the club has not given yet. Both are `pendingText()`, so they
    still READ as the blank mark for any consumer that does not know the
    convention; this one does, so it asks. The values are taken first and the
    question second: what a pending fact holds is what to print WHEN it lands,
    and `awaiting` is what to print until it does.
  */
  const decreeRef = t.decreeRef[locale];
  const secondName = t.second.name[locale];
  const decreeRefAwaiting = isPending(t.decreeRef) ? t.decreeRef.awaiting[locale] : null;
  const secondNameAwaiting = isPending(t.second.name) ? t.second.name.awaiting[locale] : null;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="sensei"
    >
      <div className="wrap sensei__inner">
        {/* mobile folio — the binding margin does not exist on phones */}
        <span className="folio-inline t-mono mb-5">
          <Kanji id="shi" className="chapter__kanji" label={null} /> 04
        </span>

        {/* I · the head. The chapter's own opening rule — the heaviest of the
            three hairlines, one per chapter — with the plate crossing it. */}
        <div className="rule rule--strong sensei__rule" />

        <div className="sensei-body">
          {/* ---- II · the plate, ranged to the binding trim ---- */}
          <figure className="sensei-figure" data-colour={colour ? "on" : "off"}>
            <Curtain className="sensei-plate aspect-[4/5] lg:aspect-[3/4]" duration={1.2}>
              <Photo slot="coachPortrait" priority={false} sizes={PLATE_SIZES} />
              {/*
                The second pass. The colour print is not dissolved in over the
                grade — it is uncovered by a front travelling across the plate,
                the same verb <Curtain> opens a plate with, because a plate is
                printed pass by pass and never cross-faded. The front is CSS
                (`clip-path`), so `prefers-reduced-motion` withdraws it in the
                stylesheet and the reader still gets the colour.
              */}
              <div className="sensei-plate__color" aria-hidden="true">
                <Photo slot="coachPortrait" grade="color" priority={false} sizes={PLATE_SIZES} />
              </div>
            </Curtain>

            {/* the plate's apparatus: its number, and the reader's control.
                On a wide sheet the two become one ruled caption line the width
                of the plate. The caption is printed, not flown in. */}
            <figcaption className="sensei-apparatus">
              <Settle delay={0.25} className="sensei-apparatus__caption">
                <p className="t-caption text-ink-2">{t.plateCaption[locale]}</p>
              </Settle>
              <button
                type="button"
                className="sensei-toggle t-mono"
                aria-pressed={colour}
                onClick={() => setColour((v) => !v)}
              >
                <span className="sensei-toggle__dot" aria-hidden="true" />
                <span className="sensei-toggle__label">{ui[locale].colour}</span>
              </button>
            </figcaption>
          </figure>

          {/* ---- II · the biography, ranged to the right trim ---- */}
          <div className="sensei-text">
            <Settle delay={0.1} className="sensei-full">
              <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
            </Settle>

            <h2 id={HEADING_ID} className="sensei-name sensei-full t-chapter">
              <LineReveal
                as="span"
                className="block"
                lines={nameLines}
                label={t.name[locale]}
                delay={0.15}
                stagger={0.1}
              />
            </h2>

            <Reveal delay={0.3} className="sensei-rank">
              <p className="t-statement sensei-rank__line">{t.rank[locale]}</p>
            </Reveal>

            {/* The citation. It is READ, so it is set in `.t-note` — the mono
                voice for matter that is read — not in tracked all-caps. On a
                wide sheet it moves out of the reading column into the outer
                margin and is ruled off as the printed reference it is. */}
            <Reveal delay={0.35} className="sensei-decree">
              <p className="t-note sensei-decree__note">{t.decree[locale]}</p>
              <p className="sensei-ref">
                <span className="t-mono sensei-ref__label">{t.decreeRefLabel[locale]}</span>
                {decreeRefAwaiting ? (
                  <>
                    <span className="sensei-ref__blank" aria-hidden="true" />
                    <span className="t-note sensei-ref__await">{decreeRefAwaiting}</span>
                  </>
                ) : (
                  <span className="t-note sensei-ref__value">{decreeRef}</span>
                )}
              </p>
            </Reveal>

            <Reveal delay={0.4} className="sensei-full">
              <div className="rule sensei-bio__rule" />
              <p className="t-lead sensei-bio">{t.bio[locale]}</p>
            </Reveal>
          </div>

          {/* ---- III · the word. The quote crosses the whole sheet from the
                  binding; the seal is stamped at the outer trim and the
                  signature settles under it. A seal may overlap a rule or a
                  margin; it may not overlap running text, and here it has a
                  register of its own so it can never reach any. ---- */}
          <div className="sensei-word">
            <Reveal delay={0.1} className="sensei-word__quote">
              <blockquote className="sensei-quote t-accent">
                <p>{t.quote[locale]}</p>
              </blockquote>
            </Reveal>
            <div className="sensei-stamp">
              <Seal className="sensei-seal" delay={0.35} />
              <Settle delay={0.55} from={1.04}>
                <p className="sensei-signature t-accent">{t.signature[locale]}</p>
              </Settle>
            </div>
          </div>

          {/*
            IV · the closing register — the second coach. Three fields coming
            into register along one baseline, which is what <Register> is for:
            this is a tabulated row, not a copy block, and a vertical rise would
            break the line the three fields share.

            The club has not given the name. It used to print «Имя Фамилия» in
            Prata at heading size, under a real label and above a real
            credential — an invented person, typeset as production copy. It
            prints as a ruled blank now; the mono note beside it says what is
            missing, and it is the note, not the rule, that assistive
            technology reads.
          */}
          <Register className="sensei-second" delay={0.15} stagger={0.09} x={-14}>
            <p className="t-mono sensei-second__label">{t.second.label[locale]}</p>
            {secondNameAwaiting ? (
              <span className="sensei-blank" aria-hidden="true" />
            ) : (
              <p className="t-h3 font-display sensei-second__name">{secondName}</p>
            )}
            <div className="sensei-second__meta">
              <p className="t-caption text-ink-2">{t.second.role[locale]}</p>
              {secondNameAwaiting && <p className="t-note sensei-second__await">{secondNameAwaiting}</p>}
            </div>
          </Register>
        </div>

        <ChapterFoot index={chapter.index} />
      </div>
    </Chapter>
  );
}
