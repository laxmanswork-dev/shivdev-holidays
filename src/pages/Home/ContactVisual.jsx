import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { brandPhoto } from '../../utils/photoSources';

// Responsive WebP files generated from source-images/brand/contact.png
// (see scripts/optimize-images.cjs). Drawn at most ~620px wide.
const PHOTO = brandPhoto('contact');
const PHOTO_SIZES = '(min-width: 1025px) 620px, calc(100vw - 40px)';

/**
 * The Contact section's right-side photo — a supporting brand visual
 * next to the contact introduction, not a decorative filler. Same
 * "never a broken-image glyph" approach as AboutPromoImage/
 * DestinationImage: a neutral placeholder shows until the real file
 * exists, so the layout has a properly sized frame to
 * align against even before/if the photo fails to load.
 *
 * object-fit: contain (not cover) — the box's own aspect-ratio is
 * set to the photo's real natural dimensions in ContactSection.css,
 * so nothing is ever cropped regardless of the exact pixel
 * dimensions of whatever file actually sits at PHOTO_SRC.
 */
export function ContactVisual() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="contact-visual-image">
      {!failed && (
        <img
          src={PHOTO.src}
          srcSet={PHOTO.srcSet}
          sizes={PHOTO_SIZES}
          alt="Shivdev Holidays cab"
          loading="lazy"
          decoding="async"
          className={cn('contact-visual-image__img', loaded && 'contact-visual-image__img--visible')}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {!loaded && (
        <div className="contact-visual-image__placeholder" aria-hidden="true">
          <ImageIcon size={32} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
