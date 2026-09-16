"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { localeHref, otherLocale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";
import { navItems } from "@/content/nav";
import { club } from "@/content/schedule";
import { Logo } from "@/components/brand/Logo";
import { Kanji } from "@/components/brush/Kanji";
import { Reveal, Settle } from "@/components/ui/Reveal";
import { createLiveStore, useLiveStore } from "@/lib/useLiveValue";
import { useGroundReporter } from "@/components/layout/ChapterContext";
/* three of the four printed section labels are chapter anchors and one is a
   page — the map and the argument for it are in lib/sections, and the bar
   prints the same four through the same resolver */
import { sectionLink } from "@/lib/sections";

/*
  The belt ladder.

  These were printed as seven literal colour chips — orange, blue, yellow,
  green, brown — which put five brand-foreign hues in the footer of a page whose
  whole claim is paper, ink and one vermilion. The RANKS are worth keeping; the
  dyes are not ours to print. That much was right.

  What replaced them was not: seven progress bars, a track with a fill at 14.3%,
  28.6% … 100%, which is the CV skill meter — the most template-coded widget
  there is — and it was the colophon's only ornament. It read wrong as well as
  generic: a 10 кю is not 14% of a black belt.

  A printer has the true mark for graduated ink, and this page is a printed
  manual: the step wedge. Seven flat patches butted into ONE continuous band,
  stepping from bone at the white belt to solid ink at 黒帯 — so the rank is the
  POSITION in the band rather than a distance travelled along a bar, and the
  sentence set directly above it, «Каждый чёрный пояс когда-то был белым.», is
  literally the strip's two ends. The colour names stay as words, where they
  belong. The band's paint and its single hairline are in chrome.css.
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

/*
  The imprint dates itself.

  `const year = 2026` would have read 2026 for the life of the site, and on a
  colophon written as a real imprint — set in Nalchik, typefaces named, KanjiVG
  licensed — a frozen date is the one line in it guaranteed to become false.
  The club's own clock already drives the timetable's «сегодня» and the sunrise,
  so the year comes from the same time zone rather than from the reader's, and
  through the same store, so the server and the first client render agree and
  there is no hydration mismatch. It ticks hourly: a year does not need a
  minute's resolution, and midnight on the 31st is the only moment it matters.
*/
const EDITION_YEAR = 2026;
const yearStore = createLiveStore<number>(
  () => Number(new Intl.DateTimeFormat("en-US", { timeZone: club.timeZone, year: "numeric" }).format(new Date())),
  (y) => String(y),
  60 * 60 * 1000,
);

export function Footer({ route = "/" }: { route?: string }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const year = useLiveStore(yearStore, EDITION_YEAR);
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
            {/* <Settle>, not <Reveal>: a step wedge is pulled with the sheet, not
                assembled in front of the reader, so it fades up through a
                sub-pixel scale and never travels. */}
            <Settle duration={0.8}>
              <ol className="belt-wedge">
                {belts.map((b, i) => (
                  <li
                    key={b.en}
                    className="belt-wedge__rank t-caption"
                    /* 0% ink at the white belt, 100% at the black — the tone is
                       computed here rather than in a calc() so the band's ends
                       are exact whatever the ladder's length becomes */
                    style={{ "--tone": `${(i / (belts.length - 1)) * 100}%` } as CSSProperties}
                  >
                    <span aria-hidden="true" className="belt-wedge__cell" />
                    <span className="capitalize">{b[locale]}</span>
                    <span className="text-bone-2">
                      {b.kyu === "дан" ? (locale === "ru" ? "дан" : "dan") : `${b.kyu} ${t.kyu}`}
                    </span>
                  </li>
                ))}
              </ol>
            </Settle>
          </div>

          <div className="footer__col footer__col--sections">
            <p className="footer__col-label t-mono text-bone-2">{t.sections}</p>
            <ul className="footer__list">
              {navItems.map((item) => {
                const link = sectionLink(item.href, locale, route);
                return (
                  <li key={item.href}>
                    {link.inPage ? (
                      <a href={link.href} className="footer-link t-caption">
                        {item.label[locale]}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="footer-link t-caption"
                        aria-current={link.current ? "page" : undefined}
                      >
                        {item.label[locale]}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="footer__col footer__col--contacts">
            <p className="footer__col-label t-mono text-bone-2">{t.contacts}</p>
            {/*
              TWO ENTRIES LEFT THIS LIST AND BOTH WERE ACTED ON RATHER THAN
              MERELY READ, which is what made them worse than an ordinary
              placeholder — `content/schedule.ts` marks both `pending` and says
              so at the record itself.

              `club.phone` was rendered here as a live `tel:` link, so a parent
              could tap «+7 (900) 000-00-00» and reach nobody. `coordsLabel` was
              printed to the arc-minute as though the hall had been surveyed,
              when the figures are the CITY's — the record's own comment says
              «approximate coordinates of Nalchik; confirm the exact hall
              location». The colophon is the last thing on every page, so both
              were printed on every page, including the contacts page, which
              prints the phone the way the convention asks: a ruled blank with
              what is awaited beside it. A page that shows a blank and then a
              number three screens later contradicts itself inside one scroll.

              Neither is deleted from the content layer — they come back here,
              as facts, the day the club confirms them.
            */}
            <ul className="footer__list t-caption">
              <li>{club.city[locale]}, {club.address[locale]}</li>
              <li><a href={club.telegram} className="footer-link" rel="noopener">Telegram</a></li>
              <li><a href={club.instagram} className="footer-link" rel="noopener">Instagram</a></li>
              <li className="pt-3">
                {/* the other language of THIS page — see the same argument in
                    the bar's RU | EN toggle */}
                <Link href={localeHref(otherLocale(locale), route)} hrefLang={otherLocale(locale)} className="footer-link">
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
