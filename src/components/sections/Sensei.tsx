"use client";

import "@/styles/sections/sensei.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, coaches } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Photo } from "@/components/ui/Photo";
import { Curtain } from "@/components/ui/Curtain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "sensei")!;
const HEADING_ID = "sensei-heading";

/*
  A plate's share of the sheet, expressed the way the CSS lays it out.

  `.wrap` is the trim, so the field is 100vw − 2 × gutter ≈ 92.8vw. From 1024
  each coach takes five of its twelve columns — about 38vw, requested as 40 —
  and that holds at every width above it, because the spread never changes its
  column count; past about 1900 the plate stops growing TALLER instead (see
  `max-block-size` in the stylesheet), which costs `sizes` nothing, since
  `sizes` describes width and nothing else.

  Between 768 and 1023 each coach is a band with the plate at 5 of 12 columns
  of the trim, which is the same 38vw; below that the plate is the trim.
*/
const PLATE_SIZES = "(min-width: 768px) 40vw, 93vw";

/**
 * Chapter 四 / 04 — «Тренеры».
 *
 * A SPREAD, NOT A FRONTISPIECE. This chapter set one man at poster scale with
 * his record beside him for as long as the club had one coach on the page. It
 * now sets TWO, on the two halves of the sheet, and the change is structural
 * rather than additive: the component maps over `coaches` and lays one entry
 * per half, so the chapter's arithmetic is the length of that array. A third
 * coach is a content edit. Losing the second one is a deletion. Neither is a
 * change to this file.
 *
 * Both halves are the same four rows — plate, name, rank, record — and they
 * are the SAME four rows, not four rows each: the two entries stand on a
 * shared four-track grid (`grid-template-rows: subgrid`), so the two names sit
 * on one line and the two records start on one line however the type wraps.
 * That is what makes it a spread rather than two cards side by side, and it is
 * the one thing a reader would notice immediately if it broke.
 *
 * THE COLOUR PAGES. The manual is printed in two inks and every other plate on
 * the site goes through the duotone press; these two are printed in full sRGB,
 * because 四 is the one chapter about people rather than about a practice. The
 * exception is still ONE decision — it is spent on this chapter, not on each
 * photograph — and the book closes straight back into ink afterwards, since 五
 * and 六 are dark.
 *
 * THE RULING. There is no horizontal rule in this chapter, and that survives
 * the redesign: 三 is a timetable built out of hairlines and 五 rules its
 * chronicle off line by line, so a third ruled chapter would have read as a
 * spec sheet for two men instead of one. The only line is VERTICAL, down the
 * centre of the sheet, and it now has the job it was invented for — the fold
 * of the spread, with a coach on each side of it.
 *
 * THE ONE VERMILION IS A 一, at the head of the chapter and across the trim.
 * The rota reserves red for three things and the first of them is an actual
 * <Brush> mark; this is the first stroke, which is what the book is named
 * after and what both of these men draw for a student before anything else.
 * It opens the chapter the way `--color-rule-strong` opens every other one,
 * except that it is ink: pressed (tooth, mottle and bleed through the filters
 * in ui/PressDefs), tapered, dried out into bristle ribbons at the tail, and
 * DRAWN left to right, once, when the reader reaches it. It belongs to neither
 * coach, which is why it is above both and not inside either.
 *
 * ONE MAN HERE IS INVENTED. `assistant` in `content/home.ts` — his name, his
 * rank, his belt and the groups he works with — is a placeholder, and so is
 * the frame beside it. Both carry their own warning and both are in the
 * README's «Before this can go live» list. The head coach's own «Ведёт детские
 * и взрослую группы САМ» lost its «сам» to make room for him, because a second
 * coach and a man who does it all himself cannot both be printed on one page.
 *
 * The chapter holds NO STATE: no `useState`, no effect, no timer, no
 * `useStillness()`. Nothing here decides a Motion `initial` or a serialised
 * style, so <Curtain> handles stillness internally and everything else runs
 * under <MotionConfig reducedMotion="user">.
 */
export function Sensei() {
  const { locale } = useLocale();

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="sensei"
    >
      <div className="wrap sensei__inner">
        {/*
          The chapter's own heading, and the only one that names the chapter
          rather than a person. It is not printed: the manual titles its
          chapters in the running head and in the contents, never on the page —
          but the section still has to have an accessible name, and with two
          coaches on the sheet neither man's name can be it.
        */}
        <h2 id={HEADING_ID} className="sr-only">
          {chapter.title[locale]}
        </h2>

        {/* The first stroke. Decorative, and it says so: no `label`, so
            <Brush> marks it `aria-hidden`. The numeral 四 in the binding rail
            already speaks the character. */}
        <Brush kind="ichi" className="sensei-mark" delay={0.15} duration={1.3} />

        <div className="sensei-body">
          {coaches.map((coach, i) => {
            /* one beat between the two halves — they arrive together, but not
               in lockstep, which is the difference between a spread being
               printed and a pair of cards animating */
            const beat = i * 0.12;
            return (
              <article key={coach.name.en} className="sensei-coach">
                <figure className="sensei-figure">
                  <Curtain className="sensei-plate" delay={0.05 + beat} duration={1.2}>
                    <Photo slot={coach.plate} grade="color" priority={false} sizes={PLATE_SIZES} />
                  </Curtain>
                </figure>

                {/*
                  The name at chapter scale. No caption under either plate: a
                  frontispiece portrait is captioned by the headword beside it,
                  and both headwords are set here, one row down and on the same
                  line as each other. `media.ts` carries the alt text, and that
                  is the only description of either plate that is true of the
                  file on disk.
                */}
                <h3 className="sensei-name t-chapter">
                  <LineReveal
                    as="span"
                    className="block"
                    lines={coach.name[locale].split(" ")}
                    label={coach.name[locale]}
                    delay={0.2 + beat}
                    stagger={0.1}
                    duration={1.1}
                  />
                </h3>

                {/* The credential, and the fact a parent is actually weighing.
                    It used to be ruled off above like an award line; it is
                    simply the second size in the chapter now, which says the
                    same thing without printing a line to say it. */}
                <Reveal delay={0.34 + beat} y={22} className="sensei-rank">
                  <p className="t-statement sensei-rank__line">{coach.rank[locale]}</p>
                </Reveal>

                {/*
                  THE TWO REGISTERS — a man, read twice, and now both men read
                  the same two ways. The labels are the copy's own vocabulary
                  and they are deliberately the SAME pair on both halves, so the
                  spread is one register system rather than two biographies: the
                  reader compares «Спортсмен» with «Спортсмен» across the fold
                  without being asked to.

                  They REVEAL rather than come into register: a register is for
                  matter that shares a baseline, and these are copy blocks.
                */}
                <div className="sensei-registers">
                  {coach.registers.map((entry, j) => (
                    <Reveal
                      key={entry.label.en}
                      className="sensei-register"
                      delay={0.44 + beat + j * 0.1}
                      y={18}
                      duration={0.8}
                    >
                      <h4 className="sensei-register__head">{entry.label[locale]}</h4>
                      <p className="sensei-register__body">{entry.body[locale]}</p>
                    </Reveal>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Chapter>
  );
}
