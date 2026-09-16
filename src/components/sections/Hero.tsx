"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, hero, heroFit } from "@/content/home";
import { cta } from "@/content/nav";
import { Chapter } from "@/components/layout/Chapter";
import { LineReveal } from "@/components/ui/LineReveal";
import { Settle } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { Reel } from "@/components/ui/Reel";
import { Grain } from "@/components/ui/Grain";
import { useStillness } from "@/lib/useStillness";
import { EASE_OUT } from "@/lib/ease";
import "@/styles/sections/hero.css";

/**
 * Chapter 一 — «Первая черта».
 *
 * THE BEAT IS THE PLATE. The sheet sets one sentence and puts the silence
 * inside it: «Сначала поклон.» printed small under the running head, then a
 * screen of photograph, then «Потом удар.» at exactly twice the size along the
 * foot. The sentence's own logic — first this, then that — is carried by SCALE
 * rather than by punctuation, and the interval the reader's eye has to cross to
 * get from the bow to the strike is the count a student holds between them.
 *
 * What changed is what the interval is made of. It was a band of bare paper,
 * then a screen of white gi; it is a black room with one figure standing in it.
 * Same composition, same relationship — but the sheet is DARK now, and the
 * silence between the bow and the strike is the room the strike is thrown in.
 * Swap the copy for a coffee brand and none of it means anything, which is the
 * test.
 *
 * SIX THINGS ARE ON THIS SHEET: the chapter mark 一/01 in the binding margin, a
 * running head, the bow, the plate, the strike, and the offer with its control.
 *
 * THE PLATE IS THE GROUND, not an illustration on it. The chapter is `ink`,
 * so the fixed bar inverts over it — the ground reporter that already exists
 * (layout/ChapterContext) is told `ink`, the bar prints in bone, and a dark
 * first screen gets the header a dark first screen wants. Chapter 二 is paper,
 * so the plate's foot ends on a TRIMMED EDGE rather than a dissolve: the
 * photograph runs to black and the next sheet begins. That is the ordinary
 * arrangement in this book — every ink chapter meets its neighbour that way —
 * and it is the thing the paper version of this chapter could not do, which is
 * why it spent three measured ramps buying itself a seam.
 *
 * THERE IS NO VERMILION ON THIS SHEET except the seal welded to the control,
 * which is one of the three jobs red has on this page. There is deliberately no
 * <Brush>: a red 一 over a photograph is, to everyone who is not a typographer,
 * an eyebrow rule redrawn. The hand belongs later in the book.
 *
 * NOTHING HERE MEASURES ITSELF AT RUNTIME. The headline is sized by CSS alone
 * from two em constants (`heroFit`), and every delay below is a literal.
 */

/*
  THE LOAD, AS ONE FRONT CROSSING THE SHEET ONCE.

  No element authors its own entrance. Every delay is derived from that
  element's own top edge by one constant —

      delay(s) = 0.12 + 0.0155 x (top edge, in svh)

  — so the front crosses 100svh in 1.55s, and the pause in the middle of the
  load is not a number anyone typed: it is the time the front spends travelling
  down the plate. That is the composition rendered as duration, and it is what
  makes this one gesture rather than a queue of entrances.

    0.00  the page — the plate, the binding hairline and 一/01, all already
          printed. These are the book, not the chapter, and the plate in
          particular must never be REVEALED: an element clipped to zero area or
          held at opacity 0 is not an LCP candidate, and it is the LCP element.
          It only settles — a 4.5% scale coming to rest, which is a transform
          and therefore invisible to the metric.
    0.37  the bow rises inside its mask
      ->  NOTHING NEW BEGINS for 0.94s. The front is crossing the plate.
    1.31  the offer is printed
    1.33  the strike rises
    1.48  the control is printed — the last mark, and the only red one
    2.05  finished. Nothing on this sheet moves again: no loop, no breathing
          hairline, no scroll-linked transform, no pointer lean.
*/
const T = {
  bow: 0.37,
  offer: 1.31,
  strike: 1.33,
  press: 1.48,
} as const;

/** How the plate lands: 4.5% over 1.9s, which reads as settling, not as a zoom. */
const PLATE_SETTLE = 1.045;

export function Hero() {
  const { locale } = useLocale();
  const ch = chapters[0];
  const fit = heroFit[locale];
  const line1 = hero.line1[locale];
  const line2 = hero.line2[locale];
  const still = useStillness();

  return (
    <Chapter
      id={ch.id}
      index={1}
      title={ch.title[locale]}
      ground="ink"
      labelledBy="hero-title"
      className="hero"
      style={
        {
          /* Set EQUAL to `.chapter__numeral`'s own sticky `top`, so the numeral
             is already at its resting offset at scroll 0 and never jumps once
             the reader starts moving. It lands on the running head's line. */
          "--numeral-top": "calc(var(--header-h) + 2rem)",
          /* The two em constants the size law divides by. See `heroFit`. */
          "--em-bow": fit.bow,
          "--em-strike": fit.strike,
        } as CSSProperties
      }
    >
      {/*
        The plate. One photograph at the size of the screen, GRADED rather than
        pressed — hero.css owns the whole declaration, which is why `grade` is
        `color` here: not "the colour exception" (that is still 四) but "this
        plate is not on the shared press". It runs to all four trimmed edges.

        `art` serves the upright cut through a <picture>, so the screen that
        gets it downloads that file and only that file. It is a DIFFERENT frame
        of the same cut — see content/media, which carries why. The
        query is on the SHAPE of the viewport and not on its width, because the
        thing that ruins the wide cut is a tall box, not a narrow one: a 3:2
        landscape asked to cover 390 x 844 shows a 31% vertical slice of itself
        and 768 x 1024 is barely better, while 1024 x 1366 — wider than the
        phone breakpoint by a long way — is worse than both. `4 / 5` is the
        shape at which the wide frame stops holding its subject.

        The scale is on the WRAPPER and not on the image, so the <img> that the
        browser measures for LCP is never itself transformed, and `useStillness`
        decides the `initial` — Motion serialises `initial` into the SSR markup
        and React will not patch a mismatched style attribute, so reading the
        media query directly would leave a reader who asked for stillness with a
        permanently over-scaled plate.
      */}
      <motion.div
        className="hero__plate"
        initial={{ scale: still ? 1 : PLATE_SETTLE }}
        animate={{ scale: 1 }}
        transition={{ duration: still ? 0 : 1.9, ease: EASE_OUT }}
      >
        <Photo
          slot="firstScreen"
          art={{ slot: "firstScreenTall", media: "(max-aspect-ratio: 4 / 5)", sizes: "170vw" }}
          grade="color"
          sizes="100vw"
        />
        {/*
          AND THE PLATE IS MADE, ONCE.

          The strike is thrown over 2.17s and then the sheet is a photograph —
          no loop, nothing ambient. That is not restraint for its own sake: it
          is the same sentence this file already ends on, and the same one
          hero.css ends on. The gesture is also the chapter's own sentence; 一
          reads «Сначала поклон. / Потом удар.» and the cut is the second half.

          It lies OVER the plate and is never the plate. <Photo> above prints
          the reel's own frame 0, and that <img> is the LCP element, the alt
          text, and what the reader keeps if the reel is held back — which it is
          on a phone, on a reduced-motion machine, and anywhere autoplay is
          refused. ui/Reel carries the three conditions and why each is decided
          on the client.

          THE QUERY IS THE SAME ONE <Photo art> IS GIVEN, inverted: the upright
          cut and the reel are two answers to one question about the shape of
          the viewport, and they must never both be right. Keep them in step.

          IT CARRIES NO PRESS OF ITS OWN any more. The video used to have the
          two-ink duotone baked into its frames because an SVG reference filter
          is a per-frame pass; the grade is three colour-matrix functions now,
          so hero.css declares it once for the <img> and the <video> together
          and the two halves of this plate cannot drift apart.

          It is NOT inside the load sequence above and takes no delay from it.
          The reel starts when the file can start; the front crossing the sheet
          is type, and the plate was never part of it.
        */}
        <Reel slot="firstScreen" className="hero__reel" when="(min-aspect-ratio: 4 / 5)" />
      </motion.div>
      <div className="hero__scrim" aria-hidden="true" />
      {/*
        THE SURFACE, AND WHY IT IS <Grain> AGAIN.

        This used to be `.hero__stock` — the paper chapters' two near-white
        tiles, multiplied over the plate, because the chapter's ground was paper
        and the plate covered it. Multiply has nothing to take from a frame
        whose field is #000: the tooth simply vanished the moment the plate went
        dark.

        Screen is the operator that bites on ink, and <Grain> is the calibrated
        one — primitives.css sets its two slopes from a contrast budget, not by
        eye, so the worst grained pixel is still known. It is the surface the
        other ink chapters already carry, applied here where a full screen of
        near-black would otherwise be a flat digital void.
      */}
      <Grain />

      <div className="hero__sheet">
        {/*
          The sentence. One <h1>, announced once and whole to a screen reader
          through the sr-only span; the two visible lines are masked, animated
          and `aria-hidden` (LineReveal does that itself when `label` is null),
          and the screen of plate between them is decorative. Never an
          aria-label on the h1 — it would silently win over the real content.

          The two lines are a screen apart and still one heading: the <h1> takes
          rows 2–4 of the sheet's grid and hands them straight through with
          `grid-template-rows: subgrid`. See hero.css for why not
          `display: contents`.
        */}
        <h1 id="hero-title" className="hero__title t-display">
          <span className="sr-only">
            {line1} {line2}
          </span>

          <LineReveal
            as="span"
            className="hero__line hero__line--bow"
            lines={[line1]}
            label={null}
            mode="load"
            delay={T.bow}
            duration={1}
            bleed={0.16}
          />

          <LineReveal
            as="span"
            className="hero__line hero__line--strike"
            lines={[line2]}
            label={null}
            mode="load"
            delay={T.strike}
            duration={1}
            bleed={0.16}
          />
        </h1>

        {/*
          The offer. The sheet's only sentence of prose and the page's only
          action, ranged to the right trim and standing on the strike's own
          baseline band. The prose is set in SENTENCE CASE at caption size on
          purpose: `.t-mono` is for labels of three words or fewer, and this is
          a sentence, to be read rather than counted.

          The control is the press — the same object the header, the contents
          page, the schedule and the mobile bar print — so the page asks for the
          one thing it wants in one voice, and its vermilion arrow tile is the
          seal, which is job two of the three red is allowed.
        */}
        <div className="hero__offer">
          <Settle mode="load" delay={T.offer} duration={0.55}>
            <p className="t-caption hero__qualifier">{hero.offer[locale]}</p>
          </Settle>
          <Settle mode="load" delay={T.press} duration={0.55}>
            <Button href={cta.href} className="hero__press">
              {hero.ctaPrimary[locale]}
            </Button>
          </Settle>
        </div>
      </div>
    </Chapter>
  );
}
