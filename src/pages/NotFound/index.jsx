import { Link } from 'react-router-dom';
import { SEO } from '../../seo/SEO';
import { Container } from '../../components/common/Container';

/** 404 page. Kept simple for now; will feel more "Shivdev" later. */
export default function NotFound() {
  return (
    <div className="page-ice-bg">
      <SEO title="Page Not Found" path="/404" noindex />
      <Container className="page-placeholder">
        <h1 className="heading-xl">Page not found</h1>
        <p className="body">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <p className="body">
          <Link to="/">Go back home</Link> or <Link to="/destinations">browse all destinations</Link>.
        </p>
      </Container>
    </div>
  );
}
