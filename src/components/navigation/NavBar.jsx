import { site } from '../../data/site';
import { SectionNavLink } from './SectionNavLink';
import { cn } from '../../utils/cn';
import './NavBar.css';

/** Primary desktop navigation. Hidden below the mobile breakpoint. */
export function NavBar({ className }) {
  return (
    <nav className={cn('nav-bar', className)} aria-label="Primary">
      <ul className="nav-bar__list">
        {site.nav.map((item) => (
          <li key={item.to}>
            <SectionNavLink
              item={item}
              className="nav-bar__link"
              activeClassName="nav-bar__link--active"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
