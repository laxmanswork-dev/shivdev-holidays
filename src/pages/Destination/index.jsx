import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../../seo/SEO';
import { touristDestinationSchema, breadcrumbListSchema } from '../../seo/structuredData';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { DestinationImage } from '../../components/destinations/DestinationImage';
import { getDestinationDetail } from '../../data/destinationDetail';
import NotFound from '../NotFound';
import './Destination.css';

/**
 * Single-destination page. Works for every destination in the search
 * index (data/travelPlaces.js), not just the curated Destinations-page
 * catalogue — see data/destinationDetail.js for how a destination
 * without a hand-authored data/destinations.js entry still gets a
 * complete, non-invented page from data that already exists.
 */
export default function Destination() {
  const { slug } = useParams();
  const destination = getDestinationDetail(slug);
  // Most places in the search index don't have a photo yet. Rather than
  // showing an empty placeholder box above the heading, the image frame is
  // left out entirely once the file is known to be missing (the same thing
  // the cards on /destinations do). Tracked per slug so navigating from one
  // destination to another doesn't inherit the previous page's result.
  const [imageMissingFor, setImageMissingFor] = useState(null);
  // Places with a nearby destination's photo to fall back on try that
  // once before giving up on the frame.
  const [ownImageFailedFor, setOwnImageFailedFor] = useState(null);

  if (!destination) {
    return <NotFound />;
  }

  const useNearby = Boolean(destination.fallbackImage) && ownImageFailedFor === destination.slug;
  const path = `/destinations/${destination.slug}`;
  const planTripHref = `/plan-your-trip?destination=${destination.slug}`;

  return (
    <div className="page-ice-bg">
      <SEO
        title={destination.seoTitle}
        description={destination.seoDescription}
        path={path}
        structuredData={[
          touristDestinationSchema({
            name: destination.name,
            description: destination.shortDescription,
            path,
          }),
          breadcrumbListSchema([
            { name: 'Home', path: '/' },
            { name: 'Destinations', path: '/destinations' },
            { name: destination.name, path },
          ]),
        ]}
      />
      <Container
        className={`page-placeholder destination-detail${imageMissingFor === destination.slug ? ' destination-detail--no-media' : ''}`}
      >
        {imageMissingFor !== destination.slug && (
          <div className="destination-detail__media">
            <DestinationImage
              key={useNearby ? 'nearby' : 'own'}
              src={useNearby ? destination.fallbackImage : destination.image}
              alt={useNearby ? `${destination.fallbackImageLabel}, near ${destination.name}` : destination.name}
              size="card"
              onError={() =>
                destination.fallbackImage && !useNearby
                  ? setOwnImageFailedFor(destination.slug)
                  : setImageMissingFor(destination.slug)
              }
            />
          </div>
        )}

        <div className="destination-detail__content">
          <p className="eyebrow">{destination.category}</p>
          <h1 className="heading-xl">{destination.name}</h1>
          <p className="body-lg">{destination.shortDescription}</p>
          {destination.recommendedDays && (
            <p className="label">Recommended stay: {destination.recommendedDays}</p>
          )}
  
          {destination.placesToSee.length > 0 && (
            <div>
              <h2 className="heading-sm">Places to see</h2>
              <ul>
                {destination.placesToSee.map((place) => (
                  <li key={place} className="body">{place}</li>
                ))}
              </ul>
            </div>
          )}
  
          <div className="page-placeholder__actions">
            <Button to={planTripHref} variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              Plan Your Trip to {destination.name}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
