/**
 * Plan Your Trip's own fixed choice list — trip type. Small and
 * static enough that it doesn't need the destination data
 * architecture; kept here (not inline in a component) so the page
 * component and the WhatsApp message builder both read the same
 * labels and can never drift apart.
 *
 * @typedef {Object} TripType
 * @property {string} id
 * @property {string} label
 * @property {boolean} needsReturnDate - whether this trip type shows
 *   a second "Return Date" field
 * @property {string} [onlyToSlug] - when set, this trip type is only
 *   offered while the "To" (destination) place has this slug (see
 *   getAvailableTripTypes)
 */

/** @type {TripType[]} */
export const TRIP_TYPES = [
  { id: 'one-way', label: 'One Way – Drop Only', needsReturnDate: false },
  { id: 'round-trip', label: 'Round Trip – Go & Return', needsReturnDate: true },
  { id: 'sightseeing', label: 'Sightseeing', needsReturnDate: false, onlyToSlug: 'kanyakumari' },
  { id: 'multi-day', label: 'Multi-Day Trip', needsReturnDate: true },
  { id: 'airport-transfer', label: 'Airport Pickup / Drop', needsReturnDate: false },
];

/**
 * The trip types offered for a given destination — Sightseeing only
 * appears when the destination ("To") is Kanyakumari; every other
 * destination (or none chosen yet) gets the remaining types.
 *
 * @param {{slug: string}|null} toPlace
 * @returns {TripType[]}
 */
export function getAvailableTripTypes(toPlace) {
  return TRIP_TYPES.filter((type) => !type.onlyToSlug || type.onlyToSlug === toPlace?.slug);
}

export function getTripType(id) {
  return TRIP_TYPES.find((type) => type.id === id) ?? TRIP_TYPES[0];
}
