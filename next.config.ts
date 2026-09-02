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
const RESERVED = "_next|api|media|fonts|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image|twitter-image";

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
