import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/common/ScrollToTop';
// Home is a static import, not lazy — it's the entry route almost
// every visitor lands on first, so lazy-loading it only adds a
// sequential chunk-fetch delay before the hero (including its LCP
// video/poster) can even start loading, with no benefit (there's no
// "avoid loading it" scenario for the homepage). Every other route
// stays lazy since a visitor only needs one of them per session.
import Home from './pages/Home';

const Destinations = lazy(() => import('./pages/Destinations'));
const Destination = lazy(() => import('./pages/Destination'));
const PlanTrip = lazy(() => import('./pages/PlanTrip'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={null}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="destinations/:slug" element={<Destination />} />
          <Route path="plan-your-trip" element={<PlanTrip />} />
          {/* No page has ever lived at /plan — only a nav-anchor id
              (see data/site.js) — but redirect it anyway in case any
              old/external link assumed it was a real route. */}
          <Route path="plan" element={<Navigate to="/plan-your-trip" replace />} />
          {/* The About page was folded into a Home section (see
              pages/Home) — redirect old /about links there instead of
              404ing, same treatment as /plan above. */}
          <Route path="about" element={<Navigate to="/#about" replace />} />
          {/* The standalone Contact page was removed — the Contact
              section on Home covers it. Redirect old /contact links
              (and the header/footer nav item's route off-homepage,
              see data/site.js) there, same as /about above. */}
          <Route path="contact" element={<Navigate to="/#contact" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
