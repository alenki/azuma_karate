import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero, heroFit } from "@/content/home";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * The share card — the hero, typeset for a link preview.
 *
 * The club's own channel is Telegram, so this image is where most people meet
 * the page for the first time: it has to be the sheet, not a screenshot of it.
 * So it is set the way the hero is set — masthead, hairline, the headline laid
 * to the exact measure, and the one vermilion stroke running off the right trim
 * — and nothing else is red on it. That means the ONLY red on the card is the
 * brush, which is the whole palette rule stated in one 1200×630 frame.
 *
 * The stroke is `public/brand/hero-stroke.svg`, the same file `--stroke` masks
 * in the hero, recoloured from mask-white to vermilion; and its box is built
 * with the hero's own arithmetic (see hero.css `--band-w` / `--band-h`) so the
 * mark is stretched here exactly as hard as it is on the page.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
  The sheet's tokens, copied. satori has no cascade and no custom properties, so
  globals.css cannot reach this runtime — these six values are the only place in
  the codebase where the palette is repeated, and they have to move with it.
*/
const PAPER = "#f3efe6";
const INK = "#151311";
const INK_2 = "#5a554e";
const INK_QUIET = "#726c62";
const RULE = "#c8c1b3";
const SHU = "#c41e2a";

/** The trim, matching `--gutter` at its 6rem cap. */
const GUTTER = 64;
/** `--band-bleed`, 8vw of the card: how far the dry tail runs past the trim. */
const BLEED = Math.round(size.width * 0.08);

function toLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/* `params` is already resolved here — unlike the image handler below, where it
   is a promise (Next 16). */
export function generateImageMetadata({ params }: { params: { locale: string } }) {
  const locale = toLocale(params.locale);
  return [
    {
      id: locale,
      size,
      contentType,
      alt: `${hero.line1[locale]} ${hero.line2[locale]} — ${hero.eyebrow[locale]}`,
    },
  ];
}

/*
  Google Fonts answers a current browser with WOFF2, and satori reads TTF, OTF
  and WOFF but NOT WOFF2 — with a modern User-Agent every glyph on this card
  comes back a tofu box. The 2011 Safari string is what makes the API serve a
  plain WOFF instead. `text=` subsets the file to the characters actually set,
  so both faces together cost about 8KB rather than 300.

  This is a build-time network call and it is deliberately allowed to throw: the
  build already cannot run without fonts.googleapis.com (next/font/google fetches
  Prata, Golos, Plex Mono and Cormorant the same way), and a card of tofu shared
  into every Telegram chat is worse than a build that stops.
*/
const OLD_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Version/5.1 Safari/534.30";

async function subset(family: string, text: string): Promise<ArrayBuffer> {
  const api = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await fetch(api, { headers: { "User-Agent": OLD_SAFARI_UA } }).then((r) => r.text());
  const file = /src:\s*url\((https:[^)]+)\)/.exec(css)?.[1];
  if (!file) throw new Error(`opengraph-image: Google Fonts returned no font file for ${family}`);
  return fetch(file).then((r) => r.arrayBuffer());
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);

  const line1 = hero.line1[locale];
  const line2 = hero.line2[locale];
  const trial = hero.trial[locale];
  /* The colophon along the foot: the eyebrow, in the mono voice a reader counts
     rather than reads, so it is set in caps and tracked like the page's own. */
  const colophon = hero.eyebrow[locale].toUpperCase();
  const wordmark = "SK AZUMA";
  const tag = "karate team";

  /*
    The headline is laid to the measure the way the hero lays it: `heroFit` holds
    each line's width in em, measured in Prata, and the longer of the two lines
    fills the trim. The 128px cap is a height stop, not a taste one — two lines
    of 128 plus the stroke and the two mono bands is exactly 630.
  */
  const fit = Math.max(heroFit[locale].wide, heroFit[locale].narrow);
  const display = Math.min(Math.floor((size.width - GUTTER * 2) / fit), 128);

  /* hero.css: band-w = trim + gutter + bleed, band-h = band-w / 14. The mark
     starts on the left trim and its tail is cut by the right edge of the sheet. */
  const bandW = size.width - GUTTER + BLEED;
  const bandH = Math.round(bandW / 14);

  const strokeFile = await readFile(join(process.cwd(), "public", "brand", "hero-stroke.svg"), "utf8");
  const stroke = `data:image/svg+xml;base64,${Buffer.from(
    /* the file is drawn white because the page uses it as a mask; here it is ink */
    strokeFile.replace('fill="#fff"', `fill="${SHU}"`),
  ).toString("base64")}`;

  const [prata, plexMono] = await Promise.all([
    subset("Prata", line1 + line2),
    subset("IBM+Plex+Mono:wght@500", colophon + trial + wordmark + tag),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          padding: `48px ${GUTTER}px 52px`,
          fontFamily: "IBM Plex Mono",
        }}
      >
        {/* masthead: the lockup against the offer, the two verticals of the trim */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontSize: 26, letterSpacing: 4.7, fontWeight: 500 }}>{wordmark}</span>
            <span style={{ fontSize: 13, letterSpacing: 3.6, color: INK_QUIET }}>{tag}</span>
          </div>
          <span style={{ fontSize: 18, color: INK_2 }}>{trial}</span>
        </div>

        <div style={{ marginTop: 18, height: 1, background: RULE }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 42,
            fontFamily: "Prata",
            fontSize: display,
            lineHeight: 1.02,
            letterSpacing: display * -0.01,
          }}
        >
          <span>{line1}</span>
          <span>{line2}</span>
        </div>

        {/* the first stroke, running off the right trim */}
        <div style={{ display: "flex", marginTop: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders <img>, not next/image */}
          <img src={stroke} alt="" width={bandW} height={bandH} />
        </div>

        <div style={{ display: "flex", marginTop: "auto", fontSize: 19, letterSpacing: 3.4, color: INK_2 }}>
          {colophon}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Prata", data: prata, style: "normal", weight: 400 },
        { name: "IBM Plex Mono", data: plexMono, style: "normal", weight: 500 },
      ],
    },
  );
}
