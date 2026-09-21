/**
 * Decides, once per page load, whether the logo intro should play.
 *
 * It plays only when ALL of these hold:
 *  - it is the first page load of this browser session (sessionStorage
 *    flag), so it never repeats on reload, on in-app navigation, or when
 *    the visitor returns to Home later in the same session;
 *  - that first page is the homepage itself, with no #hash (a link to
 *    /#about or /#contact means "take me to that section", not "make me
 *    wait");
 *  - the visitor has NOT asked for reduced motion, and is not on Data
 *    Saver or a slow (2G/3G) connection — the same signals the hero video
 *    already respects;
 *  - sessionStorage works. If it doesn't we can't remember that the intro
 *    was shown, so we skip it rather than replaying on every load.
 *
 * This module is imported (via pages/Home, a static import) when the app
 * boots, whatever route the visitor lands on — so a first visit to
 * /destinations marks the session as "seen" and the intro never appears
 * later when they click through to Home.
 *
 * The same test is repeated in a tiny inline script in index.html so the
 * very first paint can already be white instead of flashing the ice-blue
 * page background first. Keep the two in sync (same key, same rules).
 */
const SESSION_KEY = 'shivdev:intro-seen';
const SLOW_CONNECTION_TYPES = ['slow-2g', '2g', '3g'];

function decide() {
  if (typeof window === 'undefined') return false;

  let firstVisit;
  try {
    firstVisit = !window.sessionStorage.getItem(SESSION_KEY);
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    return false;
  }
  if (!firstVisit) return false;

  const { pathname, hash } = window.location;
  if (pathname !== '/' || hash) return false;

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;

  const connection = window.navigator.connection;
  if (connection?.saveData || SLOW_CONNECTION_TYPES.includes(connection?.effectiveType)) {
    return false;
  }

  return true;
}

/**
 * `play`    — whether the intro should run on this page load.
 * `started` — set once the overlay has mounted, so a later fresh mount of
 *             Home (e.g. browser back) can never replay it.
 */
export const introPlan = { play: decide(), started: false };

// html.intro-pending (set by the inline script in index.html) gives the
// first paint its white background and holds the hero text back until the
// intro lifts. When the intro isn't going to run, drop it right away.
if (!introPlan.play && typeof document !== 'undefined') {
  document.documentElement.classList.remove('intro-pending');
}
