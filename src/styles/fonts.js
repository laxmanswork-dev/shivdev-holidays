/**
 * Self-hosted font loading.
 *
 * Three families, each with one job (see the --font-* tokens in
 * typography.css):
 *   Fraunces         — editorial serif: headings and card/section titles
 *                      (--font-display).
 *   Work Sans        — humanist sans: body copy, navigation, buttons,
 *                      labels, form fields (--font-body).
 *   Playfair Display — the "Shivdev Holidays" brand name ONLY: the
 *                      header wordmark and the footer name (--font-brand).
 *
 * Loaded via @fontsource so the site has no runtime dependency on an
 * external font CDN. Only the weights actually used are imported, and
 * only the latin subset (all site content is in English) — keep this
 * list in sync with the weight tokens in typography.css.
 *
 * Imported once from main.jsx.
 */

// Fraunces: 400 (the mobile menu's "Menu" label), 500 (h1/h2/h3 — most
// headings) and 600 (--weight-semibold headings and the Destinations
// page label).
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-500.css';
import '@fontsource/fraunces/latin-600.css';
// Italic is reserved for the .font-italic utility in typography.css;
// nothing uses it yet, so the browser never actually fetches this file.
import '@fontsource/fraunces/latin-400-italic.css';

// Playfair Display — the three weights the brand name uses: 700
// ("Shivdev" in the header), 500 ("HOLIDAYS" in the header) and 400
// (the footer name).
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-700.css';

// Work Sans: 400 body, 500 nav/labels/inputs, 600 buttons, and 700 for
// the few emphasized UI elements (header "Call Now", the hero "Book
// Now" button, the Contact phone number, the Destinations filter
// buttons).
import '@fontsource/work-sans/latin-400.css';
import '@fontsource/work-sans/latin-500.css';
import '@fontsource/work-sans/latin-600.css';
import '@fontsource/work-sans/latin-700.css';
