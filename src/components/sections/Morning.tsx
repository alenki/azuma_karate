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
 *
 * The plate is printed outside the trim, so it is as wide as the screen and
 * only its height is composed — see `--morning-plate-h` in `morning.css`,
 * which takes the larger of a viewport-height and a viewport-width term so the
 * spread keeps a photographic proportion instead of turning into a letterbox
 * strip on a wide sheet. The text block below stands on the shared
 * twelve-column page grid and gains a third field at 1600 rather than
 * stretching the two it has.
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
            <Photo slot="sunriseKick" grade="duotone" sizes="100vw" />
          </motion.div>
        </Curtain>

        <div className="morning-card__anchor">
          <div className="wrap">
            <Reveal delay={0.5} y={14} className="morning-card">
              <p className="t-caption text-ink-2 morning-caption">{t.plateCaption[locale]}</p>
              <p className="t-mono mt-2 text-ink">
                {t.sunriseLabel[locale]} ·{" "}
                {sunrise === "—" ? <span aria-hidden="true">—</span> : <time dateTime={sunrise}>{sunrise}</time>}
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ---- the text ---- */}
      <div className="wrap morning__text">
        <div className="rule" />
        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="roku" className="chapter__kanji" label={null} /> 06
          </span>
        </Reveal>

        {/*
          Four blocks on the sheet's own twelve-column field, placed in
          `morning.css`: title and lead face each other on the first row, the
          park plate and the meta line stand on the second, and from 1600 the
          meta leaves that row to become a margin note at the right trim.
          The DOM order is the reading order at every width.
        */}
        <div className="morning__body page-grid">
          <h2 id={HEADING_ID} className="t-chapter morning-title morning__title-col">
            <LineReveal
              as="span"
              className="block"
              delay={0.1}
              stagger={0.1}
              lines={t.titleLines[locale]}
            />
          </h2>

          <Reveal delay={0.25} className="morning__lead-col">
            <p className="t-lead measure-lead text-ink-2">{t.body[locale]}</p>
          </Reveal>

          <Reveal delay={0.35} className="morning__figure-col">
            <figure className="m-0">
              <Curtain className="morning__figure-plate" duration={1}>
                <Photo
                  slot="parkAlley"
                  sizes="(min-width: 2000px) 22vw, (min-width: 1600px) 26vw, (min-width: 1024px) 30vw, 100vw"
                />
              </Curtain>
              <figcaption className="t-caption mt-3 text-ink-quiet">{t.plateCaption[locale]}</figcaption>
            </figure>
          </Reveal>

          {/*
            «Два адреса» set as two facing register blocks, bottom-aligned with
            the plate beside them. The chapter names both addresses now instead
            of burying one of them in the lead.
          */}
          <Reveal delay={0.4} className="morning__places-col">
            <ul className="morning__places" role="list">
              {t.places.map((place, i) => {
                const href = i === 0 ? club.mapsHref : club.telegram;
                return (
                  <li key={place.where.ru} className="morning__place">
                    <div className="rule" />
                    <p className="t-mono morning__place-kicker">{place.kicker[locale]}</p>
                    <h3 className="t-h3 font-display morning__place-where">{place.where[locale]}</h3>
                    <p className="t-caption morning__place-when">
                      {i === 0 ? club.address[locale] : place.when![locale]}
                    </p>
                    <p className="morning__place-note">{place.note[locale]}</p>
                    <a
                      href={href}
                      className="t-mono morning__place-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {place.linkLabel[locale]} <span aria-hidden="true">&#8594;</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
