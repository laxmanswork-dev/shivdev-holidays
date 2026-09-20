import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Fades a section's content in once it's scrolled into view — a
 * one-time reveal (the observer disconnects after the first
 * intersection), not a toggle that fades back out when scrolled past
 * again. Whatever's already in the viewport at mount (the hero, most
 * of the time) reveals almost immediately rather than waiting on a
 * real scroll gesture.
 *
 * Starts already "revealed" under prefers-reduced-motion (a lazy
 * initializer, not a setState call inside the effect, so there's no
 * flash of hidden content while React decides).
 */
export function useRevealOnScroll() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    // threshold: 0 (not a percentage) — some sections (e.g. a whole
    // region's worth of destination cards) are many viewport-heights
    // tall, so a percentage-based threshold could need more pixels
    // visible at once than the viewport can ever show. Firing the
    // moment any part of the section enters (a little before it
    // actually reaches the viewport, via rootMargin) works the same
    // regardless of the section's own height.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
