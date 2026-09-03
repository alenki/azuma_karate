import type { Metadata } from "next";
import { Cormorant_Garamond, Golos_Text, IBM_Plex_Mono, Prata, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { DuotoneDefs } from "@/components/ui/DuotoneDefs";
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

/* Mono: folios, running heads, captions, table cells. */
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

/* Wordmark stand-in: wide geometric, latin only, one weight. Replaced by the client's vector lockup later. */
const unbounded = Unbounded({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-wordmark",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale === "ru";
  return {
    title: ru ? "SK AZUMA — киокушинкай каратэ в Нальчике" : "SK AZUMA — Kyokushin karate in Nalchik",
    description: ru
      ? "Секция киокушинкай каратэ для детей и взрослых от 4 лет. Нальчик, ул. Кирова, 157. Первая тренировка — пробная."
      : "Kyokushin karate club for kids and adults from age 4. Nalchik, Kirova 157. Your first session is a trial.",
    alternates: {
      canonical: ru ? "/" : "/en",
      languages: { ru: "/", en: "/en" },
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;
  return (
    <html
      lang={typedLocale}
      className={`${prata.variable} ${golos.variable} ${plexMono.variable} ${cormorant.variable} ${unbounded.variable} antialiased`}
    >
      <body>
        <DuotoneDefs />
        <LocaleProvider locale={typedLocale}>
          <MotionProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </MotionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
