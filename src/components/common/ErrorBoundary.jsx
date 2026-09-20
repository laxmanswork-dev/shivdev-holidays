import { Component } from 'react';
import { Container } from './Container';
import { site } from '../../data/site';
import { toTelHref } from '../../utils/format';

/**
 * Catches a page that fails to render or load — most commonly a lazy
 * route chunk that couldn't be fetched (a flaky mobile connection, or
 * a tab left open across a redeploy, when the old hashed file no
 * longer exists). Without it, React unmounts the whole app and the
 * visitor is left with a blank white screen. This keeps the header and
 * footer (it wraps only the routed page — see components/layout/
 * Layout.jsx) and gives a way forward: reload, or call the business.
 *
 * Layout keys it by pathname, so navigating to another page retries
 * instead of staying stuck on the message.
 */
export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="page-ice-bg" role="alert">
        <Container className="page-placeholder">
          <h1 className="heading-xl">This page didn’t load</h1>
          <p className="body">
            Something went wrong while loading this page — usually a weak connection. Please try
            again, or call us on{' '}
            <a href={toTelHref(site.contact.phone)} style={{ textDecoration: 'underline' }}>
              {site.contact.phone}
            </a>.
          </p>
          <div>
            <button type="button" className="btn btn--primary btn--md" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </Container>
      </div>
    );
  }
}
