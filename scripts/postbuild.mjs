/**
 * Runs automatically after `vite build` (npm "postbuild").
 *
 * The site is a client-rendered React app, so the HTML Vite produces is one
 * empty shell — every page would look identical to a crawler or link-preview
 * bot that doesn't run JavaScript. This step fixes that without changing the
 * app:
 *
 *  1. Writes a static HTML file for every real route (/, /destinations,
 *     /plan-your-trip and each /destinations/<slug>) that is the same shell,
 *     but with that page's real <title>, description, canonical URL, Open
 *     Graph / Twitter tags and JSON-LD already in the <head>, plus a short
 *     <noscript> summary with real links. The tags come from the very same
 *     code the app renders at runtime (src/seo/routeMeta.js + headTags.js),
 *     and carry data-rh="true": src/seo/SEO.jsx removes them as soon as React
 *     has rendered its own copies, so a page never ends up with two of each. The files are named
 *     "<route>.html" so Cloudflare serves them at the extension-less URL with
 *     no redirect; any other URL still falls back to index.html (the SPA).
 *
 *  2. Writes dist/_headers from scripts/headers.template, filling in the
 *     SHA-256 hash of each inline <script>/<style> in index.html so the
 *     Content-Security-Policy can forbid all other inline code.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ROOT, createSrcLoader } from './lib/loadSrc.mjs';

const DIST = path.join(ROOT, 'dist');
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const { load, close } = await createSrcLoader();
try {
  const { site } = await load('/src/data/site.js');
  const { resolveSeo } = await load('/src/seo/seoConfig.js');
  const { buildHeadTags } = await load('/src/seo/headTags.js');
  const meta = await load('/src/seo/routeMeta.js');
  const { travelPlaces } = await load('/src/data/travelPlaces.js');
  const { destinationCatalogue } = await load('/src/data/destinationCatalogue.js');
  const { getDestinationDetail } = await load('/src/data/destinationDetail.js');
  const { toTelHref, toWhatsAppHref } = await load('/src/utils/format.js');

  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  if (!template.includes('<title>') || !template.includes('</head>')) throw new Error('dist/index.html has an unexpected shape');

  const phone = site.contact.phone;
  const contactLine = `To plan or book a trip, call <a href="${toTelHref(phone)}">${escapeText(phone)}</a> or message us on <a href="${toWhatsAppHref(site.contact.whatsapp)}">WhatsApp</a>.`;

  function headHtml(props, { generic = false } = {}) {
    const seo = resolveSeo(props);
    // The homepage file is also what Cloudflare serves for any unknown URL, so
    // it must not claim a canonical URL or "index" for those addresses.
    if (generic) seo.canonical = null;
    const tags = buildHeadTags(seo).filter((t) => !(generic && t.attrs.name === 'robots'));
    const attrs = (a) => Object.entries(a).map(([k, v]) => `${k}="${escapeHtml(v)}"`).join(' ');
    const lines = tags.map((t) => `    <${t.tag} data-rh="true" ${attrs(t.attrs)} />`);
    const schemas = props.structuredData ? (Array.isArray(props.structuredData) ? props.structuredData : [props.structuredData]) : [];
    for (const schema of schemas) {
      lines.push(`    <script data-rh="true" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`);
    }
    return { title: seo.title, html: lines.join('\n') };
  }

  function page(props, noscriptBody, options) {
    const { title, html } = headHtml(props, options);
    // data-rh: SEO.jsx removes this static title once React has rendered its own.
    let out = template.replace(/<title>[\s\S]*?<\/title>/, `<title data-rh="true">${escapeText(title)}</title>`);
    out = out.replace('</head>', `${html}\n  </head>`);
    if (noscriptBody) out = out.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>\n      <div class="noscript-note">\n${noscriptBody}\n      </div>\n    </noscript>`);
    return out;
  }

  const files = new Map();

  // Home (also the fallback for unknown URLs, hence "generic").
  files.set('index.html', page(meta.homeSeoProps(), null, { generic: true }));

  // /destinations — lists every catalogue destination as a real link.
  const catalogueLinks = destinationCatalogue
    .map((d) => `          <li><a href="/destinations/${d.slug}">${escapeText(d.name)}</a></li>`)
    .join('\n');
  files.set(
    'destinations.html',
    page(
      meta.destinationsSeoProps(),
      `        <h1>Destinations</h1>\n        <p>${escapeText(meta.destinationsSeoProps().description)}</p>\n        <ul>\n${catalogueLinks}\n        </ul>\n        <p>${contactLine}</p>`,
    ),
  );

  files.set(
    'plan-your-trip.html',
    page(
      meta.planTripSeoProps(),
      `        <h1>Plan Your Trip</h1>\n        <p>${escapeText(meta.planTripSeoProps().description)}</p>\n        <p>${contactLine}</p>\n        <p><a href="/destinations">Browse destinations</a></p>`,
    ),
  );

  // Every /destinations/<slug> page the app can render.
  let destinationPages = 0;
  for (const place of travelPlaces) {
    const d = getDestinationDetail(place.slug);
    if (!d) continue;
    const places = d.placesToSee?.length ? `\n        <p>Places to see: ${d.placesToSee.map(escapeText).join(', ')}.</p>` : '';
    const stay = d.recommendedDays ? `\n        <p>Recommended stay: ${escapeText(d.recommendedDays)}.</p>` : '';
    files.set(
      `destinations/${d.slug}.html`,
      page(
        meta.destinationSeoProps(d),
        `        <h1>${escapeText(d.name)}</h1>\n        <p>${escapeText(d.shortDescription)}</p>${stay}${places}\n        <p>${contactLine.replace('a trip', `a trip to ${escapeText(d.name)}`)}</p>\n        <p><a href="/destinations">All destinations</a></p>`,
      ),
    );
    destinationPages++;
  }

  await mkdir(path.join(DIST, 'destinations'), { recursive: true });
  for (const [name, html] of files) await writeFile(path.join(DIST, name), html, 'utf8');

  // --- Content-Security-Policy hashes from the inline blocks in index.html ---
  const finalIndex = files.get('index.html');
  const hashes = (re) => [...finalIndex.matchAll(re)].map((m) => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
  const scriptHashes = hashes(/<script>([\s\S]*?)<\/script>/g);
  const styleHashes = hashes(/<style>([\s\S]*?)<\/style>/g);
  if (!scriptHashes.length || !styleHashes.length) throw new Error('expected inline <script> and <style> blocks in index.html');

  const headers = (await readFile(path.join(ROOT, 'scripts', 'headers.template'), 'utf8'))
    .replace('{{SCRIPT_HASHES}}', scriptHashes.join(' '))
    .replace('{{STYLE_HASHES}}', styleHashes.join(' '));
  await writeFile(path.join(DIST, '_headers'), headers, 'utf8');

  console.log(`postbuild: wrote ${files.size} static route files (${destinationPages} destination pages) and dist/_headers (${scriptHashes.length} script + ${styleHashes.length} style hash)`);
} finally {
  await close();
}
