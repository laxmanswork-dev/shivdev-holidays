import { useSyncExternalStore } from 'react';

function subscribe(callback) {
  window.addEventListener('scroll', callback, { passive: true });
  return () => window.removeEventListener('scroll', callback);
}

/**
 * True once the page has scrolled past `threshold` pixels.
 * Used for the header's subtle scrolled-state elevation.
 */
export function useScrolled(threshold = 8) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false
  );
}
