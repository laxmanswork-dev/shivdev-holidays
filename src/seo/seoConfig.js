import { site } from '../data/site';

// Social crawlers (WhatsApp, Facebook, X) need an ABSOLUTE image URL — a
// root-relative path like "/images/..." doesn't resolve for them.
function toAbsoluteUrl(url) {
  if (/^https?:\/\//.test(url)) return url;
  return `${site.url}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * Resolves the final metadata values for a page by merging
 * page-level overrides on top of site-wide defaults.
 *
 * @param {Object} options
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {string} [options.path] - route path, e.g. "/destinations/madurai"
 * @param {string} [options.image]
 * @param {boolean} [options.noindex]
 */
export function resolveSeo({ title, description, path = '/', image, noindex = false } = {}) {
  const resolvedTitle = title
    ? site.seo.titleTemplate.replace('%s', title)
    : site.seo.defaultTitle;

  return {
    title: resolvedTitle,
    description: description || site.seo.defaultDescription,
    canonical: buildCanonical(path),
    image: toAbsoluteUrl(image || site.seo.defaultImage),
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
  };
}

export function buildCanonical(path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${site.url}${cleanPath === '/' ? '' : cleanPath}`;
}
