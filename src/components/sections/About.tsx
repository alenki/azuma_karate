"use client";

import "@/styles/sections/about.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { about, chapters } from "@/content/home";
import { families } from "@/content/schedule";
import { ageBand, groupsInFamily } from "@/lib/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { AzumaFigure } from "@/components/figures/AzumaFigure";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "about")!;
const HEADING_ID = "about-title";

/**
 * THE MASK'S CLEARANCE.
 *
 * LineReveal gives every line a mask of `padding-block: bleed` with
 * `margin-block` the negative of it, so the padding is paid back and no
 * descender is clipped by the mask the line rises through.
 *
 * IT USED TO BE HALF OF A SUM. While the statement was two lines, the two
 * negative margins COLLAPSED between them to the more negative of the pair
 * rather than summing, so one bleed survived as leading and what the reader saw
 * was `line-height + bleed` = `0.82 + 0.2` = `1.02em` — the ghost sitting
 * directly under the solid line, close enough that the two read as one block of
 * type. There is one line now and nothing to collapse against, so
 * `--say-leading` in `styles/sections/about.css` is simply the line-height of a
 * single display line. The two numbers are no longer one measurement, and
 * moving either no longer obliges the other.
 */
const SAY_BLEED = 0.2;

/**
 * Chapter 二 / 02 — «О клубе».
 *
 * ONE FRAME. It was three, then two, and the arithmetic of the cuts is most of
 * what there is to know about the chapter. «Киокуши́н — предельная истина.»
 * went first, folded into the lede, taking 押忍 — the chapter's one red mark —
 * with it. Then «Азума — восток.» lost its meaning line and «С четырёх лет — и
 * без потолка.» lost its statement entirely, which left the roster with nothing
 * standing over it and no reason to hold a screen of its own. So the roster
 * came up into the surviving frame's foot, under the lede, and the chapter is
 * one screen:
 *
 *     Азума
 *                              東
 *              (void)
 *     СК «Азума» — секция киокушинкай каратэ в Нальчике…
 *     ──────────────────────────────────────
 *     Мальчики и девочки            4–6 лет
 *
 * NOTHING ANSWERS THE NAME ANY MORE, and that is the cut with the most
 * consequences. The chapter's hierarchy was a two-line device — one solid line
 * and a ghost at a fifth of its contrast, a claim and its echo — and the ghost
 * tone existed for exactly that second line. With one line left there is no
 * device, so `--ghost` went with it. What carries the foot now is a rule and a
 * measure, which is the manual's own vocabulary anyway.
 *
 * SO CHAPTER 二 STILL CARRIES NO VERMILION, and that is still a legal reading
 * of the rota rather than an oversight: the hue is spent on an actual brush
 * mark, on the seal and on the reader's own accent, never on ornament. Once
 * 押忍's paragraph was gone there was nowhere for it to stand that was not
 * ornament.
 *
 * The chapter is PAPER. It was ink for one edit, on the argument that the
 * board's own hierarchy is bone against ghost — but chapter 一 is ink too, so
 * that put the manual's first two chapters back to back as one unbroken dark
 * run: the book opened on a black spread, and the header, which inverts over
 * an ink ground, had no boundary to invert at until chapter 三. The rota is
 * open dark, turn dark once in the middle, close dark.
 *
 * ONE departure from the manual's defaults survives, scoped to this chapter's
 * own stylesheet and component — nothing outside 二 knows about it. It is the
 * face: the display type here is the GROTESQUE, the body face promoted to 500
 * and tracked in, not the Didone the rest of the book sets its headlines in. A
 * high-contrast serif at 113px is a fashion masthead on any ground, and this is
 * not one — it is athletic and neutral and its whole voice is scale.
 *
 * 東 IS NOT READ OFF ANY MORE. It used to be a picture of the word printed
 * beside it — a sun risen into the branches of a tree, with «восток.» set
 * underneath. The gloss is gone, so the mark is simply the club's own
 * character, blind-stamped at the tone a press leaves when it puts no ink on
 * the sheet, and nothing on the page depends on a reader knowing what it says.
 * If the reading ever has to be printed it goes in the copy, not into a legend
 * beside the figure — that apparatus was removed from this chapter once
 * already.
 *
 * THE ROSTER IS THE CHAPTER'S ONLY TABLE and the only hard fact it states. It
 * shares the foot with the lede now rather than standing under a statement of
 * its own: «Мальчики и девочки» against three bands, «Мужчины и девушки»
 * against one.
 *
 * THE BANDS ARE NOT COPY. They are read off `content/schedule.ts` through
 * `ageBand()` — the same record chapter 三's timetable legend reads — so the
 * roster and the week cannot print different figures, and a band is added or
 * moved by editing the groups there and nothing here. A <dl> is what it is:
 * two terms, each with the bands that belong to it.
 *
 * The roster is RULED, not sized. It is set at the lede's size like everything
 * else at the frame's foot, and what separates the two families is a hairline —
 * the chapter's rule that hierarchy is tone and rule, never scale, holds for
 * the one thing in it that is tabulated.
 *
 * MOTION IS ONE CASCADE, not two frames' worth. The name rises inside its mask,
 * the lede reveals under it, the two roster rows follow. The rows used to open
 * a second frame at 0.25 / 0.37 with a whole screen between them and the lede;
 * in one foot those delays read as three things landing together, so they were
 * pushed back behind the lede rather than started alongside it. 東 is wiped in
 * once from the foot up, on its own timing. Nothing here is drawn stroke by
 * stroke.
 */
export function About() {
  const { locale } = useLocale();
  const t = about;

  return (
    /*
      Nothing in the `bleed` slot, and that is not an omission. The chapter
      used to hang a <Grain> there; film grain SCREENS a noise field back in,
      which is the operator that bites on ink and the one that does nothing
      worth a compositing layer on paper. A paper chapter's surface is the
      STOCK — two tiles multiplied into the ground itself by `.ground-paper`
      (globals.css) — so the sheet still has a tooth and this chapter is one
      blend layer lighter than it was.
    */
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      ground="paper"
      className="about relative"
    >
      <div className="wrap about__inner">
        <div className="about__frame">
          {/*
            東, blind-stamped into the ground and held inside the outer trim.
            It brings its OWN reveal — one bottom-up wipe — so it is not wrapped
            in a <Settle> as well: two entrances on one mark is the kind of
            doubled motion this chapter spent the rest of its edit removing.
          */}
          <div className="about__watermark" aria-hidden="true">
            <AzumaFigure />
          </div>

          {/*
            THE STATEMENT, and it is one word on one line.

            `lines` is a plain string, so LineReveal derives the screen-reader
            text itself and renders it once inside this <h2> — which is what
            `aria-labelledby` on the <section> resolves to. The local <Say>
            wrapper that used to stand here passed `label={null}` and printed
            its own `.sr-only` span, because its lines were elements; do not add
            one back beside a string line, or the name is announced twice.
          */}
          <h2 id={HEADING_ID} className="about__say">
            <LineReveal
              as="span"
              className="block"
              delay={0.08}
              duration={1.15}
              bleed={SAY_BLEED}
              lines={[t.name[locale]]}
            />
          </h2>

          <div className="about__frame-foot">
            <Reveal delay={0.25} y={22}>
              <p className="about__lede">{t.lede[locale]}</p>
            </Reveal>

            {/*
              A <div> between <dl> and its <dt>/<dd> is valid and is what lets
              each family arrive on its own — <Reveal> renders that div. Two
              rows, so the stagger is a beat and not a run, and both fall in
              behind the lede they now share a foot with.
            */}
            <dl className="about__roster">
              {families.map((f, i) => (
                <Reveal key={f.id} className="about__roster-row" delay={0.42 + i * 0.12} y={18} duration={0.8}>
                  <dt className="about__roster-who">{f.label[locale]}</dt>
                  <dd className="about__roster-bands">
                    {groupsInFamily(f.id).map((g) => (
                      <span key={g.id} className="about__band">
                        {ageBand(g, locale)}
                      </span>
                    ))}
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
