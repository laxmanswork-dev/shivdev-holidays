/**
 * Release checks on the finished build (dist/). Run with `npm run verify`
 * after `npm run build`; exits non-zero if any check fails. It is a
 * regression gate for the SEO, security-header, caching, image and
 * asset-hygiene work — not a substitute for browser testing.
 *
 * DNS is the one network-dependent check, and it only WARNS: a canonical
 * domain that doesn't resolve can't be fixed in code (see docs/deployment.md).
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import dns from 'node:dns/promises';
import path from 'node:path';
import { ROOT, createSrcLoader } from './lib/loadSrc.mjs';

const DIST = path.join(ROOT, 'dist');
let failures = 0;
const warnings = [];
const check = (name, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push({ rel: path.relative(base, full).split(path.sep).join('/'), full });
  }
  return out;
}

const { load, close } = await createSrcLoader();
try {
  const { site } = await load('/src/data/site.js');
  const { travelPlaces } = await load('/src/data/travelPlaces.js');
  const { getDestinationDetail } = await load('/src/data/destinationDetail.js');
  const { destinationImageWidths, brandImageWidths } = await load('/src/data/imageManifest.js');

  const files = await walk(DIST);
  const names = new Set(files.map((f) => f.rel));
  const sizeOf = async (rel) => (await stat(path.join(DIST, rel))).size;

  // ---------- asset hygiene ----------
  const leaked = files.filter((f) => /\.md$/i.test(f.rel) || /(^|\/)\./.test(f.rel));
  check('no internal notes (.md) or dotfiles are deployed', leaked.length === 0, leaked.map((f) => f.rel).join(', '));
  const huge = [];
  for (const f of files) if ((await sizeOf(f.rel)) > 25 * 1024 * 1024) huge.push(f.rel);
  check('no file exceeds Cloudflare\'s 25 MiB asset limit', huge.length === 0, huge.join(', '));
  check('original source photos are not deployed (source-images/ stays in the repo)', !files.some((f) => /^images\/(destinations|brand)\/(?!og-share|shivdev-)[^/]*\.png$/.test(f.rel) && !/logo-road-mask/.test(f.rel)), files.filter((f) => /^images\/destinations\/[^/]*\.png$/.test(f.rel)).slice(0, 3).map((f) => f.rel).join(', '));

  // ---------- every route has its own static, crawler-visible head ----------
  const routes = [['/', 'index.html'], ['/destinations', 'destinations.html'], ['/plan-your-trip', 'plan-your-trip.html']];
  for (const place of travelPlaces) if (getDestinationDetail(place.slug)) routes.push([`/destinations/${place.slug}`, `destinations/${place.slug}.html`]);
  const missing = routes.filter(([, f]) => !names.has(f)).map(([r]) => r);
  check(`static HTML exists for all ${routes.length} routes`, missing.length === 0, missing.slice(0, 5).join(', '));

  const titles = new Map();
  const descriptions = new Map();
  const problems = [];
  for (const [route, file] of routes) {
    if (!names.has(file)) continue;
    const html = await readFile(path.join(DIST, file), 'utf8');
    const count = (re) => (html.match(re) || []).length;
    const tag = (re) => (html.match(re) || [])[1];
    const isHome = route === '/';
    const title = tag(/<title[^>]*>([\s\S]*?)<\/title>/);
    const desc = tag(/<meta data-rh="true" name="description" content="([^"]*)"/);
    const canonical = tag(/<link data-rh="true" rel="canonical" href="([^"]*)"/);
    if (count(/<title[ >]/g) !== 1) problems.push(`${route}: ${count(/<title[ >]/g)} <title>`);
    if (count(/name="description"/g) !== 1) problems.push(`${route}: ${count(/name="description"/g)} description tags`);
    if (!desc || desc.length < 50) problems.push(`${route}: description missing/short`);
    if (!/property="og:title"/.test(html) || !/property="og:image" content="https?:\/\//.test(html) || !/name="twitter:card"/.test(html)) problems.push(`${route}: missing og/twitter tags`);
    if (isHome ? canonical : canonical !== `${site.url}${route}`) problems.push(`${route}: canonical ${canonical ?? 'missing'}`);
    if (!isHome && !/name="robots" content="index, follow"/.test(html)) problems.push(`${route}: robots`);
    for (const m of html.matchAll(/<script data-rh="true" type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1].replace(/\\u003c/g, '<')); } catch { problems.push(`${route}: invalid JSON-LD`); }
    }
    if (!/<noscript>/.test(html)) problems.push(`${route}: no noscript`);
    if (!isHome) {
      titles.set(title, (titles.get(title) || []).concat(route));
      descriptions.set(desc, (descriptions.get(desc) || []).concat(route));
    }
  }
  check('every route: one title, one description, correct canonical, og/twitter, valid JSON-LD, noscript', problems.length === 0, problems.slice(0, 4).join(' | '));
  const dupT = [...titles.values()].filter((r) => r.length > 1);
  const dupD = [...descriptions.values()].filter((r) => r.length > 1);
  check('titles and descriptions are unique across pages', dupT.length === 0 && dupD.length === 0, `${dupT.length} duplicate titles, ${dupD.length} duplicate descriptions`);

  const notFoundHome = await readFile(path.join(DIST, 'index.html'), 'utf8');
  check('the generic fallback page (served for unknown URLs) claims no canonical and is not marked noindex/index', !/rel="canonical"/.test(notFoundHome) && !/name="robots"/.test(notFoundHome));

  // ---------- security headers + caching ----------
  const headersRaw = names.has('_headers') ? await readFile(path.join(DIST, '_headers'), 'utf8') : '';
  // Comment lines (#) explain the rules; only the real rules are checked.
  const headers = headersRaw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n');
  check('dist/_headers exists', headers.length > 0);
  const csp = (headers.match(/Content-Security-Policy: (.*)/) || [])[1] || '';
  const inlineCount = [...notFoundHome.matchAll(/<script>[\s\S]*?<\/script>|<style>[\s\S]*?<\/style>/g)].length;
  const hashCount = (csp.match(/'sha256-[A-Za-z0-9+/=]+'/g) || []).length;
  check('CSP allows exactly the inline blocks in index.html by hash', inlineCount > 0 && hashCount === inlineCount, `${inlineCount} inline blocks, ${hashCount} hashes`);
  check("CSP has no 'unsafe-inline' / 'unsafe-eval', and forbids framing and plugins", !/unsafe-(inline|eval)/.test(csp) && /frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp) && /default-src 'self'/.test(csp));
  for (const h of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy:', 'Permissions-Policy:']) check(`header set: ${h.split(':')[0]}`, headers.includes(h));
  check('fingerprinted /assets/* are cached immutably for a year', /\/assets\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/.test(headers));
  check('no HSTS yet (needs the confirmed HTTPS domain — see docs/deployment.md)', !/Strict-Transport-Security/.test(headers));
  check('_redirects is not deployed (the Cloudflare infinite-loop rule must never return)', !names.has('_redirects'));

  // ---------- sitemap + robots ----------
  const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check('sitemap is well-formed XML with a urlset', /^<\?xml/.test(sitemap) && /<urlset[^>]*>/.test(sitemap) && /<\/urlset>\s*$/.test(sitemap) && (sitemap.match(/<url>/g) || []).length === locs.length);
  check('sitemap has no duplicate or off-domain URLs', new Set(locs).size === locs.length && locs.every((u) => u.startsWith(site.url + '/') || u === site.url), `${locs.length} URLs`);
  const orphan = locs.filter((u) => { const p = u.slice(site.url.length) || '/'; return !routes.some(([r]) => r === p); });
  check('every sitemap URL is a real prerendered route', orphan.length === 0, orphan.slice(0, 3).join(', '));
  const robots = await readFile(path.join(DIST, 'robots.txt'), 'utf8');
  check('robots.txt points at the sitemap on the canonical domain', robots.includes(`Sitemap: ${site.url}/sitemap.xml`));

  // ---------- images and video ----------
  const KB = 1024;
  // Dense, detailed photos that need a higher WebP quality to stay visually faithful
  // (SSIM >= 0.97 against the original), so they exceed the default budget. Documented
  // exceptions, each still under the 500KB ceiling.
  const DENSE_PHOTOS = new Set(['kollam', 'kumarakom']);
  const overBudget = [];
  for (const [slug, widths] of Object.entries(destinationImageWidths)) {
    for (const w of widths) {
      const rel = `images/destinations/${slug}-${w}.webp`;
      if (!names.has(rel)) { overBudget.push(`${rel} MISSING`); continue; }
      const dense = DENSE_PHOTOS.has(slug);
      const limit = w <= 480 ? 150 * KB : w <= 720 ? (dense ? 300 : 250) * KB : (dense ? 450 : 350) * KB;
      if ((await sizeOf(rel)) > limit) overBudget.push(`${rel} ${Math.round((await sizeOf(rel)) / KB)}KB`);
    }
  }
  check('every destination photo variant exists and is within budget (480w ≤150KB, 720w ≤250KB, larger ≤350KB; two documented dense photos allowed up to 300/450KB)', overBudget.length === 0, overBudget.slice(0, 5).join(', '));
  const brandBad = [];
  for (const [name, widths] of Object.entries(brandImageWidths)) for (const w of widths) { const rel = `images/brand/${name}-${w}.webp`; if (!names.has(rel)) brandBad.push(`${rel} MISSING`); else if ((await sizeOf(rel)) > 350 * KB) brandBad.push(`${rel} ${Math.round((await sizeOf(rel)) / KB)}KB`); }
  check('About/Contact photo variants exist and are within budget (≤350KB)', brandBad.length === 0, brandBad.join(', '));
  const stray = files.filter((f) => /^images\/.*\.(png|jpe?g)$/i.test(f.rel)).filter((f) => !/(shivdev-favicon|shivdev-holidays-logo|logo-road-mask|og-share)/.test(f.rel));
  check('no unoptimised photos left in images/ (only logo, favicon, road map, share image)', stray.length === 0, stray.map((f) => f.rel).join(', '));
  const og = names.has('images/brand/og-share.jpg') ? await sizeOf('images/brand/og-share.jpg') : 0;
  check('share-preview image exists (og-share.jpg, ≤250KB)', og > 0 && og <= 250 * KB, `${Math.round(og / KB)}KB`);
  const vd = names.has('videos/car.mp4') ? await sizeOf('videos/car.mp4') : 0;
  const vm = names.has('videos/car-mobile.mp4') ? await sizeOf('videos/car-mobile.mp4') : 0;
  check('hero video: desktop ≤3.2MB and phone version ≤1.6MB', vd > 0 && vd <= 3.2 * 1048576 && vm > 0 && vm <= 1.6 * 1048576, `desktop ${(vd / 1048576).toFixed(2)}MB, phone ${(vm / 1048576).toFixed(2)}MB`);
  const html0 = await readFile(path.join(DIST, 'index.html'), 'utf8');
  check('poster is preloaded only by the homepage script, not by a static <link> on every route', !/<link[^>]*rel="preload"/.test(html0));

  // ---------- domain (warn only) ----------
  const host = new URL(site.url).hostname;
  try { await dns.lookup(host); console.log(`PASS  canonical domain resolves — ${host}`); } catch { warnings.push(`canonical domain "${host}" does not resolve in DNS — set the real domain in src/data/site.js (see docs/deployment.md)`); }
} finally {
  await close();
}

console.log('');
for (const w of warnings) console.log(`WARN  ${w}`);
console.log(failures === 0 ? `\nAll release checks passed${warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : ''}.` : `\n${failures} release check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
