"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { club } from "@/content/schedule";
import { chapters, hero } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { Button } from "@/components/ui/Button";
import { LineReveal } from "@/components/ui/LineReveal";
import { NextSessionStrip } from "@/components/ui/NextSessionStrip";
import { Photo } from "@/components/ui/Photo";
import { Reveal, EASE_OUT_EXPO } from "@/components/ui/Reveal";
import "@/styles/sections/hero.css";

/**
 * Chapter 一 — «Первая черта».
 * The one orchestrated moment of the page: eyebrow → two headline lines →
 * plate curtain → the sensei's first stroke 一 (finishing «Потом удар.») →
 * lead → actions → folio.
 */
export function Hero() {
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const ch = chapters[0];
  const d = (s: number) => (reduced ? 0 : s);

  return (
    <Chapter
      id={ch.id}
      index={1}
      title={ch.title[locale]}
      labelledBy="hero-title"
      className="hero"
      style={{ ["--numeral-top" as string]: "calc(var(--header-h) + 2.5rem)" }}
    >
      <div className="wrap hero__inner">
        {/* eyebrow row */}
        <Reveal mode="load" delay={0.1} y={10} duration={0.7} className="hero__eyebrow-row">
          <p className="t-mono text-ink-2">{hero.eyebrow[locale]}</p>
          <p className="t-accent text-ink-2 hero__aside">— {hero.aside[locale]}</p>
        </Reveal>

        {/* headline spans the page; the plate sits beside the shorter second line */}
        <div className="hero__stage">
          <LineReveal
            as="h1"
            id="hero-title"
            mode="load"
            delay={0.25}
            stagger={0.09}
            label={`${hero.line1[locale]} ${hero.line2[locale]}`}
            className="t-display t-hero hero__title"
            lines={[
              <span key="l1">{hero.line1[locale]}</span>,
              <span key="l2" className="hero__line2">
                <span className="text-ink-2">{hero.line2[locale]}</span>
                <span className="hero__stroke" aria-hidden="true">
                  <Brush kind="ichi" className="w-full h-auto text-shu" trigger="load" delay={d(1.25)} />
                </span>
              </span>,
            ]}
          />

          <div className="hero__below">
            <div className="hero__copy">
              <Reveal mode="load" delay={1.45} y={16} className="hero__lead">
                <p className="t-lead text-ink-2">{hero.lead[locale]}</p>
              </Reveal>
              <Reveal mode="load" delay={1.6} y={14} className="hero__actions">
                <Button href="#join" size="lg">{hero.ctaPrimary[locale]}</Button>
                <Button href="#schedule" variant="outline" size="lg">{hero.ctaSecondary[locale]}</Button>
                <a href={club.telegram} className="btn-text t-mono hero__tg" rel="noopener">
                  {hero.ctaTelegram[locale]} <span aria-hidden="true">→</span>
                </a>
              </Reveal>
            </div>

            {/* small plate on phones only */}
            <motion.figure
              className="hero__plate hero__plate--sm"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: d(1), delay: d(0.5), ease: EASE_OUT_EXPO }}
            >
              <div className="hero__plate-img">
                <Photo slot="heroPlate" sizes="45vw" priority />
              </div>
            </motion.figure>
          </div>

          {/* desktop plate, beside line 2 */}
          <div className="hero__plate-col">
            <motion.figure
              className="hero__plate hero__plate--lg"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: d(1.1), delay: d(0.35), ease: EASE_OUT_EXPO }}
            >
              <div className="hero__plate-img">
                <Photo slot="heroPlate" sizes="(min-width: 1024px) 30vw, 45vw" priority />
              </div>
              <figcaption className="t-caption text-ink-2 hero__caption">{hero.plateCaption[locale]}</figcaption>
            </motion.figure>
            <motion.div
              className="hero__kanji"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: d(1.2) }}
            >
              <Kanji id="kyoku" className="w-full" weight={5} label={null} />
              <Kanji id="shin" className="w-full" weight={5} label={null} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* folio bar */}
      <Reveal mode="load" delay={1.8} y={0} duration={0.9} className="hero__folio">
        <div className="wrap">
          <div className="rule" />
          <div className="hero__folio-row">
            <NextSessionStrip href="#schedule" className="hero__next" />
            <span className="hero__scroll t-mono text-ink-2" aria-hidden="true">
              {hero.scroll[locale]}
              <span className="hero__scroll-line" />
            </span>
          </div>
        </div>
      </Reveal>
    </Chapter>
  );
}
