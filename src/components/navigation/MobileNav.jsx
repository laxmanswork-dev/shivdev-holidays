import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Phone } from 'lucide-react';
import { site } from '../../data/site';
import { Button } from '../common/Button';
import { SectionNavLink } from './SectionNavLink';
import { toTelHref } from '../../utils/format';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { DURATION, EASE_OUT } from '../../utils/motion';
import './MobileNav.css';

/**
 * Full-height slide-in navigation panel for narrow viewports.
 * Locks body scroll while open, traps Tab focus within the panel,
 * closes on Escape or backdrop click, and returns focus to the
 * trigger button on close.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {React.RefObject<HTMLElement>} [props.triggerRef]
 */
export function MobileNav({ isOpen, onClose, triggerRef }) {
  const panelRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = panelRef.current?.querySelectorAll('a[href], button:not([disabled])');
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'Tab' && focusable?.length) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    const triggerEl = triggerRef?.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      triggerEl?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: DURATION.slow, ease: EASE_OUT };
  const panelOffset = prefersReducedMotion ? 0 : '100%';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-nav__backdrop"
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-nav__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            ref={panelRef}
            initial={{ x: panelOffset }}
            animate={{ x: 0 }}
            exit={{ x: panelOffset }}
            transition={transition}
          >
            <div className="mobile-nav__header">
              <span className="mobile-nav__title">Menu</span>
              <button
                type="button"
                className="mobile-nav__close"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <ul className="mobile-nav__list">
              {site.nav.map((item) => (
                <li key={item.to}>
                  <SectionNavLink
                    item={item}
                    className="mobile-nav__link"
                    activeClassName="mobile-nav__link--active"
                    onNavigate={onClose}
                  />
                </li>
              ))}
            </ul>

            <div className="mobile-nav__footer">
              <Button
                href={toTelHref(site.contact.phone)}
                icon={Phone}
                iconPosition="left"
                size="lg"
                className="mobile-nav__call"
              >
                Call Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
