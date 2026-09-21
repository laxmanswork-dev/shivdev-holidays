/**
 * The <head> tags that describe one page to search engines and link
 * previews, as plain data — the single source of truth used both at
 * runtime (seo/SEO.jsx renders them through react-helmet-async) and at
 * build time (scripts/postbuild.mjs writes the same tags into each route's
 * static HTML, so crawlers that don't run JavaScript still see them; SEO.jsx
 * removes those static copies once React has rendered its own).
 * Keeping one builder is what stops the two from drifting apart.
 *
 * @param {Object} seo - the object returned by resolveSeo() (seoConfig.js)
 * @returns {{tag: 'meta'|'link', attrs: Object}[]}
 */
export function buildHeadTags(seo) {
  const tags = [
    { tag: 'meta', attrs: { name: 'description', content: seo.description } },
    ...(seo.canonical ? [{ tag: 'link', attrs: { rel: 'canonical', href: seo.canonical } }] : []),
    { tag: 'meta', attrs: { name: 'robots', content: seo.robots } },

    { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: seo.siteName } },
    { tag: 'meta', attrs: { property: 'og:title', content: seo.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: seo.description } },
    ...(seo.canonical ? [{ tag: 'meta', attrs: { property: 'og:url', content: seo.canonical } }] : []),
    { tag: 'meta', attrs: { property: 'og:image', content: seo.image } },
    ...(seo.imageSize
      ? [
          { tag: 'meta', attrs: { property: 'og:image:width', content: String(seo.imageSize.width) } },
          { tag: 'meta', attrs: { property: 'og:image:height', content: String(seo.imageSize.height) } },
        ]
      : []),

    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: seo.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: seo.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: seo.image } },
  ];
  return tags;
}
