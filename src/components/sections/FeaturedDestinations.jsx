import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { DestinationImage } from '../destinations/DestinationImage';
import { getBySlug } from '../../data/destinationCatalogue';
import './FeaturedDestinations.css';

/**
 * A small, curated preview of 4 destinations — NOT the full
 * catalogue (that's the dedicated /destinations page). This is the
 * homepage's own "signature" showcase: 4 places, plus one link to the
 * real listing (rendered by the caller, Home/index.jsx, in the
 * section's own header row next to the eyebrow/heading — this
 * component only owns the 4-card grid itself). Deliberately a
 * different visual language from DestinationCard (the /destinations
 * page's own bordered/shadowed card) — no card chrome at all here,
 * just a tall photograph and a plain caption underneath, closer to an
 * editorial feature than a UI component.
 *
 * Only `category` and `description` are this section's own copy —
 * name, duration, image path and routing all come from the single
 * centralized catalogue (data/destinationCatalogue.js), the same one
 * /destinations itself reads from, so nothing here is duplicated
 * data that could drift out of sync.
 *
 * The one exception is Thiruvananthapuram Airport: it is a real place
 * (data/travelPlaces.js, so its "Plan This Trip" link pre-fills the
 * planner) but not a card on the /destinations catalogue, so its
 * `name`, `duration` and `image` are given here directly.
 */
const FEATURED_SLUGS = [
  {
    slug: 'kanyakumari',
    category: 'Sightseeing',
    description: "See the coast, temples and landmarks around India's southern tip.",
  },
  {
    slug: 'tirunelveli',
    category: 'Day Trip',
    description: 'Temples, waterfalls and the quieter side of southern Tamil Nadu.',
  },
  {
    slug: 'madurai',
    category: 'City & Heritage',
    description: 'Visit the famous temples, markets and historic parts of the city.',
  },
  {
    slug: 'thiruvananthapuram-airport',
    name: 'Thiruvananthapuram Airport',
    category: 'Airport Transfer',
    description: "Kerala's southernmost international airport — easy cab pickup and drop.",
    duration: 'Same Day',
    image: '/images/destinations/thiruvananthapuram-airport.png',
  },
];

export function FeaturedDestinations() {
  const featured = FEATURED_SLUGS.map((entry) => ({ ...entry, ...getBySlug(entry.slug) })).filter(
    (entry) => entry.slug
  );

  return (
    <div className="featured-destinations__grid">
      {featured.map((destination) => {
        const planTripHref = `/plan-your-trip?destination=${destination.slug}`;

        return (
          <div key={destination.slug} className="featured-destination">
            {/* Decorative duplicate of the real "Plan This Trip" link
                below (same target) — lets the photo itself stay
                clickable now that the button is a real, separately
                focusable link rather than a span, mirroring
                DestinationCard's own media-link + explicit action
                pattern on /destinations. */}
            <Link
              className="featured-destination__media-link"
              to={planTripHref}
              tabIndex={-1}
              aria-hidden="true"
            >
              <DestinationImage src={destination.image} alt={destination.name} size="portrait" />
            </Link>

            <div className="featured-destination__caption">
              <span className="featured-destination__category">{destination.category}</span>
              <h3 className="featured-destination__name">{destination.name}</h3>
              <p className="featured-destination__description">{destination.description}</p>

              <span className="featured-destination__meta">
                <span className="featured-destination__duration">{destination.duration}</span>
                <Button
                  className="featured-destination__link"
                  to={planTripHref}
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Plan This Trip
                </Button>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
