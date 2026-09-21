import type { NextConfig } from "next";

/*
  No locale routing, and nothing here that stands in for it.

  Every page used to live under `src/app/[locale]/…` and be generated twice:
  Russian was served from the bare path through an internal rewrite to `/ru/…`,
  English from `/en/…`, and `/ru/…` was redirected back to the bare path so each
  page had exactly one canonical URL per language. The English edition was
  withdrawn, so the pages moved up to `src/app/` and the bare path is the real
  path — the rewrites, the redirects and the `RESERVED` list of files that must
  never be rewritten all went with them.

  There are no `/en` or `/ru` redirects left behind either. The site has not
  launched (`NEXT_PUBLIC_SITE_URL` is still unset, see the README), so neither
  prefix was ever indexed and there is no reader holding an old link.
*/
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920, 2560],
  },
};

export default nextConfig;
