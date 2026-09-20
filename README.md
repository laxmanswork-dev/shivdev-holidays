# Shivdev Holidays

Website for Shivdev Holidays, a South India cab and tour service. Built with
Vite 8, React 19 and React Router 7. Routes are code-split, SEO metadata is
handled with react-helmet-async, and fonts are self-hosted through `@fontsource`.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install        # install dependencies
npm run dev        # start the dev server
npm run lint       # run ESLint
npm run build      # production build into dist/ (regenerates public/sitemap.xml first)
npm run preview    # serve the production build locally
```

No environment variables are needed to install, build or run the site, so there
is no `.env` file or `.env.example`.

## Project layout

```
src/
  components/   shared UI (layout, navigation, destinations, sections, planTrip)
  pages/        Home, Destinations, Destination (detail), PlanTrip, NotFound
  data/         destination catalogue, travel places, trip options, site details
  seo/          SEO component, metadata and structured data helpers
  styles/       design tokens, typography, fonts, global CSS
public/         images, hero video, robots.txt, sitemap.xml, _redirects
scripts/        sitemap generator and placeholder-image helper
```

## Destinations

`src/data/destinationCatalogue.js` defines the 61-destination catalogue
shown on `/destinations`. `src/data/travelPlaces.js` is the wider search index;
every place has a page at `/destinations/:slug`.

Each destination looks for its photo at `public/images/destinations/<slug>.png`.
If the file is missing, the card or page omits the image frame rather than
showing a broken image (see `public/images/destinations/README.md`).

## Deployment notes

The site is a single-page app, so the host must rewrite unknown paths to
`/index.html`. Both `public/_redirects` (Netlify and Cloudflare Pages style)
and `vercel.json` are included. Set the production URL in `src/data/site.js`
so canonical URLs, the sitemap and social images are correct.
