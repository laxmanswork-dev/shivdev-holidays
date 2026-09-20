import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDestinationFinder } from '../../hooks/useDestinationFinder';
import { DestinationResultsList } from '../navigation/DestinationResultsList';
import { cn } from '../../utils/cn';
import './HeroTripSearch.css';

// Shivdev Holidays operates FROM Kanyakumari — there's no "starting
// from" field to fill in, and Kanyakumari itself isn't a valid
// "where do you want to go?" answer.
const EXCLUDE_SLUGS = ['kanyakumari'];

/**
 * The hero's booking entry point: "Where do you want to go?" → pick a
 * destination → "Book Now" carries that choice straight into Plan
 * Your Trip (/plan-your-trip?destination=:slug), the site's one
 * planning/booking hub — see pages/PlanTrip. Genuinely different from
 * the navbar's destination search (which just jumps to a destination
 * page) — this one is the start of an actual trip request.
 *
 * Deliberately plain: a premium glass input card next to a solid
 * primary button — no illustration, no decorative shape. The video
 * behind it is the visual hero; this bar just needs to be legible,
 * elegant and obviously interactive.
 *
 * @param {Object} props
 * @param {string} [props.className]
 */
export function HeroTripSearch({ className }) {
  const [chosenPlace, setChosenPlace] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  const finder = useDestinationFinder({ excludeSlugs: EXCLUDE_SLUGS });
  const { query, handleQueryChange } = finder;

  useEffect(() => {
    if (!isOpen) return undefined;
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  function handleGoingToChange(event) {
    handleQueryChange(event.target.value);
    setChosenPlace(null);
    setIsOpen(true);
    if (validationError) setValidationError('');
  }

  function handleChoose(place) {
    finder.selectPlace(place);
    setChosenPlace(place);
    setIsOpen(false);
    if (validationError) setValidationError('');
  }

  function handleFieldKeyDown(event) {
    finder.handleKeyDown(event, {
      onEscape: () => setIsOpen(false),
      onEnter: handleChoose,
    });
  }

  function handleBookNow() {
    if (!chosenPlace) {
      setValidationError('Please select a destination first.');
      inputRef.current?.focus();
      return;
    }
    navigate(`/plan-your-trip?destination=${chosenPlace.slug}`);
  }

  return (
    <div className={cn('hero-trip-search', className)} ref={rootRef} role="group" aria-label="Plan your trip">
      <p className="hero-trip-search__title">Plan your trip</p>

      <div className="hero-trip-search__bar">
        <div className="hero-trip-search__field">
          <input
            ref={inputRef}
            id={`${listboxId}-to`}
            type="text"
            className="hero-trip-search__input"
            placeholder="Enter destination"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={handleGoingToChange}
            onKeyDown={handleFieldKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              finder.activeIndex >= 0 ? `${listboxId}-option-${finder.activeIndex}` : undefined
            }
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? `${listboxId}-error` : undefined}
            aria-label="Where do you want to go?"
            autoComplete="off"
          />

          {isOpen && (
            <div className="destination-search__panel hero-trip-search__dropdown">
              <DestinationResultsList
                visibleResults={finder.visibleResults}
                activeIndex={finder.activeIndex}
                isSearching={finder.isSearching}
                hasMore={finder.hasMore}
                matchesCount={finder.matchesCount}
                listboxId={listboxId}
                onHover={finder.setActiveIndex}
                onSelect={handleChoose}
                onShowAll={() => finder.setShowAll(true)}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          className="hero-trip-search__submit"
          onClick={handleBookNow}
        >
          Book Now
        </button>
      </div>

      {validationError && (
        <p className="hero-trip-search__error" id={`${listboxId}-error`} role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
