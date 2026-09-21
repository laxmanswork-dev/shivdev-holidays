# Deployment notes (Cloudflare Workers Static Assets)

## Build
`npm run build` runs, in order: the sitemap generator, `vite build`, then
`scripts/postbuild.mjs` (per-route static HTML with real SEO tags, and
`dist/_headers` with the Content-Security-Policy hashes). `npm run verify`
then checks the result. Use Node `^20.19 || >=22.12` (`.nvmrc` = 22).

## Setting the real domain (REQUIRED before launch)
`src/data/site.js` -> `url` is the single place the canonical hostname lives
(canonical links, sitemap, robots.txt, Open Graph, JSON-LD all derive from it,
except `public/robots.txt`'s Sitemap line, which must be edited to match).
It currently points at `www.shivdevholidays.com`, which does not resolve in DNS.
1. Attach the custom domain to the Worker in Cloudflare, or decide to use the
   `workers.dev` address.
2. Change `url` in `src/data/site.js` and the Sitemap line in `public/robots.txt`.
3. `npm run build && npm run verify` (the DNS warning should disappear).
4. Once HTTPS works on that exact domain, consider adding
   `Strict-Transport-Security: max-age=31536000` to `scripts/headers.template`
   (browsers remember it, so only after the domain is final).

## After deploying, verify on the live URL
- Headers: `curl -I https://DOMAIN/` (CSP, X-Frame-Options, nosniff, Referrer-Policy)
  and `curl -I https://DOMAIN/assets/<file>.js` (`immutable`).
- Video byte ranges (needed by Safari/iPhone):
  `curl -I -H "Range: bytes=0-99" https://DOMAIN/videos/car-mobile.mp4`
  must answer `206 Partial Content` with a `Content-Range` header.
- `https://DOMAIN/images/destinations/README.md` must not exist (404 -> app shell).
- Unknown URLs still return HTTP 200 with the app's 404 page (SPA fallback); the page
  is `noindex`. A true HTTP 404 would need `not_found_handling: "404-page"`.

## Assets
Original photos live in `source-images/` (not deployed). Add/replace a photo there,
then `npm install --no-save ffmpeg-static && npm run images`. See `docs/assets/`.
