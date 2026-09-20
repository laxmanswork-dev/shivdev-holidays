import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, Menu, X } from 'lucide-react';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { NavBar } from '../navigation/NavBar';
import { MobileNav } from '../navigation/MobileNav';
import { DestinationSearch } from '../navigation/DestinationSearch';
import { useScrolled } from '../../hooks/useScrolled';
import { site } from '../../data/site';
import { toTelHref } from '../../utils/format';
import { cn } from '../../utils/cn';
import { DURATION } from '../../utils/motion';
import './Header.css';

// Roughly "one hero's worth" of scroll — the homepage hero video is
// (close to) a full viewport tall, so this is the simplest reliable
// proxy for "is the video still behind the header" without wiring up
// a ref/IntersectionObserver across Header ↔ Home just for this.
const HERO_SCROLL_THRESHOLD =
  typeof window !== 'undefined' ? window.innerHeight * 0.85 : 700;

/** Sticky, minimal site header: wordmark, primary nav, call CTA, mobile menu. */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const pastHero = useScrolled(HERO_SCROLL_THRESHOLD);
  const toggleRef = useRef(null);
  const { pathname } = useLocation();

  // Transparent glass only where it can actually stay readable: over
  // the homepage hero video, before scrolling past it. Everywhere
  // else (scrolled down, or any other page — none of which have a
  // video behind the header) it's the normal solid white bar, so nav
  // text is never left illegible against a light page canvas.
  const transparent = pathname === '/' && !pastHero;

  return (
    <header
      className={cn(
        'site-header',
        scrolled && 'site-header--scrolled',
        transparent && 'site-header--transparent',
      )}
    >
      <Container className="site-header__bar">
        <Link to="/" className="site-header__brand" onClick={() => setIsMenuOpen(false)}>
          <img
            src="/images/brand/shivdev-holidays-logo.png"
            alt=""
            className="site-header__logo"
          />
          {/* alt="" above: this wordmark is now what names the link for
              screen readers (the accessible name of a link is built from
              all its content), so the mark stays but doesn't also
              announce "Shivdev Holidays" a second time. */}
          <span className="site-header__wordmark">
            <span className="site-header__wordmark-main">Shivdev</span>
            <span className="site-header__wordmark-sub">Holidays</span>
          </span>
        </Link>

        <NavBar className="site-header__nav" />

        <div className="site-header__actions">
          <DestinationSearch className="site-header__search" />

          <Button
            href={toTelHref(site.contact.phone)}
            icon={Phone}
            iconPosition="left"
            size="sm"
            className="site-header__call"
            // Below 480px the visible "Call Now" label is hidden (icon-only);
            // display:none also removes it from the accessibility tree, so
            // give the link its name explicitly (same words as the label).
            aria-label="Call Now"
          >
            Call Now
          </Button>

          <button
            type="button"
            ref={toggleRef}
            className="site-header__toggle"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span
                  key="close"
                  className="site-header__toggle-icon"
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: DURATION.fast }}
                >
                  <X size={22} aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  className="site-header__toggle-icon"
                  initial={{ opacity: 0, rotate: 45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -45 }}
                  transition={{ duration: DURATION.fast }}
                >
                  <Menu size={22} aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </Container>

      <MobileNav
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        triggerRef={toggleRef}
      />
    </header>
  );
}
