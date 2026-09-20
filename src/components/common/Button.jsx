import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useSectionLink } from '../../hooks/useSectionLink';
import { cn } from '../../utils/cn';
import './Button.css';

/**
 * The one button component for the whole app.
 *
 * Renders the correct element for what it does — a real <button> for
 * an action, a react-router <Link> for internal navigation (`to`), a
 * plain <a> for external links / tel: / mailto: (`href`), or — for a
 * CTA that targets a homepage section (`section`) — whichever of
 * those is correct for where the visitor currently is (see
 * useSectionLink). Never a div pretending to be a button.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'text'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {React.ComponentType} [props.icon] - a lucide-react icon component
 * @param {'left'|'right'} [props.iconPosition]
 * @param {string} [props.to] - internal route, rendered as a <Link>
 * @param {string} [props.href] - external URL / tel: / mailto:, rendered as <a>
 * @param {string} [props.section] - homepage anchor id, e.g. "destinations"
 * @param {string} [props.sectionFallback] - standalone route to use when not on the homepage
 * @param {boolean} [props.disabled]
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'right',
    to,
    href,
    section,
    sectionFallback,
    disabled = false,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  const sectionLink = useSectionLink(section, sectionFallback);
  const classes = cn('btn', `btn--${variant}`, `btn--${size}`, className);
  const iconSize = size === 'lg' ? 20 : 18;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon size={iconSize} aria-hidden="true" />}
      {children && <span className="btn__label">{children}</span>}
      {Icon && iconPosition === 'right' && <Icon size={iconSize} aria-hidden="true" />}
    </>
  );

  if (sectionLink?.mode === 'anchor' && !disabled) {
    return (
      <a ref={ref} href={sectionLink.href} className={classes} onClick={sectionLink.onClick} {...rest}>
        {content}
      </a>
    );
  }

  if (sectionLink?.mode === 'route' && !disabled) {
    return (
      <Link ref={ref} to={sectionLink.to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (to && !disabled) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled} {...rest}>
      {content}
    </button>
  );
});
