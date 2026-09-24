import { getBySlug } from '../../data/destinationCatalogue';
import { cn } from '../../utils/cn';
import './PlacesToVisit.css';

/**
 * "What would you like to see?" — once a destination is chosen, shows
 * its real named places (straight from the same travelPlaces dataset
 * that powers search everywhere else — see data/travelPlaces.js's
 * `popularPlaces`) as a plain multi-select. Nothing is pre-selected;
 * the customer picks what they actually want. Entirely data-driven —
 * no per-destination JSX, so it works the same way for every
 * destination that has this data, and simply says so plainly when one
 * doesn't, rather than inventing attractions.
 *
 * @param {Object} props
 * @param {Object|null} props.place - the chosen "To" place (a TravelPlace)
 * @param {Set<string>} props.selected
 * @param {(name: string) => void} props.onToggle
 */
export function PlacesToVisit({ place, selected, onToggle }) {
  if (!place) {
    return null;
  }

  const suggestedDuration = getBySlug(place.slug)?.duration;
  const options = place.popularPlaces ?? [];

  return (
    <div className="places-to-visit">
      <h2 className="places-to-visit__heading">What would you like to see?</h2>

      {suggestedDuration && (
        <p className="places-to-visit__duration">
          Suggested trip: <strong>{suggestedDuration}</strong>
        </p>
      )}

      {options.length > 0 ? (
        <div className="places-to-visit__options" role="group" aria-label={`Places to visit in ${place.name}`}>
          {options.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={selected.has(name)}
              className={cn('places-to-visit__chip', selected.has(name) && 'places-to-visit__chip--active')}
              onClick={() => onToggle(name)}
            >
              <span>{name}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="places-to-visit__hint">Tell us what you&rsquo;d like to visit.</p>
      )}
    </div>
  );
}
