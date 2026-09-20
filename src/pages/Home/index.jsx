import { ArrowRight, Car, Route, Camera, Plane, Phone, MessageCircle } from 'lucide-react';
import { SEO } from '../../seo/SEO';
import { organizationSchema, localBusinessSchema } from '../../seo/structuredData';
import { Section } from '../../components/common/Section';
import { Button } from '../../components/common/Button';
import { HeroVideo } from '../../components/common/HeroVideo';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { HeroTripSearch } from '../../components/sections/HeroTripSearch';
import { FeaturedDestinations } from '../../components/sections/FeaturedDestinations';
import { AboutPromoImage } from './AboutPromoImage';
import { ContactVisual } from './ContactVisual';
import { useScrollToHashOnMount } from '../../hooks/useScrollToHashOnMount';
import { site } from '../../data/site';
import { toTelHref, toWhatsAppHref } from '../../utils/format';
import './AboutSection.css';
import './ContactSection.css';

// About section copy — small and static enough that it doesn't need
// to live in data/, unlike the shared destination/site data. Moved
// here from the former standalone About page (see pages/Home's
// "about" section below).
const ABOUT_SERVICES = [
  { icon: Car, name: 'Local Cab' },
  { icon: Route, name: 'Outstation Travel' },
  { icon: Camera, name: 'Sightseeing' },
  { icon: Plane, name: 'Airport Transfers' },
];

const ABOUT_STEPS = [
  {
    number: '01',
    name: 'Choose',
    description: 'Pick your destination.',
  },
  {
    number: '02',
    name: 'Plan',
    description: 'Share your travel details.',
  },
  {
    number: '03',
    name: 'Travel',
    description: 'Confirm your booking.',
  },
  {
    number: '04',
    name: 'Rate',
    description: 'Rate and review your trip.',
  },
];

/**
 * Homepage — viewport-composed section system, routing/nav
 * foundation only.
 *
 * Each section below is one (roughly) full-viewport screen: a
 * heading, a line or two of real copy, and a working CTA. The full
 * art-directed sections (hero, destination cards, etc. — see
 * data/homeSections.js for the planned flow) are built section by
 * section in a later phase. What matters here is that
 * every id below is a real, reachable anchor, correctly offset below
 * the sticky header, with a clean one-screen-per-section rhythm.
 */
export default function Home() {
  useScrollToHashOnMount();

  return (
    <>
      <SEO path="/" structuredData={[organizationSchema(), localBusinessSchema()]} />

      {/* position: fixed, so placement in the DOM tree doesn't matter
          for layout — kept up top for visibility in the file. */}
      <WhatsAppButton />

      <Section
        id="home"
        viewport="hero"
        divider
        aria-labelledby="home-heading"
        background="dark"
        media={
          <HeroVideo
            src="/videos/car.mp4"
            webmSrc="/videos/car.webm"
            poster="/videos/car-poster.jpg"
          />
        }
      >
        <p className="eyebrow">Best Tours &amp; Travels in Kanyakumari</p>
        <h1 id="home-heading" className="display hero-heading">
          <span className="hero-heading__line">Dream. Explore. Discover.</span>{' '}
          <span className="hero-heading__line">
            Your Journey <span className="hero-heading__accent">Begins Here.</span>
          </span>
        </h1>
        <p className="body-lg hero-description">
          Kanyakumari &amp; Outstation Cab Services across Tamil Nadu and South India.
        </p>

        <HeroTripSearch />
      </Section>

      <Section
        id="destinations"
        viewport="full"
        background="surface"
        divider
        align="start"
        aria-labelledby="destinations-heading"
        contentClassName="featured-destinations__section-content"
      >
        <div className="featured-destinations__header">
          <div className="featured-destinations__intro">
            <p className="eyebrow">Featured Destinations</p>
            <h2 id="destinations-heading" className="heading-xl">
              A few destinations to start your journey from Kanyakumari.
            </h2>
          </div>

          <Button
            to="/destinations"
            variant="primary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            className="featured-destinations__cta-link"
          >
            Explore Full Destinations
          </Button>
        </div>

        <FeaturedDestinations />
      </Section>

      <Section
        id="about"
        background="surface"
        spacing="none"
        aria-labelledby="about-heading"
        className="about-intro-section"
        contentClassName="about-two-col"
      >
        <div className="about-two-col__left">
          <p className="eyebrow">About Shivdev Holidays</p>
          <h2 id="about-heading" className="heading-lg">
            Travel Made Simple. Memories Made Memorable.
          </h2>
        </div>

        <div className="about-two-col__right">
          <p className="eyebrow">What We Do</p>

          <div className="about-services">
            {ABOUT_SERVICES.map(({ icon: Icon, name }) => (
              <div key={name} className="about-services__item">
                <Icon size={22} strokeWidth={1.75} className="about-services__icon" aria-hidden="true" />
                <h3 className="heading-sm">{name}</h3>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="about-how-it-works"
        background="surface"
        spacing="none"
        divider
        ariaLabel="How it works"
        className="about-how-section"
        contentClassName="about-how-promo"
      >
        <div className="about-how-promo__left">
          <p className="eyebrow">How It Works</p>

          <div className="about-steps">
            {ABOUT_STEPS.map((step) => (
              <div key={step.number} className="about-steps__item">
                <span className="about-steps__number" aria-hidden="true">{step.number}</span>
                <h3 className="heading-sm">{step.name}</h3>
                <p className="body-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <p className="body-lg">
            Explore South India with Shivdev Holidays.
          </p>
          <Button to="/plan-your-trip" variant="primary" icon={ArrowRight} iconPosition="right">
            Book Your Trip
          </Button>
        </div>

        <div className="about-how-promo__right">
          <AboutPromoImage />
        </div>
      </Section>

      <Section
        id="contact"
        background="surface"
        spacing="none"
        divider
        aria-labelledby="contact-heading"
        className="contact-section"
        contentClassName="contact-content"
      >
        <div className="contact-content__left">
          <p className="eyebrow contact-content__label">Contact Us</p>
          <h2 id="contact-heading" className="heading-lg contact-content__heading">
            Book a Cab from Kanyakumari
          </h2>
          <p className="body-lg contact-content__description">
            Need a cab for local travel, sightseeing, or an outstation trip? Contact Shivdev
            Holidays for cab bookings from Kanyakumari to destinations across Tamil Nadu and South
            India.
          </p>
          <a href={toTelHref(site.contact.phone)} className="contact-content__phone">
            <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>{site.contact.phone}</span>
          </a>
          <div className="contact-content__actions">
            <Button to="/plan-your-trip" variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Plan Your Trip
            </Button>
            <Button
              href={toWhatsAppHref(site.contact.whatsapp)}
              variant="secondary"
              size="md"
              icon={MessageCircle}
              iconPosition="left"
              className="contact-content__whatsapp-btn"
            >
              Book via WhatsApp
            </Button>
          </div>
        </div>

        <div className="contact-content__right">
          <ContactVisual />
        </div>
      </Section>
    </>
  );
}
