import { Helmet } from 'react-helmet-async';
import { resolveSeo } from './seoConfig';

/**
 * Drop-in SEO component. Handles title, meta description, canonical
 * URL, robots, Open Graph, and Twitter card metadata for one page.
 * Pass `structuredData` (a JSON-LD object, or an array of them) to
 * inject schema — only when it genuinely matches the page content.
 *
 * @param {Object} props
 * @param {string} [props.title] - page title; combined with the site template
 * @param {string} [props.description]
 * @param {string} [props.path] - route path, e.g. "/destinations/madurai"
 * @param {string} [props.image] - absolute or root-relative image path
 * @param {boolean} [props.noindex]
 * @param {Object|Object[]} [props.structuredData] - JSON-LD object(s)
 */
export function SEO({ title, description, path, image, noindex, structuredData }) {
  const seo = resolveSeo({ title, description, path, image, noindex });
  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonical} />
      <meta name="robots" content={seo.robots} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:image" content={seo.image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
