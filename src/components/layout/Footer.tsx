"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { localeHref, otherLocale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { navItems } from "@/content/nav";
import { club } from "@/content/schedule";
import { Logo } from "@/components/brand/Logo";
import { Kanji } from "@/components/brush/Kanji";
import { Reveal } from "@/components/ui/Reveal";
import { useGroundReporter } from "@/components/layout/ChapterContext";

/*
  The belt ladder.

  These were printed as seven literal colour chips — orange, blue, yellow,
  green, brown — which put five brand-foreign hues in the footer of a page whose
  whole claim is paper, ink and one vermilion. The RANKS are worth keeping; the
  dyes are not ours to print.

  So the rank is drawn the way this manual draws everything else: as a measured
  rule. Each belt's bar fills one seventh further than the one above it, and the
  ladder resolves to a solid bar at 黒帯 — which is the sentence set directly
  above it, «Каждый чёрный пояс когда-то был белым.», made visible instead of
  merely asserted. The colour names stay as words, where they belong.
*/
const belts = [
  { ru: "белый", en: "white", kyu: "10" },
  { ru: "оранжевый", en: "orange", kyu: "10–9" },
  { ru: "синий", en: "blue", kyu: "8–7" },
  { ru: "жёлтый", en: "yellow", kyu: "6–5" },
  { ru: "зелёный", en: "green", kyu: "4–3" },
  { ru: "коричневый", en: "brown", kyu: "2–1" },
  { ru: "чёрный", en: "black", kyu: "дан" },
];

const copy = {
  ru: {
    aphorism: "Каждый чёрный пояс когда-то был белым.",
    belts: "Пояса киокушин",
    kyu: "кю",
    sections: "Разделы",
    contacts: "Контакты",
    colophon: "Набрано в Нальчике. Прата, Голос, IBM Plex Mono. Иероглифы — KanjiVG (CC BY-SA 3.0). Фотографии — временные, Wikimedia Commons.",
    lang: "English version",
    osu: "Осу.",
    rights: "Все права защищены",
  },
  en: {
    aphorism: "Every black belt was once white.",
    belts: "Kyokushin belts",
    kyu: "kyu",
    sections: "Sections",
    contacts: "Contacts",
    colophon: "Set in Nalchik. Prata, Golos Text, IBM Plex Mono. Kanji — KanjiVG (CC BY-SA 3.0). Photographs are temporary, from Wikimedia Commons.",
    lang: "Русская версия",
    osu: "Osu.",
    rights: "All rights reserved",
  },
};

export function Footer() {
  const { locale, href } = useLocale();
  const t = copy[locale];
  const year = 2026;
  /* the colophon is ink too, so the bar has to invert over it like a chapter */
  const ref = useRef<HTMLElement>(null);
  useGroundReporter(ref, "footer", "ink");

  return (
    <footer ref={ref} id="footer" className="footer ground-ink relative overflow-hidden">
      <div className="footer__inner wrap">
        <Reveal>
          <p className="footer__aphorism t-statement max-w-[24ch] text-bone">{t.aphorism}</p>
        </Reveal>

        {/*
          Three lists on the page grid from 1280 up (chrome.css §3): the belts,
          the sections and the particulars stand on the same verticals the
          chapters above them use, and the last two columns are left to the
          stamp instead of being padding inside an over-wide proportional slot.
        */}
        <div className="footer__lists">
          <div className="footer__col footer__col--belts">
            <p className="footer__col-label t-mono text-bone-2">{t.belts}</p>
            <ol className="footer__list">
              {belts.map((b, i) => (
                <li key={b.en} className="footer__belt t-caption">
                  <span
                    aria-hidden="true"
                    className="belt-swatch"
                    style={{ "--fill": `${((i + 1) / belts.length) * 100}%` } as CSSProperties}
                  />
                  <span className="capitalize">{b[locale]}</span>
                  <span className="text-bone-2">
                    {b.kyu === "дан" ? (locale === "ru" ? "дан" : "dan") : `${b.kyu} ${t.kyu}`}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="footer__col footer__col--sections">
            <p className="footer__col-label t-mono text-bone-2">{t.sections}</p>
            <ul className="footer__list">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={href(item.href)} prefetch={false} className="footer-link t-caption">
                    {item.label[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col footer__col--contacts">
            <p className="footer__col-label t-mono text-bone-2">{t.contacts}</p>
            <ul className="footer__list t-caption">
              <li>{club.city[locale]}, {club.address[locale]}</li>
              <li className="text-bone-2">{club.coordsLabel}</li>
              <li><a href={club.phoneHref} className="footer-link">{club.phone}</a></li>
              <li><a href={club.telegram} className="footer-link" rel="noopener">Telegram</a></li>
              <li><a href={club.instagram} className="footer-link" rel="noopener">Instagram</a></li>
              <li className="pt-3">
                <Link href={localeHref(otherLocale(locale), "/")} hrefLang={otherLocale(locale)} className="footer-link">
                  {t.lang}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* the rule runs the trim, edge to edge, like every rule in the manual */}
        <div className="footer__rule rule" />

        <div className="footer__colophon">
          <div className="footer__imprint">
            <Logo tagline />
            <span className="t-accent text-bone text-2xl leading-none">{t.osu}</span>
          </div>
          <p className="t-caption text-bone-2 max-w-[52ch]">{t.colophon}</p>
        </div>
        <p className="footer__copyright t-mono text-bone-2">© {year} SK AZUMA · {t.rights}</p>
      </div>

      {/* 押忍 printed large in the corner, aria-hidden */}
      <div aria-hidden="true" className="footer__stamp">
        <Kanji id="ou" className="footer__glyph" weight={5} label={null} />
        <Kanji id="su" className="footer__glyph" weight={5} label={null} />
      </div>
    </footer>
  );
}
