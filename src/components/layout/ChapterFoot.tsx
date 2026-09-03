"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Kanji } from "@/components/brush/Kanji";
import { Reveal } from "@/components/ui/Reveal";
import { CHAPTER_NUMERALS } from "./Chapter";

export type ChapterFootLink = {
  href: string;
  label: string;
};

type ChapterFootProps = {
  /** 1-based chapter number — drives the folio kanji and the two digits. */
  index: number;
  /**
   * The closing line. One sentence, set in `.t-note` (the mono voice for matter
   * that is read), so it stays apparatus without becoming a tracked all-caps
   * label. Omit it and the foot is just a folio and its exits.
   */
  note?: ReactNode;
  /** Where the chapter lets the reader out. Two at most — see below. */
  links?: ChapterFootLink[];
  /** Print the closing hairline. Off for a chapter that rules its own foot. */
  rule?: boolean;
  /** Seconds; the row rises in like any other block. */
  delay?: number;
  className?: string;
};

/**
 * The foot of a chapter — the page furniture that closes it, the way the rule
 * and the running head open it.
 *
 * Ten chapters opened with a bracket and only two closed with one, so every
 * other chapter simply ran off the bottom of the sheet into a band of blank
 * paper. This is About's hand-drawn colophon promoted to a component: a
 * hairline, the folio kanji ranged to the binding, one closing line, and up to
 * two exits ranged to the right trim.
 *
 *   <ChapterFoot
 *     index={7}
 *     note={t.footNote[locale]}
 *     links={[{ href: "#schedule", label: t.onSchedule[locale] }]}
 *   />
 *
 * Two links is a cap, not a suggestion: a colophon with three exits is a nav
 * bar, and the reader already has one. Extras are dropped rather than wrapped.
 *
 * The folio block is `aria-hidden` — <Chapter> already announces "title — 07"
 * to assistive tech once, and a second reading of the same two digits at the
 * foot of every chapter is noise. The links are real links at 44px.
 * Colours come from the ground: `.ground-ink .chapter-foot` restates the ramp,
 * so an ink chapter needs no prop.
 */
export function ChapterFoot({ index, note, links, rule = true, delay = 0.1, className }: ChapterFootProps) {
  const exits = links?.slice(0, 2) ?? [];
  const folio = String(index).padStart(2, "0");
  return (
    <div className={cn("chapter-foot", className)}>
      {rule && <div className="rule chapter-foot__rule" />}
      <Reveal delay={delay} y={10} duration={0.7} className="chapter-foot__row">
        <span className="t-mono chapter-foot__folio" aria-hidden="true">
          <Kanji id={CHAPTER_NUMERALS[index - 1]} className="chapter-foot__kanji" label={null} />
          {folio}
        </span>
        {note ? <p className="t-note chapter-foot__note">{note}</p> : <span className="chapter-foot__gap" aria-hidden="true" />}
        {exits.length > 0 && (
          <span className="chapter-foot__links">
            {exits.map((link) => (
              <a
                key={link.href}
                href={link.href}
                /* an off-site exit (the Telegram channel) opens in place, so it
                   only needs the opener severed — no target, no noreferrer */
                rel={link.href.startsWith("#") || link.href.startsWith("/") ? undefined : "noopener"}
                className="chapter-foot__link t-mono"
              >
                <span className="chapter-foot__link-label">{link.label}</span>
                <span className="chapter-foot__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </span>
        )}
      </Reveal>
    </div>
  );
}
