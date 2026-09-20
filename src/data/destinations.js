/**
 * Destination data model.
 *
 * This is the foundation dataset — a small number of real entries
 * to prove the architecture. Content should be expanded later
 * without changing this shape.
 *
 * @typedef {Object} Destination
 * @property {string} name
 * @property {string} slug - URL segment, used at /destinations/:slug
 * @property {string} shortDescription - one or two plain sentences
 * @property {string} region - broad area, e.g. "South Tamil Nadu"
 * @property {string} category - primary category label
 * @property {string[]} themes - experience slugs, see data/experiences.js
 * @property {string} recommendedDays - e.g. "1–2 Days"
 * @property {string} startingPoint - typical starting point for a trip
 * @property {string[]} highlights - short highlight phrases
 * @property {string[]} placesToSee - named places within the destination
 * @property {string[]} journeys - related journey slugs (planned "related
 *   trips" feature; not read by any page yet — the standalone Journeys
 *   pages/data were removed, this is just reserved shape for later)
 * @property {string} heroImage - path under /public/images
 * @property {string[]} gallery - paths under /public/images
 * @property {string} seoTitle
 * @property {string} seoDescription
 */

/** @type {Destination[]} */
export const destinations = [
  {
    name: 'Kanyakumari',
    slug: 'kanyakumari',
    shortDescription:
      'The southern tip of India, where the sea meets from three sides.',
    region: 'South Tamil Nadu',
    category: 'Coastal & Pilgrimage',
    themes: ['beaches-coast', 'temple-culture'],
    recommendedDays: '1 Day',
    startingPoint: 'Kanyakumari',
    highlights: [
      'Sunrise and sunset over the sea',
      'Vivekananda Rock Memorial',
      'Thiruvalluvar Statue',
    ],
    placesToSee: [
      'Vivekananda Rock Memorial',
      'Thiruvalluvar Statue',
      'Bhagavathi Amman Temple',
      'Sunset Point',
      'Gandhi Mandapam',
      'Padmanabhapuram Palace',
      'Suchindram',
      'Mathur Aqueduct',
      'Thirparappu Falls',
    ],
    journeys: ['kanyakumari-madurai-kodaikanal', 'kanyakumari-tirunelveli-madurai'],
    heroImage: '/images/destinations/kanyakumari-hero.jpg',
    gallery: [],
    seoTitle: 'Kanyakumari Travel Guide & Trip Planning',
    seoDescription:
      'Plan your Kanyakumari trip — places to see, sunrise and sunset timing, and ready-made journeys with Shivdev Holidays.',
  },
  {
    name: 'Madurai',
    slug: 'madurai',
    shortDescription:
      'A temple city built around the Meenakshi Amman Temple.',
    region: 'South Tamil Nadu',
    category: 'Temple & Culture',
    themes: ['temple-culture', 'heritage-history'],
    recommendedDays: '1–2 Days',
    startingPoint: 'Kanyakumari',
    highlights: [
      'Meenakshi Amman Temple',
      'Thirumalai Nayakkar Palace',
      'Local Madurai food',
    ],
    placesToSee: [
      'Meenakshi Amman Temple',
      'Thirumalai Nayakkar Palace',
      'Gandhi Memorial Museum',
    ],
    journeys: ['kanyakumari-madurai-kodaikanal', 'kanyakumari-tirunelveli-madurai'],
    heroImage: '/images/destinations/madurai-hero.jpg',
    gallery: [],
    seoTitle: 'Madurai Travel Guide & Trip Planning',
    seoDescription:
      'Plan your Madurai trip — temple visit timing, places to see, and journeys from Kanyakumari with Shivdev Holidays.',
  },
  {
    name: 'Kodaikanal',
    slug: 'kodaikanal',
    shortDescription: 'A quiet hill town with a lake and pine forests.',
    region: 'Western Ghats',
    category: 'Hills & Nature',
    themes: ['hills-nature'],
    recommendedDays: '2 Days',
    startingPoint: 'Madurai',
    highlights: ['Kodaikanal Lake', 'Coaker’s Walk', 'Pillar Rocks'],
    placesToSee: ['Kodaikanal Lake', 'Coaker’s Walk', 'Pillar Rocks', 'Bryant Park'],
    journeys: ['kanyakumari-madurai-kodaikanal'],
    heroImage: '/images/destinations/kodaikanal-hero.jpg',
    gallery: [],
    seoTitle: 'Kodaikanal Travel Guide & Trip Planning',
    seoDescription:
      'Plan your Kodaikanal trip — lake, viewpoints, and hill town routes from Madurai with Shivdev Holidays.',
  },
  {
    name: 'Tirunelveli',
    slug: 'tirunelveli',
    shortDescription:
      'Known for the Nellaiappar Temple and nearby Courtallam falls.',
    region: 'South Tamil Nadu',
    category: 'Temple & Nature',
    themes: ['temple-culture', 'hills-nature'],
    recommendedDays: '1 Day',
    startingPoint: 'Kanyakumari',
    highlights: ['Nellaiappar Temple', 'Courtallam Falls'],
    placesToSee: ['Nellaiappar Temple', 'Manimuthar', 'Papanasam', 'Courtallam', 'Agasthiyar Falls'],
    journeys: ['kanyakumari-tirunelveli-madurai'],
    heroImage: '/images/destinations/tirunelveli-hero.jpg',
    gallery: [],
    seoTitle: 'Tirunelveli Travel Guide & Trip Planning',
    seoDescription:
      'Plan your Tirunelveli trip — temples, Courtallam falls, and routes from Kanyakumari with Shivdev Holidays.',
  },
  {
    name: 'Rameswaram',
    slug: 'rameswaram',
    shortDescription:
      'An island town with the Ramanathaswamy Temple and the road to Dhanushkodi.',
    region: 'South Tamil Nadu',
    category: 'Coastal & Pilgrimage',
    themes: ['temple-culture', 'beaches-coast'],
    recommendedDays: '1–2 Days',
    startingPoint: 'Madurai',
    highlights: ['Ramanathaswamy Temple', 'Pamban Bridge', 'Dhanushkodi'],
    placesToSee: ['Ramanathaswamy Temple', 'Pamban Bridge', 'Dhanushkodi'],
    journeys: ['kanyakumari-rameswaram-dhanushkodi'],
    heroImage: '/images/destinations/rameswaram-hero.jpg',
    gallery: [],
    seoTitle: 'Rameswaram Travel Guide & Trip Planning',
    seoDescription:
      'Plan your Rameswaram trip — temple, Pamban Bridge, and Dhanushkodi with Shivdev Holidays.',
  },
  {
    name: 'Ooty',
    slug: 'ooty',
    shortDescription: 'A hill station known for tea estates and cool weather.',
    region: 'Western Ghats',
    category: 'Hills & Nature',
    themes: ['hills-nature'],
    recommendedDays: '2 Days',
    startingPoint: 'Coimbatore',
    highlights: ['Ooty Lake', 'Botanical Garden', 'Doddabetta Peak'],
    placesToSee: ['Ooty Lake', 'Botanical Garden', 'Doddabetta Peak'],
    journeys: ['coimbatore-valparai-ooty'],
    heroImage: '/images/destinations/ooty-hero.jpg',
    gallery: [],
    seoTitle: 'Ooty Travel Guide & Trip Planning',
    seoDescription:
      'Plan your Ooty trip — tea estates, viewpoints, and routes from Coimbatore with Shivdev Holidays.',
  },
];

export function getDestinationBySlug(slug) {
  return destinations.find((destination) => destination.slug === slug);
}

export function getDestinationsByTheme(themeSlug) {
  return destinations.filter((destination) => destination.themes.includes(themeSlug));
}
