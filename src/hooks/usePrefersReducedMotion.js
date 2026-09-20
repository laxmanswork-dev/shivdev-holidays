import { useMediaQuery } from './useMediaQuery';

/**
 * True when the user has requested reduced motion at the OS level.
 * Use this to gate non-essential framer-motion animations.
 */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
