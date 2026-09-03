"use client";

import "@/styles/sections/morning.css";

import { motion, useScroll, useTransform } from "motion/react";
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
import { Register, Reveal, Settle } from "@/components/ui/Reveal";

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
 * The spread is printed outside the trim, so it is as wide as the screen and
 * only its height is composed — see `--morning-plate-h` in `morning.css`,
 * which takes the larger of a viewport-height and a viewport-width term so the
 * spread keeps a photographic proportion instead of turning into a letterbox
 * strip on a wide sheet.
 *
 * THE FIGURE BELOW IT. «Два адреса. Один путь.» — so the second row of the
 * chapter is three ruled fields across the sheet: the hall at the binding, the
 * park at the right trim, and the path between them as a plate. All three open
 * on the same hairline, and the plate takes its HEIGHT from the type beside it
 * rather than from an aspect ratio of its own. That is the whole cure for the
 * ~500px hole this chapter used to print: a 4:5 portrait plate beside two short
 * register blocks left half a screen of paper doing nothing, and no amount of
 * aligning the blocks to its foot could fill it. A field that is exactly as
 * tall as its neighbours cannot open a hole.
 */
export function Morning() {
  const { locale } = useLocale();
  const t = morning;
  const plateRef = useRef<HTMLDivElement>(null);
  /* today's sunrise is client-only: the server has no clock for Nalchik */
  const sunrise = useLiveStore(sunriseStore, "—");

  /*
    The one scroll-linked value in the chapter, driving one property.
    Reduced motion is pinned in CSS (`transform: none !important` on the layer),
    not branched here: the server renders scroll progress 0, so a branch would
    serialise `translateY(-6%)` into the HTML and hydrate it against a client
    `0%` — the mismatch AzumaFigure documents. Same reasoning, same fix.
  */
  const { scrollYProgress } = useScroll({ target: plateRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

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
            <Photo slot="sunriseKick" sizes="100vw" />
          </motion.div>
        </Curtain>

        <div className="morning-card__anchor">
          <div className="wrap">
            {/* the card is not flown in: it is a caption, so it is printed */}
            <Settle delay={0.5} className="morning-card">
              <p className="t-caption text-ink-2 morning-caption">{t.plateCaption[locale]}</p>
              <p className="t-mono mt-2 text-ink">
                {t.sunriseLabel[locale]} ·{" "}
                {sunrise === "—" ? <span aria-hidden="true">—</span> : <time dateTime={sunrise}>{sunrise}</time>}
              </p>
            </Settle>
          </div>
        </div>
      </div>

      {/* ---- the text ---- */}
      <div className="wrap morning__text">
        <div className="rule" />
        {/* running head and folio: two marks holding one baseline, so they come
            into register along it rather than rising out of the rule */}
        <Register delay={0.1} x={-12} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="roku" className="chapter__kanji" label={null} /> 06
          </span>
        </Register>

        {/*
          Two rows of the sheet's own twelve-column field, placed in
          `morning.css`: title and lead face each other on the first, and the
          second is the chapter's figure — hall · path · park.

          The address list spans the whole field and prints in its outer
          columns only, so the plate stands in the gap it leaves. That looks
          like an overlap and is one, deliberately: it is the only way to keep
          two addresses inside ONE <ul> — the list is what tells a screen
          reader there are two of them — while a photograph stands between them
          on the page. The list paints nothing in the middle columns, and the
          plate follows it in the DOM, so it is the plate that is on top.
        */}
        <div className="morning__body page-grid">
          <h2 id={HEADING_ID} className="t-chapter morning__title-col">
            <LineReveal
              as="span"
              className="block"
              delay={0.1}
              stagger={0.1}
              label={t.title[locale]}
              lines={[
                t.titleLines[locale][0],
                /*
                  «Один путь.» steps back into the secondary ink. The tone rides
                  the line itself, the way About sets its two-tone words —
                  never a positional selector: LineReveal emits its
                  screen-reader copy as the heading's first child, so a
                  `span + span` rule matched line ONE as well and the whole
                  monument printed in #5a554e with no black anywhere in it.
                */
                <span key="back" className="text-ink-2">
                  {t.titleLines[locale][1]}
                </span>,
              ]}
            />
          </h2>

          <Reveal delay={0.25} className="morning__lead-col">
            <p className="t-lead measure-lead text-ink-2">{t.body[locale]}</p>
          </Reveal>

          {/* a short rise, not the default 28: the three fields of this row are
              ruled off by one hairline and a tall travel breaks that line for
              the length of the arrival */}
          <Reveal delay={0.3} y={14} className="morning__places-col">
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
                    {/*
                      The exits carry the chapter foot's own device — a ruled
                      label that doubles its rule on hover and focus, and an
                      arrow that steps. They used to turn vermilion, which is
                      the sensei's brush and the club's seal and nothing else.
                    */}
                    <a
                      href={href}
                      className="t-mono morning__place-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="morning__place-link-label">{place.linkLabel[locale]}</span>
                      <span className="morning__place-arrow" aria-hidden="true">
                        &#8594;
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/*
            The path. No <Reveal> around it — a plate is uncovered by the
            curtain and its caption is printed; wrapping the pair in a rise as
            well made the whole figure arrive twice.
          */}
          <figure className="morning__figure morning__figure-col">
            <div className="rule" />
            <Curtain className="morning__figure-plate" duration={1} delay={0.15} amount={0}>
              <Photo slot="parkAlley" sizes="(min-width: 1024px) 32vw, 100vw" />
            </Curtain>
            <figcaption className="morning__figure-cap">
              <Settle delay={0.45} className="t-caption">
                {t.plateCaptionAlley[locale]}
              </Settle>
            </figcaption>
          </figure>
        </div>
      </div>
    </Chapter>
  );
}
