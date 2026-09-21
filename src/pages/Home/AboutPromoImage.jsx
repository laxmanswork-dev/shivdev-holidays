import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { brandPhoto } from '../../utils/photoSources';

// Responsive WebP files generated from source-images/brand/laxman.png
// (see scripts/optimize-images.cjs). Drawn at most ~1240px wide.
const PHOTO = brandPhoto('laxman');
const PHOTO_SIZES = '(min-width: 1280px) 1240px, calc(100vw - 40px)';

/**
 * The About section's photo frame. Same "never a broken-image glyph"
 * approach as DestinationImage: a neutral placeholder shows until the
 * real file exists at PHOTO_SRC, so the two-column layout this sits
 * in has a properly sized, balanced frame to align against even
 * before a real photo exists. To change the photo, replace
 * source-images/brand/laxman.png and run `npm run images`.
 */
export function AboutPromoImage() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <div className="about-promo-image">
        {!failed && (
          <img
            src={PHOTO.src}
            srcSet={PHOTO.srcSet}
            sizes={PHOTO_SIZES}
            alt="Shivdev Holidays"
            loading="lazy"
            decoding="async"
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
