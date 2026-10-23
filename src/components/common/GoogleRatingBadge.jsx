import { Star } from 'lucide-react';
import { site } from '../../data/site';
import './GoogleRatingBadge.css';

const STAR_INDEXES = [0, 1, 2, 3, 4];

/**
 * The small "5.0 ★★★★★ (6 reviews)" row under the hero subtitle. Always a
 * complete, working link to the business's real Google listing
 * (site.googleMapsUrl).
 *
 * The rating/review count are **manually maintained**, not fetched live —
 * see `site.googleRating` in src/data/site.js for the one place to update
 * them, and docs/google-rating.md for why (no Google Cloud billing/API
 * credentials for this business yet) and how to switch to the live-API
 * path later without touching this component. Never describe these
 * numbers as live/real-time/automatically-updated anywhere in this file.
 *
 * If `site.googleRating` is ever cleared (set to null), this falls back
 * to a plain "Read Google Reviews" link with no number — same principle
 * as the live-data version before it: never show an invented rating.
 */
export function GoogleRatingBadge() {
  const rating = site.googleRating;
  const hasRating = Boolean(rating) && typeof rating.value === 'number' && typeof rating.reviewCount === 'number';
  const fillPercent = hasRating ? Math.max(0, Math.min(100, (rating.value / 5) * 100)) : 100;

  const ariaLabel = hasRating
    ? `${site.name}: ${rating.value.toFixed(1)} out of 5 on Google, from ${rating.reviewCount} review${rating.reviewCount === 1 ? '' : 's'}. Opens Google Maps in a new tab.`
    : `Read ${site.name} reviews on Google Maps. Opens in a new tab.`;

  return (
    <a
      href={site.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="google-rating-badge"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <GoogleGIcon className="google-rating-badge__g" />

      <span className="google-rating-badge__stars" aria-hidden="true">
        <span className="google-rating-badge__stars-track">
          {STAR_INDEXES.map((i) => (
            <Star key={i} size={14} strokeWidth={1.75} fill="currentColor" />
          ))}
        </span>
        <span className="google-rating-badge__stars-fill" style={{ width: `${fillPercent}%` }}>
          {STAR_INDEXES.map((i) => (
            <Star key={i} size={14} strokeWidth={1.75} fill="currentColor" />
          ))}
        </span>
      </span>

      {hasRating && (
        <span className="google-rating-badge__score">
          {rating.value.toFixed(1)}
          <span className="google-rating-badge__count">
            ({rating.reviewCount.toLocaleString('en-IN')} review{rating.reviewCount === 1 ? '' : 's'})
          </span>
        </span>
      )}

      <span className="google-rating-badge__label">{hasRating ? 'Google Reviews' : 'Read Google Reviews'}</span>
    </a>
  );
}

// A plain, generic four-color "G" mark — the same widely-used
// representation of Google's brand colors seen on most "Google Reviews"
// badges and sign-in buttons, not a pixel copy of any specific official
// asset file. Purely decorative: the link's own text/aria-label already
// name Google, so this is aria-hidden.
function GoogleGIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.95 11.95 0 0 0 0 12c0 1.92.46 3.74 1.29 5.38z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}
