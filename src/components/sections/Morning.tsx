"use client";

import "@/styles/sections/morning.css";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, morning } from "@/content/home";
import { club } from "@/content/schedule";
import { sunriseAt } from "@/lib/sunrise";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import { Chapter } from "@/components/layout/Chapter";
import { Kanji } from "@/components/brush/Kanji";
import { Curtain } from "@/components/ui/Curtain";
import { LineReveal } from "@/components/ui/LineReveal";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "morning")!;
const HEADING_ID = "morning-title";

const sunriseStore = createLiveStore<string>(
  () => sunriseAt(club.lat, club.lng, new Date(), club.timeZone),
  (s) => s,
  15 * 60_000,
);

/**
 * Chapter 六 / 06 — «Утро».
 *
 * The photo spread, and the one chapter the brush skips: a manual is not
 * annotated on the plate page. A wide muted plate drifts under a transform-only
 * parallax, a paper caption card is pressed into its corner with today's
 * computed sunrise, and the text below sets the two addresses of the club.
 */
export function Morning() {
  const { locale } = useLocale();
  const t = morning;
  const reduced = useReducedMotion();
  const plateRef = useRef<HTMLDivElement>(null);
  /* today's sunrise is client-only: the server has no clock for Nalchik */
  const sunrise = useLiveStore(sunriseStore, "—");

  const { scrollYProgress } = useScroll({ target: plateRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="morning relative overflow-hidden"
    >
      {/* ---- the spread ---- */}
      <div className="relative" ref={plateRef}>
        <Curtain className="morning-plate" duration={1.2}>
          <motion.div className="morning-plate__img" style={{ y }}>
            <Photo slot="sunriseKick" grade="muted" sizes="100vw" />
          </motion.div>
        </Curtain>

        <div className="morning-card__anchor">
          <div className="wrap">
            <Reveal delay={0.5} y={14} className="morning-card">
              <p className="t-caption text-ink-2 morning-caption">{t.plateCaption[locale]}</p>
              <p className="t-mono mt-2 text-ink">
                {t.sunriseLabel[locale]} · <time>{sunrise}</time>
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ---- the text ---- */}
      <div className="wrap pt-14 pb-24 md:pt-20 md:pb-32">
        <div className="rule" />
        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="roku" className="chapter__kanji" label={null} /> 06
          </span>
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id={HEADING_ID} className="t-chapter morning-title">
              <LineReveal
                as="span"
                className="block"
                delay={0.1}
                stagger={0.1}
                lines={[t.title[locale].split(" ").slice(0, 2).join(" "), t.title[locale].split(" ").slice(2).join(" ")]}
              />
            </h2>
            <Reveal delay={0.35} className="mt-10 hidden lg:block">
              <figure className="m-0">
                <Curtain className="aspect-[4/5]" duration={1}>
                  <Photo slot="parkAlley" sizes="30vw" />
                </Curtain>
              </figure>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-3">
            <Reveal delay={0.25}>
              <p className="t-lead max-w-[58ch] text-ink-2">{t.body[locale]}</p>
            </Reveal>
            <Reveal delay={0.4} className="mt-12">
              <div className="rule" />
              <p className="t-mono mt-4 text-ink-2">
                {t.meta[locale].split("Telegram")[0]}
                <a href={club.telegram} className="morning-tg" rel="noopener">
                  Telegram
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
