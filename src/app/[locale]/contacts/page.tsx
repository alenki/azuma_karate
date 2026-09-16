import { notFound } from "next/navigation";
import { isLocale, localeHref, type Locale } from "@/i18n/config";
import { chapters } from "@/content/home";
import { meta as pageCopy } from "@/content/contacts";
import { club } from "@/content/schedule";
import { cta } from "@/content/nav";
import { homeAnchorHref } from "@/lib/sections";
import { ChapterProvider } from "@/components/layout/ChapterContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { Door } from "@/components/sections/contacts/Door";
import { GroupBand } from "@/components/sections/contacts/GroupBand";
import { Letter } from "@/components/sections/contacts/Letter";

const ROUTE = "/contacts";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata({ params }: PageProps<"/[locale]/contacts">) {
  const { locale } = await params;
  const typed: Locale = isLocale(locale) ? locale : "ru";
  /*
    Canonical and alternates are built with `localeHref`, never concatenated:
    Russian is served from the bare path and English from `/en`, and `/ru/…`
    permanently redirects, so a hand-built `/ru/contacts` in the head would
    publish a URL that 308s.
  */
  return {
    metadataBase: new URL(siteUrl),
    title: pageCopy.title[typed],
    description: pageCopy.description[typed],
    alternates: {
      canonical: localeHref(typed, ROUTE),
      languages: { ru: localeHref("ru", ROUTE), en: localeHref("en", ROUTE) },
    },
    openGraph: {
      type: "website",
      siteName: club.name,
      title: pageCopy.title[typed],
      description: pageCopy.description[typed],
      url: localeHref(typed, ROUTE),
      locale: typed === "ru" ? "ru_RU" : "en_US",
      alternateLocale: typed === "ru" ? "en_US" : "ru_RU",
    },
    twitter: { card: "summary_large_image" as const },
  };
}

/**
 * /contacts — «Обратная сторона» / "The Reverse".
 *
 * The manual's back matter: not a seventh chapter but the leaf where the club
 * prints its own particulars. Three bands — the addressed face, the group, the
 * letter — and the binding margin carries the printer's register mark instead
 * of a numeral, because this is the same press on a different sheet.
 *
 * `route` is handed to the chrome rather than read from `usePathname()`: the
 * locale rewrite means the server renders `/ru/contacts` while the browser
 * shows `/contacts`, and a hook that read the path could answer differently on
 * the two sides of hydration. See `lib/sections.ts`.
 *
 * `chapters` is still the HOME page's contents, because the contents overlay
 * lists the manual from wherever it is opened; `homeAnchorHref` gives each
 * entry the home path to carry.
 */
export default async function ContactsPage({ params }: PageProps<"/[locale]/contacts">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const contents = chapters.map((c) => ({ id: c.id, index: c.index, title: c.title[locale] }));

  return (
    <ChapterProvider>
      <Header chapters={contents} route={ROUTE} />
      <main id="main">
        <Door />
        <GroupBand />
        <Letter />
      </main>
      <Footer route={ROUTE} />
      {/*
        The foot margin is hidden over the two bands that already carry the same
        matter: «Дверь» prints the live session on its own rule, and «Письмо»
        is the ask. It arrives over «Ваша группа» and over nothing else. Its
        control is «Записаться», which belongs to chapter 六 on the home page —
        this page's own act is a letter, not a booking, so the bar is not
        re-pointed at it.
      */}
      <MobileBar
        hideWhenVisible={["door", "letter", "footer"]}
        ctaHref={homeAnchorHref(cta.href, locale, ROUTE)}
      />
    </ChapterProvider>
  );
}
