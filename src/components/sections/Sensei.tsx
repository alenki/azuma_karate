"use client";

import "@/styles/sections/sensei.css";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { chapters, sensei } from "@/content/home";
import { Chapter } from "@/components/layout/Chapter";
import { Kanji } from "@/components/brush/Kanji";
import { Seal } from "@/components/brush/Seal";
import { Photo } from "@/components/ui/Photo";
import { Curtain } from "@/components/ui/Curtain";
import { Reveal } from "@/components/ui/Reveal";
import { LineReveal } from "@/components/ui/LineReveal";

const chapter = chapters.find((c) => c.id === "sensei")!;
const HEADING_ID = "sensei-heading";

/* Toggle label per the chapter brief; the hover hint itself is sensei.hoverHint. */
const ui = {
  ru: { colour: "Показать в цвете" },
  en: { colour: "Show in colour" },
} as const;

const PLATE_SIZES = "(min-width: 1024px) 40vw, (min-width: 768px) 26rem, 100vw";

/**
 * Chapter 四 / 04 — «Тренер».
 *
 * A 3:4 portrait plate in columns 1–5 breaks the grid upward across the
 * chapter's top rule; the text column (7–12) sets the name in Prata, the rank,
 * the decree as a plain caption, the bio, and the quote with the club's seal
 * pressed at the right edge — the chapter's single brush mark, stamped last.
 * The plate is grayscale and shows its colour on hover, focus, or the toggle.
 */
export function Sensei() {
  const { locale } = useLocale();
  const [colour, setColour] = useState(false);
  const t = sensei;

  /* first name / surname on their own lines — both locales are two words */
  const nameLines = t.name[locale].split(" ");


  return (
    <Chapter id={chapter.id} index={chapter.index} title={chapter.title[locale]} labelledBy={HEADING_ID}>
      <div className="wrap pt-4 pb-20 md:pb-24 lg:pt-0 lg:pb-32">
        {/* mobile folio — the binding margin does not exist on phones */}
        <span className="folio-inline t-mono mb-5">
          <Kanji id="shi" className="chapter__kanji" label={null} /> 04
        </span>

        {/* the chapter's top rule; the plate crosses it on wide screens */}
        <div className="rule" />

        <div className="grid gap-x-8 lg:grid-cols-12 lg:items-start">
          {/* ---- plate, cols 1–5, pulled 4rem above the rule ---- */}
          <figure
            className="sensei-figure mt-8 md:max-w-[26rem] lg:col-span-5 lg:-mt-16 lg:max-w-none"
            data-colour={colour ? "on" : "off"}
          >
            <Curtain className="sensei-plate aspect-[4/5] lg:aspect-[3/4]" duration={1.2}>
              <Photo slot="coachPortrait" priority={false} sizes={PLATE_SIZES} />
              <Photo
                slot="coachPortrait"
                grade="color"
                priority={false}
                sizes={PLATE_SIZES}
                className="sensei-plate__color"
                aria-hidden="true"
              />
            </Curtain>

            <div className="mt-4 flex flex-col items-start gap-1">
              <p className="sensei-hint t-caption text-ink-2">{t.hoverHint[locale]}</p>
              <button
                type="button"
                className="sensei-toggle t-mono inline-flex min-h-11 items-center gap-3"
                aria-pressed={colour}
                onClick={() => setColour((v) => !v)}
              >
                <span className="sensei-toggle__dot" aria-hidden="true" />
                {ui[locale].colour}
              </button>
            </div>
          </figure>

          {/* ---- text, cols 7–12 ---- */}
          <div className="pt-10 md:pt-12 lg:col-span-6 lg:col-start-7 lg:pt-14">
            <Reveal delay={0.1}>
              <p className="t-mono text-ink-2">{t.eyebrow[locale]}</p>
            </Reveal>

            <h2 id={HEADING_ID} className="t-chapter mt-5 md:mt-6">
              <LineReveal as="span" className="block" lines={nameLines} label={t.name[locale]} delay={0.15} stagger={0.1} />
            </h2>

            <Reveal delay={0.3}>
              <p className="t-statement mt-6 max-w-[22ch] text-ink-2">{t.rank[locale]}</p>
            </Reveal>

            {/* the decree is summarised in one caption line — never typeset as a document */}
            <Reveal delay={0.35}>
              <p className="t-caption mt-4 max-w-[52ch] text-ink-2">{t.decree[locale]}</p>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="rule mt-10 md:mt-12" />
              <p className="t-lead mt-8 max-w-[60ch]">{t.bio[locale]}</p>
            </Reveal>

            {/* quote at the left; the seal pressed at the right edge, its top
                biting ~30% into the bio's last line; the signature under it */}
            <div className="mt-8 grid grid-cols-[1fr_auto] items-start gap-x-6 md:gap-x-8">
              <Reveal delay={0.5}>
                <blockquote className="t-accent text-[1.5rem] leading-[1.2] md:text-[2rem]">
                  <p>{t.quote[locale]}</p>
                </blockquote>
              </Reveal>
              <div className="-mt-16 flex flex-col items-end md:-mt-20">
                <Seal className="w-28 md:w-40" delay={0.7} />
                <Reveal delay={0.55} className="mt-2">
                  <p className="t-accent text-right text-[1.25rem] leading-none text-shu">{t.signature[locale]}</p>
                </Reveal>
              </div>
            </div>

            {/* second coach — name and role are PLACEHOLDER copy in home.ts */}
            <Reveal delay={0.6}>
              <div className="mt-12 grid gap-y-2 border-y border-rule py-5 md:grid-cols-[10rem_1fr] md:gap-x-8">
                <p className="t-mono pt-1 text-ink-2">{t.second.label[locale]}</p>
                <div>
                  <p className="t-h3 font-display">{t.second.name[locale]}</p>
                  <p className="t-caption mt-1 text-ink-2">{t.second.role[locale]}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
