/**
 * Cloudflare Worker entry point.
 *
 * This site is otherwise a pure static-asset deployment (see
 * wrangler.jsonc's `assets` config) — this Worker exists for exactly one
 * reason: to call the Google Places API from the server side, so the API
 * key never reaches the browser. Every other request is handed straight
 * to the static-asset handler (`env.ASSETS.fetch`), which preserves the
 * site's existing SPA routing and 404 fallback exactly as before this
 * file existed — see docs/google-rating.md for the full setup/config.
 *
 * Routes handled here:
 *   GET /api/google-rating  → { ok, configured, rating?, userRatingCount?,
 *                                name?, fetchedAt?, source }
 * Everything else → env.ASSETS.fetch(request)
 */

const RATING_PATH = '/api/google-rating';

// Only the two fields the UI actually displays, plus displayName for a
// sanity-check log and googleMapsUri so a future debug build could show
// Google's own canonical link. A minimal field mask keeps the Places API
// (New) request to the smallest billable field set — see
// docs/google-rating.md for what this does and does not cost.
const FIELD_MASK = 'id,displayName,rating,userRatingCount,googleMapsUri';

const DEFAULT_CACHE_SECONDS = 21600; // 6 hours — see docs/google-rating.md
const ERROR_CACHE_SECONDS = 300; // 5 minutes: recover quickly once fixed, without hammering a failing key

function jsonResponse(body, { status = 200, cacheSeconds = 0 } = {}) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (cacheSeconds > 0) headers['Cache-Control'] = `public, max-age=${cacheSeconds}`;
  else headers['Cache-Control'] = 'no-store';
  return new Response(JSON.stringify(body), { status, headers });
}

async function handleRatingRequest(request, env, ctx) {
  if (request.method !== 'GET') {
    return jsonResponse({ ok: false, configured: false, error: 'method_not_allowed' }, { status: 405 });
  }

  // caches.default is Cloudflare's per-colo edge cache — no extra binding
  // or provisioning needed. One stable internal key for the one Place ID
  // this site cares about (not the real request URL, so query strings or
  // proxying never fragment the cache).
  const cache = caches.default;
  const cacheKey = new Request('https://internal-cache.shivdev-holidays.workers.dev/google-rating');
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  const placeId = env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    // Not an error: the feature simply hasn't been configured yet (see
    // docs/google-rating.md). The frontend treats this exactly like a
    // fetch failure — link-only fallback, never a fabricated number.
    const body = { ok: true, configured: false, source: 'live' };
    const response = jsonResponse(body, { cacheSeconds: DEFAULT_CACHE_SECONDS });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }

  let upstream;
  try {
    upstream = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
    });
  } catch {
    // Network failure reaching Google — cache briefly so a transient
    // outage doesn't retry on every single visitor.
    return jsonResponse({ ok: false, configured: true, error: 'network_error' }, { cacheSeconds: ERROR_CACHE_SECONDS });
  }

  if (!upstream.ok) {
    // Never forward Google's raw error body to the client — it can
    // include the request's own key/context in some error payloads.
    return jsonResponse(
      { ok: false, configured: true, error: 'upstream_error', upstreamStatus: upstream.status },
      { cacheSeconds: ERROR_CACHE_SECONDS },
    );
  }

  const data = await upstream.json();
  if (typeof data.rating !== 'number' || typeof data.userRatingCount !== 'number') {
    // Place exists but Google has no rating yet, or the field mask
    // response shape changed — fall back rather than show a bad value.
    return jsonResponse({ ok: false, configured: true, error: 'no_rating_data' }, { cacheSeconds: ERROR_CACHE_SECONDS });
  }

  const body = {
    ok: true,
    configured: true,
    rating: data.rating,
    userRatingCount: data.userRatingCount,
    name: data.displayName?.text ?? null,
    fetchedAt: new Date().toISOString(),
    source: 'live',
  };
  const cacheSeconds = Number(env.GOOGLE_RATING_CACHE_SECONDS) > 0 ? Number(env.GOOGLE_RATING_CACHE_SECONDS) : DEFAULT_CACHE_SECONDS;
  const response = jsonResponse(body, { cacheSeconds });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === RATING_PATH) {
      try {
        return await handleRatingRequest(request, env, ctx);
      } catch {
        // Belt and braces: whatever goes wrong server-side, the frontend
        // must still get a well-formed "unavailable" response, never a
        // raw 500 with a stack trace or an unhandled-exception page.
        return jsonResponse({ ok: false, configured: false, error: 'internal_error' }, { status: 200 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
