import { cn } from '../../utils/cn';
import './ResponsiveImage.css';

/**
 * Standard image presentation pattern: fixed aspect ratio (no layout
 * shift), object-fit cover, lazy by default. Use `priority` for an
 * above-the-fold image (e.g. a hero) that should load eagerly.
 *
 * `alt` is required — pass alt="" explicitly for a purely decorative
 * image so the omission is a deliberate choice, not an oversight.
 *
 * @param {Object} props
 * @param {string} props.src
 * @param {string} props.alt
 * @param {string} [props.aspectRatio] - e.g. "16 / 9", "4 / 3", "1 / 1"
 * @param {string} [props.objectPosition] - e.g. "center", "top", "50% 30%"
 * @param {string} [props.sizes]
 * @param {boolean} [props.priority] - load eagerly, at high priority
 * @param {number} [props.width]
 * @param {number} [props.height]
 */
export function ResponsiveImage({
  src,
  alt,
  aspectRatio,
  objectPosition = 'center',
  sizes,
  priority = false,
  width,
  height,
  className,
  imgClassName,
  ...rest
}) {
  if (import.meta.env.DEV && alt === undefined) {
    console.warn(
      'ResponsiveImage: `alt` is required (pass alt="" for a decorative image).'
    );
  }

  return (
    <div
      className={cn('responsive-image', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        className={cn('responsive-image__img', imgClassName)}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        style={{ objectPosition }}
        {...rest}
      />
    </div>
  );
}
