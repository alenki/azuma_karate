"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { navItems } from "@/content/nav";
import { club } from "@/content/schedule";
import { Kanji } from "@/components/brush/Kanji";
import { Reveal, Settle } from "@/components/ui/Reveal";
import { useGroundReporter } from "@/components/layout/ChapterContext";
/* three of the four printed section labels are chapter anchors and one is a
   page — the map and the argument for it are in lib/sections, and the bar
   prints the same four through the same resolver */
import { sectionLink } from "@/lib/sections";

/*
  The belt ladder — and the dyes.

  These were seven literal colour chips once, then seven progress bars (a
  track with a fill at 14.3%, 28.6% … 100%: the CV skill meter, and it read
  wrong as well as generic — a 10 кю is not 14% of a black belt), then seven
  greys. The greys were the rota being applied where it does not reach: on a
  belt ladder the hue is not an ornament laid over the rank, it is the rank,
  and «оранжевый» printed in grey is a worse mark than orange. A printer's
  answer exists and the page is a printed manual — the dye card, the strip of
  butted patches at the back of a book that lets a lot be named — so the band
  keeps its construction and gets its real dyes.

  The dyes live in `--color-obi-*` in globals.css, mixed warm and well off
  full saturation for this press; the argument for the one exception to the
  colour rota is written there. Each rank hands its own patch the dye, so the
  ladder below is the single place the order of the belts is stated.

  `dye` IS NOT A LEFTOVER TRANSLATION — it is the token key. The patch's colour
  is `var(--color-obi-white)`, `--color-obi-orange` and so on, named in English
  in globals.css the way every other custom property there is, and this field is
  what composes that name at runtime. It was called `en` while the row also
  carried an English label; the label went with the English edition and the key
  was renamed to say what it actually is.
*/
const belts = [
  { name: "белый", dye: "white", kyu: "10" },
  { name: "оранжевый", dye: "orange", kyu: "10–9" },
  { name: "синий", dye: "blue", kyu: "8–7" },
  { name: "жёлтый", dye: "yellow", kyu: "6–5" },
  { name: "зелёный", dye: "green", kyu: "4–3" },
  { name: "коричневый", dye: "brown", kyu: "2–1" },
  { name: "чёрный", dye: "black", kyu: "дан" },
];

/* `lang` used to stand here too: the link to the other edition, printed last in
   the particulars. It went with the edition it pointed at. */
const t = {
  aphorism: "Каждый чёрный пояс когда-то был белым.",
  belts: "Пояса киокушин",
  kyu: "кю",
  sections: "Разделы",
  contacts: "Контакты",
};

export function Footer({ route = "/" }: { route?: string }) {
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
                {belts.map((b) => (
                  <li
                    key={b.dye}
                    className="belt-wedge__rank t-caption"
                    /* the rank's own dye, named off the same record that names
                       the rank — a patch cannot end up a colour the row does
                       not say, whatever the ladder's length becomes */
                    style={{ "--dye": `var(--color-obi-${b.dye})` } as CSSProperties}
                  >
                    <span aria-hidden="true" className="belt-wedge__cell" />
                    <span className="capitalize">{b.name}</span>
                    <span className="text-bone-2">{b.kyu === "дан" ? "дан" : `${b.kyu} ${t.kyu}`}</span>
                  </li>
                ))}
              </ol>
            </Settle>
          </div>

          <div className="footer__col footer__col--sections">
            <p className="footer__col-label t-mono text-bone-2">{t.sections}</p>
            <ul className="footer__list">
              {navItems.map((item) => {
                const link = sectionLink(item.href, route);
                return (
                  <li key={item.href}>
                    {link.inPage ? (
                      <a href={link.href} className="footer-link t-caption">
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="footer-link t-caption"
                        aria-current={link.current ? "page" : undefined}
                      >
                        {item.label}
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
              <li>{club.city}, {club.address}</li>
              <li><a href={club.telegram} className="footer-link" rel="noopener">Telegram</a></li>
              <li><a href={club.instagram} className="footer-link" rel="noopener">Instagram</a></li>
            </ul>
          </div>
        </div>

      </div>

      {/* 押忍 printed large in the corner, aria-hidden */}
      <div aria-hidden="true" className="footer__stamp">
        <Kanji id="ou" className="footer__glyph" weight={5} label={null} />
        <Kanji id="su" className="footer__glyph" weight={5} label={null} />
      </div>
    </footer>
  );
}
