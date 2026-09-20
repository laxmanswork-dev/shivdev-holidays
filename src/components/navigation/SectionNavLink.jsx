import { Link, useLocation } from 'react-router-dom';
import { useSectionLink } from '../../hooks/useSectionLink';
import { useActiveSectionId } from '../../hooks/useActiveSectionId';
import { cn } from '../../utils/cn';

/**
 * One nav item, rendered correctly for wherever the visitor is:
 * a same-page anchor with smooth scroll on the homepage, or a real
 * React Router link to the standalone page anywhere else. Used by
 * the desktop nav, the mobile drawer, and the footer, so this
 * decision lives in exactly one place.
 *
 * @param {Object} props
 * @param {{label:string, sectionId:string, to:string}} props.item
 * @param {string} [props.className]
 * @param {string} [props.activeClassName]
 * @param {() => void} [props.onNavigate] - e.g. close the mobile drawer
 */
export function SectionNavLink({ item, className, activeClassName, onNavigate }) {
  const location = useLocation();
  const activeSectionId = useActiveSectionId();
  const link = useSectionLink(item.sectionId, item.to);

  const isActive =
    link?.mode === 'anchor'
      ? activeSectionId === item.sectionId
      : item.to === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.to);

  const classes = cn(className, isActive && activeClassName);

  if (link?.mode === 'anchor') {
    return (
      <a
        href={link.href}
        className={classes}
        aria-current={isActive ? 'true' : undefined}
        onClick={(event) => {
          link.onClick(event);
          onNavigate?.();
        }}
      >
        {item.label}
      </a>
    );
  }

  // item.to, not link.to: correct either way — when item.sectionId is
  // set but we're off the homepage, link is {mode:'route', to:
  // item.to} anyway; when item.sectionId is absent entirely (e.g.
  // "Plan Your Trip" — see data/site.js), link is null and item.to is
  // the only route this item has.
  return (
    <Link
      to={item.to}
      className={classes}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}
