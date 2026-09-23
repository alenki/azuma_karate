import { chapters } from "@/content/home";
import { ChapterProvider } from "@/components/layout/ChapterContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
export default function HomePage() {
  const contents = chapters.map((c) => ({ id: c.id, index: c.index, title: c.title }));

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
      {/*
        The fourth slot held the bar pinned to the foot of a phone, and it is
        kept, empty, on purpose. React numbers every useId under this provider
        by how many siblings it has, and each unseeded <Brush> takes its hand
        from that id: three children instead of four renumbers everything in
        <main> and redraws the strokes on every sheet. It is the same rule that
        keeps <body> at three children in the layout.
      */}
      {null}
    </ChapterProvider>
  );
}
