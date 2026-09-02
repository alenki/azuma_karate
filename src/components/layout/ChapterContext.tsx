"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ChapterInfo = { id: string; index: number; title: string };

type ChapterContextValue = {
  active: ChapterInfo | null;
  setActive: (chapter: ChapterInfo) => void;
};

const ChapterContext = createContext<ChapterContextValue>({ active: null, setActive: () => {} });

/** Tracks which chapter is in view so the header's running head can name it. */
export function ChapterProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<ChapterInfo | null>(null);
  const setActive = useCallback((c: ChapterInfo) => {
    setActiveState((prev) => (prev?.id === c.id ? prev : c));
  }, []);
  const value = useMemo(() => ({ active, setActive }), [active, setActive]);
  return <ChapterContext.Provider value={value}>{children}</ChapterContext.Provider>;
}

export function useActiveChapter() {
  return useContext(ChapterContext);
}
