/**
 * Generates public/sitemap.xml from the site's route data.
 *
 * This is a plain Vite SPA (no server-side rendering), so the
 * sitemap is generated at build time from the same data modules
 * that drive the app, rather than pulled from a routing package.
 * Runs automatically before `npm run build` (see package.json
 * "prebuild") so the file exists in /public before Vite copies
 * the public directory into dist.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { site } from '../src/data/site.js';
import { destinationCatalogue } from '../src/data/destinationCatalogue.js';
import { travelPlaces } from '../src/data/travelPlaces.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, '..', 'public', 'sitemap.xml');

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/destinations', changefreq: 'weekly', priority: '0.9' },
  { path: '/plan-your-trip', changefreq: 'monthly', priority: '0.7' },
];

// Every destination that has a real /destinations/:slug page (see
// data/destinationDetail.js) belongs in the sitemap — not just the
// curated catalogue shown as cards on the Destinations page. Airports
// are excluded: they resolve to a real page (useful for a visitor who
// searches for one directly), but they aren't a travel destination
// worth a search engine indexing.
const catalogueSlugs = new Set(destinationCatalogue.map((d) => d.slug));

const destinationRoutes = destinationCatalogue.map((destination) => ({
  path: `/destinations/${destination.slug}`,
  changefreq: 'monthly',
  priority: '0.8',
}));

const otherPlaceRoutes = travelPlaces
  .filter((place) => !catalogueSlugs.has(place.slug) && place.type !== 'airport')
  .map((place) => ({
    path: `/destinations/${place.slug}`,
    changefreq: 'monthly',
    priority: '0.5',
  }));

const allRoutes = [...staticRoutes, ...destinationRoutes, ...otherPlaceRoutes];

const urlEntries = allRoutes
  .map(
    (route) => `  <url>
    <loc>${site.url}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

await writeFile(outFile, xml, 'utf-8');
console.log(`Sitemap written: ${outFile} (${allRoutes.length} URLs)`);
