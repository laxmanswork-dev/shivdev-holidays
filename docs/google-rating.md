# Live Google rating on the homepage

The hero shows a small "4.8 ★★★★★ (128 reviews)" row under the subtitle
(`src/components/common/GoogleRatingBadge.jsx`), always linking to the
business's real Google Maps listing. The rating/review count shown next to
it is live data from the official Google Places API, fetched through a
small Cloudflare Worker (`src/worker/index.mjs`) — never hardcoded, never
fetched with an API key exposed to the browser.

**Until the two values below are configured, the row still works** — it
shows the Google icon, outline stars and a "Google Reviews" link to the
exact same Maps listing, just without a live number. It will never show a
fabricated rating.

## 1. The verified business

The supplied link (`https://maps.app.goo.gl/bpT4mZXg55k3NQ7Z8`) was
followed (a plain HTTP redirect, no API key needed) and resolves to:

- **Name on Google:** Shivdev holidays
- **Coordinates:** 8.1193381, 77.5230156 (Kanyakumari — matches the
  business's address throughout the rest of the site)
- **Resolved Maps URL:**
  `https://www.google.com/maps/place/Shivdev+holidays/@8.1193381,77.5204407,17z/data=!3m1!4b1!4m6!3m5!1s0x3b04f3fb8f01f045:0x63a6f5d7e117d5a4!8m2!3d8.1193381!4d77.5230156!16s%2Fg%2F11zzhv6l2_`
- **CID (hex):** `0x3b04f3fb8f01f045:0x63a6f5d7e117d5a4`
- **Feature ID:** `/g/11zzhv6l2_`

That confirms which business this is, but it is **not** the Places API's
own `place_id` format (`ChIJ...`) — getting that requires an API key (see
below), so it's left for you to fill in. This keeps the identifiers above
as a direct, independent way to double-check you've picked the right
result in step 3.

The exact supplied link (`site.googleMapsUrl` in `src/data/site.js`) is
what the badge always links to — unchanged, exactly as given.

## 2. Create a Google Cloud project and API key

This is a **paid Google API once past its free usage** — I haven't added
a hidden cost, but you do need to decide to enable billing. The current
pricing is on
[Google Maps Platform's pricing page](https://mapsplatform.google.com/pricing/);
check it yourself before enabling, since I can't guarantee it hasn't
changed.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or
   pick a project, then enable **Places API (New)**.
2. **APIs & Services → Credentials → Create Credentials → API key.**
3. Restrict the key immediately (Credentials → your key → *Edit*):
   - **API restrictions:** Places API (New) only.
   - **Application restrictions:** none needed — this key is only ever
     called from the Cloudflare Worker (a server), never from the
     browser, so IP/referrer restriction isn't required for that reason;
     restricting it to just Places API is what matters here.
4. Enable billing on the project (required even to stay within any free
   monthly credit).

## 3. Find the Place ID

1. Open Google's
   [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id#find-id).
2. Search **"Shivdev holidays, Kanyakumari"** (or paste the coordinates
   from step 1: `8.1193381, 77.5230156`).
3. Confirm the result matches the CID/feature ID above before copying its
   Place ID (`ChIJ...`).

## 4. Configure the two values

| Name | Value | Where it goes |
|---|---|---|
| `GOOGLE_PLACE_ID` | the `ChIJ...` ID from step 3 | `wrangler.jsonc`'s `vars` (not secret — place IDs are public, already visible in every Maps URL) |
| `GOOGLE_PLACES_API_KEY` | the key from step 2 | **a Cloudflare secret — never this file, never git** |

```sh
# one-time, real production key
npx wrangler secret put GOOGLE_PLACES_API_KEY
# paste the key when prompted
```

(Or: Cloudflare dashboard → Workers & Pages → shivdev-holidays → Settings
→ Variables → add `GOOGLE_PLACES_API_KEY` as **Encrypted**.)

Then edit the empty `"GOOGLE_PLACE_ID": ""` in `wrangler.jsonc` to the real
ID and deploy as usual (push to `main` — Cloudflare's existing Git
integration builds and deploys it; nothing extra to run).

**Local testing:** copy `.dev.vars.example` to `.dev.vars` (already
gitignored) and fill in both values there, then `npx wrangler dev` to test
the real Worker + API locally — `npm run dev` (plain Vite) never runs the
Worker, so the badge will always show its link-only fallback there, which
is correct, expected behavior, not a bug.

## How it works

- **`src/worker/index.mjs`** is the only backend code in this project.
  It answers `GET /api/google-rating`; every other request is handed
  straight to the static site (`env.ASSETS.fetch`), so nothing about the
  existing site's routing, 404 page, or headers changed.
- It calls `GET https://places.googleapis.com/v1/places/{PLACE_ID}` with
  `X-Goog-FieldMask: id,displayName,rating,userRatingCount,googleMapsUri`
  — a minimal field mask requesting only what's displayed, not every
  available field.
- **Caching:** the response is cached at Cloudflare's edge (`caches.default`
  — no extra KV/D1 setup needed) for 6 hours by default
  (`GOOGLE_RATING_CACHE_SECONDS` in `wrangler.jsonc`'s `vars` to change
  it), so the Places API is called at most a handful of times a day
  regardless of traffic — never once per page view. A failed/unconfigured
  response is cached for only 5 minutes, so a fix recovers quickly.
- **Attribution/display:** the row always shows the Google "G" mark, the
  words "Google Reviews", and links directly to the real Google Maps
  listing — the standard way Places data is attributed back to Google.
  The 6-hour cache is comfortably inside Google's Places API caching
  policy limits; check the current
  [Places API Policies](https://developers.google.com/maps/documentation/places/web-service/policies)
  yourself if you ever raise the TTL significantly.
- **Security:** the API key only ever exists in the Worker's environment
  (a Cloudflare secret) and is never returned to the browser in any
  response, success or error.
- **Frontend:** `src/components/common/GoogleRatingBadge.jsx` fetches
  `/api/google-rating` once on mount. Three states: a brief loading
  skeleton, the live rating once it arrives, or — if not configured, or
  the request fails for any reason — a plain, fully functional link to
  the same Google Maps listing with no number shown. It never displays a
  fabricated or stale-looking value.

## Verified before this was written

- The short link's redirect was followed live and resolves to "Shivdev
  holidays" at the coordinates above — not assumed, not invented.
- The full request/response path was tested against the **real** Google
  Places API (New) endpoint with a deliberately invalid key: the Worker
  correctly built the request, received a real `400` from Google, and
  returned a safe, graceful error response with no key leakage.
- The frontend was tested in a real browser (Playwright + the actual
  Worker via `wrangler dev`): the link-only fallback state, the loading
  skeleton, keyboard focus (`:focus-visible` ring), clicking through to
  the exact correct Maps URL in a new tab, and an axe accessibility scan
  (0 violations) of the hero section.
- The "ready" (live-data) rendering path was verified by mocking the
  network response in a test-only browser context — this proves the
  component's rendering code is correct, but is **not** a substitute for
  testing with a real key once one is configured. Please check the
  homepage after setup to confirm the real number appears correctly.
