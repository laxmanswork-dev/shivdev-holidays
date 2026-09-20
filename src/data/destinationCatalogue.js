import { travelPlaces } from './travelPlaces.js';

/**
 * The Destinations PAGE's own catalogue — presentation metadata
 * (region grouping, card tier, filter tags, recommended duration,
 * image path, and the couple of special-case fields Kanyakumari/
 * Tirunelveli need) layered on top of the single real content source,
 * `data/travelPlaces.js` (itself built on `data/destinations.js` for
 * the places with a full page). Name, short description and whether
 * a real /destinations/:slug page exists all come from there — never
 * retyped here — so there is exactly one place that owns what a
 * destination IS, and this file only owns how it's PRESENTED on this
 * one page.
 *
 * @typedef {Object} CatalogueEntry
 * @property {string} slug
 * @property {string} name
 * @property {string} shortDescription
 * @property {'Tamil Nadu'|'Kerala'|'Other'} region
 * @property {string[]} tags - filter categories, see FILTERS below
 * @property {'card'|'compact'} tier - 'card' (photo + description, the
 *   normal catalogue card — every one uses the exact same image frame)
 *   or 'compact' (no image, a dense text row — reserved for the "More
 *   Places We Can Take You" list at the bottom of the page)
 * @property {string} duration
 * @property {string} image - path under /public/images/destinations.
 *   Every 'card'-tier slug has a file there — a handful are real
 *   photos, the rest are still a generated placeholder standing in
 *   until a real one is uploaded (see that folder's README). If a
 *   path is ever missing or fails to load anyway, DestinationImage
 *   falls back to its own neutral placeholder rather than erroring.
 * @property {string} [imagePosition] - CSS object-position override,
 *   for the handful of photos where the default center crop would cut
 *   into the actual landmark (a tall gopuram, a person in frame, etc).
 * @property {boolean} availableForDetailedPage - true only for the
 *   destinations with a real, built /destinations/:slug page
 */

// slug → presentation metadata. Order within each region matches the
// order requested for that region.
const META = {
  // ---------- Tamil Nadu — featured ----------
  kanyakumari: {
    region: 'Tamil Nadu',
    tags: ['pilgrimage', 'coastal', 'heritage'],
    tier: 'card',
    duration: '1 Day',
    descriptionOverride: 'Sea, temples, landmarks and the southern tip of India.',
  },
  tirunelveli: {
    region: 'Tamil Nadu',
    tags: ['pilgrimage'],
    tier: 'card',
    duration: '1 Day',
    descriptionOverride: 'Temples, waterfalls and the landscapes of southern Tamil Nadu.',
    imagePosition: 'top',
  },
  madurai: {
    region: 'Tamil Nadu',
    tags: ['pilgrimage', 'heritage'],
    tier: 'card',
    duration: '1–2 Days',
    imagePosition: 'top',
  },
  rameswaram: { region: 'Tamil Nadu', tags: ['pilgrimage', 'coastal', 'heritage'], tier: 'card', duration: '1–2 Days' },
  kodaikanal: { region: 'Tamil Nadu', tags: ['hill-station'], tier: 'card', duration: '2 Days / 1 Night' },
  ooty: {
    region: 'Tamil Nadu',
    tags: ['hill-station'],
    tier: 'card',
    duration: '2–3 Days',
    imagePosition: 'top',
  },
  kanchipuram: { region: 'Tamil Nadu', tags: ['heritage', 'pilgrimage'], tier: 'card', duration: '1 Day' },
  mahabalipuram: { region: 'Tamil Nadu', tags: ['heritage', 'coastal'], tier: 'card', duration: '1 Day' },
  thanjavur: { region: 'Tamil Nadu', tags: ['heritage', 'pilgrimage'], tier: 'card', duration: '1 Day' },
  chennai: { region: 'Tamil Nadu', tags: ['coastal'], tier: 'card', duration: '2–3 Days' },
  yercaud: { region: 'Tamil Nadu', tags: ['hill-station'], tier: 'card', duration: '2 Days / 1 Night' },
  coonoor: { region: 'Tamil Nadu', tags: ['hill-station'], tier: 'card', duration: '1–2 Days' },

  // ---------- Tamil Nadu — secondary ----------
  tiruchirappalli: { region: 'Tamil Nadu', tags: ['heritage', 'pilgrimage'], tier: 'card', duration: '1 Day' },
  coimbatore: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1–2 Days' },
  kumbakonam: { region: 'Tamil Nadu', tags: ['heritage', 'pilgrimage'], tier: 'card', duration: '1–2 Days' },
  yelagiri: { region: 'Tamil Nadu', tags: ['hill-station'], tier: 'card', duration: '1–2 Days' },
  valparai: { region: 'Tamil Nadu', tags: ['hill-station'], tier: 'card', duration: '2 Days / 1 Night' },
  pollachi: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1–2 Days' },
  courtallam: { region: 'Tamil Nadu', tags: ['hill-station'], tier: 'card', duration: '1 Day' },
  karaikudi: { region: 'Tamil Nadu', tags: ['heritage'], tier: 'card', duration: '1–2 Days' },
  velankanni: { region: 'Tamil Nadu', tags: ['pilgrimage', 'coastal'], tier: 'card', duration: '1 Day' },
  chidambaram: { region: 'Tamil Nadu', tags: ['pilgrimage', 'heritage'], tier: 'card', duration: '1 Day' },

  // ---------- Tamil Nadu — more places ----------
  thoothukudi: { region: 'Tamil Nadu', tags: ['coastal'], tier: 'card', duration: '1 Day' },
  tiruchendur: { region: 'Tamil Nadu', tags: ['pilgrimage', 'coastal'], tier: 'card', duration: '1 Day' },
  palani: { region: 'Tamil Nadu', tags: ['pilgrimage', 'hill-station'], tier: 'card', duration: '1 Day' },
  theni: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1–2 Days' },
  dharmapuri: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1–2 Days' },
  tiruvannamalai: { region: 'Tamil Nadu', tags: ['pilgrimage'], tier: 'card', duration: '1 Day' },
  vellore: { region: 'Tamil Nadu', tags: ['heritage', 'pilgrimage'], tier: 'card', duration: '1 Day' },
  mayiladuthurai: { region: 'Tamil Nadu', tags: ['pilgrimage'], tier: 'card', duration: '1 Day' },
  pudukkottai: { region: 'Tamil Nadu', tags: ['heritage'], tier: 'card', duration: '1 Day' },
  cuddalore: { region: 'Tamil Nadu', tags: ['coastal'], tier: 'card', duration: '1 Day' },
  salem: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  dindigul: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  namakkal: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  erode: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  tiruppur: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  villupuram: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  kallakurichi: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  ariyalur: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  perambalur: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  ramanathapuram: { region: 'Tamil Nadu', tags: ['coastal'], tier: 'card', duration: '1 Day' },
  sivaganga: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  krishnagiri: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  hosur: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },
  tiruvallur: { region: 'Tamil Nadu', tags: [], tier: 'card', duration: '1 Day' },

  // ---------- Kerala ----------
  munnar: { region: 'Kerala', tags: ['hill-station'], tier: 'card', duration: '2–3 Days' },
  kochi: { region: 'Kerala', tags: ['coastal', 'heritage'], tier: 'card', duration: '1–2 Days' },
  alappuzha: { region: 'Kerala', tags: ['coastal'], tier: 'card', duration: '1–2 Days' },
  thekkady: { region: 'Kerala', tags: ['hill-station'], tier: 'card', duration: '2 Days' },
  thiruvananthapuram: { region: 'Kerala', tags: ['coastal'], tier: 'card', duration: '1–2 Days' },
  kovalam: { region: 'Kerala', tags: ['coastal'], tier: 'card', duration: '1 Day' },
  varkala: { region: 'Kerala', tags: ['coastal'], tier: 'card', duration: '1–2 Days' },
  kollam: { region: 'Kerala', tags: ['coastal'], tier: 'card', duration: '1 Day' },
  vagamon: { region: 'Kerala', tags: ['hill-station'], tier: 'card', duration: '2 Days' },
  kumarakom: { region: 'Kerala', tags: ['coastal'], tier: 'card', duration: '1–2 Days' },

  // ---------- Other destinations — all compact ----------
  tirupati: { region: 'Other', tags: ['pilgrimage'], tier: 'compact', duration: '1–2 Days' },
  bengaluru: { region: 'Other', tags: [], tier: 'compact', duration: '1–2 Days' },
  mysuru: { region: 'Other', tags: ['heritage'], tier: 'compact', duration: '2 Days' },
  hyderabad: { region: 'Other', tags: [], tier: 'compact', duration: '2–3 Days' },
  puducherry: { region: 'Other', tags: ['coastal', 'heritage'], tier: 'compact', duration: '1–2 Days' },
};

// A handful of places are better known locally by a different name
// than travelPlaces.js's canonical one — display-only, never changes
// the underlying slug/search data.
const DISPLAY_NAME_OVERRIDES = {
  tiruchirappalli: 'Trichy',
  alappuzha: 'Alappuzha / Alleppey',
  kochi: 'Kochi / Cochin',
  karaikudi: 'Karaikudi / Chettinad',
  dharmapuri: 'Dharmapuri / Hogenakkal',
};

const placeBySlug = new Map(travelPlaces.map((place) => [place.slug, place]));

/** @type {CatalogueEntry[]} */
export const destinationCatalogue = Object.entries(META)
  .map(([slug, meta]) => {
    const place = placeBySlug.get(slug);
    if (!place) {
      // Fails loudly in dev rather than silently dropping a
      // destination the catalogue is supposed to show.
      if (import.meta.env?.DEV) {
        console.warn(`destinationCatalogue: no travelPlaces entry for "${slug}"`);
      }
      return null;
    }
    return {
      slug,
      name: DISPLAY_NAME_OVERRIDES[slug] ?? place.name,
      shortDescription: place.shortDescription,
      availableForDetailedPage: place.hasPage,
      // A handful of destinations already have a real photo dropped in
      // at this exact path (see public/images/destinations/README.md);
      // the rest simply don't have a file here yet, and DestinationImage
      // shows its own neutral fallback rather than an error. Adding a
      // photo later is a straight file drop at this same path, no code
      // change needed.
      image: `/images/destinations/${slug}.png`,
      ...meta,
    };
  })
  .filter(Boolean);

/** Filter chips shown on the page — id must match a `tags` value or be 'all'/a region name. */
export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Tamil Nadu', label: 'Tamil Nadu' },
  { id: 'Kerala', label: 'Kerala' },
  { id: 'hill-station', label: 'Hill Stations' },
  { id: 'pilgrimage', label: 'Pilgrimage' },
  { id: 'coastal', label: 'Coastal' },
  { id: 'heritage', label: 'Heritage' },
];

export function matchesFilter(entry, filterId) {
  if (filterId === 'all') return true;
  if (filterId === 'Tamil Nadu' || filterId === 'Kerala') return entry.region === filterId;
  return entry.tags.includes(filterId);
}

export function getByRegion(region) {
  return destinationCatalogue.filter((entry) => entry.region === region);
}

export function getBySlug(slug) {
  return destinationCatalogue.find((entry) => entry.slug === slug);
}
