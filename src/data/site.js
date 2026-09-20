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
    line1: 'Kanyakumari',
    city: 'Kanyakumari',
    state: 'Tamil Nadu',
    country: 'India',
    postalCode: '',
  },

  social: {
    instagram: '',
    facebook: '',
    youtube: '',
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
    defaultImage: '/images/brand/shivdev-holidays-logo.png',
    twitterHandle: '',
  },
};
