import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { introPlan } from './introSession';
import './IntroOverlay.css';

const LOGO_SRC = '/images/brand/shivdev-holidays-logo.png';
// 8-bit grayscale map of the logo (same 480×480 size): 0 = not road, 1–255 =
// where that pixel of the black road sits along its S-curve, from the end
// nearest the car (1) to the far tip (255). Generated once from the logo
// artwork — see public/images/brand/README.md.
const MASK_SRC = '/images/brand/logo-road-mask.png';
const SIZE = 480;
// A sane road covers ~42,500 of the 230,400 pixels. Outside this range the
// browser has altered the canvas read-back (some privacy modes add noise),
// so the mask can't be trusted — skip the intro rather than show garbage.
const ROAD_PIXELS_MIN = 38000;
const ROAD_PIXELS_MAX = 47000;

// Timeline (ms), counted from when the logo and font are ready:
//   0 – 380     logo fades in (road not yet laid)
//   150 – 1300  the road lays itself along its curve, from the car outward
//   550 – 1150  "Shivdev Holidays" fades in beneath
//   1650        hand-over: white fades away as the hero text fades in (500ms)
const ROAD_DELAY_MS = 150;
const ROAD_MS = 1150;
const FEATHER = 0.14;
const PLAY_MS = 1650;
const EXIT_MS = 500;
// Never make the visitor wait on assets: past this, skip the intro.
const READY_CAP_MS = 1000;

const easeInOutSine = (p) => -(Math.cos(Math.PI * p) - 1) / 2;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Reads the logo and its road map into a drawing buffer: the logo's own
 * pixels, plus the list of road pixels with their position along the road.
 * Only the road pixels are ever changed (their transparency), so once the
 * road has fully drawn, every pixel is exactly the original artwork.
 */
async function prepareRoad() {
  const [logo, mask] = await Promise.all([loadImage(LOGO_SRC), loadImage(MASK_SRC)]);

  const work = document.createElement('canvas');
  work.width = SIZE;
  work.height = SIZE;
  const ctx = work.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(logo, 0, 0, SIZE, SIZE);
  const frame = ctx.getImageData(0, 0, SIZE, SIZE);

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.drawImage(mask, 0, 0, SIZE, SIZE);
  const maskData = ctx.getImageData(0, 0, SIZE, SIZE).data;

  let count = 0;
  for (let i = 0; i < SIZE * SIZE; i++) if (maskData[i * 4] > 0) count++;
  if (count < ROAD_PIXELS_MIN || count > ROAD_PIXELS_MAX) throw new Error('road mask unusable');

  // Group the road pixels by their position value (1–255) so a frame only has to
  // touch the narrow band at the leading edge instead of every road pixel.
  const start = new Uint32Array(257); // start[m] .. start[m+1] = pixels at position m
  for (let i = 0; i < SIZE * SIZE; i++) {
    const m = maskData[i * 4];
    if (m > 0) start[m + 1]++;
  }
  for (let m = 1; m <= 256; m++) start[m] += start[m - 1];

  const alphaIndex = new Uint32Array(count); // index of each road pixel's alpha byte
  const alpha = new Uint8Array(count); // its original alpha
  const box = new Int16Array(256 * 4); // per position: minX, minY, maxX, maxY
  for (let m = 0; m < 256; m++) {
    box[m * 4] = SIZE;
    box[m * 4 + 1] = SIZE;
    box[m * 4 + 2] = -1;
    box[m * 4 + 3] = -1;
  }
  const fill = new Uint32Array(start);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const m = maskData[i * 4];
    if (m === 0) continue;
    const k = fill[m]++;
    alphaIndex[k] = i * 4 + 3;
    alpha[k] = frame.data[i * 4 + 3];
    const x = i % SIZE;
    const y = (i / SIZE) | 0;
    if (x < box[m * 4]) box[m * 4] = x;
    if (y < box[m * 4 + 1]) box[m * 4 + 1] = y;
    if (x > box[m * 4 + 2]) box[m * 4 + 2] = x;
    if (y > box[m * 4 + 3]) box[m * 4 + 3] = y;
  }
  // Start with the whole road undrawn.
  for (let k = 0; k < count; k++) frame.data[alphaIndex[k]] = 0;
  ctx.putImageData(frame, 0, 0);
  return { work, ctx, frame, alphaIndex, alpha, start, box, fullThrough: 0 };
}

/**
 * Lays the road up to "head" (0 … 1+FEATHER, only ever increasing): pixels the
 * leading edge has fully passed are restored once to their original value;
 * pixels inside the soft edge get a partial transparency; the rest stay
 * undrawn. Uploads only the rectangle that changed.
 */
function paintRoad(road, head) {
  const { frame, alphaIndex, alpha, start, box, ctx } = road;
  const data = frame.data;
  const full = Math.min(255, Math.max(0, Math.floor((head - FEATHER) * 254) + 1));
  const top = Math.min(255, Math.max(0, Math.floor(head * 254) + 1));
  let x0 = SIZE;
  let y0 = SIZE;
  let x1 = -1;
  let y1 = -1;
  const touch = (m) => {
    if (box[m * 4 + 2] < 0) return;
    if (box[m * 4] < x0) x0 = box[m * 4];
    if (box[m * 4 + 1] < y0) y0 = box[m * 4 + 1];
    if (box[m * 4 + 2] > x1) x1 = box[m * 4 + 2];
    if (box[m * 4 + 3] > y1) y1 = box[m * 4 + 3];
  };

  for (let m = road.fullThrough + 1; m <= full; m++) {
    for (let k = start[m]; k < start[m + 1]; k++) data[alphaIndex[k]] = alpha[k];
    touch(m);
  }
  if (full > road.fullThrough) road.fullThrough = full;

  for (let m = road.fullThrough + 1; m <= top; m++) {
    let a = (head - (m - 1) / 254) / FEATHER;
    a = a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a);
    for (let k = start[m]; k < start[m + 1]; k++) data[alphaIndex[k]] = alpha[k] * a;
    touch(m);
  }

  if (x1 >= x0) ctx.putImageData(frame, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}

/**
 * First-visit logo reveal: plain white, the existing logo centered with the
 * existing "Shivdev Holidays" wordmark beneath. The only thing that moves is
 * the black road inside the logo, which lays itself along its S-curve from
 * the car outward; then the white fades away into the homepage hero.
 *
 * Plays at most once per session and only on a homepage first load — see
 * introSession.js for the rules. Never shown for reduced motion.
 */
export function IntroOverlay() {
  const [phase, setPhase] = useState(() => (introPlan.play && !introPlan.started ? 'play' : 'done'));
  const [ready, setReady] = useState(false);
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const roadRef = useRef(null);

  // While the intro is up: hold the hero text back (see IntroOverlay.css) and
  // stop wheel/touch scrolling from moving the page behind it.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    introPlan.started = true;
    document.documentElement.classList.add('intro-pending');

    const overlay = overlayRef.current;
    const stop = (event) => event.preventDefault();
    overlay?.addEventListener('wheel', stop, { passive: false });
    overlay?.addEventListener('touchmove', stop, { passive: false });
    return () => {
      overlay?.removeEventListener('wheel', stop);
      overlay?.removeEventListener('touchmove', stop);
    };
  }, [phase]);

  // Load the logo, road map and brand font. If anything is slow or unusable,
  // skip the intro entirely rather than make the visitor wait.
  useEffect(() => {
    if (phase !== 'play') return undefined;
    let cancelled = false;

    const fonts = document.fonts?.load
      ? Promise.all([
          document.fonts.load('700 1rem "Playfair Display"'),
          document.fonts.load('500 1rem "Playfair Display"'),
        ]).catch(() => {})
      : Promise.resolve();
    const cap = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), READY_CAP_MS));

    Promise.race([Promise.all([prepareRoad(), fonts]), cap])
      .then(([road]) => {
        if (cancelled) return;
        roadRef.current = road;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setPhase('done');
      });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // Draw: road hidden, then laid along its curve.
  useEffect(() => {
    const road = roadRef.current;
    const canvas = canvasRef.current;
    if (!ready || !road || !canvas) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssWidth = canvas.getBoundingClientRect().width || 240;
    const size = Math.max(64, Math.round(cssWidth * dpr));
    canvas.width = size;
    canvas.height = size;
    const out = canvas.getContext('2d');
    out.imageSmoothingEnabled = true;
    out.imageSmoothingQuality = 'high';

    const draw = (head) => {
      paintRoad(road, head);
      out.clearRect(0, 0, size, size);
      out.drawImage(road.work, 0, 0, size, size);
    };
    draw(0);

    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(Math.max((now - t0 - ROAD_DELAY_MS) / ROAD_MS, 0), 1);
      draw(easeInOutSine(p) * (1 + FEATHER));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  // play -> exit
  useEffect(() => {
    if (phase !== 'play' || !ready) return undefined;
    const timer = setTimeout(() => setPhase('exit'), PLAY_MS);
    return () => clearTimeout(timer);
  }, [phase, ready]);

  // exit -> done. Releasing the html class here lets the hero's own fade-in
  // run while the white fades away.
  useEffect(() => {
    if (phase !== 'exit') return undefined;
    document.documentElement.classList.remove('intro-pending');
    const timer = setTimeout(() => setPhase('done'), EXIT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Whenever the intro is over — including when it skipped itself because an
  // asset was slow or unusable — make sure the hero is never left held.
  useEffect(() => {
    if (phase === 'done') document.documentElement.classList.remove('intro-pending');
  }, [phase]);

  // Safety net: if this ever unmounts mid-intro, never leave the hero held.
  useEffect(
    () => () => {
      document.documentElement.classList.remove('intro-pending');
    },
    [],
  );

  if (phase === 'done') return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={cn('intro', ready && 'intro--ready', phase === 'exit' && 'intro--exit')}
      aria-hidden="true"
    >
      <div className="intro__lockup">
        <canvas ref={canvasRef} className="intro__logo" width="240" height="240" />
        <div className="intro__wordmark">
          <span className="intro__wordmark-main">Shivdev</span>
          <span className="intro__wordmark-sub">Holidays</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
