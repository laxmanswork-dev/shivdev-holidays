import { useEffect, useId, useRef, useState } from 'react';
import { useDestinationFinder } from '../../hooks/useDestinationFinder';
import { DestinationResultsList } from '../navigation/DestinationResultsList';
import { cn } from '../../utils/cn';
import './DestinationField.css';

/**
 * One "From"/"To" field in the trip planner — a labeled input backed
 * by the exact same shared search brain (useDestinationFinder) and
 * results list (DestinationResultsList) as the navbar search and the
 * homepage hero's "Going to" field. No second destination database:
 * typing, aliases, keyboard navigation and result ordering are all
 * identical to those two, only the field's own label/shell differs.
 *
 * The field owns its own draft text; the CONFIRMED selection lives in
 * the parent (Plan Your Trip), passed back via `onSelect`. Typing
 * without picking a result calls `onSelect(null)` — the parent should
 * treat that as "nothing chosen yet" for validation/summary purposes,
 * exactly like the hero's own "Going to" field already does.
 *
 * `initialPlace` only seeds the field's first render (e.g. "From"
 * defaulting to Kanyakumari, or "To" arriving via ?destination=) — it
 * is not resynced on every parent re-render. When the parent needs to
 * force a NEW value in from outside after mount (a destination link
 * clicked while already on this page), give the field a fresh `key`
 * so it remounts with the new initial value, rather than fighting the
 * field's own draft state.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} [props.placeholder]
 * @param {Object|null} [props.initialPlace]
 * @param {(place: Object|null) => void} props.onSelect
 * @param {string[]} [props.excludeSlugs]
 * @param {string} [props.error]
 */
export function DestinationField({
  id,
  label,
  placeholder = 'Search a destination',
  initialPlace = null,
  onSelect,
  excludeSlugs,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  const finder = useDestinationFinder({ excludeSlugs, initialQuery: initialPlace?.name ?? '' });

  useEffect(() => {
    if (!isOpen) return undefined;
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  function handleChange(event) {
    finder.handleQueryChange(event.target.value);
    onSelect?.(null);
    setIsOpen(true);
  }

  function handleChoose(place) {
    finder.selectPlace(place);
    onSelect?.(place);
    setIsOpen(false);
  }

  function handleKeyDown(event) {
    finder.handleKeyDown(event, {
      onEscape: () => setIsOpen(false),
      onEnter: handleChoose,
    });
  }

  return (
    <div className="trip-field" ref={rootRef}>
      <label className="trip-field__label" htmlFor={id}>
        {label}
      </label>

      {/* .trip-field__field is the (unskewed) positioning context for
          the dropdown; the parallelogram shape/border lives one level
          in, on .trip-field__input-wrap, so the results list below
          never inherits that skew and stays perfectly upright. */}
      <div className="trip-field__field">
        <div className={cn('trip-field__input-wrap', error && 'trip-field__input-wrap--error')}>
          <input
            ref={inputRef}
            id={id}
            type="text"
            className="trip-field__input"
            placeholder={placeholder}
            value={finder.query}
            onFocus={() => setIsOpen(true)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              finder.activeIndex >= 0 ? `${listboxId}-option-${finder.activeIndex}` : undefined
            }
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            autoComplete="off"
          />
        </div>

        {isOpen && (
          <div className="destination-search__panel trip-field__dropdown">
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

      {error && (
        <p className="trip-field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
