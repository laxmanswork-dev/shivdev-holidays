/**
 * Shared Framer Motion constants — keep every animation in the app
 * pulling from the same restrained set of easing curves and
 * durations (mirrors the --ease-out / --duration-* tokens in
 * tokens.css, since CSS custom properties aren't readable from JS
 * animation configs).
 */
export const EASE_OUT = [0.16, 1, 0.3, 1];
export const EASE_STANDARD = [0.4, 0, 0.2, 1];

export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.45,
};
