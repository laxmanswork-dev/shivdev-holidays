import { Container } from '../common/Container';
import { SectionNavLink } from '../navigation/SectionNavLink';
import { site } from '../../data/site';
import { toTelHref } from '../../utils/format';
import './Footer.css';

/** Routing-level footer placeholder — not the final art-directed design. */
export function Footer() {
  return (
    <footer className="site-footer">
      <Container as="div" className="site-footer__bar">
        <div>
          <p className="site-footer__brand">{site.name}</p>
          <p className="body-sm">{site.address.city}, {site.address.state}</p>
        </div>
        <nav aria-label="Footer">
          <ul>
            {site.nav.map((item) => (
              <li key={item.to}>
                <SectionNavLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <a href={toTelHref(site.contact.phone)}>{site.contact.phone}</a>
        </div>
      </Container>

      <Container as="div">
        <p className="site-footer__copyright">© 2026 Shivdev Holidays. All rights reserved.</p>
      </Container>
    </footer>
  );
}
