# Google rating on the homepage

The hero shows a small "5.0 ★★★★★ (6 reviews)" row under the subtitle
(`src/components/common/GoogleRatingBadge.jsx`), always linking to the
business's real Google listing.

**Current mode: manually maintained.** This business doesn't have Google
Cloud billing/API credentials set up, so the rating and review count are
two plain numbers in `src/data/site.js` (`site.googleRating`), not
fetched from any API. Nothing here claims to be live, real-time, or
auto-updating — it's exactly as accurate as the last time someone
checked the real listing and updated those two numbers. A fully-built
live-data mode already exists and can be switched on later with no
component changes — see "Optional: switch to live data later" below.

If `site.googleRating` is ever set to `null`, the row still works — it
shows the Google icon, five gold stars (decorative, since there's no
number to represent), and a "Read Google Reviews" link to the same
listing. It will never show an invented rating.

## 1. The verified business

Three different links have been supplied across separate requests for
this feature:

- `https://maps.app.goo.gl/bpT4mZXg55k3NQ7Z8`
- `https://maps.app.goo.gl/CD9puqv2V3gt5zcy8`
- `https://share.google/R9BVeSZjKv5uGRJl0`

Each was followed independently (a plain HTTP redirect, no API key, no
scraping of rating/review content — only the destination URL itself was
read) and all three resolve to the same business:

- **Name on Google:** Shivdev holidays
- **Coordinates:** 8.1193381, 77.5230156 (Kanyakumari)
- **CID (hex):** `0x3b04f3fb8f01f045:0x63a6f5d7e117d5a4`
- **Google Knowledge Graph feature ID:** `/g/11zzhv6l2_` — identical
  across all three redirects, which is the strongest available
  confirmation without an API key that every supplied link points at
  one single, consistent Google Business Profile, not three different
  or similarly-named listings.
- **Supplied address (unverified by me):** Anandhapuri, North St,
  Kottaram, Tamil Nadu 629703, India. The formatted street address isn't
  exposed by a plain (non-JS, non-API) fetch of any of these links, so
  this is recorded as supplied, not independently confirmed.

The most recently supplied link (`site.googleMapsUrl` in
`src/data/site.js`) is what the badge links to — unchanged, exactly as
given.

**The `5.0` / `6 reviews` currently in `site.googleRating`** were
supplied directly by the business across several requests as the values
shown on this listing. I have no way to independently verify a rating
number without the API below, so this relies on whoever maintains the
site checking the real listing periodically — see the comment next to
`site.googleRating` for how to update it.

## Keeping it up to date

Open the listing link above, check the rating and review count Google
currently shows, and edit `site.googleRating.value` /
`.reviewCount` / `.checkedOn` in `src/data/site.js` to match. Then
rebuild and redeploy. There's no reminder system — it's manual by
design (see "No Google Cloud billing or API credentials" in the brief
this implements).

## Optional: switch to live data later

Everything below was already fully built and tested (in an earlier pass
of this feature) and still exists in the repo — `src/worker/index.mjs`,
`/api/google-rating`, `wrangler.jsonc`'s `GOOGLE_PLACE_ID` var. The
frontend just doesn't call it right now. Switching back means (a) doing
the steps below, and (b) having `GoogleRatingBadge.jsx` fetch
`/api/google-rating` instead of reading `site.googleRating` — a small,
contained change when that day comes.

### 1. Create a Google Cloud project and API key

This is a **paid Google API once past its free usage** — you'd need to
decide to enable billing. Current pricing is on
[Google Maps Platform's pricing page](https://mapsplatform.google.com/pricing/);
check it yourself before enabling, since pricing can change.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or
   pick a project, then enable **Places API (New)**.
2. **APIs & Services → Credentials → Create Credentials → API key.**
3. Restrict the key immediately (Credentials → your key → *Edit*):
   - **API restrictions:** Places API (New) only.
   - **Application restrictions:** none needed — this key is only ever
     called from the Cloudflare Worker (a server), never from the
     browser.
4. Enable billing on the project (required even to stay within any free
   monthly credit).

### 2. Find the Place ID

1. Open Google's
   [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id#find-id)
   (this tool itself needs an API key loaded into the page, from step 1).
2. Search **"Shivdev holidays, Anandhapuri, North St, Kottaram, Tamil
   Nadu 629703"** (or paste the coordinates from step 1 above:
   `8.1193381, 77.5230156`).
3. Confirm the result's displayed address and coordinates match section 1
   above before copying its Place ID (`ChIJ...`) — the tool doesn't show
   the CID/feature ID directly, so coordinates and the formatted address
   are the cross-check here.

### 3. Configure the two values

| Name | Value | Where it goes |
|---|---|---|
| `GOOGLE_PLACE_ID` | the `ChIJ...` ID from step 2 | `wrangler.jsonc`'s `vars` (not secret — place IDs are public, already visible in every Maps URL) |
| `GOOGLE_PLACES_API_KEY` | the key from step 1 | **a Cloudflare secret — never this file, never git** |

```sh
# one-time, real production key
npx wrangler secret put GOOGLE_PLACES_API_KEY
# paste the key when prompted
```

(Or: Cloudflare dashboard → Workers & Pages → shivdev-holidays → Settings
→ Variables → add `GOOGLE_PLACES_API_KEY` as **Encrypted**.)

Then edit the empty `"GOOGLE_PLACE_ID": ""` in `wrangler.jsonc` to the real
ID, switch `GoogleRatingBadge.jsx` back to fetching `/api/google-rating`
(see note above), and deploy as usual (push to `main`).

**Local testing:** copy `.dev.vars.example` to `.dev.vars` (already
gitignored) and fill in both values there, then `npx wrangler dev` to test
the real Worker + API locally.

### How the live path works (already built, currently unused)

- **`src/worker/index.mjs`** answers `GET /api/google-rating`; every
  other request is handed straight to the static site
  (`env.ASSETS.fetch`), so nothing about the site's routing, 404 page,
  or headers is affected by its presence.
- It calls `GET https://places.googleapis.com/v1/places/{PLACE_ID}` with
  `X-Goog-FieldMask: id,displayName,rating,userRatingCount,googleMapsUri`
  — a minimal field mask requesting only what's displayed.
- **Caching:** the response is cached at Cloudflare's edge
  (`caches.default` — no extra KV/D1 setup needed) for 6 hours by default
  (`GOOGLE_RATING_CACHE_SECONDS` in `wrangler.jsonc`'s `vars` to change
  it), so the Places API would be called at most a handful of times a
  day regardless of traffic. A failed/unconfigured response is cached
  for only 5 minutes, so a fix recovers quickly.
- **Security:** the API key only ever exists in the Worker's environment
  (a Cloudflare secret) and is never returned to the browser in any
  response, success or error.
- **"Write a review" link:** not added, even in the live path. A direct
  write-review deep link needs the real Places `place_id`
  (`https://search.google.com/local/writereview?placeid=ChIJ...`),
  which isn't available without completing the steps above — the
  existing Maps link already lets a visitor open the listing and leave
  a review from there.

## Verified before this was written

- Each supplied link's redirect was followed live and all three resolve
  to "Shivdev holidays" at the same coordinates/CID/feature ID above —
  not assumed, not invented.
- The live-API Worker path (now dormant) was previously tested against
  the **real** Google Places API (New) endpoint with a deliberately
  invalid key: it correctly built the request, received a real `400`
  from Google, and returned a safe, graceful error response with no key
  leakage.
- The current manual-value rendering (proportional star fill, the
  `hasRating`/no-rating fallback, click-through to the listing) was
  tested in a real browser (Playwright): with `site.googleRating` set
  to the current `5.0`/`6` values, with a lower rating (to confirm the
  stars visibly fall short of 5, not round up), and with it cleared to
  `null` (confirming the plain-link fallback still works). `npm run
  build` passes.
