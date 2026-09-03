import type { NextConfig } from "next";

/**
 * Locale routing strategy
 * -----------------------
 * Every page lives under `src/app/[locale]/…` and is statically generated for
 * both locales. Russian is the default and is served from the bare path
 * (`/`, `/about`, …) through an internal rewrite to `/ru/…`, while English is
 * served from `/en/…`. Direct hits on `/ru/…` are redirected to the bare path
 * so the site has exactly one canonical URL per page and language.
 */
/*
  Paths that must never be rewritten into the Russian tree.

  The test is not "is this a metadata route" but "does this file live at the
  app root or under [locale]". Everything listed here lives at the root —
  `src/app/icon.svg`, a favicon, a robots.txt — so it has no locale segment and
  a rewrite to `/ru/…` would send it somewhere that does not exist.

  `opengraph-image` and `twitter-image` are deliberately NOT listed, because
  ours is `src/app/[locale]/opengraph-image.tsx` — it is generated per locale
  and its real path is `/ru/opengraph-image/ru`. Listing it broke the Russian
  card, and broke it in the one way nobody would notice: `/ru/:path*` redirects
  to the bare path, the bare path was then excluded from the rewrite that would
  have put the locale back, and the URL printed in `og:image` for the DEFAULT
  language 308'd into a 404. English worked, because `/en/…` is never
  redirected. Sharing the club in Telegram — which is the club's actual
  channel — produced a bare link.
*/
const RESERVED = "_next|api|media|brand|fonts|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920, 2560],
  },
  async redirects() {
    return [
      { source: "/ru", destination: "/", permanent: true },
      { source: "/ru/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/ru" },
        {
          source: `/:path((?!en(?:/|$)|ru(?:/|$)|${RESERVED}).*)`,
          destination: "/ru/:path",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
