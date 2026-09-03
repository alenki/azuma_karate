"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, hero, heroFit } from "@/content/home";
import { club } from "@/content/schedule";
import { Chapter } from "@/components/layout/Chapter";
import { EASE_BRUSH } from "@/components/brush/Brush";
import { EASE_OUT_EXPO } from "@/components/ui/Reveal";
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

const RISE = { y: "112%" };
const SET = { y: "0%" };

/**
 * Chapter 一 — «Первая черта».
 *
 * The one orchestrated moment of the site. Masthead, rule, then «Сначала
 * поклон.» set to the trim on bare paper — there is no column here, the sheet
 * is the page, and the headline is the page width over the length of the longer
 * line. At 0.42s the brush lands and lays the first stroke straight across the
 * full width of the paper in vermilion; the plate floods in behind the same
 * front a beat later, so the photograph appears in the brush's wake rather than
 * fading up, and a hairline of pigment survives all the way round the gesture.
 * «Потом удар.» rises into the ink as it passes and straddles its top edge.
 * Then the under-plate register — colophon, lead, seal-tiled button — and the
 * folio. Nothing on the page moves again after 1.9 seconds.
 */
export function Hero() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const ch = chapters[0];
  const fit = heroFit[locale];
  const stage = useRef<HTMLDivElement>(null);

  /** Seconds, or none at all when the reader has asked for stillness. */
  const d = (s: number) => (reduced ? 0 : s);

  /* The plate drifts inside the stroke as the page scrolls, and leans a little
     under the pointer, so the mark reads as a slot cut through the paper rather
     than a picture pasted on it. Transforms only.

     Both are gated on `reduced` here, in the range. <MotionConfig reducedMotion="user">
     neutralises animations and variants, but a useScroll → useTransform value written
     into `style` is not an animation — it is a live motion value, and it keeps running.
     Morning's plate gates the identical effect the same way. */
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end start"] });
  const driftY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "8%"]);
  const lean = useMotionValue(0);
  const leanX = useTransform(useSpring(lean, { stiffness: 48, damping: 22, mass: 0.7 }), [-1, 1], ["-1.2%", "1.2%"]);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    lean.set(((e.clientX - box.left) / box.width) * 2 - 1);
  };

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
        <motion.div
          className="hero__masthead"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d(0.6), delay: d(0.06), ease: EASE_OUT_EXPO }}
        >
          <p className="t-mono hero__eyebrow text-ink-2">{hero.eyebrow[locale]}</p>
          <p className="t-accent hero__aside">— {hero.aside[locale]}</p>
        </motion.div>
        <motion.div
          className="rule hero__masthead-rule"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: d(1), delay: d(0.14), ease: EASE_OUT_EXPO }}
        />
      </div>

      <div
        ref={stage}
        className="hero__stage"
        onPointerMove={onPointerMove}
        style={{ "--em-wide": fit.wide, "--em-narrow": fit.narrow } as CSSProperties}
      >
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
                transition={{ duration: d(1.1), delay: d(0.24), ease: EASE_OUT_EXPO }}
              >
                {hero.line1[locale]}
              </motion.span>
            </span>
          </span>

          <span className="hero__deck" aria-hidden="true">
            {/* the first stroke: vermilion, with the plate flooding in behind it */}
            <motion.span
              className="hero__band"
              initial={{ clipPath: wipe(0) }}
              animate={{ clipPath: wipe(1) }}
              transition={{ duration: d(1.15), delay: d(0.42), ease: EASE_BRUSH }}
            >
              <motion.span
                className="hero__band-plate"
                initial={{ clipPath: wipe(0) }}
                animate={{ clipPath: wipe(1) }}
                transition={{ duration: d(1.2), delay: d(0.66), ease: EASE_BRUSH }}
              >
                <motion.span className="hero__band-img" style={{ y: driftY, x: leanX }}>
                  {/* The band is 104.4vw of the sheet and this box is inset -3%
                      on each side for the lean, so the file is asked for 112vw
                      rather than the 110vw the old 82rem column needed. */}
                  <Photo slot="heroStroke" grade="color" sizes="112vw" preload fetchPriority="high" />
                </motion.span>
                <span className="hero__band-scrim" />
                <span className="grain hero__band-grain" />
              </motion.span>
            </motion.span>

            {/* the second line, set twice: ink on the paper, bone in the ink */}
            <span className="hero__line">
              <motion.span
                className="hero__line-in"
                initial={RISE}
                animate={SET}
                transition={{ duration: d(1.1), delay: d(0.72), ease: EASE_OUT_EXPO }}
              >
                <span className="hero__knockout">
                  {line2}
                  <span className="hero__knockout-lit">{line2}</span>
                </span>
              </motion.span>
            </span>
          </span>
        </h1>

      </div>

      {/* Printed under the plate: its colophon on the left, the lead in the
          middle and the offer ranged hard right — two columns under 1440, three
          ranged blocks on the page grid above it. Nothing sits on the tail — by
          then the stroke has broken into bristle ribbons and no type could be
          read across them. */}
      <motion.div
        className="wrap hero__base"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: d(0.85), delay: d(1.05), ease: EASE_OUT_EXPO }}
      >
        <div className="hero__colophon">
          <p className="t-caption">{hero.plateCaption[locale]}</p>
          <p className="t-mono hero__hand">{hero.hand[locale]}</p>
        </div>
        {/* The lead and the offer are one block until the sheet is wide enough
            to range them on two verticals of their own; from 1440 `.hero__pitch`
            is `display: contents` and its two halves are placed straight onto
            the page grid. */}
        <div className="hero__pitch">
          <p className="hero__lead">{hero.lead[locale]}</p>
          <div className="hero__act">
            <a href="#join" className="hero__cta">
              <span className="hero__cta-label t-mono">{hero.ctaPrimaryShort[locale]}</span>
              <span className="hero__cta-seal" aria-hidden="true">
                <span className="hero__cta-arrow">→</span>
              </span>
            </a>
            <p className="hero__trial t-mono">
              <span>{hero.trial[locale]}</span>
              <a href={club.telegram} className="hero__tg" rel="noopener">
                Telegram <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* folio */}
      <motion.div
        className="hero__folio"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: d(0.9), delay: d(1.3) }}
      >
        <div className="wrap">
          <div className="rule" />
          <div className="hero__folio-row">
            <NextSessionStrip href="#schedule" className="hero__next" />
            <a href="#about" className="hero__scroll t-mono">
              {hero.scroll[locale]}
              <span className="hero__scroll-line" aria-hidden="true" />
            </a>
          </div>
        </div>
      </motion.div>
    </Chapter>
  );
}
