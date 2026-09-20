import { getTypeLabel } from '../../data/travelPlaces';
import { cn } from '../../utils/cn';

/**
 * The results portion of a destination search dropdown — the
 * "Popular destinations" label, the result rows (name + type · state),
 * "View all N results", and the empty state. Shared by the navbar
 * search and the hero destination finder so both present matches
 * identically; only the surrounding trigger/field shell differs
 * between the two. Pass the values straight from useDestinationFinder.
 *
 * @param {Object} props
 * @param {Array} props.visibleResults
 * @param {number} props.activeIndex
 * @param {boolean} props.isSearching
 * @param {boolean} props.hasMore
 * @param {number} props.matchesCount
 * @param {string} props.listboxId
 * @param {(index: number) => void} props.onHover
 * @param {(place: Object) => void} props.onSelect
 * @param {() => void} props.onShowAll
 */
export function DestinationResultsList({
  visibleResults,
  activeIndex,
  isSearching,
  hasMore,
  matchesCount,
  listboxId,
  onHover,
  onSelect,
  onShowAll,
}) {
  return (
    <>
      {!isSearching && <p className="destination-search__label">Popular destinations</p>}

      {visibleResults.length > 0 ? (
        <>
          <ul className="destination-search__results" role="listbox" id={listboxId}>
            {visibleResults.map((place, index) => (
              <li key={place.slug} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(
                    'destination-search__result',
                    index === activeIndex && 'destination-search__result--active'
                  )}
                  onMouseEnter={() => onHover(index)}
                  onClick={() => onSelect(place)}
                >
                  <span className="destination-search__result-name">{place.name}</span>
                  <span className="destination-search__result-meta">
                    {getTypeLabel(place.type)} · {place.state}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {hasMore && (
            <button type="button" className="destination-search__view-all" onClick={onShowAll}>
              View all {matchesCount} results
            </button>
          )}
        </>
      ) : (
        <p className="destination-search__empty">No destinations found</p>
      )}
    </>
  );
}
