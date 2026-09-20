import { cn } from '../../utils/cn';
import './Skeleton.css';

/**
 * Loading placeholder for content that hasn't arrived yet (e.g. an
 * image, a card, a line of text). Purely decorative — hidden from
 * assistive tech.
 *
 * @param {Object} props
 * @param {string|number} [props.width]
 * @param {string|number} [props.height]
 * @param {boolean} [props.circle]
 */
export function Skeleton({ width, height = '1em', circle = false, className, style, ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={cn('skeleton', circle && 'skeleton--circle', className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
