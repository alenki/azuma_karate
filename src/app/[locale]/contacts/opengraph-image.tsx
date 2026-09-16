import { ImageResponse } from "next/og";
import { door } from "@/content/contacts";
import { hero } from "@/content/home";
import { kanji } from "@/content/kanji";
import { club } from "@/content/schedule";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * The contacts share card — the addressed face, typeset for a link preview.
 *
 * WITHOUT THIS FILE THE PAGE HAS NO CARD AT ALL. `opengraph-image` beside the
 * home page's `page.tsx` belongs to that ROUTE, not to the `[locale]` segment's
 * children, so /contacts was serving a bare link — verified in the rendered
 * head, not assumed. The club's own channel is Telegram, which is exactly where
 * a contacts link gets pasted, so a bare preview is the one place this page
 * could not afford to be quiet.
 *
 * It is the page's own first screen at 1200×630: the lockup, the rule, the
 * particulars set the way a posted address is set, the seal in the stamp
 * corner, and the routes along the foot. Nothing on it is a fact this page does
 * not already print, and the phone — which is pending — is not on it.
 *
 * The seal is drawn flat here and that is a deliberate downgrade. satori
 * rasterises through resvg, which has no SVG filters and no <textPath>, so the
 * stone's bite and the ring legend cannot survive the trip; what carries at
 * 150px is the device — two rings and the club's own 東 — and a seal that is
 * merely clean reads far better than one whose filter silently dropped.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The sheet's tokens, copied — satori has no cascade and no custom properties.
   They are the same six values the home card repeats, and they move with it. */
const PAPER = "#f3efe6";
const INK = "#151311";
const INK_2 = "#5a554e";
const INK_QUIET = "#726c62";
const RULE = "#c8c1b3";
const SHU = "#c41e2a";

/** The trim, matching `--gutter` at its 6rem cap. */
const GUTTER = 64;

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
      alt: `${club.address[locale]}, ${club.city[locale]} — ${club.name}`,
    },
  ];
}

/*
  Google Fonts answers a current browser with WOFF2, and satori reads TTF, OTF
  and WOFF but NOT WOFF2 — with a modern User-Agent every glyph comes back a
  tofu box. The 2011 Safari string is what makes the API serve a plain WOFF.
  `text=` subsets the file to the characters actually set. Same trick, same
  reasons, as the home card; see the note there.
*/
const OLD_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Version/5.1 Safari/534.30";

async function subset(family: string, text: string): Promise<ArrayBuffer> {
  const api = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await fetch(api, { headers: { "User-Agent": OLD_SAFARI_UA } }).then((r) => r.text());
  const file = /src:\s*url\((https:[^)]+)\)/.exec(css)?.[1];
  if (!file) throw new Error(`contacts/opengraph-image: Google Fonts returned no font file for ${family}`);
  return fetch(file).then((r) => r.arrayBuffer());
}

/** The device, flat: two rings and the club's own 東, in one vermilion. */
function sealDataUri(): string {
  const strokes = kanji.azuma.strokes
    .map((d) => `<path d="${d}" fill="none" stroke="${SHU}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">` +
    `<circle cx="100" cy="100" r="94" fill="none" stroke="${SHU}" stroke-width="5"/>` +
    `<circle cx="100" cy="100" r="62" fill="none" stroke="${SHU}" stroke-width="2.5"/>` +
    `<g transform="translate(100 100) scale(0.95) translate(-54.5 -54.5)">${strokes}</g>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);

  const addressee = door.addressee[locale];
  const street = club.address[locale];
  const city = club.city[locale];
  const region = club.region[locale];
  const trial = hero.trial[locale];
  const wordmark = "SK AZUMA";
  const tag = "karate team";
  const routes = `TELEGRAM ${door.telegramHandle}   ·   INSTAGRAM ${door.instagramHandle}`;

  const [prata, plexMono] = await Promise.all([
    subset("Prata", street + city),
    subset("IBM+Plex+Mono:wght@500", addressee.toUpperCase() + region + trial + wordmark + tag + routes),
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
        {/* the masthead, on the two verticals of the trim */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontSize: 26, letterSpacing: 4.7, fontWeight: 500 }}>{wordmark}</span>
            <span style={{ fontSize: 13, letterSpacing: 3.6, color: INK_QUIET }}>{tag}</span>
          </div>
          <span style={{ fontSize: 18, color: INK_2 }}>{trial}</span>
        </div>

        <div style={{ marginTop: 18, height: 1, background: RULE }} />

        <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 17, letterSpacing: 3.2, color: INK_QUIET, marginBottom: 18 }}>
              {addressee.toUpperCase()}
            </span>
            <span style={{ fontFamily: "Prata", fontSize: 92, lineHeight: 1, letterSpacing: -1.4 }}>{street}</span>
            <span style={{ fontFamily: "Prata", fontSize: 52, lineHeight: 1.1, color: INK_2, marginTop: 6 }}>
              {city}
            </span>
            <span style={{ fontSize: 18, color: INK_QUIET, marginTop: 16 }}>{region}</span>
          </div>
          {/* the stamp corner, and the card's only vermilion */}
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders <img>, not next/image */}
          <img src={sealDataUri()} alt="" width={150} height={150} style={{ marginBottom: 12 }} />
        </div>

        <div style={{ marginTop: 34, height: 1, background: RULE }} />
        <div style={{ display: "flex", marginTop: 16, fontSize: 18, letterSpacing: 2.6, color: INK_2 }}>{routes}</div>
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
