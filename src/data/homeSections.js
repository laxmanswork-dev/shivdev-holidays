/**
 * The homepage's planned section flow, in order.
 *
 * This is the single reference for where a new homepage section
 * belongs — not every entry is built yet. `status: 'placeholder'`
 * sections exist now (see pages/Home) with minimal content and a
 * working anchor; `status: 'planned'` sections are not built yet —
 * add them here first when they are, so this list stays the source
 * of truth for the page's order.
 *
 * Entries with a `navLabel` are also wired into the main navigation
 * (see data/site.js `nav`) — clicking that nav item scrolls here
 * when already on the homepage.
 *
 * @typedef {Object} HomeSection
 * @property {number} order
 * @property {string} id - anchor id, matches an `<section id="...">`
 * @property {string} title - working title for this section
 * @property {string} [navLabel] - if present, this section has a nav item
 * @property {'placeholder'|'planned'} status
 */

/** @type {HomeSection[]} */
export const HOME_SECTIONS = [
  { order: 1, id: 'home', title: 'Hero', navLabel: 'Home', status: 'placeholder' },
  { order: 2, id: 'more-than-a-cab', title: 'More Than a Cab', status: 'planned' },
  { order: 3, id: 'experiences', title: 'Explore by Experience', status: 'planned' },
  {
    order: 4,
    id: 'destinations',
    title: 'Popular Destinations',
    navLabel: 'Destinations',
    status: 'placeholder',
  },
  { order: 5, id: 'around-kanyakumari', title: 'Around Kanyakumari', status: 'planned' },
  { order: 6, id: 'hidden-places', title: 'Places You May Not Know', status: 'planned' },
  // Order 7 ("plan", a "Plan your trip" teaser) was removed — Home
  // never routed its nav item there anyway (see site.js's `nav`
  // comment on "Plan Your Trip"), and the real form lives at
  // /plan-your-trip only.
  { order: 8, id: 'about', title: 'Why Shivdev Holidays', navLabel: 'About', status: 'placeholder' },
  { order: 9, id: 'stories', title: 'Traveller Trust / Stories', status: 'planned' },
  { order: 10, id: 'contact', title: 'Final CTA', navLabel: 'Contact', status: 'placeholder' },
  // Footer is rendered by Layout, not Home — not a scroll-anchor section.
];
