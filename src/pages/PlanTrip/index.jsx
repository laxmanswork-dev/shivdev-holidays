import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Phone } from 'lucide-react';
import { SEO } from '../../seo/SEO';
import { serviceSchema, breadcrumbListSchema } from '../../seo/structuredData';
import { Section } from '../../components/common/Section';
import { Button } from '../../components/common/Button';
import { DestinationField } from '../../components/planTrip/DestinationField';
import { PillSelect } from '../../components/planTrip/PillSelect';
import { TravellerStepper } from '../../components/planTrip/TravellerStepper';
import { PlacesToVisit } from '../../components/planTrip/PlacesToVisit';
import { TripSummary } from '../../components/planTrip/TripSummary';
import { getAvailableTripTypes, getTripType } from '../../data/tripOptions';
import { getPlaceBySlug } from '../../data/travelPlaces';
import { site } from '../../data/site';
import { toWhatsAppHref, toTelHref, formatDateLabel } from '../../utils/format';
import './PlanTrip.css';

const KANYAKUMARI = getPlaceBySlug('kanyakumari') ?? null;

const todayIso = () => new Date().toISOString().slice(0, 10);

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

/**
 * Plan Your Trip — the site's actual planning/booking hub. One
 * continuous form (destination search, trip type, dates, travellers,
 * places to visit, contact details) that ends in a pre-filled
 * WhatsApp message to the business's real number — no
 * account, no separate "booking system", nothing invented (no
 * pricing, no fake fleet models). The destination search is the exact
 * same shared data/matching used by the navbar and homepage search
 * (see hooks/useDestinationFinder); "places to visit" reads the same
 * per-destination data those pages already have (travelPlaces.js's
 * `popularPlaces`) rather than a second, page-specific list.
 */
export default function PlanTrip() {
  const [searchParams] = useSearchParams();

  const [fromPlace, setFromPlace] = useState(KANYAKUMARI);
  const [toPlace, setToPlace] = useState(null);
  const [toPrefillKey, setToPrefillKey] = useState('to-empty');
  const [handledDestinationParam, setHandledDestinationParam] = useState(null);

  const [tripType, setTripType] = useState('one-way');
  const [travelDate, setTravelDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travellers, setTravellers] = useState(1);
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [waHref, setWaHref] = useState('');
  // Guards against opening two WhatsApp tabs from one rapid double
  // click — a ref, not state, so the check is synchronous within the
  // same handleSubmit call (state updates aren't guaranteed to have
  // committed yet if the handler somehow re-entered before a
  // re-render). Reset when the visitor goes back to "Make changes",
  // since that's a genuine new submission once they resubmit.
  const hasOpenedWhatsAppRef = useRef(false);

  // A destination arriving via ?destination=slug — from a "Plan This
  // Trip" card, the homepage hero search, or a shared link. Handled
  // during render (React's documented pattern for "adjusting state
  // when a prop changes", also used by BookingModal previously) rather
  // than in an effect, so it applies immediately on first paint and
  // still picks up a new destination if another such link is clicked
  // while already on this page — without a spurious extra render.
  // `toPrefillKey` only changes here, never on a normal in-page
  // selection, so DestinationField only remounts for a genuine
  // external prefill.
  const destinationParam = searchParams.get('destination');
  if (destinationParam && destinationParam !== handledDestinationParam) {
    setHandledDestinationParam(destinationParam);
    const place = getPlaceBySlug(destinationParam);
    if (place) {
      setToPlace(place);
      setToPrefillKey(destinationParam);
      setSelectedPlaces(new Set());
      // Same rule as resetTripTypeIfUnavailable below, inlined here
      // because this runs during render, not in an event handler.
      if (!getAvailableTripTypes(place).some((type) => type.id === tripType)) {
        setTripType(getAvailableTripTypes(place)[0].id);
        setReturnDate('');
      }
    }
  }

  const tripTypeInfo = getTripType(tripType);

  function clearError(field) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // A trip type that's only offered for certain destinations
  // (Sightseeing — Kanyakumari only) can't stay selected once the
  // destination changes to somewhere it isn't offered: fall back to
  // the first available option.
  function resetTripTypeIfUnavailable(place) {
    const available = getAvailableTripTypes(place);
    if (!available.some((type) => type.id === tripType)) {
      setTripType(available[0].id);
      setReturnDate('');
      clearError('returnDate');
    }
  }

  function handleFromSelect(place) {
    setFromPlace(place);
    if (place) clearError('from');
  }

  function handleToSelect(place) {
    setToPlace(place);
    setSelectedPlaces(new Set());
    if (place) clearError('to');
    resetTripTypeIfUnavailable(place);
  }

  function handleTripTypeChange(id) {
    setTripType(id);
    if (!getTripType(id).needsReturnDate) setReturnDate('');
    clearError('returnDate');
  }

  function handleTogglePlace(placeName) {
    setSelectedPlaces((prev) => {
      const next = new Set(prev);
      if (next.has(placeName)) next.delete(placeName);
      else next.add(placeName);
      return next;
    });
  }

  function validate() {
    const next = {};
    if (!fromPlace) next.from = 'Please choose a starting point.';
    if (!toPlace) next.to = 'Please choose a destination.';
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!phone.trim()) next.phone = 'Please enter your phone number.';
    else if (!isValidPhone(phone)) next.phone = 'Please enter a valid phone number.';
    if (!travelDate) next.travelDate = 'Please choose a travel date.';
    else if (travelDate < todayIso()) next.travelDate = 'Travel date cannot be in the past.';
    if (tripTypeInfo.needsReturnDate) {
      if (!returnDate) next.returnDate = 'Please choose a return date.';
      else if (returnDate < travelDate) next.returnDate = 'Return date cannot be before the travel date.';
    }
    return next;
  }

  // Builds the WhatsApp message from the CURRENT form state every
  // time it's called (handleSubmit calls this fresh on each submit,
  // never from stale/cached state) — *bold* below is WhatsApp's own
  // markdown syntax, rendered as real bold once the message arrives
  // in the chat. Each optional section (email, return date, places,
  // notes) is only included when the visitor actually provided it —
  // never an "undefined"/"null"/empty line.
  function buildMessage() {
    const lines = ['Hello Shivdev Holidays! I would like to request this trip.', ''];

    lines.push('*CUSTOMER DETAILS*');
    lines.push(`Name: ${name.trim()}`);
    lines.push(`Phone: ${phone.trim()}`);
    if (email.trim()) lines.push(`Email: ${email.trim()}`);
    lines.push('');

    lines.push('*TRIP DETAILS*');
    lines.push(`From: ${fromPlace?.name ?? 'Kanyakumari'}`);
    lines.push(`To: ${toPlace?.name ?? ''}`);
    lines.push(`Trip Type: ${tripTypeInfo.label}`);
    lines.push(`Travel Date: ${formatDateLabel(travelDate)}`);
    if (tripTypeInfo.needsReturnDate && returnDate) {
      lines.push(`Return Date: ${formatDateLabel(returnDate)}`);
    }
    lines.push(`Travellers: ${travellers}`);
    lines.push('');

    if (selectedPlaces.size > 0) {
      lines.push('*PLACES TO VISIT*');
      lines.push([...selectedPlaces].join(', '));
      lines.push('');
    }

    if (notes.trim()) {
      lines.push('*ADDITIONAL NOTES*');
      lines.push(notes.trim());
      lines.push('');
    }

    lines.push('Please contact me to discuss the trip details. Thank you!');
    return lines.join('\n');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (hasOpenedWhatsAppRef.current) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstField = document.getElementById(
        Object.keys(nextErrors)[0] === 'from'
          ? 'plan-trip-from'
          : Object.keys(nextErrors)[0] === 'to'
            ? 'plan-trip-to'
            : Object.keys(nextErrors)[0]
      );
      firstField?.focus();
      return;
    }

    hasOpenedWhatsAppRef.current = true;
    const href = toWhatsAppHref(site.contact.whatsapp, buildMessage());
    setWaHref(href);
    setSubmitted(true);
    // Opened as a direct result of this click, so browsers won't treat
    // it as an unsolicited popup; the success panel below still offers
    // the same link manually as a fallback if it's blocked anyway.
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <SEO
        title="Plan Your Trip"
        description="Plan local and outstation cab trips from Kanyakumari across Tamil Nadu and South India with Shivdev Holidays."
        path="/plan-your-trip"
        structuredData={[
          serviceSchema({
            name: 'Trip Planning',
            description:
              'Plan a cab trip from Kanyakumari across Tamil Nadu and South India with Shivdev Holidays.',
            path: '/plan-your-trip',
          }),
          breadcrumbListSchema([
            { name: 'Home', path: '/' },
            { name: 'Plan Your Trip', path: '/plan-your-trip' },
          ]),
        ]}
      />

      <Section id="plan-trip-intro" background="surface" spacing="compact" ariaLabel="Plan your trip">
        <p className="eyebrow">Plan Your Trip</p>
        <h1 className="heading-lg plan-trip__intro-line">
          Tell us where you want to go and we&rsquo;ll help plan the journey around you.
        </h1>
      </Section>

      <Section
        id="plan-trip-form"
        background="surface"
        spacing="compact"
        horizontal="left"
        contentClassName="plan-trip__section-content"
      >
        <div className="plan-trip__layout">
          <form className="plan-trip__form" onSubmit={handleSubmit} noValidate>
            {/* The card itself is skewed (see PlanTrip.css); this single
                inner wrapper is counter-skewed once so every field/row
                inside sits upright as a group — same technique as the
                Your Trip summary card. Each field's own parallelogram
                shape (DestinationField, PillSelect, etc.) is unaffected,
                since it's an independent transform on that field itself. */}
            <div className="plan-trip__form-inner">
            <div className="plan-trip__field-row">
              <DestinationField
                key="from"
                id="plan-trip-from"
                label="From"
                placeholder="Starting from"
                initialPlace={KANYAKUMARI}
                onSelect={handleFromSelect}
                error={errors.from}
              />
              <DestinationField
                key={toPrefillKey}
                id="plan-trip-to"
                label="To"
                placeholder="Going to"
                initialPlace={toPlace}
                onSelect={handleToSelect}
                error={errors.to}
              />
            </div>

            <PillSelect
              name="trip-type"
              label="Trip Type"
              options={getAvailableTripTypes(toPlace)}
              value={tripType}
              onChange={handleTripTypeChange}
            />

            <div className="plan-trip__field-row">
              <div className="trip-field">
                <label className="trip-field__label" htmlFor="travelDate">
                  Travel Date
                </label>
                <div
                  className={`trip-field__input-wrap${errors.travelDate ? ' trip-field__input-wrap--error' : ''}`}
                >
                  <input
                    id="travelDate"
                    type="date"
                    className="trip-field__input"
                    value={travelDate}
                    min={todayIso()}
                    onChange={(event) => {
                      setTravelDate(event.target.value);
                      clearError('travelDate');
                    }}
                    aria-invalid={Boolean(errors.travelDate)}
                    aria-describedby={errors.travelDate ? 'travelDate-error' : undefined}
                  />
                </div>
                {errors.travelDate && (
                  <p className="trip-field__error" id="travelDate-error" role="alert">
                    {errors.travelDate}
                  </p>
                )}
              </div>

              {tripTypeInfo.needsReturnDate && (
                <div className="trip-field">
                  <label className="trip-field__label" htmlFor="returnDate">
                    Return Date
                  </label>
                  <div
                    className={`trip-field__input-wrap${errors.returnDate ? ' trip-field__input-wrap--error' : ''}`}
                  >
                    <input
                      id="returnDate"
                      type="date"
                      className="trip-field__input"
                      value={returnDate}
                      min={travelDate || todayIso()}
                      onChange={(event) => {
                        setReturnDate(event.target.value);
                        clearError('returnDate');
                      }}
                      aria-invalid={Boolean(errors.returnDate)}
                      aria-describedby={errors.returnDate ? 'returnDate-error' : undefined}
                    />
                  </div>
                  {errors.returnDate && (
                    <p className="trip-field__error" id="returnDate-error" role="alert">
                      {errors.returnDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <TravellerStepper id="travellers" value={travellers} onChange={setTravellers} />

            <PlacesToVisit place={toPlace} selected={selectedPlaces} onToggle={handleTogglePlace} />

            <div className="plan-trip__contact">
              <h2 className="plan-trip__section-heading">Your details</h2>

              {submitted ? (
                <div className="plan-trip__success">
                  <CheckCircle2 size={32} aria-hidden="true" className="plan-trip__success-icon" />
                  <p className="plan-trip__success-text">
                    Your trip details are ready in WhatsApp — press <strong>Send</strong> there
                    to reach us. (We haven&rsquo;t received anything yet; nothing is booked
                    until you send that message.)
                  </p>
                  <div className="plan-trip__actions">
                    <Button href={waHref} variant="primary" size="lg">
                      Open WhatsApp
                    </Button>
                    <Button href={toTelHref(site.contact.phone)} variant="secondary" size="lg" icon={Phone}>
                      Call Shivdev Holidays
                    </Button>
                  </div>
                  <button
                    type="button"
                    className="plan-trip__make-changes"
                    onClick={() => {
                      setSubmitted(false);
                      hasOpenedWhatsAppRef.current = false;
                    }}
                  >
                    Make changes
                  </button>
                </div>
              ) : (
                <>
                  <div className="plan-trip__field-row">
                    <div className="trip-field">
                      <label className="trip-field__label" htmlFor="name">
                        Name
                      </label>
                      <div className={`trip-field__input-wrap${errors.name ? ' trip-field__input-wrap--error' : ''}`}>
                        <input
                          id="name"
                          type="text"
                          className="trip-field__input"
                          value={name}
                          onChange={(event) => {
                            setName(event.target.value);
                            clearError('name');
                          }}
                          autoComplete="name"
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                      </div>
                      {errors.name && (
                        <p className="trip-field__error" id="name-error" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="trip-field">
                      <label className="trip-field__label" htmlFor="phone">
                        Phone Number
                      </label>
                      <div
                        className={`trip-field__input-wrap${errors.phone ? ' trip-field__input-wrap--error' : ''}`}
                      >
                        <input
                          id="phone"
                          type="tel"
                          inputMode="tel"
                          className="trip-field__input"
                          value={phone}
                          onChange={(event) => {
                            setPhone(event.target.value);
                            clearError('phone');
                          }}
                          autoComplete="tel"
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? 'phone-error' : undefined}
                        />
                      </div>
                      {errors.phone && (
                        <p className="trip-field__error" id="phone-error" role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="trip-field">
                    <label className="trip-field__label" htmlFor="email">
                      Email <span className="plan-trip__optional">(optional)</span>
                    </label>
                    <div className="trip-field__input-wrap">
                      <input
                        id="email"
                        type="email"
                        className="trip-field__input"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="trip-field">
                    <label className="trip-field__label" htmlFor="notes">
                      Anything else you&rsquo;d like us to know?
                    </label>
                    <div className="trip-field__input-wrap">
                      <textarea
                        id="notes"
                        className="trip-field__input trip-field__textarea"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="plan-trip__actions">
                    <Button type="submit" variant="primary" size="lg">
                      Request This Trip
                    </Button>
                    <Button href={toTelHref(site.contact.phone)} variant="secondary" size="lg" icon={Phone}>
                      Call Shivdev Holidays
                    </Button>
                  </div>
                </>
              )}
            </div>
            </div>
          </form>

          <aside className="plan-trip__summary-col" aria-label="Trip summary">
            <TripSummary
              fromPlace={fromPlace}
              toPlace={toPlace}
              tripType={tripType}
              travelDate={travelDate}
              returnDate={returnDate}
              travellers={travellers}
              selectedPlaces={[...selectedPlaces]}
            />
          </aside>
        </div>
      </Section>

      <Section id="plan-trip-help" background="surface" spacing="compact">
        <h2 className="heading-md">Need help planning?</h2>
        <p className="body-lg">
          Not sure how many days you need? Tell us your destination and travel dates. We can
          suggest a practical route and trip plan.
        </p>
      </Section>
    </>
  );
}
