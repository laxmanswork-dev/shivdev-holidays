import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SkipLink } from '../common/SkipLink';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ActiveSectionProvider } from '../navigation/ActiveSectionProvider';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Route shell: header, routed page content, footer.
 *
 * The routed page sits inside its own Suspense + ErrorBoundary so a lazy
 * page that is slow to load — or fails to (see ErrorBoundary) — never
 * takes the header and footer down with it. Keyed by pathname so
 * navigating away from a failed page tries the next one afresh.
 *
 * While a lazy page is still downloading, the fallback reserves a full
 * screen of height: with an empty <main> the footer would otherwise sit
 * right under the header and then jump down the moment the page arrives
 * (a large layout shift). Reserved, the footer starts below the fold.
 */
export function Layout() {
  const { pathname } = useLocation();

  return (
    <ActiveSectionProvider>
      <SkipLink />
      <Header />
      <main id="main-content">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<div aria-hidden="true" style={{ minHeight: '100svh' }} />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </ActiveSectionProvider>
  );
}
