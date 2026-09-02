"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Kanji } from "@/components/brush/Kanji";
import type { KanjiId } from "@/content/kanji";
import { useActiveChapter } from "./ChapterContext";

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
        <div className="chapter__numeral" aria-hidden="true">
          <Kanji id={CHAPTER_NUMERALS[index - 1]} className="chapter__kanji" weight={6} label={null} />
          <span className="t-mono chapter__folio">{folio}</span>
        </div>
      )}
      <span className="sr-only">
        {title} — {folio}
      </span>
      {children}
      {bleed}
    </section>
  );
}
