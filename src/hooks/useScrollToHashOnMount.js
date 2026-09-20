import { useEffect } from 'react';

/**
 * Handles a deep link like "/#destinations": jumps to that section
 * once it exists in the DOM. Native browser fragment-scroll-on-load
 * can't be relied on here because the homepage's sections are
 * lazy-loaded, so the target id doesn't exist yet at first paint.
 *
 * Call once from the page that owns the anchored sections (Home).
 * Uses an instant jump (not smooth) to match how a fresh page load
 * to a fragment normally behaves.
 */
export function useScrollToHashOnMount() {
  useEffect(() => {
    const id = window.location.hash?.slice(1);
    if (!id) return undefined;

    let rafId;
    function trySetup() {
      const target = document.getElementById(id);
      if (!target) {
        rafId = requestAnimationFrame(trySetup);
        return;
      }
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    trySetup();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
    // Deliberately run once on mount only.
  }, []);
}
