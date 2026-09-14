"use client";

import "@/styles/sections/sensei.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, isPending, sensei } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Photo } from "@/components/ui/Photo";
import { Curtain } from "@/components/ui/Curtain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Register, Reveal } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "sensei")!;
const HEADING_ID = "sensei-heading";

/*
  The plate's share of the sheet, expressed the way the CSS lays it out.
  `.wrap` is the trim, so the field is 100vw − 2 × gutter ≈ 92.8vw, and the
  plate takes five of its twelve columns up to 2000 (≈ 38vw, requested as 40)
  and four of them above it (≈ 30vw, requested as 32). The first matching
  condition wins, so the widest breakpoint has to be listed first.

  UNCHANGED by the redesign, and that is load-bearing rather than lazy: the
  plate swapped SIDES but kept its column COUNT, so its width ladder is the
  same at every tier — 545px at 1440, 756px at 1999, 599px at 2000, 768px at
  2560. `sizes` describes width and nothing else, so it did not need re-solving.
*/
const PLATE_SIZES =
  "(min-width: 2000px) 32vw, (min-width: 1024px) 40vw, (min-width: 768px) 26rem, 100vw";

/**
 * Chapter 四 / 04 — «Тренер».
 *
 * THE ONE COLOUR PAGE. The manual is printed in two inks, and every other
 * plate on this site is pulled through the duotone press in the page's own
 * paper and ink. This chapter is printed in full colour, because it is the one
 * chapter about a person rather than about a practice — and the book closes
 * straight back into ink afterwards, since 五 and 六 are dark chapters. An
 * exception that happens exactly once, on the page that earns it, is a
 * decision: the same argument the rota already makes for vermilion, applied to
 * the press.
 *
 * That is also what "one man, two ways" is built out of here. The BINDING side
 * of the sheet is what the ministry knows about him — the name, the rank, the
 * decree and its still-missing order number, the record — all of it set in the
 * book's own two colours. The FORE-EDGE is the man, in colour. The reader does
 * not have to press anything to get the second reading; it is the composition.
 *
 * ONE register: the entry ranged to the binding, so the name is set at
 * chapter scale on the same vertical 四 hangs in — which is what a
 * frontispiece is. The plate holds the fore-edge and breaks upward across
 * the chapter boundary there. From 1600 the citation leaves the reading
 * column for the channel between the two.
 *
 * WHAT WENT, and why none of it is coming back:
 *
 *   · The second coach. The club never gave a name, so the fourth register
 *     printed a label, a ruled blank and a note saying the name was awaited.
 *     A register whose entire content is an absence is not a register, and
 *     the chapter is about one man.
 *   · The colour toggle, and everything built to serve it — the second
 *     <Photo> layer, the travelling clip-path front, the apparatus that held
 *     the control. The plate is simply in colour now. All of that was
 *     scaffolding around a door that is already open — and it never worked:
 *     the file it revealed (`karateka-fist-bw.jpg`) is a true greyscale
 *     original, single-channel on Wikimedia Commons as well, so the control
 *     changed nothing a reader could see.
 *   · The hover path with it. It did not merely fail on a phone, it LIED:
 *     hovering opened the plate while `aria-pressed` still reported `false`,
 *     the identical defect this file's own comments record having removed
 *     from `:focus-within`.
 *   · The plate caption, which printed the sensei's name under a Wikimedia
 *     stranger — an invented fact hiding in the apparatus rather than in the
 *     copy, which is exactly where nobody goes looking for one.
 *   · The quote, the seal and the signature. A coda set under a rule at
 *     the foot of the chapter, saying at display size what the registers
 *     had already said in the man's own record. The seal went with it: it
 *     is stamped where a reader signs up (ч. десять), not where a
 *     biography ends.
 *
 * The chapter now holds NO STATE. There is no `useState`, no effect, no timer
 * and no `useStillness()` call here: nothing in it decides a Motion `initial`
 * or a serialised style, so <Curtain> handles stillness internally
 * and everything else runs under <MotionConfig reducedMotion="user">.
 *
 * ONE fact in this chapter is still not the club's — the decree's number and
 * date. It prints as `PENDING SLOT`: the label and the ruled line stay, the
 * value is a blank, and a mono note says what is missing. Nothing is invented
 * in the display face.
 */
export function Sensei() {
  const { locale } = useLocale();
  const t = sensei;

  /* first name / surname on their own lines — both locales are two words */
  const nameLines = t.name[locale].split(" ");

  /*
    The one fact the club has not given yet. `pendingText()` still READS as the
    blank mark for any consumer that does not know the convention; this one
    does, so it asks. The value is taken first and the question second: what a
    pending fact holds is what to print WHEN it lands, and `awaiting` is what
    to print until it does.
  */
  const decreeRef = t.decreeRef[locale];
  const decreeRefAwaiting = isPending(t.decreeRef) ? t.decreeRef.awaiting[locale] : null;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="sensei"
    >
      <div className="wrap sensei__inner">
        <div className="sensei-body">
          {/* ---- I · the entry, ranged to the BINDING ---- */}
          <div className="sensei-entry">
            <h2 id={HEADING_ID} className="sensei-name t-chapter">
              <LineReveal
                as="span"
                className="block"
                lines={nameLines}
                label={t.name[locale]}
                stagger={0.1}
                duration={1.1}
              />
            </h2>

            <Reveal delay={0.22} y={22} className="sensei-rank">
              <p className="t-statement sensei-rank__line">{t.rank[locale]}</p>
            </Reveal>

            {/* The citation. It is READ, so it is set in `.t-note` — the mono
                voice for matter that is read — not in tracked all-caps. From
                1600 it leaves the reading column for the channel between the
                type and the plate, which is the emptiest column on the sheet:
                the one fact the club still owes is set in the one place the
                composition has nothing else to say. */}
            <div className="sensei-cite">
              <Reveal delay={0.3} duration={0.7}>
                <p className="t-note sensei-decree__note">{t.decree[locale]}</p>
              </Reveal>
              {/* label, ruled blank and awaiting note are three fields sharing
                  one baseline — a tabulated row, which is what <Register> is
                  for. A vertical rise would break the line they share. */}
              <Register className="sensei-ref" delay={0.38} stagger={0.08} x={-14} duration={0.7}>
                <span className="t-mono sensei-ref__label">{t.decreeRefLabel[locale]}</span>
                {decreeRefAwaiting ? (
                  <span className="sensei-ref__blank" aria-hidden="true" />
                ) : (
                  <span className="t-note sensei-ref__value">{decreeRef}</span>
                )}
                {decreeRefAwaiting ? (
                  <span className="t-note sensei-ref__await">{decreeRefAwaiting}</span>
                ) : null}
              </Register>
            </div>

            {/*
              THE TWO REGISTERS — the chapter's device, and the whole of "one
              man, two ways" on the type side of the sheet.

              This was one paragraph of biography. It is the same sentences,
              ruled apart under the two words the copy already used for him.
              Each row is a label and its matter on one baseline, so each row
              comes into REGISTER rather than rising: they are tabulated, not
              prose. The hairline between them is the only rule a separation
              INSIDE a block may take.
            */}
            <div className="sensei-registers">
              {t.registers.map((entry, i) => (
                <Register
                  key={entry.label.en}
                  className="sensei-register"
                  delay={0.42 + i * 0.09}
                  stagger={0.08}
                  x={-14}
                  duration={0.7}
                >
                  <p className="t-mono sensei-register__label">{entry.label[locale]}</p>
                  <p className="t-lead sensei-register__body">{entry.body[locale]}</p>
                </Register>
              ))}
            </div>
          </div>

          {/* ---- I · the plate, holding the FORE-EDGE ----
                  The only full-colour image on the site. It carries no caption:
                  its subject is named at chapter scale one column away, which
                  is how a frontispiece portrait has always been captioned, and
                  the caption that stood here named a man the photograph is
                  not. `media.ts` states what a replacement must satisfy. */}
          <figure className="sensei-figure">
            <Curtain className="sensei-plate aspect-[4/5] lg:aspect-[3/4]" duration={1.2}>
              <Photo slot="senseiPlate" grade="color" priority={false} sizes={PLATE_SIZES} />
            </Curtain>
          </figure>
        </div>
      </div>
    </Chapter>
  );
}
