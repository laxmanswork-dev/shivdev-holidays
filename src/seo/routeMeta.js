import { getDestinationDetail } from '../data/destinationDetail';
import {
  organizationSchema,
  localBusinessSchema,
  touristDestinationSchema,
  breadcrumbListSchema,
  serviceSchema,
} from './structuredData';

/**
 * Page-level SEO props (title, description, path, JSON-LD), defined once.
 * The pages pass them to <SEO> at runtime, and scripts/postbuild.mjs uses
 * the very same functions to write each route's static HTML head — so what
 * a crawler sees before JavaScript runs is what React renders afterwards.
 */

export function homeSeoProps() {
  return { path: '/', structuredData: [organizationSchema(), localBusinessSchema()] };
}

export function destinationsSeoProps() {
  return {
    title: 'Destinations',
    description:
      'Explore destinations across Tamil Nadu and Kerala with Shivdev Holidays. Plan local visits, outstation journeys and comfortable cab travel from Kanyakumari.',
    path: '/destinations',
    structuredData: breadcrumbListSchema([
      { name: 'Home', path: '/' },
      { name: 'Destinations', path: '/destinations' },
    ]),
  };
}

export function planTripSeoProps() {
  return {
    title: 'Plan Your Trip',
    description:
      'Plan local and outstation cab trips from Kanyakumari across Tamil Nadu and South India with Shivdev Holidays.',
    path: '/plan-your-trip',
    structuredData: [
      serviceSchema({
        name: 'Trip Planning',
        description:
          'Plan a cab trip from Kanyakumari across Tamil Nadu and South India with Shivdev Holidays.',
        path: '/plan-your-trip',
      }),
      breadcrumbListSchema([
        { name: 'Home', path: '/' },
        { name: 'Plan Your Trip', path: '/plan-your-trip' },
      ]),
    ],
  };
}

/** @param {ReturnType<typeof getDestinationDetail>} destination */
export function destinationSeoProps(destination) {
  const path = `/destinations/${destination.slug}`;
  return {
    title: destination.seoTitle,
    description: destination.seoDescription,
    path,
    structuredData: [
      touristDestinationSchema({
        name: destination.name,
        description: destination.shortDescription,
        path,
      }),
      breadcrumbListSchema([
        { name: 'Home', path: '/' },
        { name: 'Destinations', path: '/destinations' },
        { name: destination.name, path },
      ]),
    ],
  };
}

/** Same as destinationSeoProps, looked up by slug (null if there is no such page). */
export function destinationSeoPropsForSlug(slug) {
  const destination = getDestinationDetail(slug);
  return destination ? destinationSeoProps(destination) : null;
}
