import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * The one place that decides: "smooth-scroll to a homepage section"
 * vs. "React Router navigate to its standalone page" — and performs
 * whichever is correct. Shared by SectionNavLink (nav items) and
 * Button (`section` prop), so no component hand-rolls this logic.
 *
 * Rule: if we're already on the homepage, scroll to the section in
 * place. Otherwise, navigate to its real standalone route.
 *
 * @param {string} [sectionId] - homepage anchor id, e.g. "destinations"
 * @param {string} [fallbackRoute] - standalone route, e.g. "/destinations"
 * @returns {null|{mode:'anchor', href:string, onClick:Function}|{mode:'route', to:string}}
 */
export function useSectionLink(sectionId, fallbackRoute) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = useCallback(
    (event) => {
      if (!sectionId) return;
      // Let the browser do its normal thing for new-tab / modified clicks.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = document.getElementById(sectionId);
      if (!target) return;
      event.preventDefault();

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      // Reflect the section in the URL without pushing a new history
      // entry for every click.
      navigate({ hash: `#${sectionId}` }, { replace: true });
    },
    [sectionId, navigate]
  );

  if (!sectionId) return null;

  if (location.pathname === '/') {
    return { mode: 'anchor', href: `#${sectionId}`, onClick: handleAnchorClick };
  }

  return { mode: 'route', to: fallbackRoute || '/' };
}
