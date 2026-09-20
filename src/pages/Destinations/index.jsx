import { useMemo, useState } from 'react';
import { SEO } from '../../seo/SEO';
import { breadcrumbListSchema } from '../../seo/structuredData';
import { Section } from '../../components/common/Section';
import { Button } from '../../components/common/Button';
import { DestinationCard } from '../../components/destinations/DestinationCard';
import { CategoryFilter } from '../../components/destinations/CategoryFilter';
import { destinationCatalogue, FILTERS, matchesFilter } from '../../data/destinationCatalogue';
import './Destinations.css';

/**
 * One region's worth of destinations — a heading, a supporting line,
 * then a single uniform grid of cards (see DestinationCard), every one
 * using the exact same image frame. If the region has no matches for
 * the active filter, the caller skips it entirely.
 */
function RegionSection({ id, heading, supportingLine, entries, background }) {
  if (entries.length === 0) return null;

  return (
    <Section id={id} background={background} spacing="compact" contentClassName="destinations-page__wide">
      <div className="destinations-page__region-intro">
        <h2 className="heading-lg">{heading}</h2>
        <p className="body destinations-page__lede">{supportingLine}</p>
      </div>

      <div className="destinations-page__grid">
        {entries.map((destination) => (
          <DestinationCard key={destination.slug} destination={destination} tier="card" />
        ))}
      </div>
    </Section>
  );
}

export default function Destinations() {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(
    () => destinationCatalogue.filter((entry) => matchesFilter(entry, filter)),
    [filter]
  );

  const tamilNadu = filtered.filter((d) => d.region === 'Tamil Nadu');
  const kerala = filtered.filter((d) => d.region === 'Kerala');
  const other = filtered.filter((d) => d.region === 'Other');

  return (
    <>
      <SEO
        title="Destinations"
        description="Explore destinations across Tamil Nadu and Kerala with Shivdev Holidays. Plan local visits, outstation journeys and comfortable cab travel from Kanyakumari."
        path="/destinations"
        structuredData={breadcrumbListSchema([
          { name: 'Home', path: '/' },
          { name: 'Destinations', path: '/destinations' },
        ])}
      />

      <Section
        id="destinations-intro"
        background="surface"
        spacing="compact"
        ariaLabel="Destinations introduction"
      >
        {/* The editorial heading + supporting line were removed on
            request. A visible page still needs exactly one real <h1>
            for accessibility/SEO, so "Destinations" (previously just
            a small eyebrow label) is promoted to that role — same
            restrained eyebrow styling, just the correct semantic
            tag now that it's the only heading here. */}
        <h1 className="eyebrow">Destinations</h1>

        <CategoryFilter filters={FILTERS} active={filter} onChange={setFilter} />
      </Section>

      <RegionSection
        id="tamil-nadu"
        heading="Tamil Nadu"
        supportingLine="From local Kanyakumari visits to hill stations, temples, coastal towns and long-distance journeys."
        entries={tamilNadu}
        background="surface"
      />

      <RegionSection
        id="kerala"
        heading="Kerala"
        supportingLine="Backwaters, beaches, hill stations and relaxed coastal journeys."
        entries={kerala}
        background="surface"
      />

      {other.length > 0 && (
        <Section
          id="more-places"
          background="surface"
          spacing="compact"
          contentClassName="destinations-page__wide"
        >
          <div className="destinations-page__region-intro">
            <h2 className="heading-lg">More Places We Can Take You</h2>
            <p className="body destinations-page__lede">
              Longer-distance journeys, arranged the same way — one cab, one driver, planned
              around your dates.
            </p>
          </div>

          <div className="destinations-page__compact-list">
            {other.map((destination) => (
              <DestinationCard key={destination.slug} destination={destination} tier="compact" />
            ))}
          </div>
        </Section>
      )}

      <Section id="plan-your-trip-cta" background="surface" spacing="compact">
        <h2 className="heading-md">Looking for somewhere else?</h2>
        <p className="body">Tell us where you want to go.</p>
        <Button to="/plan-your-trip" variant="primary">
          Plan Your Trip
        </Button>
      </Section>
    </>
  );
}
