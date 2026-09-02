"use client";

import "@/styles/sections/kyokushin.css";

import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, kyokushin } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Brush } from "@/components/brush/Brush";
import { Kanji } from "@/components/brush/Kanji";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal } from "@/components/ui/Reveal";

const chapter = chapters.find((c) => c.id === "kyokushin")!;
const HEADING_ID = "kyokushin-title";

/**
 * Chapter 二 / 02 — «Киокушин».
 *
 * The definition set as a dictionary entry: the headword, an em dash and the
 * gloss on its own line, with the chapter's single brush mark — an underline
 * ruled under «предельная истина». A hidden twin of the gloss sizes that
 * underline to the phrase exactly, so it never runs long or short in either
 * language. The reassurance couplet is hung lower in the right column, and a
 * printed 極真 bleeds off the top-right corner at 6%.
 */
export function Kyokushin() {
  const { locale } = useLocale();
  const t = kyokushin;

  return (
    <Chapter
      id={chapter.id}
      index={chapter.index}
      title={chapter.title[locale]}
      labelledBy={HEADING_ID}
      className="kyokushin relative overflow-hidden"
    >
      {/* 極真 printed large, clipped by the section */}
      <div className="kyokushin__mark" aria-hidden="true">
        <Kanji id="kyoku" className="w-full" weight={4} label={null} />
        <Kanji id="shin" className="w-full" weight={4} label={null} />
      </div>

      <div className="wrap pt-[var(--pad-top)] pb-[var(--pad-bottom)]">
        <div className="rule" />

        <Reveal delay={0.1} y={12} duration={0.8} className="flex items-baseline justify-between gap-6 pt-4">
          <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
          <span className="folio-inline t-mono">
            <Kanji id="ni" className="chapter__kanji" label={null} /> 02
          </span>
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:mt-16 lg:grid-cols-12">
          {/* ---- the entry: headword, dash, gloss, underline ---- */}
          <div className="lg:col-span-7">
            <h2 id={HEADING_ID} className="relative t-chapter kyokushin__headline">
              <span className="sr-only">
                {t.word[locale]} {t.dash[locale]} {t.meaning[locale]}
              </span>
              <LineReveal
                as="span"
                className="block"
                delay={0.1}
                stagger={0.1}
                lines={[
                  <span key="w">
                    {t.word[locale]} <span className="text-ink-3">{t.dash[locale]}</span>
                  </span>,
                  <span key="m" className="text-ink-2">
                    {t.meaning[locale]}
                  </span>,
                ]}
              />
              {/* a hidden twin of the gloss sizes the stroke to the phrase */}
              <span className="kyokushin__underline" aria-hidden="true">
                <span className="kyokushin__ghost">{t.meaning[locale]}</span>
                <Brush kind="underline" className="kyokushin__stroke text-shu" delay={0.75} />
              </span>
            </h2>
          </div>

          {/* ---- couplet, body, facts ---- */}
          <div className="lg:col-span-5 lg:pt-24">
            <Reveal delay={0.15}>
              <p className="t-statement kyokushin__couplet">
                <span className="block">{t.couplet1[locale]}</span>
                <span className="block text-ink-2">{t.couplet2[locale]}</span>
              </p>
            </Reveal>

            <Reveal delay={0.3} className="mt-10">
              <p className="max-w-[58ch] text-ink-2">{t.body[locale]}</p>
            </Reveal>

            <Reveal delay={0.4} className="mt-12">
              <dl className="grid grid-cols-[auto_1fr] gap-x-8">
                {t.facts.map((f, i) => (
                  <div key={f.k.en} className="contents">
                    <dt className={`t-mono text-ink-3 border-t border-rule py-3 ${i === 0 ? "" : ""}`}>
                      {f.k[locale]}
                    </dt>
                    <dd className="t-caption border-t border-rule py-3 text-ink">{f.v[locale]}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
