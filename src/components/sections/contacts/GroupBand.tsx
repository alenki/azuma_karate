"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import { door, group as copy, particulars } from "@/content/contacts";
import { chapters } from "@/content/home";
import { kanji } from "@/content/kanji";
import { CHAPTER_NUMERALS } from "@/components/layout/Chapter";
import { localeHref } from "@/i18n/config";
import { groups, type GroupId } from "@/content/schedule";
import { groupWeek, groupsForAge, youngestAge } from "@/lib/hall";
import { Leaf } from "./Leaf";
import { Brush } from "@/components/brush/Brush";
import { LineReveal } from "@/components/ui/LineReveal";
import { Register, Reveal } from "@/components/ui/Reveal";
import { Particulars } from "./Particulars";

const HEADING_ID = "contacts-groups-title";

/*
  ONE ANSWER, TWO CONTROLS, NO THIRD TRUTH.

  The reader may type an age or press a row, and the two must never disagree, so
  there is one state and each control clears the other's evidence: typing drops
  a pressed row, pressing empties the blank. A third piece of state — a selected
  group kept alongside a typed age — is how a page ends up marking «Дети» while
  the blank says 34.
*/
type Answer = { kind: "age"; raw: string } | { kind: "group"; id: GroupId };

/*
  THE BLANK IS READ AFTER THE READER STOPS TYPING.

  «12» is «1» for as long as it takes to reach the second key, and one is under
  the club's floor — so an undebounced blank marks nothing, prints «Берут с
  четырёх лет», and then jumps to the teens, all while the reader is still
  typing. A third of a second is long enough to have finished a two-digit
  number and short enough that the mark still reads as an answer.
*/
const SETTLE_MS = 320;

function useSettled(value: string, ms: number): string {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return settled;
}

/**
 * Band B — «Ваша группа». The page's one gesture.
 *
 * The reader answers a single question — how old is the student — and the
 * sensei's brush answers back, in the margin, beside the row or rows they
 * belong in. 朱筆: the vermilion a teacher corrects a student's sheet with,
 * which is a different mark in kind from the ensō that closes the home page.
 * That one is a completion, drawn once and unconditionally; this one is made
 * BECAUSE of something the reader wrote, and only then.
 *
 * Three things make it a fact rather than an ornament, and all three are the
 * club's own data rather than a flourish invented for the page:
 *
 *   · AT SIX AND AT SIXTEEN THE MARK DOUBLES. `content/schedule.ts` states that
 *     the bands overlap on purpose and must not be tidied — a six-year-old goes
 *     to whichever group they are ready for — so two rows are marked and the
 *     club's own pedagogy is printed under them. No generic contact page can
 *     carry that, because no other club's data says it.
 *   · UNDER FOUR THE BRUSH REFUSES. Nothing is marked and the club's floor is
 *     printed instead, read off the youngest band rather than typed as a
 *     literal. A mark whose absence means something is not decoration.
 *   · EVERY ROW PRINTS ITS WEEK BEFORE ANYONE ACTS. A reader who scrolls past
 *     without touching the blank still leaves with the days and times of all
 *     four groups. Marking NARROWS — the unchosen rows drop one step down the
 *     ink ramp and lose their rules, which is the timetable's own recession —
 *     it does not reveal.
 */
export function GroupBand() {
  const { locale } = useLocale();
  const uid = useId().replace(/:/g, "");
  const ageId = `${uid}-age`;
  const pickId = `${uid}-pick`;
  const [answer, setAnswer] = useState<Answer>({ kind: "age", raw: "" });

  const raw = answer.kind === "age" ? answer.raw : "";
  const settled = useSettled(raw, SETTLE_MS);
  const typed = Number.parseInt(settled, 10);
  const hasAge = answer.kind === "age" && settled.trim() !== "" && Number.isFinite(typed);

  const marked: GroupId[] = answer.kind === "group" ? [answer.id] : hasAge ? groupsForAge(typed) : [];
  const answering = answer.kind === "group" || hasAge;
  const floor = youngestAge();

  /* the timetable chapter, with its own binding numeral — read off the same two
     tables the home page margin is drawn from */
  const week = chapters.find((c) => c.id === "schedule")!;
  const weekHref = `${localeHref(locale, "/")}#${week.id}`;
  const weekNumeral = kanji[CHAPTER_NUMERALS[week.index - 1]].char;

  /*
    The one line under the rows, and it says only what the data supports.

    The floor sentence is BUILT rather than typed: the figure is `youngestAge()`
    — the youngest band in `content/schedule.ts` — and Russian is declined with
    `Intl.PluralRules`, because «с 4 лет» and «с 1 года» do not take the same
    form and a page that prints one of them wrongly is a page that was not
    proofread. English has one form and the content file carries it twice, so
    the shape of the string does not differ by language.
  */
  const floorLine = () => {
    const form = new Intl.PluralRules(locale).select(floor) === "one" ? "one" : "many";
    return copy.tooYoung[locale][form].replace("{n}", String(floor));
  };

  const verdict =
    marked.length > 1
      ? copy.overlap[locale]
      : marked.length === 1
        ? copy.trial[locale]
        : hasAge && typed < floor
          ? floorLine()
          : "";

  return (
    <Leaf id="groups" labelledBy={HEADING_ID} className="groups">
      <div className="groups__sheet wrap">
        <div className="groups__head">
          <h2 id={HEADING_ID} className="t-chapter groups__title">
            <LineReveal as="span" className="block" lines={[copy.title[locale]]} />
          </h2>

          {/*
            THE QUESTION IS THE LABEL. A blank under a question mark needs no
            helper sentence telling the reader to fill it in, and the <label>
            carries the question itself, so the accessible name and the printed
            one are the same string (2.5.3 Label in Name).

            `type="text"` with `inputMode="numeric"`, never `type="number"`: a
            number field brings a scroll wheel that changes the value when a
            reader scrolls the page past it, and spinners are furniture this
            sheet has no paint for. The filter keeps it numeric anyway.
          */}
          <div className="groups__ask">
            <label htmlFor={ageId} className="t-statement groups__question">
              {copy.question[locale]}
            </label>
            <input
              id={ageId}
              className="groups__blank"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              value={raw}
              onChange={(e) => setAnswer({ kind: "age", raw: e.target.value.replace(/\D/g, "") })}
            />
          </div>
        </div>

        <p id={pickId} className="t-mono groups__pick">
          {copy.pick[locale]}
        </p>

        <Register
          className="groups__list"
          stagger={0.05}
          itemClassName="groups__item"
          role="group"
          aria-labelledby={pickId}
        >
          {groups.map((g) => {
            const on = marked.includes(g.id);
            const week = groupWeek(g.id, locale);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                /* aria-pressed reports `on`, so pressing MUST turn `on` off — however
                   the row came to be marked. A row marked by a typed age used to
                   report pressed=true, do nothing visible when pressed, and silently
                   empty the blank; now pressing any marked row withdraws the answer
                   and pressing an unmarked one selects it. */
                onClick={() => setAnswer(on ? { kind: "age", raw: "" } : { kind: "group", id: g.id })}
                className={cn("grow", on && "grow--on", answering && !on && "grow--off")}
              >
                {/*
                  The tick is drawn in the row's own left track, on paper,
                  OUTSIDE the cell that inverts. Two things follow and both are
                  the reason: the mark never needs `--color-shu-lift`, so there
                  is one red token on this page and no conditional colour
                  anywhere; and a teacher marks in the margin beside a line,
                  never on top of it.
                */}
                <span className="grow__mark" aria-hidden="true">
                  <Brush kind="tick" trigger="manual" active={on} seed={g.id} className="grow__tick" />
                </span>
                <span className="grow__cell">
                  <span className="grow__name t-h3 font-display">{g.name[locale]}</span>
                  <span className="grow__ages t-mono">{g.ages[locale]}</span>
                  <span className="grow__note t-note">{g.note[locale]}</span>
                  <span className="grow__week t-caption">
                    {week.slots.join("\u00A0· ")}
                    {week.minutes !== null ? `\u00A0· ${week.minutes}\u00A0${copy.minutes[locale]}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </Register>

        <div className="groups__after">
          {/* announced, and only when there is something to announce: the region
              is in the tree from the first paint and empty until the reader acts */}
          <p className="t-note groups__verdict" role="status">
            {verdict}
          </p>
          {/* the locator for the times printed above: the four rows carry each
              group own week, and the WHOLE week is chapter 三 on the home page.
              This page states the one group a reader belongs to; it does not
              reprint the timetable. */}
          <Link href={weekHref} className="t-mono groups__week-link">
            <span aria-hidden="true" className="groups__week-numeral">
              {weekNumeral}
            </span>
            <span className="sr-only">{particulars.seeChapter[locale]} </span>
            {door.week[locale]}
            <span aria-hidden="true"> →</span>
          </Link>
        </div>

        <Reveal y={18} duration={0.8} className="groups__foot">
          <Particulars />
        </Reveal>
      </div>
    </Leaf>
  );
}
