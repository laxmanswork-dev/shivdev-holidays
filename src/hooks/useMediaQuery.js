import { useSyncExternalStore } from 'react';

function subscribe(query, callback) {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener('change', callback);
  return () => mediaQueryList.removeEventListener('change', callback);
}

/**
 * Tracks whether a CSS media query currently matches.
 * @param {string} query - e.g. "(min-width: 768px)"
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false
  );
}
