import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './HeroVideo.css';

/**
 * Full-bleed background video for a hero-style section.
 *
 * Usage: pass as Section's `media` prop, not as a child — `media`
 * renders as a sibling of the (width-constrained) Container, so this
 * fills the WHOLE section rather than just the text column, and
 * Section handles stacking it correctly behind the real content:
 *
 *   <Section media={<HeroVideo src="/videos/car.mp4" webmSrc="/videos/car.webm" />} ...>
 *     <p className="eyebrow">...</p>
 *     ...
 *
 * Muted/looped/inline by design (required for autoplay on mobile),
 * and skipped entirely when the visitor has asked for reduced
 * motion OR has turned on their browser/OS Data Saver mode
 * (`navigator.connection.saveData`) OR is on a slow (2G/3G)
 * connection per `navigator.connection.effectiveType` — a multi-MB
 * autoplaying background video is exactly what those signals exist
 * to avoid, so they're respected the same way reduced-motion is. In
 * every "no video" case (skipped, or the file genuinely failed) the
 * hero shows the poster frame as a static image under the same
 * scrim, so it stays polished instead of dropping to a bare colored
 * background. `preload` stays
 * "auto" and `fetchPriority` is set to "high" so this above-the-fold
 * asset isn't left competing with lower-priority requests — it
 * should start fetching immediately, not appear late.
 *
 * The H.264 mp4 `<source>` comes FIRST because it is the one format
 * every phone, tablet and desktop browser plays — including Safari /
 * iOS, where a WebM listed first can be selected and then stall
 * without ever showing video. `webmSrc` (optional) renders as a
 * `<source>` after it, as the backup for the rare browser that can't
 * decode H.264 (same as any standard `<video>` fallback chain). Two independent
 * signals decide whether the video is playable at all: the element's
 * own `error` event (fires once every `<source>` has failed), and a
 * short timeout that catches the case some static hosts answer a
 * missing file with HTTP 200 + their SPA's index.html rather than a
 * real 404 — the video then just never progresses past
 * `readyState 0`. The timeout only gives up when the browser is NOT
 * still fetching (`networkState` isn't LOADING): on a slow but
 * working connection the file is legitimately still arriving, and
 * giving up then would throw away a download in progress and drop
 * the poster — the poster simply stays up until the video can play.
 *
 * @param {Object} props
 * @param {string} props.src - H.264 MP4 source (required, tried first).
 * @param {string} [props.webmSrc] - Optional WebM source, the backup if MP4 can't play.
 * @param {string} [props.mobileSrc] - smaller H.264 MP4 for phones (below 768px), so a
 *   phone never downloads the full-size desktop clip; falls back to "src" if omitted.
 * @param {string} [props.mobileWebmSrc] - the WebM backup for phones.
 * @param {string} [props.poster]
 */
// navigator.connection.effectiveType values slow enough that a multi-MB
// background video would just compete with the page for bandwidth.
const SLOW_CONNECTION_TYPES = ['slow-2g', '2g', '3g'];

export function HeroVideo({ src, webmSrc, mobileSrc, mobileWebmSrc, poster }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPhone = useMediaQuery('(max-width: 767px)');
  const mp4 = isPhone && mobileSrc ? mobileSrc : src;
  const webm = isPhone && mobileSrc ? mobileWebmSrc : webmSrc;
  // navigator.connection is Chromium-only — every other browser just
  // gets `false` here (the video plays as normal), which is the
  // correct fallback since there's no signal to act on.
  const [saveData] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const connection = navigator.connection;
    return Boolean(connection?.saveData) || SLOW_CONNECTION_TYPES.includes(connection?.effectiveType);
  });
  const [broken, setBroken] = useState(false);
  const videoRef = useRef(null);
  const skipVideo = prefersReducedMotion || saveData;

  useEffect(() => {
    if (skipVideo) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    const handleError = () => setBroken(true);
    video.addEventListener('error', handleError);

    const timer = setTimeout(() => {
      // Nothing decoded yet AND the browser isn't still fetching — the
      // "200 + index.html" / dead-source case. A slow download
      // (NETWORK_LOADING) is left alone to keep going.
      if (video.readyState === 0 && video.networkState !== HTMLMediaElement.NETWORK_LOADING) {
        setBroken(true);
      }
    }, 4000);

    return () => {
      video.removeEventListener('error', handleError);
      clearTimeout(timer);
    };
  }, [skipVideo, mp4]);

  if (skipVideo || broken) {
    // No video: show the poster frame as a static image (same fit,
    // filter and scrim as the video layer) so the hero stays polished.
    // With no poster at all, fall back to the section's own background.
    if (!poster) return null;
    return (
      <div className="hero-video" aria-hidden="true">
        <img className="hero-video__el" src={poster} alt="" decoding="async" />
        <div className="hero-video__scrim" />
      </div>
    );
  }

  return (
    <div className="hero-video" aria-hidden="true">
      <video
        // A different file for phones vs larger screens: remount if the
        // viewport crosses the breakpoint (e.g. rotating a tablet).
        key={mp4}
        ref={videoRef}
        className="hero-video__el"
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload={isPhone ? 'metadata' : 'auto'}
        fetchPriority="high"
      >
        <source src={mp4} type="video/mp4" />
        {webm && <source src={webm} type="video/webm" />}
      </video>
      <div className="hero-video__scrim" />
    </div>
  );
}
