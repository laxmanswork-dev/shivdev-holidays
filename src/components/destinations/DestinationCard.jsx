import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { DestinationImage } from './DestinationImage';
import './DestinationCard.css';

/**
 * One destination — answering only "where can we take you", not
 * "what will you see once you're there" (the actual sightseeing list
 * lives in Plan Your Trip's data-driven "What would you like to see?"
 * step, not here). Two tiers:
 *
 *   card    — the standard tile: image, name, short description,
 *             duration, "Plan This Trip". Every card tier uses the
 *             exact same image frame (see DestinationImage) so the
 *             grid lines up row to row — unless a destination has no
 *             image file at all, in which case the frame is omitted
 *             entirely for that one card rather than showing an empty
 *             placeholder box (see imageMissing below).
 *   compact — no image, just name + duration + arrow, in a dense row.
 *             Reserved for the "More Places We Can Take You" list.
 *
 * Every card leads into the trip planner with this destination
 * already selected (/plan-your-trip?destination=:slug) — Plan Your
 * Trip is the site's one planning/booking hub, not a route that
 * exists only for some destinations, so there's no separate "has a
 * real page vs. doesn't" branch here any more.
 */
export function DestinationCard({ destination, tier = 'card' }) {
  const { name, shortDescription, descriptionOverride, duration, image, imagePosition } = destination;
  const description = descriptionOverride ?? shortDescription;
  const planTripHref = `/plan-your-trip?destination=${destination.slug}`;
  // Unknown until the <img> either loads or 404s; only true removes
  // the frame, so nothing changes for every destination that already
  // has a real file (see DestinationImage's onError).
  const [imageMissing, setImageMissing] = useState(false);

  if (tier === 'compact') {
    return (
      <Link className="destination-card destination-card--compact" to={planTripHref}>
        <span className="destination-card__compact-name">{name}</span>
        <span className="destination-card__compact-meta">
          <span className="destination-card__duration">{duration}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </Link>
    );
  }

  return (
    <article className={cn('destination-card', imageMissing && 'destination-card--no-image')}>
      {!imageMissing && (
        <Link className="destination-card__media-link" to={planTripHref} tabIndex={-1} aria-hidden="true">
          <DestinationImage
            src={image}
            alt={name}
            size="card"
            objectPosition={imagePosition}
            onError={setImageMissing}
          />
        </Link>
      )}

      <div className="destination-card__body">
        <h3 className="destination-card__name">{name}</h3>
        {description && <p className="destination-card__description">{description}</p>}

        <div className="destination-card__footer">
          <span className="destination-card__duration">{duration}</span>
          <Button
            className="destination-card__link"
            to={planTripHref}
            variant="primary"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
          >
            Plan This Trip
          </Button>
        </div>
      </div>
    </article>
  );
}
