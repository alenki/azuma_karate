"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, hero, heroFit } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { Kanji } from "@/components/brush/Kanji";
import { Curtain } from "@/components/ui/Curtain";
import { EASE_BRUSH, EASE_OUT, EASE_PRESS, Register, Settle } from "@/components/ui/Reveal";
import { NextSessionStrip } from "@/components/ui/NextSessionStrip";
import { Photo } from "@/components/ui/Photo";
import "@/styles/sections/hero.css";

/**
 * The travelling edge of the brush, as a clip path.
 *
 * `p` runs 0 → 1. The edge is convex — the belly of the bristles reaches the
 * paper before the heel and the toe — and leans back at the foot, the way a
 * loaded brush drags. The shape is affine in `p`, so Motion interpolating
 * between wipe(0) and wipe(1) produces exactly the intermediate positions.
 */
function wipe(p: number) {
  const x = p * 118 - 9;
  return (
    `polygon(-40% -40%, ${(x - 1.6).toFixed(2)}% -40%, ${(x + 0.5).toFixed(2)}% 24%, ` +
    `${(x + 1.5).toFixed(2)}% 52%, ${(x + 0.2).toFixed(2)}% 78%, ${(x - 2.4).toFixed(2)}% 140%, -40% 140%)`
  );
}

/**
 * How long the hand takes to lay a stroke `w` pixels long.
 *
 * The wipe used to run for a hardcoded 1.15s at every width, over a band that
 * is ~430px on a 390 phone and ~2660px on a 2560 sheet — so the page's one
 * hand-made mark was drawn at seven different speeds, a slow smear on a phone
 * and an implausible sprint on a monitor. It is measured now.
 *
 * The law is affine rather than a constant velocity, because a constant
 * velocity is not what a hand does either: someone drawing a longer stroke
 * swings from the shoulder and moves faster, they do not take seven times as
 * long. So: a fixed cost for loading the brush and lifting it off, plus travel
 * at ~2600px/s. That holds 1.15s at 1512 — the setting the mark was drawn and
 * judged against — draws the short phone mark in 0.70s and the 2560 sheet in
 * 1.57s. The clamps are stops for widths nobody designs for, not settings.
 */
function strokeSeconds(w: number) {
  return Math.min(1.9, Math.max(0.7, 0.55 + w / 2600));
}

const RISE = { y: "112%" };
const SET = { y: "0%" };

/**
 * Chapter 一 — «Первая черта».
 *
 * The one orchestrated moment of the site, and it is ONE gesture rather than a
 * queue: everything after the brush continues the front it left, from the
 * binding side towards the trim.
 *
 *   0.06  the masthead is printed (it does not fly in — it settles)
 *   0.14  the rule is drawn left → right
 *   0.24  «Сначала поклон.» rises inside its mask
 *   0.40  «Потом удар.» follows it
 *   0.62  the brush crosses the sheet, for as long as the sheet is wide
 *   0.86  the plate opens FROM THE LEFT, in the brush's wake
 *   1.02  its legend is printed under it
 *   1.14  the lead and the offer come into register along the same baseline
 *   1.50  the seal is pressed onto the button
 *   1.38  the folio's hairline is ruled out under all of it
 *   1.55  the live strip and the scroll cue come into register
 *   1.80  the scroll cue rules its own line out — the last mark on the sheet
 *
 * Nothing on the page moves again after 2.5 seconds. In particular nothing
 * LOOPS: the scroll cue used to breathe on a 2.6s ping-pong forever, which on
 * a sheet whose premise is that everything is typeset and still made the one
 * perpetual thing on the page a hairline that is not even the brush.
 */
export function Hero() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const ch = chapters[0];
  const fit = heroFit[locale];

  /** Seconds, or none at all when the reader has asked for stillness. */
  const d = (s: number) => (reduced ? 0 : s);

  /*
    The band is measured, not assumed: it is `100% + gutter + band-bleed` of a
    full-bleed sheet, so nothing in CSS or in this file knows how long the
    stroke is until the box exists. A ResizeObserver rather than a `resize`
    listener because the band also changes with a zoom, with the scrollbar
    appearing, and with the container query the stage declares — none of which
    fire `resize`.

    `drawn` gates the animation rather than only its duration: Motion reads a
    transition when the TARGET changes, so a duration that arrives one render
    after the animation started would simply be ignored. Holding the target at
    wipe(0) for the one frame it takes to measure means the stroke is always
    laid at the speed of the sheet it is being laid on.
  */
  const press = useRef<HTMLSpanElement>(null);
  const [band, setBand] = useState<number | null>(null);

  useEffect(() => {
    const el = press.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      /* ignore sub-pixel and scrollbar-sized noise: re-rendering the hero to
         change the stroke by two hundredths of a second is not worth a frame */
      setBand((prev) => (prev !== null && Math.abs(prev - w) < 24 ? prev : w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const drawn = band !== null;
  const hand = strokeSeconds(band ?? 0);

  const line2 = hero.line2[locale];

  return (
    <Chapter
      id={ch.id}
      index={1}
      title={ch.title[locale]}
      labelledBy="hero-title"
      className="hero"
      style={{ ["--numeral-top" as string]: "calc(var(--header-h) + 2.75rem)" }}
    >
      {/* masthead */}
      <div className="wrap">
        <Settle className="hero__masthead" mode="load" delay={d(0.06)} duration={d(0.7)}>
          <p className="t-mono hero__eyebrow text-ink-2">{hero.eyebrow[locale]}</p>
          {/* The binding margin does not exist under 768, so the chapter count
              prints in the running head instead — the same `.folio-inline` the
              other nine chapters carry. Without it the manual's first chapter
              was the only unnumbered page in the book on a phone. */}
          <span className="folio-inline t-mono">
            <Kanji id="ichi" className="chapter__kanji" label={null} /> 01
          </span>
          <p className="t-accent hero__aside">— {hero.aside[locale]}</p>
        </Settle>
        {/* a chapter's own opening rule is the strong one; the folio's closing
            hairline below is the standard weight */}
        <motion.div
          className="rule rule--strong hero__masthead-rule"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: d(1), delay: d(0.14), ease: EASE_OUT }}
        />
      </div>

      <div className="hero__stage" style={{ "--em-wide": fit.wide, "--em-narrow": fit.narrow } as CSSProperties}>
        <h1 id="hero-title" className="hero__title t-display">
          <span className="sr-only">
            {hero.line1[locale]} {line2}
          </span>

          <span className="hero__head" aria-hidden="true">
            <span className="hero__line">
              <motion.span
                className="hero__line-in"
                initial={RISE}
                animate={SET}
                transition={{ duration: d(1.1), delay: d(0.24), ease: EASE_OUT }}
              >
                {hero.line1[locale]}
              </motion.span>
            </span>
          </span>

          <span className="hero__deck" aria-hidden="true">
            <span className="hero__line">
              <motion.span
                className="hero__line-in"
                initial={RISE}
                animate={SET}
                transition={{ duration: d(1.1), delay: d(0.4), ease: EASE_OUT }}
              >
                {line2}
              </motion.span>
            </span>

            {/*
              The first stroke. It is the mark and nothing else now: pure
              vermilion, laid straight across the sheet under the headline and
              running off the right trim. It used to carry the hero photograph
              inside it as a mask — an idea that read, at screen resolution, as
              a torn JPEG: the plate was squeezed to 7.5:1 and unreadable, and
              the dry tail's bristle ribbons looked like scan lines. The
              photograph now has its own frame in the register below, where it
              can be seen, and the brush is allowed to be a brush.
            */}
            <span className="hero__press" ref={press} aria-hidden="true">
              <motion.span
                className="hero__band"
                initial={{ clipPath: wipe(0) }}
                animate={{ clipPath: drawn ? wipe(1) : wipe(0) }}
                transition={{ duration: d(hand), delay: d(0.62), ease: EASE_BRUSH }}
              />
            </span>
          </span>
        </h1>
      </div>

      {/* Printed under the plate: its colophon on the left, the lead in the
          middle and the offer ranged hard right — two columns under 1440,
          three ranged blocks on the page grid above it, four fields from 1600
          where the plate takes a column more and its legend keeps its own.
          Nothing sits on the tail — by then the stroke has broken into bristle
          ribbons and no type could be read across them. */}
      <div className="wrap hero__base">
        <figure className="hero__colophon">
          {/* The photograph, at last legible: its own frame, its own crop, its
              own caption — and the LCP element of the page.

              It opens from the LEFT, because that is the direction the brush
              travelled: the plate floods in behind the same front rather than
              fading up in place. It used to drift 13px under the scroll and
              lean 4px under the pointer, which is the cost of a `useScroll`, a
              spring and a pointermove handler for an effect below the
              threshold at which anyone reads it as depth. One legible gesture
              beats two invisible ones. */}
          <Curtain
            className="hero__plate"
            from="left"
            mode="load"
            delay={0.86}
            duration={0.9}
            scale={1.05}
          >
            <Photo
              slot="heroStroke"
              sizes="(min-width: 1600px) 32vw, (min-width: 1440px) 26vw, (min-width: 768px) 34vw, 92vw"
              preload
              fetchPriority="high"
            />
          </Curtain>
          {/* a legend is printed with the plate, not flown in after it */}
          <Settle className="hero__colophon-text" mode="load" delay={1.02} duration={0.75}>
            <p className="t-caption">{hero.plateCaption[locale]}</p>
            <p className="t-mono hero__hand">{hero.hand[locale]}</p>
          </Settle>
        </figure>

        {/* The lead and the offer come into register along one baseline rather
            than arriving as a block: from 1440 `.hero__pitch` is
            `display: contents` and Register's two item wrappers are placed
            straight onto the page grid, so the button stands on the same
            vertical as the aside above it and the scroll cue below it. */}
        <Register className="hero__pitch" mode="load" delay={1.14} stagger={0.16} duration={0.78} x={-14}>
          <p className="hero__lead">{hero.lead[locale]}</p>
          <div className="hero__act">
            <a href="#join" className="hero__cta">
              <span className="hero__cta-label t-mono">{hero.ctaPrimaryShort[locale]}</span>
              {/* the page's one action gets a landing of its own: the seal is
                  pressed onto the button on `--ease-press`, which overshoots,
                  because a press rebounds. Transform only — the tile's box
                  never moves. */}
              <motion.span
                className="hero__cta-seal"
                aria-hidden="true"
                initial={{ scale: 0.84 }}
                animate={{ scale: 1 }}
                transition={{ duration: d(0.55), delay: d(1.5), ease: EASE_PRESS }}
              >
                <span className="hero__cta-arrow">→</span>
              </motion.span>
            </a>
            <p className="hero__trial t-mono">
              <span>{hero.trial[locale]}</span>
              <a href={club.telegram} className="hero__tg" rel="noopener">
                Telegram <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </Register>
      </div>

      {/* folio */}
      <div className="hero__folio">
        <div className="wrap">
          <motion.div
            className="rule hero__folio-rule"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: d(0.85), delay: d(1.38), ease: EASE_OUT }}
          />
          <Register
            className="hero__folio-row"
            itemClassName="hero__folio-cell"
            mode="load"
            delay={1.55}
            stagger={0.09}
            duration={0.7}
            x={-12}
          >
            <NextSessionStrip href="#schedule" className="hero__next" />
            <a href="#about" className="hero__scroll t-mono">
              {hero.scroll[locale]}
              {/* ruled out once, left → right, and then left printed. A rule
                  that arrives last says "there is more below" better than one
                  that twitches for as long as the reader stays. */}
              <motion.span
                className="hero__scroll-line"
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: d(0.7), delay: d(1.8), ease: EASE_OUT }}
              />
            </a>
          </Register>
        </div>
      </div>
    </Chapter>
  );
}
