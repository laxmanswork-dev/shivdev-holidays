import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';

const PHOTO_SRC = '/images/brand/laxman.png';

/**
 * The About section's photo frame. Same "never a broken-image glyph"
 * approach as DestinationImage: a neutral placeholder shows until the
 * real file exists at PHOTO_SRC, so the two-column layout this sits
 * in has a properly sized, balanced frame to align against even
 * before a real photo exists. Once the photo is dropped in at that
 * exact path (public/images/brand/laxman.png), this needs no code
 * change — it just appears.
 */
export function AboutPromoImage() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <div className="about-promo-image">
        {!failed && (
          <img
            src={PHOTO_SRC}
            alt="Shivdev Holidays"
            loading="lazy"
            className={cn('about-promo-image__img', loaded && 'about-promo-image__img--visible')}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
        {!loaded && (
          <div className="about-promo-image__placeholder" aria-hidden="true">
            <User size={32} strokeWidth={1.5} />
          </div>
        )}
      </div>
      {/* A soft grounding shadow beneath the photo — only once a real
          photo has actually loaded, not under the placeholder. */}
      {loaded && <div className="about-promo-shadow" aria-hidden="true" />}
    </>
  );
}
