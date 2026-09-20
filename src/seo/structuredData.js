import { site } from '../data/site';

/**
 * JSON-LD builders. Only use a schema type when the page content
 * genuinely matches it — do not add schema for the sake of it,
 * and never fabricate ratings, reviews, or review counts.
 */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: `${site.url}/images/brand/shivdev-holidays-logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.contact.phone,
      contactType: 'customer service',
      areaServed: 'IN',
    },
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: site.name,
    url: site.url,
    telephone: site.contact.phone,
    email: site.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      addressCountry: site.address.country,
    },
  };
}

/**
 * @param {{name: string, description: string, path: string, image?: string}} destination
 */
export function touristDestinationSchema({ name, description, path, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name,
    description,
    url: `${site.url}${path}`,
    ...(image ? { image: `${site.url}${image}` } : {}),
  };
}

/**
 * @param {{name: string, path: string}[]} items - in order, root first
 */
export function breadcrumbListSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

/**
 * @param {{name: string, description: string, path: string}} service
 */
export function serviceSchema({ name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    description,
    url: `${site.url}${path}`,
    provider: {
      '@type': 'TravelAgency',
      name: site.name,
    },
  };
}

/**
 * Only use this when the page has real, visible FAQ content.
 * @param {{question: string, answer: string}[]} faqs
 */
export function faqPageSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
