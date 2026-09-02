"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { localeHref, otherLocale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { cta, navItems } from "@/content/nav";
import { club } from "@/content/schedule";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useActiveChapter } from "./ChapterContext";
import { EASE_OUT_EXPO } from "@/components/ui/Reveal";

const copy = {
  ru: { menu: "Меню", close: "Закрыть", chapter: "Глава", contents: "Содержание", skip: "К содержанию", lang: "Язык" },
  en: { menu: "Menu", close: "Close", chapter: "Chapter", contents: "Contents", skip: "Skip to content", lang: "Language" },
};

export type ChapterLink = { id: string; index: number; title: string };

export function Header({ chapters }: { chapters: ChapterLink[] }) {
  const { locale, href } = useLocale();
  const t = copy[locale];
  const other = otherLocale(locale);
  const { active } = useActiveChapter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const menuId = useId();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  const showRunningHead = active && active.index > 1;

  return (
    <>
      <a href="#main" className="skip-link t-mono">
        {t.skip}
      </a>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500",
          scrolled && !open && "site-header--scrolled",
          open && "site-header--open",
        )}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href={href("/")} aria-label="SK AZUMA" className="shrink-0">
            <Logo />
          </Link>

          {/* prefetch is off on nav links: those routes ship in a later phase */}
          <nav aria-label={locale === "ru" ? "Основная навигация" : "Primary"} className="hidden xl:flex items-center gap-7">
            {navItems.map((item) => (
              <Link key={item.href} href={href(item.href)} prefetch={false} className="nav-link t-mono">
                {item.label[locale]}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex min-w-[12rem] justify-center" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {showRunningHead && (
                <motion.span
                  key={active.id}
                  className="t-mono text-ink-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                >
                  {t.chapter} {String(active.index).padStart(2, "0")} · {active.title}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href={localeHref(other, "/")}
              hrefLang={other}
              lang={other}
              className="lang-toggle t-mono whitespace-nowrap"
              aria-label={`${t.lang}: ${other.toUpperCase()}`}
            >
              <span className="lang-toggle__current">{locale.toUpperCase()}</span>
              <span aria-hidden="true" className="opacity-40"> / </span>
              <span>{other.toUpperCase()}</span>
            </Link>
            <div className="hidden md:block">
              <Button href={cta.href}>{cta.label[locale]}</Button>
            </div>
            <button
              type="button"
              className="menu-toggle t-mono xl:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? t.close : t.menu}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            className="menu fixed inset-0 z-40 ground-paper overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          >
            <div className="wrap pt-[calc(var(--header-h)+1.5rem)] pb-12 grid gap-12 md:grid-cols-[1.4fr_1fr]">
              <nav aria-label={t.menu} className="flex flex-col">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.05 + i * 0.05, ease: EASE_OUT_EXPO }}
                    className="border-b border-rule"
                  >
                    <Link href={href(item.href)} prefetch={false} className="menu__link t-display block py-4 text-[clamp(2rem,7vw,4.5rem)]" onClick={() => setOpen(false)}>
                      <span className="t-mono mr-4 align-middle text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                      {item.label[locale]}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="flex flex-col gap-10">
                <div>
                  <p className="t-mono text-ink-2 mb-4">{t.contents}</p>
                  <ol className="flex flex-col gap-2">
                    {chapters.map((c) => (
                      <li key={c.id}>
                        <a href={`#${c.id}`} className="menu__chapter t-caption" onClick={() => setOpen(false)}>
                          <span className="text-ink-3 mr-3">{String(c.index).padStart(2, "0")}</span>
                          {c.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-col gap-2 t-caption">
                  <span>{club.city[locale]}, {club.address[locale]}</span>
                  <a href={club.telegram} className="btn-text self-start">Telegram</a>
                  <a href={club.instagram} className="btn-text self-start">Instagram</a>
                </div>
                <Button href={cta.href} size="lg" onClick={() => setOpen(false)}>
                  {cta.label[locale]}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
