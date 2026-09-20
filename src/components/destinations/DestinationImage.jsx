import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';
import './DestinationImage.css';

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
 * @param {string} props.src
 * @param {string} props.alt
 * @param {'card'|'portrait'} [props.size]
 * @param {string} [props.objectPosition] - CSS object-position, for a
 *   photo whose important subject isn't centered (see destinationCatalogue.js)
 * @param {(failed: boolean) => void} [props.onError] - fires once the
 *   image's load outcome is known (true = failed/missing). Optional:
 *   most callers don't pass it and get the placeholder shown below as
 *   always before. A caller that wants to omit the frame entirely for
 *   a missing image (see DestinationCard) uses this instead.
 */
export function DestinationImage({ src, alt, size = 'card', objectPosition, className, onError }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('destination-image', `destination-image--${size}`, className)}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
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
