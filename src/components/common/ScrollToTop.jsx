import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top on a real route change.
 *
 * Plain `<BrowserRouter>` + `<Routes>` (what this app uses) does not
 * reset scroll on navigation the way a data router's
 * `<ScrollRestoration>` does, so without this, navigating to a new
 * page can leave you scrolled halfway down it.
 *
 * Skipped when the new location carries a hash — that's either a
 * homepage-section link (useSectionLink already scrolled to it) or a
 * deep link the target page will scroll to itself.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}
