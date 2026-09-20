import { ArrowRight } from 'lucide-react';
import { getTripType } from '../../data/tripOptions';
import { formatDateLabel } from '../../utils/format';
import './TripSummary.css';

/**
 * A plain, live recap of the trip being planned — reads directly from
 * the same state the form itself uses, so it can never drift out of
 * sync with what will actually be sent. Deliberately simple: text
 * rows, not another wall of cards, and no pricing (none exists to
 * show honestly).
 *
 * @param {Object} props
 * @param {Object|null} props.fromPlace
 * @param {Object|null} props.toPlace
 * @param {string} props.tripType
 * @param {string} props.travelDate
 * @param {string} props.returnDate
 * @param {number} props.travellers
 * @param {string[]} props.selectedPlaces
 */
export function TripSummary({
  fromPlace,
  toPlace,
  tripType,
  travelDate,
  returnDate,
  travellers,
  selectedPlaces,
}) {
  const tripTypeInfo = getTripType(tripType);

  return (
    <div className="trip-summary">
      {/* The card itself is skewed (see TripSummary.css); this single
          inner wrapper is counter-skewed once so every line of content
          renders upright — the same "skewed box, straight content"
          technique as the rest of the form, just applied once here
          instead of per-field since it's all one static block. */}
      <div className="trip-summary__inner">
        <p className="trip-summary__eyebrow">Your Trip</p>

        <p className="trip-summary__route">
          <span>{fromPlace?.name ?? 'Kanyakumari'}</span>
          <ArrowRight size={18} aria-hidden="true" />
          <span className={!toPlace ? 'trip-summary__route-empty' : undefined}>
            {toPlace?.name ?? 'Choose a destination'}
          </span>
        </p>

        <dl className="trip-summary__rows">
          <div className="trip-summary__row">
            <dt>Trip Type</dt>
            <dd>{tripTypeInfo.label}</dd>
          </div>

          <div className="trip-summary__row">
            <dt>Travel Date</dt>
            <dd>{formatDateLabel(travelDate) || 'Not set yet'}</dd>
          </div>

          {tripTypeInfo.needsReturnDate && (
            <div className="trip-summary__row">
              <dt>Return Date</dt>
              <dd>{formatDateLabel(returnDate) || 'Not set yet'}</dd>
            </div>
          )}

          <div className="trip-summary__row">
            <dt>Travellers</dt>
            <dd>{travellers}</dd>
          </div>
        </dl>

        {selectedPlaces.length > 0 && (
          <div className="trip-summary__places">
            <p className="trip-summary__places-label">Selected places</p>
            <ul>
              {selectedPlaces.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
