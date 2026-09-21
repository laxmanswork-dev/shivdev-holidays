import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { resolveSeo } from './seoConfig';
import { buildHeadTags } from './headTags';

/**
 * Drop-in SEO component. Handles title, meta description, canonical
 * URL, robots, Open Graph, and Twitter card metadata for one page.
 * Pass `structuredData` (a JSON-LD object, or an array of them) to
 * inject schema — only when it genuinely matches the page content.
 *
 * The tags themselves come from buildHeadTags() (headTags.js), the same
 * builder the build uses to write each route's static HTML (scripts/
 * postbuild.mjs), so crawlers that don't run JavaScript get the same tags.
 * Those static copies are marked data-rh="true"; with React 19, Helmet's
 * own tags are rendered by React and are NOT marked, so once React has
 * rendered its own set the static ones are removed here — otherwise every
 * page would carry two descriptions, two canonicals and so on.
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

  useEffect(() => {
    document.head.querySelectorAll('[data-rh]').forEach((element) => element.remove());
  }, []);
  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{seo.title}</title>
      {buildHeadTags(seo).map(({ tag: Tag, attrs }) => (
        <Tag key={`${attrs.name ?? attrs.property ?? attrs.rel}`} {...attrs} />
      ))}

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
