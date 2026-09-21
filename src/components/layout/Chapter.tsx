"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Kanji } from "@/components/brush/Kanji";
import type { KanjiId } from "@/content/kanji";
import { useActiveChapter, useGroundReporter } from "./ChapterContext";

export const CHAPTER_NUMERALS: KanjiId[] = ["ichi", "ni", "san", "shi", "go", "roku", "shichi", "hachi", "kyu", "ju"];

type ChapterProps = {
  id: string;
  /** 1-based chapter number; drives the kanji numeral and the folio. */
  index: number;
  /** Short running-head title (mono). */
  title: string;
  ground?: "paper" | "ink";
  className?: string;
  /** Hide the margin numeral (e.g. the hero draws its own). */
  numeral?: boolean;
  style?: CSSProperties;
  children: ReactNode;
  /** Extra element rendered after the container (e.g. full-bleed plates). */
  bleed?: ReactNode;
  labelledBy?: string;
};

/**
 * A chapter of the manual: a <section> with the chapter numeral 一…十 printed
 * in the binding margin, a mono folio, and an observer that reports itself as
 * the active chapter when its middle crosses the viewport centre.
 *
 * The numeral rides the margin rather than printing once at the head. It used
 * to be a single absolutely positioned block, which meant the device the whole
 * book is built on — the chapters counted 一 二 三 … 七 in the binding — was on
 * screen for about a second per chapter and then the margin was blank paper for
 * the remaining 1000–2400px. It is now a full-height rail with a sticky glyph
 * inside it, so the count travels with the reader and the folio is legible the
 * whole way down. `--numeral-top` (set per chapter in the section stylesheets)
 * still decides where it FIRST prints; it is the rail item's top margin now, so
 * a chapter that opens on a plate still starts its numeral below the plate.
 */
export function Chapter({ id, index, title, ground = "paper", className, numeral = true, style, children, bleed, labelledBy }: ChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const { setActive } = useActiveChapter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive({ id, index, title });
      },
      { rootMargin: "-45% 0px -55% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, index, title, setActive]);

  /* the header learns what is behind its bar from the same element */
  useGroundReporter(ref, id, ground);

  const folio = String(index).padStart(2, "0");
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      data-chapter={index}
      className={cn("chapter relative", ground === "ink" ? "ground-ink" : "ground-paper", className)}
      style={style}
    >
      {numeral && (
        /* the binding margin itself: full height, inert, and never a scroll
           container — the sticky numeral inside it depends on that */
        <div className="chapter__rail" aria-hidden="true">
          <div className="chapter__numeral">
            <Kanji id={CHAPTER_NUMERALS[index - 1]} className="chapter__kanji" weight={6} label={null} />
            <span className="t-mono chapter__folio">{folio}</span>
          </div>
        </div>
      )}
      <span className="sr-only">
        {title}, {folio}
      </span>
      {children}
      {bleed}
    </section>
  );
}
