import { useEffect, useId, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useDestinationFinder } from '../../hooks/useDestinationFinder';
import { DestinationResultsList } from './DestinationResultsList';
import { cn } from '../../utils/cn';
import './DestinationSearch.css';

/**
 * Navbar destination search — a collapsed trigger that opens a small
 * dropdown panel ("Where are you going?"). Shares its data, matching,
 * and keyboard behavior with the hero's trip search (HeroTripSearch)
 * via useDestinationFinder — only the collapsed-trigger shell here is
 * navbar-specific. Selecting a result, or pressing Enter, navigates
 * to that destination's real route (/destinations/:slug).
 *
 * @param {Object} props
 * @param {string} [props.className]
 */
export function DestinationSearch({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxId = useId();

  const finder = useDestinationFinder();
  const { reset } = finder;

  // Reset transient state whenever the panel opens/closes so a
  // re-open never shows a stale highlighted row or leftover query.
  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [isOpen]);

  function closePanel() {
    setIsOpen(false);
    reset();
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        reset();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, reset]);

  function handleSelect(place) {
    finder.goToPlace(place);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={cn('destination-search', className)} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="destination-search__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Search a destination"
        onClick={() => (isOpen ? closePanel() : setIsOpen(true))}
      >
        <Search size={16} className="destination-search__trigger-icon" aria-hidden="true" />
        <span className="destination-search__trigger-label">Search a destination...</span>
      </button>

      {isOpen && (
        <div className="destination-search__panel" role="dialog" aria-label="Destination search">
          <p className="destination-search__title">Where are you going?</p>

          <div className="destination-search__field">
            <Search size={16} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              className="destination-search__input"
              placeholder="Search a destination..."
              value={finder.query}
              onChange={(event) => finder.handleQueryChange(event.target.value)}
              onKeyDown={(event) =>
                finder.handleKeyDown(event, { onEscape: closePanel, onEnter: handleSelect })
              }
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                finder.activeIndex >= 0 ? `${listboxId}-option-${finder.activeIndex}` : undefined
              }
              aria-label="Search a destination"
            />
          </div>

          <DestinationResultsList
            visibleResults={finder.visibleResults}
            activeIndex={finder.activeIndex}
            isSearching={finder.isSearching}
            hasMore={finder.hasMore}
            matchesCount={finder.matchesCount}
            listboxId={listboxId}
            onHover={finder.setActiveIndex}
            onSelect={handleSelect}
            onShowAll={() => finder.setShowAll(true)}
          />
        </div>
      )}
    </div>
  );
}
