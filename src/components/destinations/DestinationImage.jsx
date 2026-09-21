import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import { destinationPhoto } from '../../utils/photoSources';
import './DestinationImage.css';

// How wide a card photo is drawn: the full content width on phones, and a
// ~350px grid column on larger screens (see DestinationCard.css).
const CARD_IMAGE_SIZES = '(max-width: 640px) calc(100vw - 40px), 360px';

/**
 * A destination photo, or — for a missing/failed file — a neutral,
 * premium placeholder at the exact same dimensions, so dropping a
 * real photo in later (see public/images/destinations/README.md)
 * never shifts the layout.
 *
 * Deliberately doesn't just render `<img src={src}>` and hope: most
 * catalogue destinations still only have a generated placeholder file
 * rather than a real photo (see public/images/destinations/README.md),
 * and if a path is ever missing or fails to load anyway, this
 * component's own placeholder — not the browser's broken-image glyph —
 * is what shows instead, at the exact same frame size a real photo
 * would use. Dropping a real photo in later needs no code or layout
 * change.
 *
 * @param {Object} props
 * @param {string} props.src - the logical photo path ("/images/destinations/<slug>.png");
 *   the responsive WebP files behind it are picked by utils/photoSources.js
 * @param {string} props.alt
 * @param {'card'|'portrait'} [props.size]
 * @param {string} [props.objectPosition] - CSS object-position, for a
 *   photo whose important subject isn't centered (see destinationCatalogue.js)
 * @param {string} [props.sizes] - how wide the photo is drawn, for srcset selection
 * @param {boolean} [props.priority] - true only for the one above-the-fold photo
 *   of a page: fetched immediately (eager + high priority) instead of lazily.
 * @param {(failed: boolean) => void} [props.onError] - fires once the
 *   image's load outcome is known (true = failed/missing). Optional:
 *   most callers don't pass it and get the placeholder shown below as
 *   always before. A caller that wants to omit the frame entirely for
 *   a missing image (see DestinationCard) uses this instead.
 */
export function DestinationImage({
  src,
  alt,
  size = 'card',
  objectPosition,
  className,
  sizes = CARD_IMAGE_SIZES,
  priority = false,
  onError,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const photo = destinationPhoto(src);

  return (
    <div className={cn('destination-image', `destination-image--${size}`, className)}>
      {!failed && (
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={photo.srcSet ? sizes : undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          style={objectPosition ? { objectPosition } : undefined}
          className={cn('destination-image__img', loaded && 'destination-image__img--visible')}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            onError?.(true);
          }}
        />
      )}
      {!loaded && (
        <div className="destination-image__placeholder" aria-hidden="true">
          <MapPin size={size === 'portrait' ? 26 : 22} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
