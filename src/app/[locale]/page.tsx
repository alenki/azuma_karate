import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { chapters } from "@/content/home";
import { ChapterProvider } from "@/components/layout/ChapterContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBar } from "@/components/layout/MobileBar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Schedule } from "@/components/sections/Schedule";
import { Sensei } from "@/components/sections/Sensei";
import { Results } from "@/components/sections/Results";
import { Join } from "@/components/sections/Join";

/**
 * The home page — «Первая черта».
 * Six chapters of a printed Kyokushin manual, annotated by one red brush.
 */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const contents = chapters.map((c) => ({ id: c.id, index: c.index, title: c.title[locale] }));

  return (
    <ChapterProvider>
      <Header chapters={contents} />
      <main id="main">
        <Hero />
        <About />
        <Schedule />
        <Sensei />
        <Results />
        <Join />
      </main>
      <Footer />
      <MobileBar />
    </ChapterProvider>
  );
}
