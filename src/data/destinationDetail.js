import { getDestinationBySlug } from './destinations.js';
import { getBySlug as getCatalogueEntryBySlug } from './destinationCatalogue.js';
import { getPlaceBySlug, getTypeLabel } from './travelPlaces.js';

/**
 * Resolves a slug into everything the /destinations/:slug page needs
 * to render — for EVERY destination in data/travelPlaces.js (the full
 * search index), not just the curated destinationCatalogue.js subset
 * shown as cards on the Destinations page. travelPlaces.js's own
 * header comment already states the intent: "the same slug shape
 * (/destinations/:slug) is used for all of them so a page can be
 * added later without touching the search code" — this is that page,
 * for all of them at once, from data that already exists.
 *
 * Three tiers, richest first:
 *   1. data/destinations.js  — the handful of fully hand-authored pages.
 *   2. destinationCatalogue.js — the curated 61-destination catalogue
 *      (name, region, duration, image already assigned there).
 *   3. travelPlaces.js alone — every other searchable place (the
 *      ~60 towns, waterfalls, airports, etc. that are selectable from
 *      search but don't have a catalogue card). Gets a shorter but
 *      still complete page: real name/description/places from
 *      travelPlaces.js, plus a generic duration guess by place type
 *      (not a fabricated attraction or number).
 *
 * Nothing here is invented; a destination with genuinely sparse source
 * data (e.g. no named popularPlaces yet) simply gets a shorter page
 * rather than fabricated attractions.
 *
 * @param {string} slug
 * @returns {null | {
 *   name: string, slug: string, shortDescription: string,
 *   region: string, category: string, recommendedDays: string|null,
 *   placesToSee: string[], aliases: string[], image: string,
 *   seoTitle: string, seoDescription: string,
 * }}
 */
// Places with no photo of their own borrow the real photo of the
// destination they sit in, beside, or are reached through — never an
// unrelated one. Anything not listed here (Hampi, Wayanad, …) has no
// defensible neighbour and shows no image at all.
const NEARBY_IMAGE = {
  srirangam: 'tiruchirappalli',
  dhanushkodi: 'rameswaram',
  nagapattinam: 'velankanni',
  nagore: 'velankanni',
  poompuhar: 'mayiladuthurai',
  tharangambadi: 'mayiladuthurai',
  nagercoil: 'kanyakumari',
  poovar: 'thiruvananthapuram',
  'neyyar-dam': 'thiruvananthapuram',
  mettupalayam: 'ooty',
  tindivanam: 'villupuram',
  ranipet: 'vellore',
  arcot: 'vellore',
  sathanur: 'tiruvannamalai',
  hogenakkal: 'dharmapuri',
  tenkasi: 'courtallam',
  kottayam: 'kumarakom',
  idukki: 'thekkady',
};

// Own photo first; the page tries `fallbackImage` (a nearby
// destination's real photo) only if the own file is missing.
function placeImage(slug) {
  const nearby = NEARBY_IMAGE[slug];
  const image = `/images/destinations/${slug}.png`;
  if (!nearby) return { image };
  return {
    image,
    fallbackImage: `/images/destinations/${nearby}.png`,
    fallbackImageLabel: getPlaceBySlug(nearby)?.name ?? nearby,
  };
}

export function getDestinationDetail(slug) {
  const authored = getDestinationBySlug(slug);
  const catalogueEntry = getCatalogueEntryBySlug(slug);
  const place = getPlaceBySlug(slug);

  if (authored) {
    return {
      ...authored,
      aliases: place?.aliases ?? [],
      image: catalogueEntry?.image ?? `/images/destinations/${slug}.png`,
    };
  }

  if (catalogueEntry) {
    return {
      name: catalogueEntry.name,
      slug: catalogueEntry.slug,
      shortDescription: catalogueEntry.descriptionOverride ?? catalogueEntry.shortDescription,
      region: place?.region ?? catalogueEntry.region,
      category: deriveCategory(place, catalogueEntry.tags),
      recommendedDays: catalogueEntry.duration,
      placesToSee: place?.popularPlaces ?? [],
      aliases: place?.aliases ?? [],
      image: catalogueEntry.image,
      seoTitle: `${catalogueEntry.name} Travel Guide & Trip Planning`,
      seoDescription: `Plan your ${catalogueEntry.name} trip — places to see, suggested duration, and cab travel with Shivdev Holidays.`,
    };
  }

  if (place) {
    return {
      name: place.name,
      slug: place.slug,
      shortDescription: place.shortDescription,
      region: place.region,
      category: deriveCategory(place, []),
      recommendedDays: place.type in DEFAULT_DURATION_BY_TYPE ? DEFAULT_DURATION_BY_TYPE[place.type] : '1 Day',
      placesToSee: place.popularPlaces ?? [],
      aliases: place.aliases ?? [],
      ...placeImage(slug),
      seoTitle: `${place.name} Travel Guide & Trip Planning`,
      seoDescription: `Plan your ${place.name} trip — places to see, suggested duration, and cab travel with Shivdev Holidays.`,
    };
  }

  return null;
}

const TAG_CATEGORY_LABELS = {
  'hill-station': 'Hill Station',
  pilgrimage: 'Temple & Pilgrimage',
  heritage: 'Heritage & Culture',
  coastal: 'Coastal Town',
};

// A generic, non-invented suggested-stay guess for places outside the
// curated catalogue (which already has its own hand-set duration per
// slug) — a trip-planning heuristic by place type, not a specific
// claim about hours, distances or prices. Airports aren't a "stay" at
// all, so they get none — the page simply omits that line.
const DEFAULT_DURATION_BY_TYPE = {
  city: '1–2 Days',
  'hill-station': '1–2 Days',
  wildlife: '1–2 Days',
  backwaters: '1–2 Days',
  beach: '1 Day',
  temple: '1 Day',
  pilgrimage: '1 Day',
  historical: '1 Day',
  waterfalls: '1 Day',
  town: '1 Day',
  'tourist-place': '1 Day',
  airport: null,
};

function deriveCategory(place, tags = []) {
  for (const tag of ['hill-station', 'pilgrimage', 'heritage', 'coastal']) {
    if (tags.includes(tag)) return TAG_CATEGORY_LABELS[tag];
  }
  return place ? getTypeLabel(place.type) : 'Travel Destination';
}
