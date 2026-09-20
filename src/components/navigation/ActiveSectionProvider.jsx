import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { site } from '../../data/site';
import { ActiveSectionContext } from '../../hooks/useActiveSectionId';

// Homepage sections that back a nav item, in page order (nav order
// matches page order).
const NAV_SECTION_IDS = site.nav.map((item) => item.sectionId).filter(Boolean);

// Sections that belong to a nav item's section but have no nav item of
// their own — e.g. "How It Works" is the second half of the About
// block, so while it's on screen "About" stays highlighted (before,
// nothing owned it, so whichever item was active last just lingered).
const OWNED_BY = { 'about-how-it-works': 'about' };
const TRACKED_IDS = [...NAV_SECTION_IDS, ...Object.keys(OWNED_BY)];

/**
 * Tracks which homepage section is currently in view so every
 * consumer (desktop nav, mobile nav, footer nav) agrees on the same
 * active id at the same time — no flicker between them.
 *
 * The active section is the last one (in page order) whose top edge
 * has passed an "activation line" 40% of the way down the viewport —
 * computed from the sections' real positions on every scroll/resize
 * frame, so it's right when scrolling in either direction, after an
 * anchor jump, or on a deep-linked load (an IntersectionObserver
 * version only saw the sections that *changed*, which left the wrong
 * item highlighted when scrolling back up through unobserved parts).
 *
 * Only does anything while on the homepage; elsewhere it just
 * provides `null` (nothing to track).
 */
export function ActiveSectionProvider({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [rawActiveId, setRawActiveId] = useState(null);

  useEffect(() => {
    if (!isHome) return undefined;

    let rafId = 0;
    let ticking = false;
    let cancelled = false;
    let elements = [];

    function update() {
      ticking = false;
      const line = window.innerHeight * 0.4;
      // Above the first section (or nothing has crossed the line yet)
      // the first nav item is the active one.
      let current = NAV_SECTION_IDS[0];
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) {
          current = OWNED_BY[el.id] ?? el.id;
        }
      }
      setRawActiveId(current);
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(update);
    }

    // The homepage's sections may not exist in the DOM yet on the
    // first pass — poll a couple of frames until they do rather than
    // silently tracking nothing.
    function trySetup() {
      if (cancelled) return;
      // Sorted into real page order (TRACKED_IDS isn't: the owned
      // sections are appended after the nav ones).
      elements = TRACKED_IDS.map((id) => document.getElementById(id))
        .filter(Boolean)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      if (elements.length === 0) {
        rafId = requestAnimationFrame(trySetup);
        return;
      }
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      update();
    }

    trySetup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [isHome]);

  const activeId = isHome ? rawActiveId : null;

  return (
    <ActiveSectionContext.Provider value={activeId}>{children}</ActiveSectionContext.Provider>
  );
}
