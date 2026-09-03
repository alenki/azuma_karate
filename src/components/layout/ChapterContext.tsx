"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, type RefObject } from "react";

export type Ground = "paper" | "ink";

export type ChapterInfo = { id: string; index: number; title: string };

type ChapterContextValue = {
  /** The chapter the reader is *reading* — whichever one holds the viewport's middle. */
  active: ChapterInfo | null;
  setActive: (chapter: ChapterInfo) => void;
  /**
   * The ground directly UNDER the header bar, which is a different question and
   * needs a different answer. `active` is decided at the viewport's centre, so
   * on a 950px screen it changes ~475px after an ink chapter's top edge has
   * already slid beneath the bar — long enough for a cream header to sit on
   * black and read as a bug rather than as a design.
   */
  ground: Ground;
  setGround: (id: string, ground: Ground) => void;
};

const ChapterContext = createContext<ChapterContextValue>({
  active: null,
  setActive: () => {},
  ground: "paper",
  setGround: () => {},
});

/** Tracks which chapter is in view so the header's running head can name it. */
export function ChapterProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<ChapterInfo | null>(null);
  const [ground, setGroundState] = useState<{ id: string; ground: Ground }>({ id: "", ground: "paper" });

  const setActive = useCallback((c: ChapterInfo) => {
    setActiveState((prev) => (prev?.id === c.id ? prev : c));
  }, []);

  const setGround = useCallback((id: string, g: Ground) => {
    setGroundState((prev) => (prev.id === id && prev.ground === g ? prev : { id, ground: g }));
  }, []);

  const value = useMemo(
    () => ({ active, setActive, ground: ground.ground, setGround }),
    [active, setActive, ground.ground, setGround],
  );
  return <ChapterContext.Provider value={value}>{children}</ChapterContext.Provider>;
}

export function useActiveChapter() {
  return useContext(ChapterContext);
}

/**
 * Reports the ground of `ref`'s element to the header while it is the thing
 * directly behind the bar.
 *
 * The root is narrowed to a single-pixel line lying along the header's lower
 * edge, so exactly one element can be on that line at a time and it is by
 * definition the one the bar is sitting on. The chapter observer in
 * `Chapter.tsx` cannot be reused for this: it fires at the viewport's middle,
 * which on a 950px screen is ~475px after an ink edge has already slid under
 * the bar — long enough for a cream header on black to read as a bug.
 *
 * The bar's height is measured, not parsed: `--header-h` is a `clamp()`, and an
 * unregistered custom property hands back the expression as written rather than
 * the pixel value it resolves to.
 */
export function useGroundReporter(ref: RefObject<HTMLElement | null>, id: string, ground: Ground) {
  const { setGround } = useActiveChapter();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let io: IntersectionObserver | null = null;

    const attach = () => {
      io?.disconnect();
      const bar = document.querySelector("header.site-header");
      const h = bar ? bar.getBoundingClientRect().height : 80;
      const below = Math.max(0, window.innerHeight - h - 1);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setGround(id, ground);
        },
        { rootMargin: `-${h}px 0px -${below}px 0px`, threshold: 0 },
      );
      io.observe(el);
    };

    attach();
    window.addEventListener("resize", attach);
    return () => {
      window.removeEventListener("resize", attach);
      io?.disconnect();
    };
  }, [ref, id, ground, setGround]);
}
