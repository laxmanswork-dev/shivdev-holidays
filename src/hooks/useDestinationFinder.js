import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPopularPlaces, searchTravelPlaces } from '../data/travelPlaces';

const DEFAULT_RESULT_LIMIT = 10;
const NO_EXCLUSIONS = [];

/**
 * The shared destination-search brain: query state, live filtering
 * against the full travel-places dataset, keyboard navigation, and
 * navigation to the matched destination's real route. Used by the
 * navbar's collapsed search (DestinationSearch) and the hero's trip
 * search "Going to" field (HeroTripSearch) — same data, same
 * matching, same result ordering, same "Enter picks the strongest
 * match" behavior — so the two can never quietly drift apart. Each
 * caller still owns its own open/closed state, DOM shell, and what
 * a selection actually DOES (the navbar navigates immediately; the
 * hero's field just fills itself in and waits for "Search Trip").
 *
 * @param {Object} [options]
 * @param {number} [options.resultLimit] - how many rows render before "view all"
 * @param {string[]} [options.excludeSlugs] - places to leave out entirely,
 *   from both the popular list and search results
 * @param {string} [options.initialQuery] - pre-fills the field with a
 *   place's name already "selected" (e.g. Plan Your Trip's "From"
 *   field defaulting to Kanyakumari, or a destination arriving via
 *   ?destination= — see Plan Your Trip's DestinationField)
 */
export function useDestinationFinder({
  resultLimit = DEFAULT_RESULT_LIMIT,
  excludeSlugs = NO_EXCLUSIONS,
  initialQuery = '',
} = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const isSearching = query.trim().length > 0;

  const popularPlaces = useMemo(() => getPopularPlaces(excludeSlugs), [excludeSlugs]);

  const matches = useMemo(
    () => (isSearching ? searchTravelPlaces(query, { excludeSlugs }) : []),
    [query, isSearching, excludeSlugs]
  );

  const visibleResults = isSearching
    ? showAll
      ? matches
      : matches.slice(0, resultLimit)
    : popularPlaces;

  const hasMore = isSearching && !showAll && matches.length > resultLimit;

  function handleQueryChange(value) {
    setQuery(value);
    setActiveIndex(-1);
    setShowAll(false);
  }

  // Stable identity — this is the one piece of the hook's API that
  // consumers also need directly inside their own effects (e.g. the
  // outside-click handler), so it can't be a plain function recreated
  // every render without forcing those effects to resubscribe on
  // every render too.
  const reset = useCallback(() => {
    setQuery('');
    setActiveIndex(-1);
    setShowAll(false);
  }, []);

  // Fills the query with the chosen place's name and closes out the
  // transient (highlight/"view all") state — but does NOT navigate.
  // For a field that's just one part of a larger form (the hero's
  // "Going to"), selecting a destination should feel like filling in
  // a field, not immediately leaving the page.
  function selectPlace(place) {
    if (!place) return;
    setQuery(place.name);
    setActiveIndex(-1);
    setShowAll(false);
  }

  // Navigates straight to the place's real destination page, then
  // resets back to empty — the navbar's search-and-go behavior.
  function goToPlace(place) {
    if (!place) return;
    navigate(`/destinations/${place.slug}`);
    reset();
  }

  /**
   * @param {KeyboardEvent} event
   * @param {Object} [handlers]
   * @param {() => void} [handlers.onEscape] - called after Escape closes/resets
   * @param {(place: Object) => void} [handlers.onEnter] - called with the
   *   strongest/highlighted match on Enter; the caller decides what that
   *   means (navigate immediately, or just select it into a field)
   */
  function handleKeyDown(event, { onEscape, onEnter } = {}) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape?.();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (visibleResults.length) {
        setActiveIndex((index) => (index + 1) % visibleResults.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (visibleResults.length) {
        setActiveIndex((index) => (index <= 0 ? visibleResults.length - 1 : index - 1));
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      // Enter picks whichever row is highlighted, or — with nothing
      // highlighted yet — the strongest match at the top of the list.
      const place = visibleResults[activeIndex >= 0 ? activeIndex : 0];
      if (place) {
        onEnter?.(place);
      }
    }
  }

  return {
    query,
    activeIndex,
    isSearching,
    visibleResults,
    hasMore,
    matchesCount: matches.length,
    setActiveIndex,
    setShowAll,
    handleQueryChange,
    selectPlace,
    goToPlace,
    handleKeyDown,
    reset,
  };
}
