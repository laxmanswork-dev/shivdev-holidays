/**
 * Site-wide configuration.
 * Single source of truth for business identity, contact details,
 * navigation, and default SEO values. Components and pages should
 * read from here rather than hardcoding brand details inline.
 */

export const site = {
  name: 'Shivdev Holidays',
  legalName: 'Shivdev Holidays',
  tagline: 'Travel and cab services based in Kanyakumari',
  shortDescription:
    'Shivdev Holidays plans cab trips and travel routes across Kanyakumari and Tamil Nadu.',

  url: 'https://www.shivdevholidays.com',

  contact: {
    phone: '+91 90723 00823',
    // Single source of truth for every WhatsApp deep link on the
    // site — the floating WhatsApp button (components/common/
    // WhatsAppButton.jsx), the Plan Your Trip form, and the homepage
    // "Message us on WhatsApp" button all read this one value via
    // utils/format.js's toWhatsAppHref(). Never hardcode a number
    // anywhere else.
    whatsapp: '+91 90723 00823',
    email: 'info@shivdevholidays.com',
  },

  address: {
    line1: 'Anandhapuri, North St, Kottaram',
    city: 'Kanyakumari',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '629703',
    // Same verified location as site.googleMapsUrl / GoogleRatingBadge
    // (see docs/google-rating.md) — the coordinates given there
    // (8.1193381, 77.5230156) and the DMS coordinates supplied
    // separately (8°07'09.6"N 77°31'22.9"E = 8.119333, 77.523028)
    // agree to within ~1.5m, confirming the same business. Used in
    // the LocalBusiness structured data's `geo` field (see
    // src/seo/structuredData.js) for local SEO.
    latitude: 8.1193381,
    longitude: 77.5230156,
  },

  social: {
    instagram: '',
    facebook: '',
    youtube: '',
  },

  // The business's official Google Business Profile link, as supplied.
  // Verified (no API key needed — following each redirect, never
  // scraped for rating data) to be the same "Shivdev holidays" entity
  // as four earlier-supplied links: all resolve to the identical
  // Google Knowledge Graph feature ID /g/11zzhv6l2_ (CID
  // 0x3b04f3fb8f01f045:0x63a6f5d7e117d5a4, 8.1193381, 77.5230156).
  // Single source of truth for the homepage's Google rating row
  // (components/common/GoogleRatingBadge.jsx) — never hardcode this
  // URL elsewhere. See docs/google-rating.md.
  //
  // NOTE: this is a "share the listing" link — Google decides where it
  // redirects (currently a Search results page showing the business's
  // Knowledge Panel, not the Maps app/site), which is fine for "read
  // our reviews" but wrong for a "Get Directions" action. That one
  // uses googleDirectionsUrl below instead, not this field.
  googleMapsUrl: 'https://share.google/FccNNmuFWqNMLwWT8',

  // Google's own documented, API-key-free "Directions" URL scheme
  // (https://developers.google.com/maps/documentation/urls/get-started#directions-action)
  // — guaranteed to open the actual Google Maps app/site with this
  // business's exact coordinates as the destination, never a Search
  // results page. Used by the homepage's map section "Get Directions"
  // button (pages/Home/index.jsx). Built from site.address's verified
  // latitude/longitude, not hardcoded as a separate string, so it can
  // never drift from the one verified location.
  get googleDirectionsUrl() {
    return `https://www.google.com/maps/dir/?api=1&destination=${this.address.latitude},${this.address.longitude}`;
  },

  // MANUALLY MAINTAINED — not fetched live. There's no Google Cloud
  // billing/API key set up for this business yet, so the homepage's
  // rating row (components/common/GoogleRatingBadge.jsx) just reads
  // these two numbers directly instead of calling an API.
  //
  // To update: open the listing above, check the current rating/review
  // count shown there, and edit the two values below to match — then
  // rebuild and redeploy. There is no reminder system for this; it's on
  // whoever maintains the site to check back periodically.
  //
  // Set this whole field to `null` if you'd rather not display a
  // number at all — the row still works as a plain "Read Google
  // Reviews" link either way (tested: see docs/google-rating.md).
  //
  // A real-time version of this (auto-fetched from the Google Places
  // API, no manual editing ever needed again) already exists and is
  // fully built — see docs/google-rating.md — it just needs a Google
  // Cloud project, billing enabled, and an API key, none of which this
  // business has set up yet. Switching to it later needs no component
  // changes, only Cloudflare config.
  googleRating: {
    value: 5.0,
    reviewCount: 6,
    // The date this was last checked against the real listing above —
    // update this alongside the two values whenever you do.
    checkedOn: '2026-10-24',
  },

  serviceAreas: [
    'Kanyakumari',
    'Nagercoil',
    'Tirunelveli',
    'Madurai',
    'Rameswaram',
    'Kodaikanal',
    'Ooty',
    'Coimbatore',
  ],

  // `sectionId` is the anchor id for this item's homepage section
  // (see pages/Home). `to` is the real standalone route — used
  // whenever the visitor isn't on the homepage. See
  // hooks/useSectionLink.js for how the two are reconciled.
  //
  // "Plan Your Trip" deliberately has no `sectionId`: there's no
  // homepage teaser section for it to scroll to (removed — see
  // homeSections.js), only the real form at /plan-your-trip. This
  // item always navigates straight there instead (SectionNavLink
  // falls back to `item.to` whenever `sectionId` is absent).
  nav: [
    { label: 'Home', sectionId: 'home', to: '/' },
    { label: 'Destinations', sectionId: 'destinations', to: '/destinations' },
    { label: 'Plan Your Trip', to: '/plan-your-trip' },
    { label: 'About', sectionId: 'about', to: '/about' },
    { label: 'Contact', sectionId: 'contact', to: '/contact' },
  ],

  seo: {
    titleTemplate: '%s | Shivdev Holidays',
    defaultTitle: 'Shivdev Holidays — Cab & Travel Planning in Kanyakumari',
    defaultDescription:
      'Plan your Kanyakumari trip with Shivdev Holidays. Cab travel, ready-made journeys, and custom routes across Tamil Nadu.',
    // 1200x630 share-preview image (WhatsApp, Facebook, X) — see public/images/brand/og-share.jpg.
    defaultImage: '/images/brand/og-share.jpg',
    defaultImageSize: { width: 1200, height: 630 },
    twitterHandle: '',
  },
};
