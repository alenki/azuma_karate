import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Golos_Text, IBM_Plex_Mono, Prata } from "next/font/google";
import { club, sessions } from "@/content/schedule";
import { Flyleaf } from "@/components/flyleaf/Flyleaf";
import { FlyleafCue } from "@/components/flyleaf/FlyleafCue";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PressDefs } from "@/components/ui/PressDefs";
import "./globals.css";

/* Display: a single-weight Cyrillic-native serif — the printed manual has no bold. */
const prata = Prata({
  weight: "400",
  subsets: ["cyrillic", "latin"],
  variable: "--font-prata",
  display: "swap",
  adjustFontFallback: true,
});

/* Body: Russian-designed humanist sans, warm and legible for parents. */
const golos = Golos_Text({
  weight: ["400", "500", "600"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-golos",
  display: "swap",
});

/* Mono: folios, running heads, captions, table cells — and the wordmark. */
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

/* Accent italic: used in exactly three places. */
const cormorant = Cormorant_Garamond({
  weight: ["400", "500"],
  style: ["italic"],
  subsets: ["cyrillic", "latin"],
  variable: "--font-cormorant",
  display: "swap",
});

/*
  A fifth family used to load here — Unbounded, a wide geometric grotesque, for
  the eight characters of the stand-in lockup and for nothing else on the page.
  A book sets its masthead in a face the book owns, so the lockup is Plex Mono
  now (see brand/Logo.tsx): one fewer download, latin-only, and the placeholder
  belongs to the manual while it waits for the client's vector lettering.
*/

/*
  The sheet's address on the web is not known yet — no content file names a
  domain — so it is read from the environment rather than guessed. Every
  absolute URL in the head hangs off it: canonical, og:url and the og:image the
  share card is served at. NEXT_PUBLIC_SITE_URL has to be set before launch, or
  a link shared into Telegram previews against localhost.
*/
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/* One source for the two strings the head and the JSON-LD both state. */
const copy = {
  title: "SK AZUMA · киокушинкай каратэ в Нальчике",
  description:
    "Секция киокушинкай каратэ для детей и взрослых от 4 лет. Нальчик, ул. Кирова, 157. Первая тренировка пробная.",
};

/*
  The browser chrome joins the sheet. One colour and not a light/dark pair: this
  manual has no dark edition — `color-scheme` is `light` and the ground is paper
  at every width in both schemes — so a dark theme-color would print a black
  band across the top of a cream page for every reader whose phone is in dark
  mode. The two ink chapters are ink printed ON the sheet, not a second sheet.
*/
export const viewport: Viewport = {
  themeColor: "#f3efe6",
};

/** ISO 1…7 → the day names schema.org counts in. */
const SCHEMA_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

function endOf(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const end = h * 60 + m + minutes;
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

/*
  The hall's hours, derived from the timetable rather than restated beside it:
  a day opens with its first session and closes when its last one ends, and days
  that keep the same window are one specification. Every session on the
  timetable happens at this address; one that did not — a session whose meeting
  point is posted in Telegram rather than held in the hall — would have to be
  skipped here, because these are the hours of a place, not of the club's week.
*/
function openingHours() {
  const perDay = new Map<number, { opens: string; closes: string }>();
  for (const session of sessions) {
    const closes = endOf(session.time, session.minutes);
    const seen = perDay.get(session.day);
    perDay.set(session.day, {
      opens: seen && seen.opens < session.time ? seen.opens : session.time,
      closes: seen && seen.closes > closes ? seen.closes : closes,
    });
  }
  const windows = new Map<string, number[]>();
  for (const [day, window] of [...perDay.entries()].sort((a, b) => a[0] - b[0])) {
    const key = `${window.opens}/${window.closes}`;
    windows.set(key, [...(windows.get(key) ?? []), day]);
  }
  return [...windows.entries()].map(([key, days]) => {
    const [opens, closes] = key.split("/");
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days.map((day) => SCHEMA_DAYS[day - 1]),
      opens,
      closes,
    };
  });
}

/*
  The club as a machine-readable record. Everything here is read from
  src/content/schedule.ts, so the page and the search result cannot disagree
  about when the hall is open.

  Two properties are deliberately absent. `telephone`: schedule.ts marks the
  number PLACEHOLDER. `geo`: its coordinates are commented «approximate
  coordinates of Nalchik; confirm the exact hall location». Structured data is
  read by machines that will drop a pin and dial a number, so publishing an
  approximation as a fact costs more here than a missing property does. Add both
  the day the club confirms them.
*/
function clubSchema() {
  return {
    "@context": "https://schema.org",
    /* SportsActivityLocation is a subtype of LocalBusiness, so a consumer
       looking for either one finds this record. */
    "@type": "SportsActivityLocation",
    name: club.name,
    description: copy.description,
    url: `${siteUrl}/`,
    address: {
      "@type": "PostalAddress",
      streetAddress: club.address,
      addressLocality: club.city,
      addressCountry: "RU",
    },
    hasMap: club.mapsHref,
    sameAs: [club.telegram, club.instagram],
    openingHoursSpecification: openingHours(),
  };
}

/*
  A static object rather than `generateMetadata()`: it used to be a function
  only because the head had to be assembled per locale, and the sheet is set in
  one language now.
*/
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: copy.title,
  description: copy.description,
  /* One language, one page, one URL: no `languages` map and no hreflang set,
     because there is no alternate edition for either of them to point at. */
  alternates: { canonical: "/" },
  /*
    No `icons` block on purpose. src/app/icon.svg is the mark, and Next only
    fills `icons` from the file conventions when the metadata object leaves it
    unset (resolve-metadata: `if (!resolvedMetadata.icons)`) — declaring it
    here would silently drop the file-based link and its cache key.
  */
  openGraph: {
    type: "website",
    siteName: club.name,
    title: copy.title,
    description: copy.description,
    url: "/",
    locale: "ru_RU",
    /* no `alternateLocale`: there is no other edition to name */
    /* `images` is left unset so the opengraph-image route beside this file
       fills it — and, through it, twitter:image as well. */
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${prata.variable} ${golos.variable} ${plexMono.variable} ${cormorant.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          /* `<` is escaped so a copy string can never close this element early. */
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clubSchema()).replace(/</g, "\\u003c") }}
        />
        {/*
          ONE slot, on purpose. <body> has three children and MotionProvider is
          the third, and React derives every useId on the page from that
          position: add a sibling here and each unseeded <Brush> (chapter 四's
          一, the enso in 六, Results' underline) silently re-rolls its hand.
          The loading screen comes before any visible content, so it is the
          first thing painted and its script runs before anything below it is
          parsed.
        */}
        <>
          <PressDefs />
          <Flyleaf />
          <FlyleafCue />
        </>
        <MotionProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
